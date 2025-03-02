
/**
 * Authentication Service
 * Provides authentication and authorization functions
 */

/**
 * Checks if a user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function isAuthenticated(req, res, next) {
  // Check if user is authenticated
  if (req.session && req.session.user) {
    return next();
  }
  
  // Not authenticated
  return res.status(401).json({ error: 'Unauthorized' });
}

/**
 * Checks if a user is an admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function isAdmin(req, res, next) {
  // Check if user is authenticated and is an admin
  if (req.session && req.session.user && req.session.user.isAdmin) {
    return next();
  }
  
  // Not admin
  return res.status(403).json({ error: 'Forbidden' });
}

/**
 * Verifies API key
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function verifyApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  // Check if API key exists and is valid
  if (apiKey && apiKey === process.env.API_KEY) {
    return next();
  }
  
  // Invalid API key
  return res.status(401).json({ error: 'Invalid API key' });
}

export default {
  isAuthenticated,
  isAdmin,
  verifyApiKey
};
