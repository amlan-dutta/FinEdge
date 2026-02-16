/**
 * Logger Middleware
 * Logs request details and response information
 */

const fs = require('fs');
const path = require('path');

/**
 * Create logs directory if it doesn't exist
 */
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Format log message
 */
const formatLog = (req, res, responseTime) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('user-agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id || 'anonymous',
    body: req.method !== 'GET' ? req.body : undefined
  });
};

/**
 * Request logging middleware
 */
const logger = (req, res, next) => {
  const startTime = Date.now();

  // Store original send method
  const originalSend = res.send;

  // Override send method to capture response
  res.send = function (data) {
    const responseTime = Date.now() - startTime;
    const logMessage = formatLog(req, res, responseTime);

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      const status = res.statusCode;
      const color = status >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red for errors, green for success
      const reset = '\x1b[0m';
      console.log(`${color}${logMessage}${reset}`);
    }

    // Append to file in production
    if (process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') {
      fs.appendFileSync(
        path.join(logsDir, 'access.log'),
        logMessage + '\n',
        { flag: 'a' }
      );
    }

    // Call the original send method
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Request body logger (for debugging)
 */
const bodyLogger = (req, res, next) => {
  if (req.method !== 'GET' && Object.keys(req.body).length > 0) {
    console.log(`[${new Date().toISOString()}] Request Body:`, req.body);
  }
  next();
};

module.exports = {
  logger,
  bodyLogger
};
