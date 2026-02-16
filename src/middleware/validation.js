/**
 * Validation Middleware
 * Validates request inputs and transaction data
 */

/**
 * Validate transaction input
 */
const validateTransaction = (req, res, next) => {
  try {
    const { userId, type, category, amount, description, date } = req.body;

    // Check required fields
    const errors = [];

    if (!userId) {
      errors.push('User ID is required');
    }

    if (!type) {
      errors.push('Transaction type is required');
    } else if (!['income', 'expense'].includes(type)) {
      errors.push('Type must be either "income" or "expense"');
    }

    if (!category || category.trim() === '') {
      errors.push('Category is required');
    }

    if (!amount) {
      errors.push('Amount is required');
    } else if (typeof amount !== 'number' || amount <= 0) {
      errors.push('Amount must be a positive number');
    } else if (amount > 1000000) {
      errors.push('Amount exceeds maximum limit');
    }

    if (date && isNaN(new Date(date).getTime())) {
      errors.push('Invalid date format');
    }

    if (description && typeof description !== 'string') {
      errors.push('Description must be a string');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Attach validated data to request
    req.validatedData = {
      userId,
      type,
      category: category.trim(),
      amount,
      description: description?.trim() || '',
      date: date ? new Date(date) : new Date()
    };

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
  }
};

/**
 * Validate user input
 */
const validateUser = (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const errors = [];

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Valid email is required');
    }

    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    if (!firstName || firstName.trim() === '') {
      errors.push('First name is required');
    }

    if (!lastName || lastName.trim() === '') {
      errors.push('Last name is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Attach validated data to request
    req.validatedData = {
      email: email.toLowerCase().trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim()
    };

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
  }
};

/**
 * Validate pagination query parameters
 */
const validatePagination = (req, res, next) => {
  try {
    let { page = 1, limit = 10, sortBy = 'date', order = 'desc' } = req.query;

    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit) || 10));

    if (!['asc', 'desc'].includes(order.toLowerCase())) {
      order = 'desc';
    }

    req.pagination = {
      page,
      limit,
      skip: (page - 1) * limit,
      sortBy,
      order: order.toLowerCase()
    };

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid pagination parameters',
      error: error.message
    });
  }
};

/**
 * Validate ID parameter (MongoDB ObjectId format)
 */
const validateId = (req, res, next) => {
  try {
    const { id } = req.params;

    // Simple regex for UUID or numeric ID validation
    if (!id || !/^[a-zA-Z0-9-]+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'ID validation error',
      error: error.message
    });
  }
};

module.exports = {
  validateTransaction,
  validateUser,
  validatePagination,
  validateId
};
