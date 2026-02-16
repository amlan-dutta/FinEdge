/**
 * Transaction Model
 * Represents income/expense transactions
 */

class Transaction {
  constructor(data) {
    this.id = data.id || null;
    this.userId = data.userId;
    this.type = data.type; // 'income' or 'expense'
    this.category = data.category;
    this.amount = data.amount;
    this.description = data.description || '';
    this.date = data.date || new Date();
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Validate transaction data
   */
  static validate(data) {
    const errors = [];

    if (!data.userId) {
      errors.push('User ID is required');
    }

    if (!data.type || !['income', 'expense'].includes(data.type)) {
      errors.push('Type must be either "income" or "expense"');
    }

    if (!data.category || data.category.trim() === '') {
      errors.push('Category is required');
    }

    if (typeof data.amount !== 'number' || data.amount <= 0) {
      errors.push('Amount must be a positive number');
    }

    if (!data.date || isNaN(new Date(data.date))) {
      errors.push('Valid date is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if transaction is income
   */
  isIncome() {
    return this.type === 'income';
  }

  /**
   * Check if transaction is expense
   */
  isExpense() {
    return this.type === 'expense';
  }

  /**
   * Get formatted amount with sign
   */
  getFormattedAmount() {
    const sign = this.isIncome() ? '+' : '-';
    return `${sign}$${this.amount.toFixed(2)}`;
  }

  /**
   * Get transaction month (YYYY-MM format)
   */
  getMonth() {
    const date = new Date(this.date);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}

module.exports = Transaction;
