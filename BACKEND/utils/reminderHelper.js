/**
 * Helper utilities for Reminder nextTriggerAt calculation and notification messages.
 * All wall-clock math uses UTC getters/setters on a tz-shifted Date so it is
 * independent of the server's process timezone.
 */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * @param {Date} fromTime
 * @param {number} tzOffset getTimezoneOffset-style minutes
 */
function toUserWall(fromTime, tzOffset) {
  return new Date(fromTime.getTime() - tzOffset * 60000);
}

/**
 * Build an absolute Date from user wall-clock Y/M/D H:M and tzOffset.
 */
function fromUserWall(y, monthIndex, day, hours, minutes, tzOffset) {
  return new Date(Date.UTC(y, monthIndex, day, hours, minutes, 0, 0) + tzOffset * 60000);
}

/**
 * Calculate the next trigger Date for a reminder based on schedule rules and user timezone.
 * @param {Object} reminder
 * @param {Date} [fromTime=new Date()]
 * @param {number|null} [overrideTzOffset=null] Timezone offset in minutes (e.g. -300 for GMT+5)
 * @returns {Date|null}
 */
function calculateNextTriggerAt(reminder, fromTime = new Date(), overrideTzOffset = null) {
  if (!reminder || reminder.enabled === false) {
    return null;
  }

  const tzOffset =
    typeof overrideTzOffset === 'number'
      ? overrideTzOffset
      : typeof reminder.tzOffset === 'number'
        ? reminder.tzOffset
        : 0;

  const now = new Date(fromTime);

  // Doctor Appointment / Specific Date Reminder
  if (reminder.appointmentDate) {
    const appt = new Date(reminder.appointmentDate);
    if (Number.isNaN(appt.getTime())) return null;

    let trigger = appt;
    if (reminder.time && /^([01]\d|2[0-3]):([0-5]\d)$/.test(reminder.time)) {
      const [h, m] = reminder.time.split(':').map(Number);
      const wall = toUserWall(appt, tzOffset);
      trigger = fromUserWall(
        wall.getUTCFullYear(),
        wall.getUTCMonth(),
        wall.getUTCDate(),
        h,
        m,
        tzOffset
      );
    }
    return trigger > now ? trigger : null;
  }

  if (!reminder.time || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(reminder.time)) {
    return null;
  }

  const [hours, minutes] = reminder.time.split(':').map(Number);
  const userLocalNow = toUserWall(now, tzOffset);

  if (reminder.repeat === 'daily') {
    let candidate = fromUserWall(
      userLocalNow.getUTCFullYear(),
      userLocalNow.getUTCMonth(),
      userLocalNow.getUTCDate(),
      hours,
      minutes,
      tzOffset
    );
    if (candidate <= now) {
      const nextDay = new Date(Date.UTC(
        userLocalNow.getUTCFullYear(),
        userLocalNow.getUTCMonth(),
        userLocalNow.getUTCDate() + 1,
        hours,
        minutes,
        0,
        0
      ) + tzOffset * 60000);
      candidate = nextDay;
    }
    return candidate;
  }

  if (reminder.repeat === 'weekly' || reminder.repeat === 'custom') {
    const activeDays = Array.isArray(reminder.days) ? reminder.days : [];
    if (activeDays.length === 0) {
      return null;
    }

    for (let dayOffset = 0; dayOffset <= 8; dayOffset++) {
      const base = Date.UTC(
        userLocalNow.getUTCFullYear(),
        userLocalNow.getUTCMonth(),
        userLocalNow.getUTCDate() + dayOffset,
        hours,
        minutes,
        0,
        0
      );
      const candidate = new Date(base + tzOffset * 60000);
      const wall = toUserWall(candidate, tzOffset);
      const dayName = WEEKDAYS[wall.getUTCDay()];
      if (activeDays.includes(dayName) && candidate > now) {
        return candidate;
      }
    }
  }

  return null;
}

/**
 * Generate dynamic notification message body for a reminder.
 * @param {Object} reminder
 * @returns {string}
 */
function getNotificationBody(reminder) {
  const titleLower = (reminder.title || '').toLowerCase().trim();

  if (titleLower.includes('insulin')) {
    return 'Time to take your insulin.';
  }
  if (titleLower.includes('medicine')) {
    return 'Time to take your medicine.';
  }
  if (titleLower.includes('blood glucose') || titleLower.includes('glucose')) {
    return 'Time to check your blood glucose.';
  }
  if (titleLower.includes('doctor appointment')) {
    if (reminder.time) {
      const [h, m] = reminder.time.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      const mStr = m.toString().padStart(2, '0');
      return `Doctor appointment today at ${h12}:${mStr} ${period}.`;
    }
    return 'Doctor appointment scheduled for today.';
  }

  return `Reminder: ${reminder.title}.`;
}

module.exports = {
  calculateNextTriggerAt,
  getNotificationBody,
};
