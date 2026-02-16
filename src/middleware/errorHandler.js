/**
 * Error Handling Middleware
 * Global error handler for the application
 */

/**
 * Async error wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global error handling middleware
 * Must be registered AFTER all other middleware and routes
 */
const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors || [err.message]
    });
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
      field: Object.keys(err.keyValue)[0]
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Handle not found errors
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      message: err.message || 'Resource not found'
    });
  }

  // Handle authentication errors
  if (err.status === 401) {
    return res.status(401).json({
      success: false,
      message: err.message || 'Unauthorized'
    });
  }

  // Default error response
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Not Found middleware
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.path}`);
  error.status = 404;
  next(error);
};

module.exports = {
  asyncHandler,
  errorHandler,
  notFoundHandler
};
