const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const googleHealthController = require('../controllers/googleHealthController');

const oauthLimit = rateLimit({
  windowMs: 15 * 60_000,
  max: 30,
  keyPrefix: 'google-health',
});

router.get('/status', protect, googleHealthController.getStatus);
router.get('/connect', protect, oauthLimit, googleHealthController.connect);
router.get('/callback', oauthLimit, googleHealthController.callback);
router.post('/sync', protect, oauthLimit, googleHealthController.sync);
router.post('/disconnect', protect, googleHealthController.disconnect);

module.exports = router;
