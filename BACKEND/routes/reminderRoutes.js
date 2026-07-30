const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const reminderController = require('../controllers/reminderController');

// All reminder routes require authentication
router.use(protect);

router.get('/vapid-key', reminderController.getVapidPublicKey);
router.get('/', reminderController.getReminders);
router.get('/today', reminderController.getTodayReminders);

router.post('/', reminderController.createReminder);
router.put('/:id', reminderController.updateReminder);
router.delete('/:id', reminderController.deleteReminder);

router.patch('/:id/toggle', reminderController.toggleReminder);
router.patch('/:id/complete', reminderController.toggleComplete);

router.post('/push-subscription', reminderController.savePushSubscription);

module.exports = router;
