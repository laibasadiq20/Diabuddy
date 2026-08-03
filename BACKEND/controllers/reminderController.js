const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { DEFAULT_REMINDERS, DEFAULT_TITLES } = require('../constants/defaultReminders');
const { calculateNextTriggerAt } = require('../utils/reminderHelper');

/**
 * Helper to check if a Date is on the same calendar day as today.
 */
function isSameDayAsToday(date) {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

/**
 * Ensure default reminders exist for a given user. Auto-seeds missing defaults.
 */
async function autoSeedDefaultReminders(userId, tzOffset = 0) {
  const existingReminders = await Reminder.find({ userId });
  const existingTitles = new Set(existingReminders.map((r) => r.title));

  const toInsert = [];
  for (const def of DEFAULT_REMINDERS) {
    if (!existingTitles.has(def.title)) {
      const newRem = {
        userId,
        title: def.title,
        type: 'default',
        time: def.defaultTime,
        repeat: def.repeat,
        days: [...def.days],
        appointmentDate: def.appointmentDate,
        enabled: true,
        icon: def.icon,
        tzOffset,
      };
      newRem.nextTriggerAt = calculateNextTriggerAt(newRem, new Date(), tzOffset);
      toInsert.push(newRem);
    }
  }

  if (toInsert.length > 0) {
    await Reminder.insertMany(toInsert);
  }
}

/**
 * GET /api/reminders/vapid-key
 */
exports.getVapidPublicKey = (req, res) => {
  try {
    const { getVapidPublicKey } = require('../utils/reminderScheduler');
    return res.json({
      status: 'success',
      data: { publicKey: getVapidPublicKey() },
    });
  } catch (err) {
    console.error('getVapidPublicKey error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve VAPID key' });
  }
};

/**
 * GET /api/reminders
 * Fetch all reminders for the authenticated user (seeds default reminders if missing).
 */
exports.getReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const parsedTz = Number(req.query.tzOffset);
    const tzOffset = Number.isFinite(parsedTz) ? parsedTz : 0;
    await autoSeedDefaultReminders(userId, tzOffset);

    // Keep schedules aligned to the client's local timezone.
    const reminders = await Reminder.find({ userId }).sort({ createdAt: 1 });
    for (const r of reminders) {
      if (r.tzOffset !== tzOffset) {
        r.tzOffset = tzOffset;
        if (r.enabled) {
          r.nextTriggerAt = calculateNextTriggerAt(r, new Date(), tzOffset);
        }
        await r.save();
      }
    }

    const formatted = reminders.map((r) => {
      const doc = r.toObject();
      doc.id = doc._id;
      doc.isCompletedToday = isSameDayAsToday(doc.lastCompletedAt);
      return doc;
    });

    const defaultReminders = formatted.filter((r) => r.type === 'default');
    const customReminders = formatted.filter((r) => r.type === 'custom');

    return res.json({
      status: 'success',
      data: {
        reminders: formatted,
        defaultReminders,
        customReminders,
      },
    });
  } catch (err) {
    console.error('getReminders error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch reminders' });
  }
};

/**
 * GET /api/reminders/today
 * Fetch today's reminders in chronological order for Dashboard.
 */
exports.getTodayReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const parsedTz = Number(req.query.tzOffset);
    const tzOffset = Number.isFinite(parsedTz) ? parsedTz : 0;
    await autoSeedDefaultReminders(userId, tzOffset);

    const reminders = await Reminder.find({ userId, enabled: true });

    // Filter reminders applicable today (daily, matching weekday, or matching doctor appointment date)
    const todayStr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];

    const todayReminders = reminders
      .filter((r) => {
        if (r.appointmentDate) {
          return isSameDayAsToday(r.appointmentDate);
        }
        if (r.repeat === 'daily') return true;
        if ((r.repeat === 'weekly' || r.repeat === 'custom') && Array.isArray(r.days)) {
          return r.days.includes(todayStr);
        }
        return false;
      })
      .map((r) => {
        const doc = r.toObject();
        doc.id = doc._id;
        doc.isCompletedToday = isSameDayAsToday(doc.lastCompletedAt);
        return doc;
      })
      .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));

    return res.json({
      status: 'success',
      data: todayReminders,
    });
  } catch (err) {
    console.error('getTodayReminders error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch today reminders' });
  }
};

/**
 * POST /api/reminders
 * Create a new custom reminder.
 */
exports.createReminder = async (req, res) => {
  try {
    const { title, time, repeat, days, appointmentDate, enabled, icon, tzOffset } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ status: 'error', message: 'Reminder title is required' });
    }

    const cleanTitle = title.trim();
    const offsetMinutes = typeof tzOffset === 'number' ? tzOffset : 0;

    // Prevent creating duplicate default reminders
    if (DEFAULT_TITLES.some((t) => t.toLowerCase() === cleanTitle.toLowerCase())) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot create a custom reminder with a default reminder name',
      });
    }

    const newReminder = new Reminder({
      userId: req.user.id,
      title: cleanTitle,
      type: 'custom',
      time: time || '08:00',
      repeat: repeat || 'daily',
      days: Array.isArray(days) ? days : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      appointmentDate: appointmentDate ? new Date(appointmentDate) : null,
      enabled: enabled !== undefined ? Boolean(enabled) : true,
      icon: icon || '💊',
      tzOffset: offsetMinutes,
    });

    newReminder.nextTriggerAt = calculateNextTriggerAt(newReminder, new Date(), offsetMinutes);
    await newReminder.save();

    const doc = newReminder.toObject();
    doc.id = doc._id;
    doc.isCompletedToday = false;

    return res.status(201).json({
      status: 'success',
      message: 'Custom reminder created',
      data: doc,
    });
  } catch (err) {
    console.error('createReminder error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to create reminder' });
  }
};

