const express = require('express');
const userController = require('./user.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');

const router = express.Router();

// Apply authMiddleware to all user routes
router.use(authMiddleware);

// Admin-only route to list all users
router.get('/', authorize('ADMIN'), userController.getAllUsers.bind(userController));

// Route to update current user ('me' convenience route)
router.patch('/me', userController.updateMe.bind(userController));

// Resource-based routes
router.get('/:id', userController.getUser.bind(userController));
router.patch('/:id', userController.updateUser.bind(userController));
router.delete('/:id', userController.deleteUser.bind(userController));

module.exports = router;
