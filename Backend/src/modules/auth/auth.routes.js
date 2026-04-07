const express = require('express');
const authController = require('./auth.controller');
const validate = require('../../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('./auth.validation');

const authMiddleware = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register.bind(authController));
router.post('/login', validate(loginSchema), authController.login.bind(authController));
router.get('/me', authMiddleware, authController.getMe.bind(authController));

module.exports = router;