/**
 * PUT /api/reminders/:id
 * Edit an existing reminder (default or custom). Title cannot be changed for default reminders.
 */
exports.updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findOne({ _id: id, userId: req.user.id });

    if (!reminder) {
      return res.status(404).json({ status: 'error', message: 'Reminder not found' });
    }

    const { title, time, repeat, days, appointmentDate, enabled, icon, tzOffset } = req.body;
    const offsetMinutes = typeof tzOffset === 'number' ? tzOffset : (typeof reminder.tzOffset === 'number' ? reminder.tzOffset : 0);

    // Disallow modifying title for default reminders
    if (reminder.type === 'default' && title && title.trim().toLowerCase() !== reminder.title.toLowerCase()) {
      return res.status(400).json({
        status: 'error',
        message: 'Default reminder titles cannot be modified',
      });
    }

    if (reminder.type === 'custom' && title) {
      reminder.title = title.trim();
    }

    if (time !== undefined) reminder.time = time;
    if (repeat !== undefined) reminder.repeat = repeat;
    if (days !== undefined && Array.isArray(days)) reminder.days = days;
    if (appointmentDate !== undefined) {
      reminder.appointmentDate = appointmentDate ? new Date(appointmentDate) : null;
    }
    if (enabled !== undefined) reminder.enabled = Boolean(enabled);
    if (icon !== undefined) reminder.icon = icon;
    reminder.tzOffset = offsetMinutes;

    reminder.nextTriggerAt = calculateNextTriggerAt(reminder, new Date(), offsetMinutes);
    await reminder.save();

    const doc = reminder.toObject();
    doc.id = doc._id;
    doc.isCompletedToday = isSameDayAsToday(doc.lastCompletedAt);

    return res.json({
      status: 'success',
      message: 'Reminder updated',
      data: doc,
    });
  } catch (err) {
    console.error('updateReminder error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to update reminder' });
  }
};

/**
 * DELETE /api/reminders/:id
 * Delete a custom reminder. Rejects deleting default reminders.
 */
exports.deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findOne({ _id: id, userId: req.user.id });

    if (!reminder) {
      return res.status(404).json({ status: 'error', message: 'Reminder not found' });
    }

    if (reminder.type === 'default') {
      return res.status(400).json({
        status: 'error',
        message: 'Default reminders cannot be deleted',
      });
    }

    await Reminder.deleteOne({ _id: id });

    return res.json({
      status: 'success',
      message: 'Custom reminder deleted',
    });
  } catch (err) {
    console.error('deleteReminder error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to delete reminder' });
  }
};

/**
 * PATCH /api/reminders/:id/toggle
 * Toggle enabled state (ON/OFF).
 */
exports.toggleReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findOne({ _id: id, userId: req.user.id });

    if (!reminder) {
      return res.status(404).json({ status: 'error', message: 'Reminder not found' });
    }

    const parsedTz = Number(req.body?.tzOffset);
    if (Number.isFinite(parsedTz)) reminder.tzOffset = parsedTz;

    reminder.enabled = !reminder.enabled;
    reminder.nextTriggerAt = calculateNextTriggerAt(reminder, new Date(), reminder.tzOffset || 0);
    await reminder.save();

    const doc = reminder.toObject();
    doc.id = doc._id;
    doc.isCompletedToday = isSameDayAsToday(doc.lastCompletedAt);

    return res.json({
      status: 'success',
      message: `Reminder turned ${reminder.enabled ? 'ON' : 'OFF'}`,
      data: doc,
    });
  } catch (err) {
    console.error('toggleReminder error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to toggle reminder' });
  }
};

/**
 * PATCH /api/reminders/:id/complete
 * Toggle completion status for today (updates lastCompletedAt).
 */
exports.toggleComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findOne({ _id: id, userId: req.user.id });

    if (!reminder) {
      return res.status(404).json({ status: 'error', message: 'Reminder not found' });
    }

    const completedToday = isSameDayAsToday(reminder.lastCompletedAt);
    reminder.lastCompletedAt = completedToday ? null : new Date();
    await reminder.save();

    const doc = reminder.toObject();
    doc.id = doc._id;
    doc.isCompletedToday = !completedToday;

    return res.json({
      status: 'success',
      message: `Reminder marked as ${!completedToday ? 'Completed' : 'Pending'}`,
      data: doc,
    });
  } catch (err) {
    console.error('toggleComplete error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to update completion status' });
  }
};

/**
 * POST /api/reminders/push-subscription
 * Save Web Push subscription parameters on User document.
 */
exports.savePushSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      await User.findByIdAndUpdate(req.user.id, {
        pushSubscription: {
          endpoint: '',
          keys: { p256dh: '', auth: '' },
        },
      });
      return res.json({
        status: 'success',
        message: 'Push subscription removed successfully',
      });
    }

    await User.findByIdAndUpdate(req.user.id, {
      pushSubscription: {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys?.p256dh || '',
          auth: subscription.keys?.auth || '',
        },
      },
    });

    return res.json({
      status: 'success',
      message: 'Push subscription saved successfully',
    });
  } catch (err) {
    console.error('savePushSubscription error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to save push subscription' });
  }
};
