const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPublicProfile } = require('../controllers/authController');

// GET /api/users/:id — public community profile
router.get('/:id', protect, getPublicProfile);

module.exports = router;
