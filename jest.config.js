/**
 * Jest Configuration
 */

module.exports = {
  testEnvironment: 'node',
  testTimeout: 10000,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/app.js'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ]
};
