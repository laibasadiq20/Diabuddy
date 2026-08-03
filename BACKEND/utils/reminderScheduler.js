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
        const user = await User.findById(reminder.userId);
        const alertsEnabled = user?.reminderAlertsEnabled !== false;

        // 1. Create In-App Notification + push only when reminder alerts are enabled
        if (alertsEnabled) {
          await Notification.create({
            recipientId: reminder.userId,
            message: `${title}: ${bodyMessage}`,
            type: 'reminder',
            isRead: false,
          });

          if (user) {
            sendPushToUser(user, {
              title,
              body: bodyMessage,
              icon: '/favicon.svg',
              data: { url: '/reminders' },
            }).then((result) => {
              if (!result.ok && result.reason) {
                console.warn(`Web push notification failed for user ${user._id}:`, result.reason);
              }
            });
          }
        }

        // 2. Recalculate nextTriggerAt and update lastTriggeredAt
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

/**
 * Send a one-off web push to a user (used by test endpoint + scheduler).
 * @returns {Promise<{ ok: boolean, reason?: string }>}
 */
async function sendPushToUser(user, payloadObj) {
  if (!vapidKeysConfigured) {
    return { ok: false, reason: 'VAPID keys are not configured on the server' };
  }
  if (!user?.pushSubscription?.endpoint) {
    return { ok: false, reason: 'No push subscription saved for this user' };
  }

  const payload = JSON.stringify(payloadObj);
  try {
    await webPush.sendNotification(user.pushSubscription, payload);
    return { ok: true };
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      await User.findByIdAndUpdate(user._id, {
        pushSubscription: { endpoint: '', keys: { p256dh: '', auth: '' } },
      }).catch(() => {});
      return { ok: false, reason: 'Push subscription expired — enable push again' };
    }
    return { ok: false, reason: err.message || 'Web push failed' };
  }
}

module.exports = {
  initReminderScheduler,
  processDueReminders,
  getVapidPublicKey,
  sendPushToUser,
};
