/**
 * Transaction Service (MongoDB)
 * Business logic for transaction operations with MongoDB
 */

const Transaction = require('../models/TransactionModel');
const MongoDBService = require('../utils/mongoDBService');
const { NotFoundError, ValidationError } = require('../utils/errors');

class TransactionService {
  /**
   * Create new transaction
   */
  static async createTransaction(transactionData) {
    try {
      const txnDoc = {
        userId: transactionData.userId,
        type: transactionData.type,
        category: transactionData.category,
        amount: transactionData.amount,
        description: transactionData.description || '',
        date: transactionData.date || new Date(),
        tags: transactionData.tags || [],
        paymentMethod: transactionData.paymentMethod || 'cash',
        isRecurring: transactionData.isRecurring || false,
        recurringFrequency: transactionData.recurringFrequency || null
      };

      return await MongoDBService.create(Transaction, txnDoc);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(id) {
    try {
      const transaction = await MongoDBService.findById(Transaction, id);
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
  static async getUserTransactions(userId, filters = {}, options = {}) {
    try {
      const query = { userId };

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }

      if (filters.startDate || filters.endDate) {
        query.date = {};
        if (filters.startDate) {
          query.date.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.date.$lte = new Date(filters.endDate);
        }
      }

      return await MongoDBService.find(Transaction, query, {
        skip: options.skip || 0,
        limit: options.limit || 10,
        sort: options.sort || { date: -1 }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get transactions by category and month
   */
  static async getTransactionsByCategory(userId, category, month = null) {
    try {
      const query = { userId, category };

      if (month) {
        const [year, monthNum] = month.split('-');
        const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(monthNum), 0);
        query.date = { $gte: startDate, $lte: endDate };
      }

      return await MongoDBService.find(Transaction, query, {
        sort: { date: -1 }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update transaction
   */
  static async updateTransaction(id, updateData) {
    try {
      const allowed = ['type', 'category', 'amount', 'description', 'date', 'tags', 'paymentMethod'];
      const filteredData = {};

      allowed.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });

      const updated = await MongoDBService.update(Transaction, id, filteredData);
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
      await MongoDBService.delete(Transaction, id);
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
      const pipeline = [
        { $match: { userId: require('mongoose').Types.ObjectId(userId) } }
      ];

      if (month) {
        const [year, monthNum] = month.split('-');
        const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(monthNum), 0);
        pipeline.push({
          $match: { date: { $gte: startDate, $lte: endDate } }
        });
      }

      pipeline.push({
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      });

      const results = await MongoDBService.aggregate(Transaction, pipeline);

      let totalIncome = 0;
      let totalExpense = 0;

      results.forEach(item => {
        if (item._id === 'income') {
          totalIncome = item.total;
        } else {
          totalExpense = item.total;
        }
      });

      const netSavings = totalIncome - totalExpense;
      const savingsPercentage = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

      return {
        totalIncome,
        totalExpense,
        netSavings,
        savingsPercentage: parseFloat(savingsPercentage.toFixed(2)),
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
      const query = { userId, category };

      if (filters.startDate || filters.endDate) {
        query.date = {};
        if (filters.startDate) query.date.$gte = new Date(filters.startDate);
        if (filters.endDate) query.date.$lte = new Date(filters.endDate);
      }

      const transactions = await MongoDBService.find(Transaction, query, {
        limit: 1000
      });

      const totalAmount = transactions.data.reduce((sum, t) => sum + t.amount, 0);
      const incomeCount = transactions.data.filter(t => t.type === 'income').length;
      const expenseCount = transactions.data.filter(t => t.type === 'expense').length;
      const average = transactions.data.length > 0 ? totalAmount / transactions.data.length : 0;

      return {
        category,
        totalAmount,
        transactionCount: transactions.data.length,
        incomeCount,
        expenseCount,
        average: parseFloat(average.toFixed(2))
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get monthly comparison
   */
  static async getMonthlyComparison(userId, months = 3) {
    try {
      const comparison = [];

      for (let i = 0; i < months; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const monthKey = `${year}-${month}`;

        const summary = await this.getSummary(userId, monthKey);
        comparison.push({
          month: monthKey,
          ...summary
        });
      }

      return comparison.reverse();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get spending trends
   */
  static async getSpendingTrends(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const pipeline = [
        {
          $match: {
            userId: require('mongoose').Types.ObjectId(userId),
            date: { $gte: startDate },
            type: 'expense'
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ];

      return await MongoDBService.aggregate(Transaction, pipeline);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TransactionService;
