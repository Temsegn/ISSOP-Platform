const express = require('express');
const requestController = require('./request.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const validate = require('../../middleware/validate.middleware');
const { createRequestSchema, getRequestsQuerySchema } = require('./request.validation');

const router = express.Router();

router.use(authMiddleware);

router.post('/', validate(createRequestSchema), requestController.createRequest.bind(requestController));
router.get('/', validate(getRequestsQuerySchema), requestController.getAllRequests.bind(requestController));
router.get('/:id', requestController.getRequest.bind(requestController));

// Admin/SuperAdmin - Assign task to agent
router.patch('/:id/assign', authorize('ADMIN', 'SUPERADMIN'), requestController.assignTask.bind(requestController));

// Admin/SuperAdmin/Agent - Update status
router.patch('/:id/status', authorize('ADMIN', 'SUPERADMIN', 'AGENT'), requestController.updateStatus.bind(requestController));

module.exports = router;
