const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  logout,
  getMe,
  updateProfile,
  searchUsers,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Register route (public)
router.post('/register', register);

// Verify email route (public)
router.post('/verify-email', verifyEmail);

// Resend verification code route (public)
router.post('/resend-code', resendVerificationCode);

// Login route (public)
router.post('/login', login);

// Logout (clears cookie)
router.post('/logout', logout);

// Password reset (public)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Profile routes (private/protected)
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);

// Search users route (private/protected)
router.get('/users', protect, searchUsers);

module.exports = router;
