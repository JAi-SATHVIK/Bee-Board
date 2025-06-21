const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');


router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/me', authenticate, authController.getMe);

router.put('/profile', authenticate, authController.updateProfile);

router.put('/password', authenticate, authController.changePassword);

module.exports = router; 