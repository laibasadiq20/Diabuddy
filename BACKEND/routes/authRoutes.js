const express = require('express');
const router = express.Router();
const { register, verifyEmail, resendVerificationCode, login, getMe, searchUsers } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Register route (public)
router.post('/register', register);

// Verify email route (public)
router.post('/verify-email', verifyEmail);

// Resend verification code route (public)
router.post('/resend-code', resendVerificationCode);

// Login route (public)
router.post('/login', login);

// Profile route (private/protected)
router.get('/me', protect, getMe);

// Search users route (private/protected)
router.get('/users', protect, searchUsers);

module.exports = router;

