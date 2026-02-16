/**
 * User Service
 * Business logic for user operations
 */

const FileStorageService = require('../utils/fileStorage');
const config = require('../config/config');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

class UserService {
  /**
   * Create new user
   */
  static async createUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError(`User with email ${userData.email} already exists`);
      }

      const user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: userData.email.toLowerCase(),
        password: userData.password, // TODO: Hash in production
        firstName: userData.firstName,
        lastName: userData.lastName,
        preferences: userData.preferences || {
          currency: 'USD',
          theme: 'light',
          notifications: true,
          language: 'en'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await FileStorageService.appendToFile(config.storage.usersFile, user);
      
      // Return user without password
      const { password, ...safeUser } = user;
      return safeUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id) {
    try {
      const user = await FileStorageService.findByIdInFile(config.storage.usersFile, id);
      if (!user) {
        throw new NotFoundError('User');
      }
      const { password, ...safeUser } = user;
      return safeUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email) {
    try {
      const users = await FileStorageService.readFile(config.storage.usersFile);
      return users.find(u => u.email === email.toLowerCase()) || null;
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
      const updated = await FileStorageService.updateInFile(config.storage.usersFile, userId, {
        preferences: { ...user.preferences, ...preferences }
      });
      const { password, ...safeUser } = updated;
      return safeUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(userId) {
    try {
      // Verify user exists
      await this.getUserById(userId);
      
      // Delete user
      await FileStorageService.deleteFromFile(config.storage.usersFile, userId);
      
      // TODO: Delete associated transactions and budgets
      
      return { success: true, id: userId };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers() {
    try {
      const users = await FileStorageService.readFile(config.storage.usersFile);
      return users.map(u => {
        const { password, ...safeUser } = u;
        return safeUser;
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;
