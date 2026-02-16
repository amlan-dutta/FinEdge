/**
 * Transaction Service
 * Business logic for transaction operations
 */

const FileStorageService = require('../utils/fileStorage');
const config = require('../config/config');
const { NotFoundError, ValidationError } = require('../utils/errors');

class TransactionService {
  /**
   * Create new transaction
   */
  static async createTransaction(transactionData) {
    try {
      const transaction = {
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: transactionData.userId,
        type: transactionData.type, // 'income' or 'expense'
        category: transactionData.category,
        amount: transactionData.amount,
        description: transactionData.description || '',
        date: transactionData.date || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await FileStorageService.appendToFile(config.storage.transactionsFile, transaction);
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(id) {
    try {
      const transaction = await FileStorageService.findByIdInFile(config.storage.transactionsFile, id);
      if (!transaction) {
        throw new NotFoundError('Transaction');
      }
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user transactions with filters
   */
  static async getUserTransactions(userId, filters = {}) {
    try {
      let transactions = await FileStorageService.findInFile(
        config.storage.transactionsFile,
        t => t.userId === userId
      );

      // Apply filters
      if (filters.type) {
        transactions = transactions.filter(t => t.type === filters.type);
      }

      if (filters.category) {
        transactions = transactions.filter(t => t.category === filters.category);
      }

      if (filters.startDate) {
        const start = new Date(filters.startDate);
        transactions = transactions.filter(t => new Date(t.date) >= start);
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate);
        transactions = transactions.filter(t => new Date(t.date) <= end);
      }

      // Sort by date (newest first)
      transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      return transactions;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update transaction
   */
  static async updateTransaction(id, updateData) {
    try {
      // Verify transaction exists
      await this.getTransactionById(id);

      const updated = await FileStorageService.updateInFile(
        config.storage.transactionsFile,
        id,
        updateData
      );
      return updated;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete transaction
   */
  static async deleteTransaction(id) {
    try {
      // Verify transaction exists
      await this.getTransactionById(id);

      await FileStorageService.deleteFromFile(config.storage.transactionsFile, id);
      return { success: true, id };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get summary statistics
   */
  static async getSummary(userId, month = null) {
    try {
      const transactions = await this.getUserTransactions(userId);

      let filtered = transactions;
      if (month) {
        const [year, monthNum] = month.split('-');
        filtered = transactions.filter(t => {
          const date = new Date(t.date);
          return date.getFullYear() === parseInt(year) && 
                 date.getMonth() === parseInt(monthNum) - 1;
        });
      }

      let totalIncome = 0;
      let totalExpense = 0;
      const incomeByCategory = {};
      const expenseByCategory = {};

      filtered.forEach(t => {
        if (t.type === 'income') {
          totalIncome += t.amount;
          incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
        } else {
          totalExpense += t.amount;
          expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
        }
      });

      const netSavings = totalIncome - totalExpense;
      const savingsPercentage = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

      return {
        totalIncome,
        totalExpense,
        netSavings,
        savingsPercentage: parseFloat(savingsPercentage.toFixed(2)),
        incomeByCategory,
        expenseByCategory,
        transactionCount: filtered.length,
        period: month || 'all-time'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get category summary
   */
  static async getCategorySummary(userId, category, filters = {}) {
    try {
      const transactions = await this.getUserTransactions(userId, { category });

      let filtered = transactions;
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        filtered = filtered.filter(t => new Date(t.date) >= start);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        filtered = filtered.filter(t => new Date(t.date) <= end);
      }

      const totalAmount = filtered.reduce((sum, t) => sum + t.amount, 0);
      const incomeCount = filtered.filter(t => t.type === 'income').length;
      const expenseCount = filtered.filter(t => t.type === 'expense').length;
      const average = filtered.length > 0 ? totalAmount / filtered.length : 0;

      return {
        category,
        totalAmount,
        transactionCount: filtered.length,
        incomeCount,
        expenseCount,
        average: parseFloat(average.toFixed(2))
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TransactionService;
