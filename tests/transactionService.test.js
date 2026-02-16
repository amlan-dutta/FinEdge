/**
 * Transaction Service Tests
 */

const TransactionService = require('../src/services/TransactionService');
const UserService = require('../src/services/UserService');
const FileStorageService = require('../src/utils/fileStorage');
const config = require('../src/config/config');

describe('TransactionService', () => {
  let userId;

  beforeEach(async () => {
    // Clear files before each test
    await FileStorageService.clearFile(config.storage.usersFile);
    await FileStorageService.clearFile(config.storage.transactionsFile);

    // Create a test user
    const user = await UserService.createUser({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    });
    userId = user.id;
  });

  test('should create a new transaction', async () => {
    const txnData = {
      userId,
      type: 'income',
      category: 'Salary',
      amount: 5000,
      description: 'Monthly salary'
    };

    const transaction = await TransactionService.createTransaction(txnData);

    expect(transaction).toHaveProperty('id');
    expect(transaction.type).toBe('income');
    expect(transaction.category).toBe('Salary');
    expect(transaction.amount).toBe(5000);
  });

  test('should get transaction by ID', async () => {
    const txnData = {
      userId,
      type: 'expense',
      category: 'Food',
      amount: 50,
      description: 'Lunch'
    };

    const created = await TransactionService.createTransaction(txnData);
    const retrieved = await TransactionService.getTransactionById(created.id);

    expect(retrieved.id).toBe(created.id);
    expect(retrieved.category).toBe('Food');
  });

  test('should throw NotFoundError for non-existent transaction', async () => {
    try {
      await TransactionService.getTransactionById('non-existent-id');
      fail('Should have thrown NotFoundError');
    } catch (error) {
      expect(error.name).toBe('NotFoundError');
    }
  });

  test('should get user transactions with filters', async () => {
    await TransactionService.createTransaction({
      userId,
      type: 'income',
      category: 'Salary',
      amount: 5000,
      description: 'Monthly salary'
    });

    await TransactionService.createTransaction({
      userId,
      type: 'expense',
      category: 'Food',
      amount: 50,
      description: 'Lunch'
    });

    const incomeTransactions = await TransactionService.getUserTransactions(userId, {
      type: 'income'
    });

    expect(incomeTransactions).toHaveLength(1);
    expect(incomeTransactions[0].type).toBe('income');
  });

  test('should calculate summary statistics', async () => {
    await TransactionService.createTransaction({
      userId,
      type: 'income',
      category: 'Salary',
      amount: 5000
    });

    await TransactionService.createTransaction({
      userId,
      type: 'expense',
      category: 'Food',
      amount: 50
    });

    await TransactionService.createTransaction({
      userId,
      type: 'expense',
      category: 'Transport',
      amount: 100
    });

    const summary = await TransactionService.getSummary(userId);

    expect(summary.totalIncome).toBe(5000);
    expect(summary.totalExpense).toBe(150);
    expect(summary.netSavings).toBe(4850);
    expect(summary.savingsPercentage).toBe(97);
  });

  test('should update transaction', async () => {
    const created = await TransactionService.createTransaction({
      userId,
      type: 'expense',
      category: 'Food',
      amount: 50,
      description: 'Lunch'
    });

    const updated = await TransactionService.updateTransaction(created.id, {
      amount: 75,
      description: 'Lunch and coffee'
    });

    expect(updated.amount).toBe(75);
    expect(updated.description).toBe('Lunch and coffee');
  });

  test('should delete transaction', async () => {
    const created = await TransactionService.createTransaction({
      userId,
      type: 'expense',
      category: 'Food',
      amount: 50
    });

    await TransactionService.deleteTransaction(created.id);

    try {
      await TransactionService.getTransactionById(created.id);
      fail('Should have thrown NotFoundError');
    } catch (error) {
      expect(error.name).toBe('NotFoundError');
    }
  });
});
