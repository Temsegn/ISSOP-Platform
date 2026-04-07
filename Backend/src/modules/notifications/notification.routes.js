const express = require('express');
const notificationController = require('./notification.controller');
const authMiddleware = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', notificationController.getMyNotifications.bind(notificationController));
router.patch('/:id/read', notificationController.markAsRead.bind(notificationController));

module.exports = router;
