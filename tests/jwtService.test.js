/**
 * JWT Service Tests
 */

const JWTService = require('../src/services/JWTService');

describe('JWTService', () => {
  test('should generate a valid JWT token', () => {
    const payload = {
      sub: 'user123',
      email: 'test@example.com',
      type: 'session'
    };

    const token = JWTService.generateToken(payload);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  test('should verify a valid JWT token', () => {
    const payload = {
      sub: 'user123',
      email: 'test@example.com',
      type: 'session'
    };

    const token = JWTService.generateToken(payload);
    const decoded = JWTService.verifyToken(token);

    expect(decoded.sub).toBe('user123');
    expect(decoded.email).toBe('test@example.com');
    expect(decoded.type).toBe('session');
  });

  test('should throw error for invalid token', () => {
    const invalidToken = 'invalid.token.here';

    try {
      JWTService.verifyToken(invalidToken);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).toContain('verification failed');
    }
  });

  test('should throw error for expired token', () => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const body = {
      sub: 'user123',
      email: 'test@example.com',
      iat: Math.floor(Date.now() / 1000) - 86400,
      exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
    };

    const headerEncoded = Buffer.from(JSON.stringify(header)).toString('base64');
    const bodyEncoded = Buffer.from(JSON.stringify(body)).toString('base64');
    const crypto = require('crypto');
    const config = require('../src/config/config');

    const signature = crypto
      .createHmac('sha256', config.security.jwtSecret)
      .update(`${headerEncoded}.${bodyEncoded}`)
      .digest('base64');

    const expiredToken = `${headerEncoded}.${bodyEncoded}.${signature}`;

    try {
      JWTService.verifyToken(expiredToken);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).toContain('expired');
    }
  });

  test('should create session token', () => {
    const token = JWTService.createSessionToken('user123', 'test@example.com');
    const decoded = JWTService.verifyToken(token);

    expect(decoded.sub).toBe('user123');
    expect(decoded.email).toBe('test@example.com');
    expect(decoded.type).toBe('session');
  });

  test('should decode token without verification', () => {
    const payload = {
      sub: 'user123',
      email: 'test@example.com',
      type: 'session'
    };

    const token = JWTService.generateToken(payload);
    const decoded = JWTService.decodeToken(token);

    expect(decoded.sub).toBe('user123');
    expect(decoded.email).toBe('test@example.com');
  });
});
