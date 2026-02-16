/**
 * User Model
 * Manages authentication and user preferences
 */

class User {
  constructor(data) {
    this.id = data.id || null;
    this.email = data.email;
    this.password = data.password; // Should be hashed in practice
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.preferences = data.preferences || {
      currency: 'USD',
      theme: 'light',
      notifications: true,
      language: 'en'
    };
  }

  /**
   * Validate user data
   */
  static validate(data) {
    const errors = [];

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Valid email is required');
    }

    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    if (!data.firstName || data.firstName.trim() === '') {
      errors.push('First name is required');
    }

    if (!data.lastName || data.lastName.trim() === '') {
      errors.push('Last name is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get user display name
   */
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Update user preferences
   */
  updatePreferences(newPreferences) {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.updatedAt = new Date();
  }
}

module.exports = User;
