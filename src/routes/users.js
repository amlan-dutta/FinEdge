/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { validateId } = require('../middleware/validation');

/**
 * POST /users
 * Register new user
 */
router.post('/', UserController.register);

/**
 * GET /users/:id
 * Get user by ID
 */
router.get('/:id', validateId, UserController.getUser);

/**
 * PATCH /users/:id/preferences
 * Update user preferences
 */
router.patch('/:id/preferences', validateId, UserController.updatePreferences);

/**
 * DELETE /users/:id
 * Delete user account
 */
router.delete('/:id', validateId, UserController.deleteUser);

module.exports = router;
