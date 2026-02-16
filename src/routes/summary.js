/**
 * Summary Routes
 */

const express = require('express');
const router = express.Router();
const SummaryController = require('../controllers/SummaryController');

/**
 * GET /summary
 * Fetch income-expense summary
 */
router.get('/', SummaryController.getSummary);

/**
 * GET /summary/category
 * Get summary by category
 */
router.get('/category/:category', SummaryController.getCategorySummary);

/**
 * GET /summary/monthly-comparison
 * Get monthly comparison
 */
router.get('/monthly-comparison', SummaryController.getMonthlyComparison);

module.exports = router;
