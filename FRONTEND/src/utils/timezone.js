/**
 * User timezone helpers. Offset matches Date#getTimezoneOffset():
 * minutes to add to local wall time to reach UTC (e.g. Pakistan UTC+5 → -300).
 */

export const DEFAULT_TIMEZONE = 'Asia/Karachi';

/** Preference ids that share one IANA zone (Pakistan cities). */
const IANA_ALIASES = {
  'Pakistan/Lahore': 'Asia/Karachi',
  'Pakistan/Islamabad': 'Asia/Karachi',
};

export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Karachi', label: 'Pakistan — Karachi (PKT, UTC+5)' },
  { value: 'Pakistan/Lahore', label: 'Pakistan — Lahore (PKT, UTC+5)' },
  { value: 'Pakistan/Islamabad', label: 'Pakistan — Islamabad (PKT, UTC+5)' },
  { value: 'device', label: 'This device’s timezone' },
  { value: 'UTC', label: 'UTC — Coordinated Universal Time' },
  { value: 'Asia/Dubai', label: 'UAE — Asia/Dubai (GST, UTC+4)' },
  { value: 'Asia/Riyadh', label: 'Saudi Arabia — Asia/Riyadh (AST, UTC+3)' },
  { value: 'Asia/Kolkata', label: 'India — Asia/Kolkata (IST, UTC+5:30)' },
  { value: 'Europe/London', label: 'United Kingdom — Europe/London' },
  { value: 'Europe/Berlin', label: 'Central Europe — Europe/Berlin' },
  { value: 'America/New_York', label: 'US Eastern — America/New_York' },
  { value: 'America/Chicago', label: 'US Central — America/Chicago' },
  { value: 'America/Denver', label: 'US Mountain — America/Denver' },
  { value: 'America/Los_Angeles', label: 'US Pacific — America/Los_Angeles' },
  { value: 'Australia/Sydney', label: 'Australia — Australia/Sydney' },
];

/** Map stored preference → IANA id used for offset math. */
export function toIanaTimezone(timeZone) {
  if (!timeZone || timeZone === 'device') return timeZone;
  return IANA_ALIASES[timeZone] || timeZone;
}

export function resolveTimezone(userOrTz) {
  if (!userOrTz) return DEFAULT_TIMEZONE;
  if (typeof userOrTz === 'string') return userOrTz || DEFAULT_TIMEZONE;
  return userOrTz.timezone || DEFAULT_TIMEZONE;
}

/**
 * @param {string} timeZone IANA id or 'device'
 * @param {Date} [at]
 * @returns {number} getTimezoneOffset-style minutes
 */
export function getOffsetMinutes(timeZone, at = new Date()) {
  if (!timeZone || timeZone === 'device') {
    return at.getTimezoneOffset();
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
    return at.getTimezoneOffset();
  }
}

/** Offset for the current user preference (Settings timezone). */
export function getUserTzOffset(user, at = new Date()) {
  return getOffsetMinutes(resolveTimezone(user), at);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

/** Convert absolute instant → `YYYY-MM-DDTHH:mm` wall clock in offset. */
export function isoToWallLocal(isoOrDate, tzOffset) {
  if (!isoOrDate && isoOrDate !== 0) return '';
  const date = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  if (Number.isNaN(date.getTime())) return '';
  const shifted = new Date(date.getTime() - tzOffset * 60000);
  return `${shifted.getUTCFullYear()}-${pad2(shifted.getUTCMonth() + 1)}-${pad2(shifted.getUTCDate())}T${pad2(shifted.getUTCHours())}:${pad2(shifted.getUTCMinutes())}`;
}

/** Convert `YYYY-MM-DDTHH:mm` wall clock in offset → ISO string. */
export function wallLocalToIso(wallLocal, tzOffset) {
  if (!wallLocal || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(wallLocal)) return null;
  const [datePart, timePart] = wallLocal.split('T');
  const [y, mo, d] = datePart.split('-').map(Number);
  const [h, mi] = timePart.slice(0, 5).split(':').map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h, mi, 0, 0) + tzOffset * 60000).toISOString();
}

export function timezoneLabel(timeZone) {
  const opt = TIMEZONE_OPTIONS.find((o) => o.value === timeZone);
  return opt ? opt.label : timeZone || DEFAULT_TIMEZONE;
}

/** Display clock in 12-hour AM/PM (not 24h), regardless of device locale. */
export function formatClock12(dateOrIso, { seconds = false } = {}) {
  if (dateOrIso == null || dateOrIso === '') return '';
  const d = dateOrIso instanceof Date ? dateOrIso : new Date(dateOrIso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    ...(seconds ? { second: '2-digit' } : {}),
    hour12: true,
  });
}
