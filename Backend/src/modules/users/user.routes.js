const express = require('express');
const userController = require('./user.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const validate = require('../../middleware/validate.middleware');
const { updateUserSchema, changeRoleSchema, updateLocationSchema } = require('./user.validation');

const router = express.Router();

// Apply authMiddleware to all user routes
router.use(authMiddleware);

// Admin/SuperAdmin route to list users (filtered by area for Admin)
router.get('/', authorize('ADMIN', 'SUPERADMIN'), userController.getAllUsers.bind(userController));

// Route to change user roles (SuperAdmin only)
router.patch('/:id/role', authorize('SUPERADMIN'), validate(changeRoleSchema), userController.changeRole.bind(userController));

// Route to find nearest agents (Admin/Agent)
router.get('/nearest-agents', authorize('ADMIN', 'AGENT'), userController.getNearestAgents.bind(userController));

// Route to update current user location
router.patch('/location', authorize('AGENT'), validate(updateLocationSchema), userController.updateLocation.bind(userController));

// Route to update current user ('me' convenience route)
router.patch('/me', validate(updateUserSchema), userController.updateMe.bind(userController));

// Resource-based routes
router.get('/:id', userController.getUser.bind(userController));
router.patch('/:id', validate(updateUserSchema), userController.updateUser.bind(userController));
router.delete('/:id', userController.deleteUser.bind(userController));

module.exports = router;
