/**
 * JWT Authentication Service (Mock)
 * Simple JWT-based session management
 */

const crypto = require('crypto');
const config = require('../config/config');

/**
 * Simple JWT implementation (for demonstration)
 * In production, use a library like jsonwebtoken
 */
class JWTService {
  /**
   * Generate mock JWT token
   */
  static generateToken(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const body = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };

    const headerEncoded = Buffer.from(JSON.stringify(header)).toString('base64');
    const bodyEncoded = Buffer.from(JSON.stringify(body)).toString('base64');

    const signature = crypto
      .createHmac('sha256', config.security.jwtSecret)
      .update(`${headerEncoded}.${bodyEncoded}`)
      .digest('base64');

    return `${headerEncoded}.${bodyEncoded}.${signature}`;
  }

  /**
   * Verify mock JWT token
   */
  static verifyToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const [headerEncoded, bodyEncoded, signature] = parts;

      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', config.security.jwtSecret)
        .update(`${headerEncoded}.${bodyEncoded}`)
        .digest('base64');

      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      // Decode and parse body
      const body = JSON.parse(Buffer.from(bodyEncoded, 'base64').toString());

      // Check expiration
      if (body.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      return body;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  /**
   * Decode token without verification
   */
  static decodeToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const bodyEncoded = parts[1];
      return JSON.parse(Buffer.from(bodyEncoded, 'base64').toString());
    } catch (error) {
      throw new Error(`Token decode failed: ${error.message}`);
    }
  }

  /**
   * Create session token for user
   */
  static createSessionToken(userId, email) {
    return this.generateToken({
      sub: userId,
      email,
      type: 'session'
    });
  }

  /**
   * Refresh token
   */
  static refreshToken(oldToken) {
    try {
      const decoded = this.verifyToken(oldToken);
      return this.generateToken({
        sub: decoded.sub,
        email: decoded.email,
        type: decoded.type
      });
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }
}

module.exports = JWTService;
