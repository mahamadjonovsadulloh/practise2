/**
 * Centralized API utility for calling backend Express endpoints.
 * Automatically prepends NEXT_PUBLIC_API_URL, includes credentials for cookies,
 * and handles JSON parsing and error wrapping.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Reusable fetch wrapper
 * @param {string} endpoint - Path such as '/products' or '/auth/login'
 * @param {RequestInit} [options={}] - Custom fetch options
 * @returns {Promise<any>} Parsed response data
 */
export async function apiFetch(endpoint, options = {}) {
  // Normalize endpoint path
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  // Build headers
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
    // Always include credentials to send/receive HTTP-only JWT cookies
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);

    // Try parsing JSON response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      const errorMessage = data?.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // If backend is not running or unreachable
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error(
        `Cannot connect to backend server at ${API_BASE_URL}. Please ensure the Express backend is running on port 5000.`
      );
      networkError.status = 503;
      throw networkError;
    }
    throw error;
  }
}

export default apiFetch;

