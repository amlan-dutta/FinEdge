/**
 * File Storage Service
 * Handles file-based persistence using fs/promises
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');
const { DatabaseError } = require('./errors');

class FileStorageService {
  /**
   * Ensure data directory exists
   */
  static async ensureDataDir() {
    try {
      await fs.mkdir(config.storage.dataDir, { recursive: true });
    } catch (error) {
      throw new DatabaseError('Failed to create data directory', error);
    }
  }

  /**
   * Read JSON file
   */
  static async readFile(filePath) {
    try {
      await this.ensureDataDir();
      
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
      } catch (error) {
        if (error.code === 'ENOENT') {
          // File doesn't exist, return empty array
          return [];
        }
        throw error;
      }
    } catch (error) {
      throw new DatabaseError(`Failed to read file: ${filePath}`, error);
    }
  }

  /**
   * Write JSON file
   */
  static async writeFile(filePath, data) {
    try {
      await this.ensureDataDir();
      
      const jsonData = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, jsonData, 'utf-8');
    } catch (error) {
      throw new DatabaseError(`Failed to write file: ${filePath}`, error);
    }
  }

  /**
   * Append to JSON file (add item to array)
   */
  static async appendToFile(filePath, item) {
    try {
      const data = await this.readFile(filePath);
      data.push(item);
      await this.writeFile(filePath, data);
      return item;
    } catch (error) {
      throw new DatabaseError(`Failed to append to file: ${filePath}`, error);
    }
  }

  /**
   * Update item in JSON file
   */
  static async updateInFile(filePath, id, updateData) {
    try {
      const data = await this.readFile(filePath);
      const index = data.findIndex(item => item.id === id);

      if (index === -1) {
        throw new Error('Item not found');
      }

      data[index] = { ...data[index], ...updateData, updatedAt: new Date().toISOString() };
      await this.writeFile(filePath, data);
      return data[index];
    } catch (error) {
      throw new DatabaseError(`Failed to update item in file: ${filePath}`, error);
    }
  }

  /**
   * Delete item from JSON file
   */
  static async deleteFromFile(filePath, id) {
    try {
      const data = await this.readFile(filePath);
      const filteredData = data.filter(item => item.id !== id);

      if (filteredData.length === data.length) {
        throw new Error('Item not found');
      }

      await this.writeFile(filePath, filteredData);
      return { success: true, id };
    } catch (error) {
      throw new DatabaseError(`Failed to delete from file: ${filePath}`, error);
    }
  }

  /**
   * Find in JSON file
   */
  static async findInFile(filePath, predicate) {
    try {
      const data = await this.readFile(filePath);
      return data.filter(predicate);
    } catch (error) {
      throw new DatabaseError(`Failed to find in file: ${filePath}`, error);
    }
  }

  /**
   * Find by ID in JSON file
   */
  static async findByIdInFile(filePath, id) {
    try {
      const data = await this.readFile(filePath);
      return data.find(item => item.id === id) || null;
    } catch (error) {
      throw new DatabaseError(`Failed to find by ID in file: ${filePath}`, error);
    }
  }

  /**
   * Clear file
   */
  static async clearFile(filePath) {
    try {
      await this.writeFile(filePath, []);
    } catch (error) {
      throw new DatabaseError(`Failed to clear file: ${filePath}`, error);
    }
  }
}

module.exports = FileStorageService;
