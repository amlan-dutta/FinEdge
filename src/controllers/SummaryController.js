/**
 * Summary Controller
 * Handles income-expense summary calculations
 */

const DatabaseService = require('../utils/database');
const { asyncHandler } = require('../middleware/errorHandler');

class SummaryController {
  /**
   * Fetch income-expense summary
   * GET /summary
   */
  static getSummary = asyncHandler(async (req, res) => {
    const { userId, month } = req.query;

    if (!userId) {
      const error = new Error('User ID is required');
      error.status = 400;
      throw error;
    }

    // Build filters
    const filters = { userId };
    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(year, parseInt(monthNum) - 1, 1);
      const endDate = new Date(year, parseInt(monthNum), 0);
      filters.date = { $gte: startDate, $lte: endDate };
    }

    // Fetch transactions asynchronously
    const result = await DatabaseService.find('transactions', filters, {
      skip: 0,
      limit: 1000
    });

    // Calculate summary
    let totalIncome = 0;
    let totalExpense = 0;
    const incomeByCategory = {};
    const expenseByCategory = {};

    result.data.forEach(transaction => {
      const amount = transaction.amount;
      const category = transaction.category;

      if (transaction.type === 'income') {
        totalIncome += amount;
        incomeByCategory[category] = (incomeByCategory[category] || 0) + amount;
      } else {
        totalExpense += amount;
        expenseByCategory[category] = (expenseByCategory[category] || 0) + amount;
      }
    });

    const netSavings = totalIncome - totalExpense;
    const savingsPercentage = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    const summary = {
      totalIncome,
      totalExpense,
      netSavings,
      savingsPercentage: parseFloat(savingsPercentage.toFixed(2)),
      incomeByCategory,
      expenseByCategory,
      transactionCount: result.data.length,
      period: month || 'all-time'
    };

    res.json({
      success: true,
      data: summary
    });
  });

  /**
   * Get summary by category
   */
  static getCategorySummary = asyncHandler(async (req, res) => {
    const { userId, category, startDate, endDate } = req.query;

    if (!userId || !category) {
      const error = new Error('User ID and category are required');
      error.status = 400;
      throw error;
    }

    // Build filters
    const filters = { userId, category };
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    // Fetch transactions asynchronously
    const result = await DatabaseService.find('transactions', filters, {
      skip: 0,
      limit: 1000
    });

    // Calculate statistics
    const totalAmount = result.data.reduce((sum, t) => sum + t.amount, 0);
    const average = result.data.length > 0 ? totalAmount / result.data.length : 0;
    const incomeCount = result.data.filter(t => t.type === 'income').length;
    const expenseCount = result.data.filter(t => t.type === 'expense').length;

    res.json({
      success: true,
      data: {
        category,
        totalAmount,
        transactionCount: result.data.length,
        incomeCount,
        expenseCount,
        average: parseFloat(average.toFixed(2)),
        dateRange: {
          start: startDate || 'all-time',
          end: endDate || 'all-time'
        }
      }
    });
  });

  /**
   * Get monthly comparison
   */
  static getMonthlyComparison = asyncHandler(async (req, res) => {
    const { userId, months = '3' } = req.query;

    if (!userId) {
      const error = new Error('User ID is required');
      error.status = 400;
      throw error;
    }

    const numMonths = Math.min(parseInt(months) || 3, 12);
    const comparison = [];

    // Fetch data for each month
    for (let i = 0; i < numMonths; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;

      const startDate = new Date(year, date.getMonth(), 1);
      const endDate = new Date(year, date.getMonth() + 1, 0);

      const filters = {
        userId,
        date: { $gte: startDate, $lte: endDate }
      };

      const result = await DatabaseService.find('transactions', filters, {
        skip: 0,
        limit: 1000
      });

      let totalIncome = 0;
      let totalExpense = 0;

      result.data.forEach(transaction => {
        if (transaction.type === 'income') {
          totalIncome += transaction.amount;
        } else {
          totalExpense += transaction.amount;
        }
      });

      comparison.push({
        month: monthKey,
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        transactionCount: result.data.length
      });
    }

    res.json({
      success: true,
      data: comparison.reverse()
    });
  });
}

module.exports = SummaryController;
