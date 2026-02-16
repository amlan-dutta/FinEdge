/**
 * MongoDB Transaction Model
 * Mongoose schema for Transaction collection
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either "income" or "expense"'
      },
      required: [true, 'Transaction type is required'],
      index: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: 50,
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
      max: [1000000, 'Amount exceeds maximum limit']
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet'],
      default: 'cash'
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

/**
 * Compound indexes for common queries
 */
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ date: -1 });

/**
 * Virtual for formatted amount
 */
transactionSchema.virtual('formattedAmount').get(function () {
  const sign = this.type === 'income' ? '+' : '-';
  return `${sign}$${this.amount.toFixed(2)}`;
});

/**
 * Virtual for month (YYYY-MM format)
 */
transactionSchema.virtual('month').get(function () {
  const date = new Date(this.date);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
});

module.exports = mongoose.model('Transaction', transactionSchema);
