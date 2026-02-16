/**
 * User Controller Tests
 */

const UserService = require('../src/services/UserService');
const FileStorageService = require('../src/utils/fileStorage');
const config = require('../src/config/config');

describe('UserController', () => {
  beforeEach(async () => {
    // Clear users file before each test
    await FileStorageService.clearFile(config.storage.usersFile);
  });

  test('should create a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    const user = await UserService.createUser(userData);

    expect(user).toHaveProperty('id');
    expect(user.email).toBe('test@example.com');
    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
    expect(user).not.toHaveProperty('password');
  });

  test('should not create duplicate user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    await UserService.createUser(userData);

    try {
      await UserService.createUser(userData);
      fail('Should have thrown ConflictError');
    } catch (error) {
      expect(error.name).toBe('ConflictError');
    }
  });

  test('should get user by ID', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    const created = await UserService.createUser(userData);
    const retrieved = await UserService.getUserById(created.id);

    expect(retrieved.id).toBe(created.id);
    expect(retrieved.email).toBe('test@example.com');
  });

  test('should throw NotFoundError for non-existent user', async () => {
    try {
      await UserService.getUserById('non-existent-id');
      fail('Should have thrown NotFoundError');
    } catch (error) {
      expect(error.name).toBe('NotFoundError');
    }
  });

  test('should update user preferences', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    const created = await UserService.createUser(userData);
    const updated = await UserService.updatePreferences(created.id, {
      theme: 'dark',
      currency: 'EUR'
    });

    expect(updated.preferences.theme).toBe('dark');
    expect(updated.preferences.currency).toBe('EUR');
    expect(updated.preferences.notifications).toBe(true);
  });

  test('should delete user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    const created = await UserService.createUser(userData);
    await UserService.deleteUser(created.id);

    try {
      await UserService.getUserById(created.id);
      fail('Should have thrown NotFoundError');
    } catch (error) {
      expect(error.name).toBe('NotFoundError');
    }
  });
});
