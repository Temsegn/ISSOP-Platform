const express = require('express');
const requestController = require('./request.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { createRequestSchema, getRequestsQuerySchema } = require('./request.validation');

const router = express.Router();

router.use(authMiddleware);

router.post('/', validate(createRequestSchema), requestController.createRequest.bind(requestController));
router.get('/', validate(getRequestsQuerySchema), requestController.getAllRequests.bind(requestController));
router.get('/:id', requestController.getRequest.bind(requestController));

module.exports = router;
