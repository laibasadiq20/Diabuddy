const Notification = require('../models/Notification');
const { ADMIN_NOTIFICATION_TYPES } = require('../utils/notify');

function recipientFilter(user) {
  const base = { recipientId: user.id };
  if (user.role === 'admin') {
    return { ...base, type: { $in: [...ADMIN_NOTIFICATION_TYPES] } };
  }
  // Patients never see admin moderation alerts
  return { ...base, type: { $nin: [...ADMIN_NOTIFICATION_TYPES] } };
}

// GET /api/notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 50);
    const filter = recipientFilter(req.user);
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('senderId', 'name username profileImageUrl');

    const unreadCount = await Notification.countDocuments({
      ...filter,
      isRead: false,
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const filter = recipientFilter(req.user);
    const unreadCount = await Notification.countDocuments({
      ...filter,
      isRead: false,
    });
    res.json({ unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch unread count', error: err.message });
  }
};

// PUT /api/notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!n) return res.status(404).json({ message: 'Notification not found' });
    res.json(n);
  } catch (err) {
    res.status(400).json({ message: 'Failed to mark read', error: err.message });
  }
};

// PUT /api/notifications/read-all
exports.markAllRead = async (req, res) => {
  try {
    const filter = recipientFilter(req.user);
    await Notification.updateMany(
      { ...filter, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark all read', error: err.message });
  }
};
