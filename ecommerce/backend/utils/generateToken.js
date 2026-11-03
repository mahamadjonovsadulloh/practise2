const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token and attach it as an HTTP-only secure cookie
 * @param {Object} res - Express response object
 * @param {string} userId - User identifier (MongoDB _id)
 * @param {string} role - User role ('admin' | 'user')
 * @returns {string} token - The signed JWT token
 */
const generateTokenAndSetCookie = (res, userId, role = 'user') => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  // Create JWT payload
  const token = jwt.sign({ id: userId, role }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  // Configure cookie options
  const cookieOptions = {
    httpOnly: true, // Prevents client-side JavaScript access (XSS defense)
    secure: isProduction, // Use HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF defense
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  };

  res.cookie('jwt', token, cookieOptions);
  return token;
};

/**
 * Clear the authentication cookie (used on logout)
 * @param {Object} res - Express response object
 */
const clearTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
  });
};

module.exports = {
  generateTokenAndSetCookie,
  clearTokenCookie,
};

