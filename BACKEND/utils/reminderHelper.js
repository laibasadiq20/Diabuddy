/**
 * Helper utilities for Reminder nextTriggerAt calculation and notification messages.
 */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  const tzOffset = typeof overrideTzOffset === 'number'
    ? overrideTzOffset
    : (typeof reminder.tzOffset === 'number' ? reminder.tzOffset : 0);

  // Doctor Appointment / Specific Date Reminder
  if (reminder.appointmentDate) {
    const apptDate = new Date(reminder.appointmentDate);
    if (reminder.time && /^([01]\d|2[0-3]):([0-5]\d)$/.test(reminder.time)) {
      const [h, m] = reminder.time.split(':').map(Number);
      apptDate.setHours(h, m, 0, 0);
    }
    return apptDate > fromTime ? apptDate : null;
  }

  if (!reminder.time || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(reminder.time)) {
    return null;
  }

  const [hours, minutes] = reminder.time.split(':').map(Number);
  const now = new Date(fromTime);

  // Convert current UTC time to user's local wall-clock time representation
  const userLocalNow = new Date(now.getTime() - tzOffset * 60000);

  if (reminder.repeat === 'daily') {
    const userLocalCandidate = new Date(userLocalNow);
    userLocalCandidate.setHours(hours, minutes, 0, 0);

    if (userLocalCandidate <= userLocalNow) {
      userLocalCandidate.setDate(userLocalCandidate.getDate() + 1);
    }

    // Convert back from user local wall-clock time to absolute UTC Date
    return new Date(userLocalCandidate.getTime() + tzOffset * 60000);
  }

  if (reminder.repeat === 'weekly' || reminder.repeat === 'custom') {
    const activeDays = Array.isArray(reminder.days) ? reminder.days : [];
    if (activeDays.length === 0) {
      return null;
    }

    for (let dayOffset = 0; dayOffset <= 8; dayOffset++) {
      const userLocalCandidate = new Date(userLocalNow);
      userLocalCandidate.setDate(userLocalCandidate.getDate() + dayOffset);
      userLocalCandidate.setHours(hours, minutes, 0, 0);

      const dayName = WEEKDAYS[userLocalCandidate.getDay()];
      if (activeDays.includes(dayName) && userLocalCandidate > userLocalNow) {
        return new Date(userLocalCandidate.getTime() + tzOffset * 60000);
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
