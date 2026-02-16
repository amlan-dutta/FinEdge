/**
 * MongoDB Service
 * Wrapper for common MongoDB operations
 */

const mongoose = require('mongoose');
const MongoDBConnection = require('../config/database');
const { DatabaseError, NotFoundError } = require('./errors');

class MongoDBService {
  /**
   * Ensure database connection
   */
  static async ensureConnection() {
    try {
      await MongoDBConnection.getInstance();
    } catch (error) {
      throw new DatabaseError('Database connection failed', error);
    }
  }

  /**
   * Create document
   */
  static async create(model, data) {
    try {
      await this.ensureConnection();
      const doc = new model(data);
      return await doc.save();
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        throw new DatabaseError(`${field} already exists`, error);
      }
      throw new DatabaseError('Failed to create document', error);
    }
  }

  /**
   * Find by ID
   */
  static async findById(model, id) {
    try {
      await this.ensureConnection();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      return await model.findById(id);
    } catch (error) {
      throw new DatabaseError('Failed to find document', error);
    }
  }

  /**
   * Find one document
   */
  static async findOne(model, query) {
    try {
      await this.ensureConnection();
      return await model.findOne(query);
    } catch (error) {
      throw new DatabaseError('Failed to find document', error);
    }
  }

  /**
   * Find multiple documents
   */
  static async find(model, query = {}, options = {}) {
    try {
      await this.ensureConnection();

      const {
        skip = 0,
        limit = 10,
        sort = { createdAt: -1 },
        select = null,
        populate = null
      } = options;

      let query_builder = model.find(query);

      if (select) {
        query_builder = query_builder.select(select);
      }

      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(p => {
            query_builder = query_builder.populate(p);
          });
        } else {
          query_builder = query_builder.populate(populate);
        }
      }

      const total = await model.countDocuments(query);
      const data = await query_builder.sort(sort).skip(skip).limit(limit);

      return {
        data,
        total,
        skip,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new DatabaseError('Failed to find documents', error);
    }
  }

  /**
   * Update document
   */
  static async update(model, id, updateData) {
    try {
      await this.ensureConnection();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new NotFoundError('Document');
      }

      const doc = await model.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!doc) {
        throw new NotFoundError('Document');
      }

      return doc;
    } catch (error) {
      if (error.name === 'NotFoundError') {
        throw error;
      }
      throw new DatabaseError('Failed to update document', error);
    }
  }

  /**
   * Delete document
   */
  static async delete(model, id) {
    try {
      await this.ensureConnection();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new NotFoundError('Document');
      }

      const result = await model.findByIdAndDelete(id);

      if (!result) {
        throw new NotFoundError('Document');
      }

      return { success: true, id };
    } catch (error) {
      if (error.name === 'NotFoundError') {
        throw error;
      }
      throw new DatabaseError('Failed to delete document', error);
    }
  }

  /**
   * Delete many documents
   */
  static async deleteMany(model, query) {
    try {
      await this.ensureConnection();
      const result = await model.deleteMany(query);
      return {
        deletedCount: result.deletedCount,
        acknowledged: result.acknowledged
      };
    } catch (error) {
      throw new DatabaseError('Failed to delete documents', error);
    }
  }

  /**
   * Count documents
   */
  static async count(model, query = {}) {
    try {
      await this.ensureConnection();
      return await model.countDocuments(query);
    } catch (error) {
      throw new DatabaseError('Failed to count documents', error);
    }
  }

  /**
   * Aggregate documents
   */
  static async aggregate(model, pipeline) {
    try {
      await this.ensureConnection();
      return await model.aggregate(pipeline);
    } catch (error) {
      throw new DatabaseError('Failed to aggregate documents', error);
    }
  }

  /**
   * Bulk write operations
   */
  static async bulkWrite(model, operations) {
    try {
      await this.ensureConnection();
      return await model.collection.bulkWrite(operations);
    } catch (error) {
      throw new DatabaseError('Bulk write failed', error);
    }
  }

  /**
   * Session transaction
   */
  static async transaction(callback) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new DatabaseError('Transaction failed', error);
    } finally {
      await session.endSession();
    }
  }
}

module.exports = MongoDBService;
