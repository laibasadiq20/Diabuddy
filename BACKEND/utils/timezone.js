/**
 * Timezone offset helpers. Matches Date#getTimezoneOffset() convention:
 * minutes to add to local wall time to reach UTC (Pakistan UTC+5 → -300).
 */

const DEFAULT_TIMEZONE = 'Asia/Karachi';

const IANA_ALIASES = {
  'Pakistan/Lahore': 'Asia/Karachi',
  'Pakistan/Islamabad': 'Asia/Karachi',
};

const ALLOWED_TIMEZONES = new Set([
  'Asia/Karachi',
  'Pakistan/Lahore',
  'Pakistan/Islamabad',
  'device',
  'UTC',
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Kolkata',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Australia/Sydney',
]);

function toIanaTimezone(timeZone) {
  if (!timeZone || timeZone === 'device') return timeZone;
  return IANA_ALIASES[timeZone] || timeZone;
}

function resolveTimezone(userOrTz) {
  if (!userOrTz) return DEFAULT_TIMEZONE;
  if (typeof userOrTz === 'string') {
    return ALLOWED_TIMEZONES.has(userOrTz) ? userOrTz : DEFAULT_TIMEZONE;
  }
  const tz = userOrTz.timezone;
  return ALLOWED_TIMEZONES.has(tz) ? tz : DEFAULT_TIMEZONE;
}

/**
 * @param {string} timeZone
 * @param {Date} [at]
 * @param {number|null} [deviceOffset] fallback when timeZone === 'device'
 */
function getOffsetMinutes(timeZone, at = new Date(), deviceOffset = null) {
  if (!timeZone || timeZone === 'device') {
    return typeof deviceOffset === 'number' && Number.isFinite(deviceOffset)
      ? deviceOffset
      : at.getTimezoneOffset();
  }
  const iana = toIanaTimezone(timeZone);
  try {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: iana,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    const parts = {};
    for (const p of dtf.formatToParts(at)) {
      if (p.type !== 'literal') parts[p.type] = p.value;
    }
    const asUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );
    return -Math.round((asUtc - at.getTime()) / 60000);
  } catch {
    return typeof deviceOffset === 'number' ? deviceOffset : 0;
  }
}

function getUserTzOffset(user, deviceOffset = null, at = new Date()) {
  return getOffsetMinutes(resolveTimezone(user), at, deviceOffset);
}

/**
 * Weekday short name (Sun…Sat) for an instant in the given offset.
 */
function weekdayInOffset(date, tzOffset) {
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const shifted = new Date(date.getTime() - tzOffset * 60000);
  return WEEKDAYS[shifted.getUTCDay()];
}

/**
 * True if `date` falls on the same calendar day as `now` in the given offset.
 */
function isSameCalendarDay(date, now, tzOffset) {
  if (!date) return false;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return false;
  const a = new Date(d.getTime() - tzOffset * 60000);
  const b = new Date(now.getTime() - tzOffset * 60000);
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

module.exports = {
  DEFAULT_TIMEZONE,
  ALLOWED_TIMEZONES,
  resolveTimezone,
  getOffsetMinutes,
  getUserTzOffset,
  weekdayInOffset,
  isSameCalendarDay,
};
