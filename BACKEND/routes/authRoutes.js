const express = require('express');
const router = express.Router();
const { register, verifyEmail, resendVerificationCode, login, verifyLoginOtp, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Register route (public)
router.post('/register', register);

// Verify email route (public)
router.post('/verify-email', verifyEmail);

// Resend verification code route (public)
router.post('/resend-code', resendVerificationCode);

// Login route (public)
router.post('/login', login);

// Login OTP verification route (public)
router.post('/verify-login-otp', verifyLoginOtp);

// Forgot password route (public)
router.post('/forgot-password', forgotPassword);

// Reset password route (public)
router.post('/reset-password', resetPassword);

// Profile route (private/protected)
router.get('/me', protect, getMe);

module.exports = router;
