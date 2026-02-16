/**
 * User Service (MongoDB)
 * Business logic for user operations with MongoDB
 */

const User = require('../models/UserModel');
const MongoDBService = require('../utils/mongoDBService');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

class UserService {
  /**
   * Create new user
   */
  static async createUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await MongoDBService.findOne(User, { email: userData.email.toLowerCase() });
      if (existingUser) {
        throw new ConflictError(`User with email ${userData.email} already exists`);
      }

      const userDoc = {
        email: userData.email.toLowerCase(),
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        preferences: userData.preferences || {
          currency: 'USD',
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      };

      const user = await MongoDBService.create(User, userDoc);
      return user.toJSON();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id) {
    try {
      const user = await MongoDBService.findById(User, id);
      if (!user) {
        throw new NotFoundError('User');
      }
      return user.toJSON();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email) {
    try {
      const user = await MongoDBService.findOne(User, { email: email.toLowerCase() });
      return user ? user.toJSON() : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Authenticate user with email and password
   */
  static async authenticateUser(email, password) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        throw new ValidationError('Invalid email or password');
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new ValidationError('Invalid email or password');
      }

      // Update last login
      await MongoDBService.update(User, user._id, { lastLogin: new Date() });

      return user.toJSON();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(userId, preferences) {
    try {
      const user = await this.getUserById(userId);
      const updated = await MongoDBService.update(User, userId, {
        preferences: { ...user.preferences, ...preferences }
      });
      return updated.toJSON();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, profileData) {
    try {
      const allowed = ['firstName', 'lastName', 'preferences'];
      const updateData = {};

      allowed.forEach(field => {
        if (profileData[field] !== undefined) {
          updateData[field] = profileData[field];
        }
      });

      const updated = await MongoDBService.update(User, userId, updateData);
      return updated.toJSON();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change password
   */
  static async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new NotFoundError('User');
      }

      const isPasswordValid = await user.comparePassword(oldPassword);
      if (!isPasswordValid) {
        throw new ValidationError('Current password is incorrect');
      }

      user.password = newPassword;
      await user.save();

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(userId) {
    try {
      await MongoDBService.delete(User, userId);
      return { success: true, id: userId };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(options = {}) {
    try {
      const result = await MongoDBService.find(User, { isActive: true }, {
        skip: options.skip || 0,
        limit: options.limit || 10,
        sort: options.sort || { createdAt: -1 }
      });

      return {
        ...result,
        data: result.data.map(user => user.toJSON())
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search users
   */
  static async searchUsers(query, options = {}) {
    try {
      const searchQuery = {
        $or: [
          { email: { $regex: query, $options: 'i' } },
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } }
        ]
      };

      const result = await MongoDBService.find(User, searchQuery, {
        skip: options.skip || 0,
        limit: options.limit || 10
      });

      return {
        ...result,
        data: result.data.map(user => user.toJSON())
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;
