import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { theme } from '../theme';
import { API_URL } from '../config/api';
import { formatClock12, getUserTzOffset } from '../utils/timezone';
import { CheckCircle2, X, BellRing, AlarmClock, Bell, Pill, Syringe, Droplets, Moon, Calendar } from 'lucide-react';

/** How long after the scheduled minute the in-app alarm may still open. */
const DUE_GRACE_MS = 90 * 1000;
/** How long after a reminder notification is created it may open the blocking modal. */
const NOTIF_MODAL_MAX_AGE_MS = 3 * 60 * 1000;
/** Snooze duration before the alarm can show again. */
const SNOOZE_MS = 10 * 60 * 1000;

const HANDLED_STORAGE_KEY = 'diabuddy_handled_alarms';
const SNOOZE_STORAGE_KEY = 'diabuddy_snoozed_alarms';

function alarmIconEl(iconName, title, size = 22) {
  const id = String(iconName || '').trim();
  const titleLower = (title || '').toLowerCase();
  if (id === 'syringe' || id === '💉' || titleLower.includes('insulin')) return <Syringe size={size} strokeWidth={2} />;
  if (id === 'pill' || id === '💊' || titleLower.includes('medicine')) return <Pill size={size} strokeWidth={2} />;
  if (id === 'droplets' || id === '🩸' || titleLower.includes('glucose')) return <Droplets size={size} strokeWidth={2} />;
  if (id === 'moon' || id === '🌙' || titleLower.includes('bed')) return <Moon size={size} strokeWidth={2} />;
  if (id === 'calendar' || id === '📅' || titleLower.includes('doctor')) return <Calendar size={size} strokeWidth={2} />;
  return <Bell size={size} strokeWidth={2} />;
}

const t = theme;

const DEFAULT_TITLE_KEYS = {
  'Take Insulin': 'reminders.titles.takeInsulin',
  'Take Medicine': 'reminders.titles.takeMedicine',
  'Check Blood Glucose': 'reminders.titles.checkBloodGlucose',
  Bedtime: 'reminders.titles.bedtime',
  'Doctor Appointment': 'reminders.titles.doctorAppointment',
};

function playAlarmChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const playNote = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    const now = ctx.currentTime;
    playNote(587.33, now, 0.4);
    playNote(880.0, now + 0.25, 0.6);
  } catch {
    // Ignore autoplay restrictions
  }
}

function readJson(key, fallback) {
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / private mode
  }
}

function wallParts(now, tzOffset) {
  const wall = new Date(now.getTime() - tzOffset * 60000);
  return {
    wall,
    dayKey: `${wall.getUTCFullYear()}-${wall.getUTCMonth()}-${wall.getUTCDate()}`,
  };
}

function reminderHandledKey(remId, dayKey) {
  return `rem:${remId}:${dayKey}`;
}

function notifHandledKey(notifId) {
  return `notif:${notifId}`;
}

/** True only around the scheduled HH:mm in the user's timezone (plus short grace). */
function isWithinDueWindow(remTime, now, tzOffset) {
  if (!remTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(remTime)) return false;
  const [h, m] = remTime.split(':').map(Number);
  const { wall } = wallParts(now, tzOffset);
  const scheduledMs = Date.UTC(
    wall.getUTCFullYear(),
    wall.getUTCMonth(),
    wall.getUTCDate(),
    h,
    m,
    0,
    0
  );
  const nowWallMs = Date.UTC(
    wall.getUTCFullYear(),
    wall.getUTCMonth(),
    wall.getUTCDate(),
    wall.getUTCHours(),
    wall.getUTCMinutes(),
    wall.getUTCSeconds(),
    wall.getUTCMilliseconds()
  );
  const diff = nowWallMs - scheduledMs;
  return diff >= 0 && diff < DUE_GRACE_MS;
}

