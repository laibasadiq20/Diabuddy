const Notification = require('../models/Notification');

/**
 * Create an in-app notification. Never throws to callers — failures are logged.
 */
async function notify({ recipientId, senderId, type, referenceId, message }) {
  try {
    if (!recipientId || !type || !message) return null;
    // Don't notify yourself
    if (senderId && String(recipientId) === String(senderId)) return null;

    return await Notification.create({
      recipientId,
      senderId: senderId || undefined,
      type,
      referenceId: referenceId || undefined,
      message,
    });
  } catch (err) {
    console.error('notify failed:', err.message);
    return null;
  }
}

module.exports = { notify };
