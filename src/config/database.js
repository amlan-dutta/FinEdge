/**
 * MongoDB Connection Configuration
 * Handles MongoDB connection and initialization
 */

const mongoose = require('mongoose');
const config = require('./config');

class MongoDBConnection {
  static instance = null;
  static isConnected = false;

  /**
   * Get MongoDB connection instance (singleton)
   */
  static async getInstance() {
    if (this.instance && this.isConnected) {
      return this.instance;
    }

    return this.connect();
  }

  /**
   * Connect to MongoDB
   */
  static async connect() {
    try {
      if (this.isConnected) {
        console.log('[MongoDB] Already connected');
        return mongoose.connection;
      }

      const mongoUri = process.env.MONGODB_URI || config.db.mongodb_uri;

      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }

      console.log('[MongoDB] Connecting to:', mongoUri.split('@')[mongoUri.split('@').length - 1]);

      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      });

      this.instance = mongoose.connection;
      this.isConnected = true;

      console.log('[MongoDB] Connected successfully');

      // Connection event listeners
      mongoose.connection.on('error', (err) => {
        console.error('[MongoDB] Connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('[MongoDB] Disconnected');
        this.isConnected = false;
      });

      return this.instance;
    } catch (error) {
      console.error('[MongoDB] Connection failed:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  static async disconnect() {
    try {
      if (this.isConnected) {
        await mongoose.disconnect();
        this.isConnected = false;
        console.log('[MongoDB] Disconnected');
      }
    } catch (error) {
      console.error('[MongoDB] Disconnect error:', error.message);
      throw error;
    }
  }

  /**
   * Check connection status
   */
  static isConnectionAlive() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Drop database (for testing)
   */
  static async dropDatabase() {
    try {
      if (this.isConnected) {
        await mongoose.connection.dropDatabase();
        console.log('[MongoDB] Database dropped');
      }
    } catch (error) {
      console.error('[MongoDB] Drop database error:', error.message);
      throw error;
    }
  }
}

module.exports = MongoDBConnection;
