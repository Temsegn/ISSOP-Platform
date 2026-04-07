const express = require('express');
const taskController = require('./task.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('AGENT', 'SUPERADMIN'));

router.get('/my-tasks', taskController.getMyTasks.bind(taskController));
router.patch('/:id/accept', taskController.acceptTask.bind(taskController));
router.patch('/:id/reject', taskController.rejectTask.bind(taskController));
router.patch('/:id/complete', taskController.completeTask.bind(taskController));

module.exports = router;
