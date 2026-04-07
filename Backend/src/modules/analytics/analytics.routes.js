const express = require('express');
const analyticsController = require('./analytics.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authMiddleware);

// Only Admin and SuperAdmin can view analytics
router.use(authorize('ADMIN', 'SUPERADMIN'));

router.get('/summary', analyticsController.getSummary.bind(analyticsController));
router.get('/agents', analyticsController.getAgentPerformance.bind(analyticsController));

module.exports = router;
