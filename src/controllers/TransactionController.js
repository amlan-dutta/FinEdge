/**
 * Transaction Controller
 * Handles transaction operations (create, read, update, delete)
 */

const Transaction = require('../models/Transaction');
const DatabaseService = require('../utils/database');
const { asyncHandler } = require('../middleware/errorHandler');

class TransactionController {
  /**
   * Add income/expense transaction
   * POST /transactions
   */
  static createTransaction = asyncHandler(async (req, res) => {
    const { userId, type, category, amount, description, date } = req.validatedData || req.body;

    // Create new transaction
    const transaction = new Transaction({
      userId,
      type,
      category,
      amount,
      description,
      date
    });

    // Save to database asynchronously
    const savedTransaction = await DatabaseService.save('transactions', {
      userId: transaction.userId,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        id: savedTransaction.id,
        type: savedTransaction.type,
        category: savedTransaction.category,
        amount: savedTransaction.amount,
        formattedAmount: `${savedTransaction.type === 'income' ? '+' : '-'}$${savedTransaction.amount.toFixed(2)}`,
        date: savedTransaction.date,
        description: savedTransaction.description
      }
    });
  });

  /**
   * Fetch all transactions
   * GET /transactions
   */
  static getTransactions = asyncHandler(async (req, res) => {
    const { userId, type, category, startDate, endDate } = req.query;
    const pagination = req.pagination || { page: 1, limit: 10, skip: 0 };

    // Build filters
    const filters = {};
    if (userId) filters.userId = userId;
    if (type) filters.type = type;
    if (category) filters.category = category;
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    // Fetch from database asynchronously
    const result = await DatabaseService.find('transactions', filters, pagination);

    res.json({
      success: true,
      data: result.data,
      count: result.data.length,
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  });

  /**
   * View single transaction
   * GET /transactions/:id
   */
  static getTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Fetch from database asynchronously
    const transaction = await DatabaseService.findById('transactions', id);

    if (!transaction) {
      const error = new Error('Transaction not found');
      error.status = 404;
      throw error;
    }

    res.json({
      success: true,
      data: transaction
    });
  });

  /**
   * Update transaction
   * PATCH /transactions/:id
   */
  static updateTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { type, category, amount, description, date } = req.body;

    // Build update data
    const updateData = {};
    if (type) updateData.type = type;
    if (category) updateData.category = category;
    if (amount) updateData.amount = amount;
    if (description !== undefined) updateData.description = description;
    if (date) updateData.date = date;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Update in database asynchronously
    const updatedTransaction = await DatabaseService.update('transactions', id, updateData);

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction
    });
  });

  /**
   * Delete transaction
   * DELETE /transactions/:id
   */
  static deleteTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Delete from database asynchronously
    await DatabaseService.delete('transactions', id);

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
      data: { id }
    });
  });
}

module.exports = TransactionController;
