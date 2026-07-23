const Notification = require('../models/Notification');
const User = require('../models/User');

/** Admins only receive moderation alerts — not community activity. */
const ADMIN_NOTIFICATION_TYPES = new Set(['new_report']);

/**
 * Create an in-app notification. Never throws to callers — failures are logged.
 */
async function notify({ recipientId, senderId, type, referenceId, message }) {
  try {
    if (!recipientId || !type || !message) return null;
    // Don't notify yourself
    if (senderId && String(recipientId) === String(senderId)) return null;

    const recipient = await User.findById(recipientId).select('role').lean();
    if (!recipient) return null;

    // Admins: report queue only. Patients: never receive admin-only report pings.
    if (recipient.role === 'admin' && !ADMIN_NOTIFICATION_TYPES.has(type)) {
      return null;
    }
    if (recipient.role !== 'admin' && ADMIN_NOTIFICATION_TYPES.has(type)) {
      return null;
    }

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

/**
 * Notify every active admin (used when content is reported).
 */
async function notifyAdmins({ senderId, type, referenceId, message }) {
  try {
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id').lean();
    await Promise.all(
      admins.map((admin) =>
        notify({
          recipientId: admin._id,
          senderId,
          type,
          referenceId,
          message,
        })
      )
    );
  } catch (err) {
    console.error('notifyAdmins failed:', err.message);
  }
}

module.exports = { notify, notifyAdmins, ADMIN_NOTIFICATION_TYPES };
