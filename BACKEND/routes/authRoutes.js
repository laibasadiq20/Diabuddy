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
  getPublicProfile,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');

// Stricter limits on public auth (abuse / credential stuffing / email spam)
const loginLimit = rateLimit({
  windowMs: 15 * 60_000,
  max: 10,
  keyPrefix: 'auth-login',
});
const registerLimit = rateLimit({
  windowMs: 60 * 60_000,
  max: 5,
  keyPrefix: 'auth-register',
});
const emailLimit = rateLimit({
  windowMs: 15 * 60_000,
  max: 5,
  keyPrefix: 'auth-email',
});
const verifyLimit = rateLimit({
  windowMs: 15 * 60_000,
  max: 20,
  keyPrefix: 'auth-verify',
});

// Register route (public)
router.post('/register', registerLimit, register);

// Verify email route (public)
router.post('/verify-email', verifyLimit, verifyEmail);

// Resend verification code route (public)
router.post('/resend-code', emailLimit, resendVerificationCode);

// Login route (public)
router.post('/login', loginLimit, login);

// Logout (clears cookie)
router.post('/logout', logout);

// Password reset (public)
router.post('/forgot-password', emailLimit, forgotPassword);
router.post('/reset-password', verifyLimit, resetPassword);

// Profile routes (private/protected)
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);

// Search users route (private/protected)
router.get('/users', protect, searchUsers);
// Public community profile
router.get('/users/:id', protect, getPublicProfile);

module.exports = router;
