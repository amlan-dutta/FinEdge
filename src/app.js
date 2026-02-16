/**
 * Main Application Entry Point
 * Express server setup and configuration
 */

const express = require('express');
const path = require('path');

const app = express();

// Import middleware
const { logger, bodyLogger } = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { validateTransaction, validateUser, validatePagination } = require('./middleware/validation');

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Logging middleware
app.use(logger);
app.use(bodyLogger);

// Pagination validation middleware
app.use(validatePagination);

// Routes
const usersRouter = require('./routes/users');
const transactionsRouter = require('./routes/transactions');
const summaryRouter = require('./routes/summary');

// Apply validation middleware to specific routes
app.post('/users', validateUser);
app.post('/transactions', validateTransaction);

// Mount routes
app.use('/users', usersRouter);
app.use('/transactions', transactionsRouter);
app.use('/summary', summaryRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'FinEdge - Personal Finance Manager API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 Handler (must be after all routes)
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
