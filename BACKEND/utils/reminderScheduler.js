const webPush = require('web-push');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { calculateNextTriggerAt, getNotificationBody } = require('./reminderHelper');

// Configure Web Push VAPID keys if provided or generate development keys
let vapidKeysConfigured = false;
let currentPublicKey = process.env.VAPID_PUBLIC_KEY || '';

try {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const mailto = process.env.VAPID_MAILTO || 'mailto:support@diabuddy.app';

  if (publicKey && privateKey) {
    webPush.setVapidDetails(mailto, publicKey, privateKey);
    vapidKeysConfigured = true;
    currentPublicKey = publicKey;
  } else {
    // Generate dev keys for local testing
    const devKeys = webPush.generateVAPIDKeys();
    webPush.setVapidDetails(mailto, devKeys.publicKey, devKeys.privateKey);
    currentPublicKey = devKeys.publicKey;
    vapidKeysConfigured = true;
    console.log('📢 Web Push initialized with generated development VAPID keys.');
  }
} catch (err) {
  console.warn('⚠️ Web Push initialization warning:', err.message);
}

function getVapidPublicKey() {
  return currentPublicKey;
}

/**
 * Lightweight scheduler function to check and process due reminders.
 */
async function processDueReminders() {
  try {
    const now = new Date();

    // Query ONLY active reminders whose scheduled nextTriggerAt is on or before NOW
    const dueReminders = await Reminder.find({
      enabled: true,
      nextTriggerAt: { $lte: now },
    });

    if (dueReminders.length === 0) {
      return;
    }

    console.log(`⏰ Reminder Scheduler: Processing ${dueReminders.length} due reminder(s)...`);

    for (const reminder of dueReminders) {
      try {
        const bodyMessage = getNotificationBody(reminder);
        const title = 'DiaBuddy Reminder';

        // 1. Create In-App Notification in DB
        await Notification.create({
          recipientId: reminder.userId,
          message: `${title}: ${bodyMessage}`,
          type: 'reminder',
          isRead: false,
        });

        // 2. Send Web Push Notification if user has push subscription
        const user = await User.findById(reminder.userId);
        if (user && user.pushSubscription && user.pushSubscription.endpoint && vapidKeysConfigured) {
          const payload = JSON.stringify({
            title,
            body: bodyMessage,
            icon: '/favicon.svg',
            data: { url: '/reminders' },
          });

          webPush
            .sendNotification(user.pushSubscription, payload)
            .catch((err) => {
              if (err.statusCode === 410 || err.statusCode === 404) {
                // Subscription has expired or revoked — clear subscription
                User.findByIdAndUpdate(user._id, {
                  pushSubscription: { endpoint: '', keys: { p256dh: '', auth: '' } },
                }).catch(() => {});
              } else {
                console.warn(`Web push notification failed for user ${user._id}:`, err.message);
              }
            });
        }

        // 3. Recalculate nextTriggerAt and update lastTriggeredAt
        reminder.lastTriggeredAt = now;
        reminder.nextTriggerAt = calculateNextTriggerAt(reminder, new Date(now.getTime() + 60000));
        await reminder.save();
      } catch (itemErr) {
        console.error(`Error processing reminder ${reminder._id}:`, itemErr);
        // Advance nextTriggerAt to prevent getting stuck in a loop on failure
        reminder.nextTriggerAt = calculateNextTriggerAt(reminder, new Date(now.getTime() + 60000));
        await reminder.save();
      }
    }
  } catch (err) {
    console.error('Reminder Scheduler error:', err);
  }
}

/**
 * Initialize reminder scheduler interval (runs every 60 seconds).
 */
function initReminderScheduler() {
  console.log('🚀 Reminder Scheduler worker started (polling every 5s for exact due time)...');
  // Run once on startup
  processDueReminders();
  // Polling loop (every 5 seconds)
  setInterval(processDueReminders, 5000);
}

module.exports = {
  initReminderScheduler,
  processDueReminders,
  getVapidPublicKey,
};
