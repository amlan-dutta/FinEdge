/**
 * Transaction Routes
 */

const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/TransactionController');
const { validateId } = require('../middleware/validation');

/**
 * POST /transactions
 * Add income/expense transaction
 */
router.post('/', TransactionController.createTransaction);

/**
 * GET /transactions
 * Fetch all transactions (with optional filters)
 */
router.get('/', TransactionController.getTransactions);

/**
 * GET /transactions/:id
 * View single transaction
 */
router.get('/:id', validateId, TransactionController.getTransaction);

/**
 * PATCH /transactions/:id
 * Update transaction
 */
router.patch('/:id', validateId, TransactionController.updateTransaction);

/**
 * DELETE /transactions/:id
 * Delete transaction
 */
router.delete('/:id', validateId, TransactionController.deleteTransaction);

module.exports = router;
