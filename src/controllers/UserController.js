/**
 * User Controller
 * Handles user registration and authentication
 */

const User = require('../models/User');
const DatabaseService = require('../utils/database');
const { asyncHandler } = require('../middleware/errorHandler');

class UserController {
  /**
   * Register new user
   * POST /users
   */
  static register = asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, preferences } = req.validatedData || req.body;

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      preferences
    });

    // Save to database asynchronously
    const savedUser = await DatabaseService.save('users', {
      email: user.email,
      password: user.password, // TODO: Hash password
      firstName: user.firstName,
      lastName: user.lastName,
      preferences: user.preferences
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        fullName: `${savedUser.firstName} ${savedUser.lastName}`
      }
    });
  });

  /**
   * Get user by ID
   */
  static getUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Fetch from database asynchronously
    const user = await DatabaseService.findById('users', id);

    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        preferences: user.preferences
      }
    });
  });

  /**
   * Update user preferences
   */
  static updatePreferences = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Valid preferences object is required'
      });
    }

    // Update in database asynchronously
    const updatedUser = await DatabaseService.update('users', id, {
      preferences
    });

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        id: updatedUser.id,
        preferences: updatedUser.preferences
      }
    });
  });

  /**
   * Delete user account
   */
  static deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Delete from database asynchronously
    await DatabaseService.delete('users', id);

    res.json({
      success: true,
      message: 'User account deleted successfully',
      data: { id }
    });
  });
}

module.exports = UserController;
