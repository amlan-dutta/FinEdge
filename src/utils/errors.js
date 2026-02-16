/**
 * Custom Error Classes
 * Application-specific error types
 */

/**
 * Base application error
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error
 */
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Not found error
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Authentication error
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error
 */
class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to access this resource') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Conflict error (duplicate resource)
 */
class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Database error
 */
class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, 500);
    this.name = 'DatabaseError';
    this.originalError = originalError;
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  DatabaseError
};
