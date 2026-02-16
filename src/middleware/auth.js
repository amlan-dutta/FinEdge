/**
 * Authentication Middleware
 * JWT-based authentication and authorization
 */

const JWTService = require('../services/JWTService');
const { AuthenticationError } = require('../utils/errors');

/**
 * Verify JWT token from Authorization header
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Authorization token required');
    }

    const token = authHeader.slice(7); // Remove 'Bearer '

    try {
      const decoded = JWTService.verifyToken(token);
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        type: decoded.type
      };
      next();
    } catch (error) {
      throw new AuthenticationError(error.message);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const decoded = JWTService.verifyToken(token);
        req.user = {
          id: decoded.sub,
          email: decoded.email,
          type: decoded.type
        };
      } catch (error) {
        console.log('Optional auth failed:', error.message);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  optionalAuth
};