function parseTitleFromNotif(rawMsg) {
  let bodyStr = rawMsg;
  if (rawMsg.includes(':')) {
    bodyStr = rawMsg.split(':').slice(1).join(':').trim();
  }
  let icon = 'bell';
  let parsedTitle = 'Scheduled Reminder';
  const lowerMsg = rawMsg.toLowerCase();
  if (lowerMsg.includes('insulin')) {
    icon = 'syringe';
    parsedTitle = 'Take Insulin';
  } else if (lowerMsg.includes('medicine') || lowerMsg.includes('vitamin')) {
    icon = 'pill';
    parsedTitle = 'Take Medicine';
  } else if (lowerMsg.includes('blood glucose') || lowerMsg.includes('glucose')) {
    icon = 'droplets';
    parsedTitle = 'Check Blood Glucose';
  } else if (lowerMsg.includes('bedtime')) {
    icon = 'moon';
    parsedTitle = 'Bedtime';
  } else if (lowerMsg.includes('doctor') || lowerMsg.includes('appointment')) {
    icon = 'calendar';
    parsedTitle = 'Doctor Appointment';
  } else if (rawMsg.includes('Reminder:')) {
    parsedTitle = rawMsg.split('Reminder:')[1].replace(/\./g, '').trim();
  }
  return { icon, parsedTitle, bodyStr };
}

