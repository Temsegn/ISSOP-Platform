const express = require('express');
const taskController = require('./task.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const validate = require('../../middleware/validate.middleware');
const { completeTaskSchema } = require('./task.validation');

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('AGENT', 'SUPERADMIN'));

router.get('/my-tasks', taskController.getMyTasks.bind(taskController));
router.patch('/:id/accept', taskController.acceptTask.bind(taskController));
router.patch('/:id/reject', taskController.rejectTask.bind(taskController));
router.patch('/:id/complete', validate(completeTaskSchema), taskController.completeTask.bind(taskController));

module.exports = router;
