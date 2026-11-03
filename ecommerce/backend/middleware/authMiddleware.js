const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes: verifies the JWT cookie
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Read token from HTTP-only cookie first, or fallback to Authorization header
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No authentication token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach decoded user info to the request object
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Token verification failed or token expired',
    });
  }
};

/**
 * Middleware to verify admin permissions
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admin access privileges required',
    });
  }
};

module.exports = {
  protect,
  admin,
};