export default function AlarmPopupModal() {
  const { user, authHeaders } = useAuth();
  const { t: tr } = useI18n();
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [handledKeys, setHandledKeys] = useState(() => readJson(HANDLED_STORAGE_KEY, []));
  const [snoozedUntil, setSnoozedUntil] = useState(() => readJson(SNOOZE_STORAGE_KEY, {}));

  const activeAlarmRef = useRef(null);
  const handledKeysRef = useRef(handledKeys);
  const snoozedUntilRef = useRef(snoozedUntil);

  useEffect(() => {
    activeAlarmRef.current = activeAlarm;
  }, [activeAlarm]);
  useEffect(() => {
    handledKeysRef.current = handledKeys;
  }, [handledKeys]);
  useEffect(() => {
    snoozedUntilRef.current = snoozedUntil;
  }, [snoozedUntil]);

  useEffect(() => {
    const updateClock = () => setCurrentTimeStr(formatClock12(new Date(), { seconds: true }));
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const addHandled = useCallback((key) => {
    if (!key) return;
    setHandledKeys((prev) => {
      if (prev.includes(key)) return prev;
      const next = [...prev, key];
      writeJson(HANDLED_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const setSnooze = useCallback((key, untilMs) => {
    if (!key) return;
    setSnoozedUntil((prev) => {
      const next = { ...prev, [key]: untilMs };
      writeJson(SNOOZE_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const isSnoozed = useCallback((key) => {
    const until = snoozedUntilRef.current[key];
    return typeof until === 'number' && until > Date.now();
  }, []);

  const markNotifRead = useCallback(
    (notifId) => {
      if (!notifId) return;
      fetch(`${API_URL}/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: authHeaders ? authHeaders() : {},
        credentials: 'include',
      }).catch(() => {});
    },
    [authHeaders]
  );

  useEffect(() => {
    if (!user) return undefined;
    if (user.reminderAlertsEnabled === false) {
      setActiveAlarm(null);
      return undefined;
    }

    const checkDueReminders = async () => {
      try {
        const headers = authHeaders ? authHeaders() : {};
        const now = new Date();
        const offset = getUserTzOffset(user);
        const { dayKey } = wallParts(now, offset);
        const handled = handledKeysRef.current;
        const current = activeAlarmRef.current;

        // 1) Fresh unread reminder notifications only (not all-day backlog)
        const notifRes = await fetch(`${API_URL}/notifications?limit=20`, {
          headers,
          credentials: 'include',
        });
        const notifData = await notifRes.json().catch(() => null);

        if (notifRes.ok && Array.isArray(notifData?.notifications)) {
          const fresh = notifData.notifications.find((n) => {
            if (n.type !== 'reminder' || n.isRead) return false;
            const nKey = notifHandledKey(n._id);
            if (handled.includes(nKey)) return false;
            if (isSnoozed(nKey)) return false;
            const remKey = n.referenceId
              ? reminderHandledKey(String(n.referenceId), dayKey)
              : null;
            if (remKey && (handled.includes(remKey) || isSnoozed(remKey))) return false;
            const age = now.getTime() - new Date(n.createdAt).getTime();
            return age >= 0 && age < NOTIF_MODAL_MAX_AGE_MS;
          });

          if (fresh) {
            const rawMsg = fresh.message || 'DiaBuddy Reminder';
            const { icon, parsedTitle, bodyStr } = parseTitleFromNotif(rawMsg);
            const remId = fresh.referenceId ? String(fresh.referenceId) : null;
            const newAlarm = {
              id: remId || fresh._id,
              reminderId: remId,
              notificationId: fresh._id,
              title: parsedTitle,
              message: bodyStr,
              icon,
              time: formatClock12(fresh.createdAt),
              isFromNotification: true,
              handledKeys: [
                notifHandledKey(fresh._id),
                remId ? reminderHandledKey(remId, dayKey) : null,
              ].filter(Boolean),
            };

            if (!current || current.notificationId !== fresh._id) {
              setActiveAlarm(newAlarm);
              playAlarmChime();
            }
            return;
          }
        }

        // 2) Schedule match — only within the due window (not all day after trigger)
        const remRes = await fetch(`${API_URL}/reminders/today?tzOffset=${offset}`, {
          headers,
          credentials: 'include',
        });
        const remData = await remRes.json().catch(() => null);

        if (remRes.ok && remData?.status === 'success' && Array.isArray(remData.data)) {
          const due = remData.data.find((rem) => {
            if (!rem.enabled || rem.isCompletedToday) return false;
            const remId = rem.id || rem._id;
            const key = reminderHandledKey(remId, dayKey);
            if (handled.includes(key)) return false;
            if (isSnoozed(key)) return false;
            return isWithinDueWindow(rem.time, now, offset);
          });

          if (due) {
            const remId = due.id || due._id;
            const key = reminderHandledKey(remId, dayKey);
            if (!current || current.id !== remId) {
              setActiveAlarm({
                ...due,
                id: remId,
                reminderId: remId,
                handledKeys: [key],
              });
              playAlarmChime();
            }
          } else if (current && !current.isFromNotification && !current.notificationId) {
            // Clear stale schedule alarm if we're outside the window
            const stillDue = isWithinDueWindow(current.time, now, offset);
            if (!stillDue) setActiveAlarm(null);
          }
        }
      } catch (err) {
        console.warn('Alarm poll error:', err);
      }
    };

    checkDueReminders();
    const pollInterval = setInterval(checkDueReminders, 5000);
    return () => clearInterval(pollInterval);
  }, [user, authHeaders, isSnoozed]);

  useEffect(() => {
    const handleTestTrigger = (e) => {
      const demoReminder = e.detail || {
        id: `test_demo_${Date.now()}`,
        title: 'Take Insulin',
        message: 'Time to take your insulin.',
        time: formatClock12(new Date()),
        icon: 'syringe',
        enabled: true,
        isCompletedToday: false,
      };
      setActiveAlarm(demoReminder);
      playAlarmChime();
    };
    window.addEventListener('diabuddy:trigger-test-alarm', handleTestTrigger);
    return () => window.removeEventListener('diabuddy:trigger-test-alarm', handleTestTrigger);
  }, []);

  const clearAlarmKeys = (alarm, { snooze = false } = {}) => {
    if (!alarm) return;
    const offset = getUserTzOffset(user);
    const { dayKey } = wallParts(new Date(), offset);
    const keys = new Set(alarm.handledKeys || []);
    if (alarm.notificationId) keys.add(notifHandledKey(alarm.notificationId));
    if (alarm.reminderId || (alarm.id && !String(alarm.id).startsWith('test_'))) {
      keys.add(reminderHandledKey(alarm.reminderId || alarm.id, dayKey));
    }
    const until = Date.now() + SNOOZE_MS;
    keys.forEach((key) => {
      if (snooze) setSnooze(key, until);
      else addHandled(key);
    });
  };

  const handleSnooze = () => {
    if (activeAlarm) {
      clearAlarmKeys(activeAlarm, { snooze: true });
      if (activeAlarm.notificationId) markNotifRead(activeAlarm.notificationId);
    }
    setActiveAlarm(null);
  };

  const handleDismiss = () => {
    if (activeAlarm) {
      clearAlarmKeys(activeAlarm, { snooze: false });
      if (activeAlarm.notificationId) markNotifRead(activeAlarm.notificationId);
    }
    setActiveAlarm(null);
  };

  const handleComplete = async () => {
    if (!activeAlarm) return;
    try {
      setCompleting(true);
      const headers = authHeaders ? authHeaders() : {};
      if (activeAlarm.notificationId) markNotifRead(activeAlarm.notificationId);

      const remId = activeAlarm.reminderId || activeAlarm.id;
      if (remId && !String(remId).startsWith('test_')) {
        await fetch(`${API_URL}/reminders/${remId}/complete`, {
          method: 'PATCH',
          headers: { ...headers, 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            completed: true,
            tzOffset: getUserTzOffset(user),
          }),
        });
      }

      clearAlarmKeys(activeAlarm, { snooze: false });
      setActiveAlarm(null);
      window.dispatchEvent(new Event('diabuddy:notifs-refresh'));
      window.dispatchEvent(new Event('diabuddy:reminders-refresh'));
    } catch (err) {
      console.error('Complete error:', err);
    } finally {
      setCompleting(false);
    }
  };

  if (!activeAlarm) return null;

  const displayTime = (() => {
    if (!activeAlarm.time) return 'Now';
    const raw = String(activeAlarm.time).trim();
    if (/am|pm/i.test(raw)) return raw;
    if (/^([01]?\d|2[0-3]):([0-5]\d)$/.test(raw)) {
      const [h, m] = raw.split(':').map(Number);
      const p = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${m.toString().padStart(2, '0')} ${p}`;
    }
    return raw;
  })();

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        background: 'rgba(24, 23, 22, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        boxSizing: 'border-box',
        margin: 0,
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          margin: '0 auto',
          background: t.surface,
          borderRadius: 28,
          padding: '28px 24px 24px',
          boxShadow: t.shadowLifted,
          border: `1px solid ${t.lineStrong}`,
          position: 'relative',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -60,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 200,
            height: 120,
            background: `radial-gradient(circle, ${t.sageSoft} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <button
          type="button"
          onClick={handleDismiss}
          aria-label={tr('common.close')}
          title={tr('reminders.alarm.dismissToday')}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            border: 'none',
            background: t.surfaceSunken,
            color: t.inkFaint,
            width: 32,
            height: 32,
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
            color: t.clayDeep,
            position: 'relative',
          }}
        >
          <AlarmClock size={56} style={{ filter: 'drop-shadow(0 6px 14px rgba(224, 122, 95, 0.4))' }} />
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 999,
            background: t.sageSoft,
            color: t.sageDeep,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.04em',
            marginBottom: 12,
          }}
        >
          <BellRing size={13} />
          {tr('reminders.alarm.atTemplate').replace('{time}', displayTime)}
        </div>

        <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: t.inkFaint }}>
          {tr('reminders.alarm.currentTime').replace('{time}', currentTimeStr)}
        </p>

        <h2
          style={{
            margin: '6px 0 8px',
            fontFamily: t.fontDisplay,
            fontSize: 24,
            fontWeight: 700,
            color: t.ink,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <span style={{ color: t.forest, display: 'inline-flex' }}>
            {alarmIconEl(activeAlarm.icon, activeAlarm.title)}
          </span>
          <span>
            {DEFAULT_TITLE_KEYS[activeAlarm.title]
              ? tr(DEFAULT_TITLE_KEYS[activeAlarm.title])
              : activeAlarm.title}
          </span>
        </h2>

        <p style={{ margin: '0 0 24px', fontSize: 14, color: t.inkSoft, lineHeight: 1.5, padding: '0 8px' }}>
          {activeAlarm.title?.toLowerCase().includes('insulin')
            ? tr('reminders.alarm.insulinMsg')
            : activeAlarm.title?.toLowerCase().includes('medicine')
              ? tr('reminders.alarm.medicineMsg')
              : activeAlarm.title?.toLowerCase().includes('blood glucose')
                ? tr('reminders.alarm.glucoseMsg')
                : tr('reminders.alarm.genericMsgTemplate').replace(
                    '{title}',
                    DEFAULT_TITLE_KEYS[activeAlarm.title]
                      ? tr(DEFAULT_TITLE_KEYS[activeAlarm.title])
                      : activeAlarm.title
                  )}
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={handleSnooze}
            style={{
              flex: 1,
              padding: '13px',
              borderRadius: 14,
              border: `1px solid ${t.lineStrong}`,
              background: t.surfaceSunken,
              color: t.ink,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: t.fontBody,
            }}
          >
            {tr('reminders.alarm.snooze')}
          </button>
          <button
            type="button"
            onClick={handleComplete}
            disabled={completing}
            style={{
              flex: 1.2,
              padding: '13px',
              borderRadius: 14,
              border: 'none',
              background: t.forest,
              color: '#FFF',
              fontSize: 14,
              fontWeight: 700,
              cursor: completing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(45, 90, 39, 0.3)',
              fontFamily: t.fontBody,
              opacity: completing ? 0.7 : 1,
            }}
          >
            <CheckCircle2 size={18} />
            {completing ? tr('reminders.alarm.marking') : tr('reminders.alarm.markCompleted')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
