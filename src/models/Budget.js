/**
 * Budget Model
 * Manages monthly budgets and savings targets
 */

class Budget {
  constructor(data) {
    this.id = data.id || null;
    this.userId = data.userId;
    this.month = data.month; // YYYY-MM format
    this.monthlyGoal = data.monthlyGoal;
    this.savingsTarget = data.savingsTarget;
    this.categories = data.categories || {}; // Category-wise budgets
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Validate budget data
   */
  static validate(data) {
    const errors = [];

    if (!data.userId) {
      errors.push('User ID is required');
    }

    if (!data.month || !/^\d{4}-\d{2}$/.test(data.month)) {
      errors.push('Month must be in YYYY-MM format');
    }

    if (typeof data.monthlyGoal !== 'number' || data.monthlyGoal <= 0) {
      errors.push('Monthly goal must be a positive number');
    }

    if (typeof data.savingsTarget !== 'number' || data.savingsTarget < 0) {
      errors.push('Savings target must be a non-negative number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Set budget for a specific category
   */
  setCategoryBudget(category, amount) {
    if (amount < 0) {
      throw new Error('Budget amount cannot be negative');
    }
    this.categories[category] = amount;
    this.updatedAt = new Date();
  }

  /**
   * Get budget for a specific category
   */
  getCategoryBudget(category) {
    return this.categories[category] || 0;
  }

  /**
   * Calculate total category budgets
   */
  getTotalCategoryBudgets() {
    return Object.values(this.categories).reduce((sum, amount) => sum + amount, 0);
  }

  /**
   * Get remaining budget (monthlyGoal - totalCategoryBudgets)
   */
  getRemainingBudget() {
    return this.monthlyGoal - this.getTotalCategoryBudgets();
  }

  /**
   * Check if budget is within limits
   */
  isWithinBudget(spent) {
    return spent <= this.monthlyGoal;
  }

  /**
   * Calculate savings percentage
   */
  calculateSavingsPercentage(income) {
    if (income === 0) return 0;
    return (this.savingsTarget / income) * 100;
  }
}

module.exports = Budget;
