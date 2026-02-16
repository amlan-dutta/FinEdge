require('dotenv').config();

const config = {
  // Application
  app: {
    name: process.env.APP_NAME || 'FinEdge',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },

  // Database
  db: {
    type: process.env.DB_TYPE || 'mongodb',
    mongodb_uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/finedge',
    useNewUrlParser: true,
    useUnifiedTopology: true
  },

  // Storage/File persistence
  storage: {
    type: process.env.STORAGE_TYPE || 'mongodb',
    dataDir: process.env.DATA_DIR || 'data',
    usersFile: process.env.USERS_FILE || 'data/users.json',
    transactionsFile: process.env.TRANSACTIONS_FILE || 'data/transactions.json',
    budgetsFile: process.env.BUDGETS_FILE || 'data/budgets.json'
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    toFile: process.env.LOG_TO_FILE === 'true',
    logsDir: process.env.LOGS_DIR || 'logs'
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 24 * 60 * 60 * 1000 // 24 hours
  },

  // API
  api: {
    maxRequestBodySize: process.env.MAX_REQUEST_BODY_SIZE || '10mb',
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
    maxTransactionsPerRequest: parseInt(process.env.MAX_TRANSACTIONS_PER_REQUEST) || 1000
  },

  // Validation
  validation: {
    maxDescriptionLength: parseInt(process.env.MAX_DESCRIPTION_LENGTH) || 500,
    maxAmount: parseInt(process.env.MAX_AMOUNT) || 1000000,
    maxCategoryNameLength: parseInt(process.env.MAX_CATEGORY_NAME_LENGTH) || 50
  }
};

/**
 * Validate configuration
 */
const validateConfig = () => {
  if (config.app.environment === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
      throw new Error('JWT_SECRET must be set in production');
    }
  }

  if (config.db.type === 'mongodb' && !config.db.mongodb_uri) {
    throw new Error('MONGODB_URI must be set when using MongoDB');
  }
};

validateConfig();

module.exports = config;
