/**
 * Server Entry Point with MongoDB Connection
 */

const app = require('./app');
const config = require('./config/config');
const MongoDBConnection = require('./config/database');

const PORT = config.app.port;

/**
 * Initialize server
 */
async function initializeServer() {
  try {
    // Connect to MongoDB
    if (config.db.type === 'mongodb') {
      console.log('[Server] Initializing MongoDB connection...');
      await MongoDBConnection.connect();
      console.log('[Server] MongoDB connected successfully');
    }

    // Start server
    app.listen(PORT, config.app.host, () => {
      console.log(`
╔════════════════════════════════════════╗
║        FinEdge - Finance Manager       ║
║          Server is Running             ║
╚════════════════════════════════════════╝

✓ Application: ${config.app.name}
✓ Version: ${config.app.version}
✓ Environment: ${config.app.environment}
✓ Server: http://${config.app.host}:${PORT}
✓ Database: ${config.db.type}
✓ Timestamp: ${new Date().toISOString()}
      `);
    });
  } catch (error) {
    console.error('[Server] Initialization failed:', error.message);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  console.log('\n[Server] Shutting down gracefully...');
  try {
    await MongoDBConnection.disconnect();
    console.log('[Server] MongoDB disconnected');
    process.exit(0);
  } catch (error) {
    console.error('[Server] Shutdown error:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('[Server] SIGTERM received, shutting down...');
  try {
    await MongoDBConnection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Server] Shutdown error:', error);
    process.exit(1);
  }
});

// Start server
initializeServer();
