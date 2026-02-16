/**
 * MongoDB Budget Model
 * Mongoose schema for Budget collection
 */

const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'],
      index: true
    },
    monthlyGoal: {
      type: Number,
      required: [true, 'Monthly goal is required'],
      min: [0, 'Monthly goal must be non-negative']
    },
    savingsTarget: {
      type: Number,
      required: [true, 'Savings target is required'],
      min: [0, 'Savings target must be non-negative']
    },
    categories: {
      type: Map,
      of: {
        type: Number,
        min: [0, 'Budget amount must be non-negative']
      },
      default: new Map()
    },
    spent: {
      type: Number,
      default: 0
    },
    alerts: {
      thresholdPercentage: {
        type: Number,
        default: 80,
        min: [0, 'Threshold must be between 0-100'],
        max: [100, 'Threshold must be between 0-100']
      },
      enabled: {
        type: Boolean,
        default: true
      }
    },
    notes: {
      type: String,
      maxlength: 500
    },
    isActive: {
      type: Boolean,
      default: true
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
 * Compound index for user and month
 */
budgetSchema.index({ userId: 1, month: 1 }, { unique: true });
budgetSchema.index({ userId: 1, isActive: 1 });

/**
 * Get remaining budget
 */
budgetSchema.methods.getRemainingBudget = function () {
  const totalCategoryBudgets = Array.from(this.categories.values()).reduce((sum, amount) => sum + amount, 0);
  return this.monthlyGoal - totalCategoryBudgets;
};

/**
 * Get remaining amount before threshold
 */
budgetSchema.methods.getRemainingBeforeAlert = function () {
  const threshold = (this.monthlyGoal * this.alerts.thresholdPercentage) / 100;
  return threshold - this.spent;
};

/**
 * Check if budget is exceeded
 */
budgetSchema.methods.isExceeded = function () {
  return this.spent > this.monthlyGoal;
};

/**
 * Check if alert threshold is reached
 */
budgetSchema.methods.isAlertThresholdReached = function () {
  const threshold = (this.monthlyGoal * this.alerts.thresholdPercentage) / 100;
  return this.spent >= threshold;
};

module.exports = mongoose.model('Budget', budgetSchema);
