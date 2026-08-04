import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';
import AppSidebar from '../../components/AppSidebar';
import ThemedSelect from '../../components/ThemedSelect';
import {
  getUserTzOffset,
  isoToWallLocal,
  resolveTimezone,
  timezoneLabel,
  wallLocalToIso,
} from '../../utils/timezone';
import {
  ArrowLeft,
  Bell,
  BellOff,
  Calendar,
  Check,
  Clock,
  Droplets,
  Edit2,
  Eye,
  Moon,
  Pill,
  Plus,
  ShieldAlert,
  Stethoscope,
  Syringe,
  Trash2,
  X,
} from 'lucide-react';

const t = theme;

const REMINDER_ICON_OPTIONS = [
  { id: 'pill', Icon: Pill },
  { id: 'stethoscope', Icon: Stethoscope },
  { id: 'eye', Icon: Eye },
  { id: 'syringe', Icon: Syringe },
  { id: 'droplets', Icon: Droplets },
  { id: 'moon', Icon: Moon },
  { id: 'calendar', Icon: Calendar },
  { id: 'bell', Icon: Bell },
];

const LEGACY_EMOJI_TO_ID = {
  '💊': 'pill',
  '🩺': 'stethoscope',
  '👁️': 'eye',
  '👁': 'eye',
  '💉': 'syringe',
  '🩸': 'droplets',
  '🌙': 'moon',
  '📅': 'calendar',
  '🔔': 'bell',
};

const MONTH_KEYS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
];

const MONTH_LABELS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad2(n) {
  return String(n).padStart(2, '0');
}

function daysInMonth(year, month1to12) {
  return new Date(year, month1to12, 0).getDate();
}

function buildYearOptions() {
  const y = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => {
    const year = String(y + i - 1);
    return { value: year, label: year };
  });
}

function buildDayOptions(year, month1to12) {
  const max = daysInMonth(Number(year) || new Date().getFullYear(), Number(month1to12) || 1);
  return Array.from({ length: max }, (_, i) => {
    const d = String(i + 1);
    return { value: d, label: d };
  });
}

function buildMonthOptions(tr) {
  return MONTH_KEYS.map((key, i) => ({
    value: String(i + 1),
    label: tr(`reminders.months.${key}`) || MONTH_LABELS_EN[i],
  }));
}

function buildHourOptions() {
  return Array.from({ length: 12 }, (_, i) => {
    const h = i + 1;
    return { value: String(h), label: String(h) };
  });
}

function buildMinuteOptions(currentMinute) {
  const opts = [];
  for (let i = 0; i < 60; i += 5) {
    opts.push({ value: pad2(i), label: pad2(i) });
  }
  const cur = currentMinute != null ? pad2(Number(currentMinute)) : null;
  if (cur && !opts.some((o) => o.value === cur)) {
    opts.push({ value: cur, label: cur });
    opts.sort((a, b) => Number(a.value) - Number(b.value));
  }
  return opts;
}

/** Split HH:mm (24h) → { hour12, minute, period } */
function splitTime12(time24) {
  if (!time24 || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time24)) {
    return { hour12: '8', minute: '00', period: 'AM' };
  }
  const [h24, m] = time24.split(':').map(Number);
  const period = h24 >= 12 ? 'PM' : 'AM';
  const hour12 = String(h24 % 12 || 12);
  return { hour12, minute: pad2(m), period };
}

/** Join 12h parts → HH:mm */
function joinTime12(hour12, minute, period) {
  let h = Number(hour12) % 12;
  if (period === 'PM') h += 12;
  return `${pad2(h)}:${pad2(Number(minute) || 0)}`;
}

function splitDateParts(dateStr) {
  const now = new Date();
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return {
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1),
      day: String(now.getDate()),
    };
  }
  const [y, mo, d] = dateStr.split('-');
  return { year: y, month: String(Number(mo)), day: String(Number(d)) };
}

function joinDateParts(year, month, day) {
  const y = Number(year);
  const m = Number(month);
  let d = Number(day);
  const max = daysInMonth(y, m);
  if (d > max) d = max;
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

const DEFAULT_TITLE_KEYS = {
  'Take Insulin': 'reminders.titles.takeInsulin',
  'Take Medicine': 'reminders.titles.takeMedicine',
  'Check Blood Glucose': 'reminders.titles.checkBloodGlucose',
  Bedtime: 'reminders.titles.bedtime',
  'Doctor Appointment': 'reminders.titles.doctorAppointment',
};

function translateReminderTitle(title, tr) {
  const key = DEFAULT_TITLE_KEYS[title];
  return key ? tr(key) : title;
}

// Helper to format 24h HH:mm string to 12h AM/PM string for display
function formatTime12h(time24, notSetLabel = 'Not Set') {
  if (!time24 || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time24)) {
    return notSetLabel;
  }
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const mStr = m.toString().padStart(2, '0');
  return `${h12}:${mStr} ${period}`;
}

// Icon mapping helper — Lucide line icons matched to DiaBuddy theme
function normalizeReminderIconId(iconName, title) {
  const raw = String(iconName || '').trim();
  if (LEGACY_EMOJI_TO_ID[raw]) return LEGACY_EMOJI_TO_ID[raw];
  if (REMINDER_ICON_OPTIONS.some((o) => o.id === raw)) return raw;

  const titleLower = (title || '').toLowerCase();
  if (titleLower.includes('insulin')) return 'syringe';
  if (titleLower.includes('medicine') || titleLower.includes('vitamin')) return 'pill';
  if (titleLower.includes('glucose')) return 'droplets';
  if (titleLower.includes('bedtime') || titleLower.includes('bed')) return 'moon';
  if (titleLower.includes('doctor') || titleLower.includes('appointment')) return 'calendar';
  if (titleLower.includes('eye')) return 'eye';
  return 'bell';
}

function getReminderIcon(iconName, title, size = 20) {
  const id = normalizeReminderIconId(iconName, title);
  const found = REMINDER_ICON_OPTIONS.find((o) => o.id === id);
  const Icon = found?.Icon || Bell;
  return <Icon size={size} strokeWidth={2} />;
}

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Reminders() {
  const navigate = useNavigate();
  const { user, authHeaders } = useAuth();
  const { t: tr } = useI18n();

  const [defaultReminders, setDefaultReminders] = useState([]);
  const [customReminders, setCustomReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Push notification state
  const [pushStatus, setPushStatus] = useState(Notification.permission || 'default');
  const [pushSubscribed, setPushSubscribed] = useState(false);

  // Modal State (Add/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null for new custom reminder
  const [formTitle, setFormTitle] = useState('');
  const [formTime, setFormTime] = useState('08:00');
  const [formRepeat, setFormRepeat] = useState('daily');
  const [formDays, setFormDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [formApptDate, setFormApptDate] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const [formIcon, setFormIcon] = useState('pill');
  const [saving, setSaving] = useState(false);

  // Delete Confirmation Modal State
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const tzName = resolveTimezone(user);
  const isDoctorAppt = formTitle === 'Doctor Appointment';

  const fetchReminders = async (retryCount = 0) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/reminders?tzOffset=${getUserTzOffset(user)}`, {
        headers: authHeaders(),
        credentials: 'include',
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        if (retryCount < 2) {
          setTimeout(() => fetchReminders(retryCount + 1), 500);
          return;
        }
        throw new Error(tr('reminders.errors.invalidResponse'));
      }

      const data = await res.json();

      if (res.ok && (data?.status === 'success' || data?.defaultReminders)) {
        const payload = data.data || data;
        setDefaultReminders(payload.defaultReminders || []);
        setCustomReminders(payload.customReminders || []);
        setError(null);
      } else if (res.status === 401) {
        setError(tr('reminders.errors.signIn'));
      } else {
        if (retryCount < 1) {
          setTimeout(() => fetchReminders(retryCount + 1), 500);
          return;
        }
        setError(data?.message || tr('reminders.errors.loadFailed'));
      }
    } catch (err) {
      console.error('Fetch reminders error:', err);
      if (retryCount < 1) {
        setTimeout(() => fetchReminders(retryCount + 1), 500);
        return;
      }
      setError(tr('reminders.errors.connectFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [user]);

  // Check push subscription on load
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setPushSubscribed(true);
          }
        });
      });
    }
  }, []);

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

  // Request Web Push Permission & Subscribe
  const handleEnablePush = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        showToast(tr('reminders.toasts.pushUnsupported'));
        return;
      }

      const perm = await Notification.requestPermission();
      setPushStatus(perm);

      if (perm !== 'granted') {
        showToast(tr('reminders.toasts.pushDenied'));
        return;
      }

      // Fetch active VAPID Public Key from backend
      const vapidRes = await fetch(`${API_URL}/reminders/vapid-key`, {
        headers: authHeaders(),
        credentials: 'include',
      });
      const vapidData = await vapidRes.json().catch(() => null);
      const vapidPublicKey = vapidData?.data?.publicKey;

      // Register SW
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      let sub = await reg.pushManager.getSubscription();
      if (sub) {
        try {
          await sub.unsubscribe();
        } catch (e) {}
      }

      if (!vapidPublicKey) {
        showToast(tr('reminders.toasts.pushNoVapid'));
        return;
      }

      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      try {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      } catch (e) {
        console.warn('VAPID subscription warning:', e);
        showToast(tr('reminders.toasts.pushSubscribeFailed'));
        return;
      }

      const subJson = sub.toJSON();
      const saveRes = await fetch(`${API_URL}/reminders/push-subscription`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subscription: subJson }),
      });
      if (!saveRes.ok) {
        showToast(tr('reminders.toasts.pushSaveFailed'));
        return;
      }
      setPushSubscribed(true);
      showToast(tr('reminders.toasts.pushEnabled'));
    } catch (err) {
      console.error('Push error:', err);
      showToast(tr('reminders.toasts.pushSubscribeFailed'));
    }
  };

  // Disable / Turn Off Web Push Notifications
  const handleDisablePush = async () => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
        }
      }

      await fetch(`${API_URL}/reminders/push-subscription`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subscription: null }),
      });

      setPushSubscribed(false);
      showToast(tr('reminders.toasts.pushOff'));
    } catch (err) {
      console.error('Disable push error:', err);
      setPushSubscribed(false);
      showToast(tr('reminders.toasts.notifOff'));
    }
  };

  // Toggle ON/OFF switch
  const handleToggle = async (id) => {
    try {
      const res = await fetch(`${API_URL}/reminders/${id}/toggle`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tzOffset: getUserTzOffset(user) }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        const updated = data.data;
        setDefaultReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
        setCustomReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
        showToast(updated.enabled ? tr('reminders.toasts.enabled') : tr('reminders.toasts.disabled'));
      }
    } catch (err) {
      showToast(tr('reminders.toasts.statusError'));
    }
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setFormTitle(item.title || '');
    setFormTime(item.time || '08:00');
    setFormRepeat(item.repeat || 'daily');
    setFormDays(item.days && item.days.length > 0 ? item.days : ALL_DAYS);
    if (item.appointmentDate) {
      const wall = isoToWallLocal(item.appointmentDate, getUserTzOffset(user));
      if (wall) {
        setFormApptDate(wall.slice(0, 10));
        if (wall.length >= 16) setFormTime(wall.slice(11, 16));
      } else {
        const p = splitDateParts('');
        setFormApptDate(joinDateParts(p.year, p.month, p.day));
      }
    } else if (item.title === 'Doctor Appointment') {
      const p = splitDateParts('');
      setFormApptDate(joinDateParts(p.year, p.month, p.day));
    } else {
      setFormApptDate('');
    }
    setFormEnabled(item.enabled !== false);
    setFormIcon(normalizeReminderIconId(item.icon, item.title));
    setIsModalOpen(true);
  };

  // Open Add Modal for Custom Reminder
  const openAddModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormTime('08:00');
    setFormRepeat('daily');
    setFormDays([...ALL_DAYS]);
    setFormApptDate('');
    setFormEnabled(true);
    setFormIcon('pill');
    setIsModalOpen(true);
  };

  // Save Modal Form (Create or Update)
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast(tr('reminders.toasts.titleRequired'));
      return;
    }
    if (formRepeat !== 'daily' && (!formDays || formDays.length === 0)) {
      showToast(tr('reminders.toasts.daysRequired'));
      return;
    }

    try {
      setSaving(true);

      const offset = getUserTzOffset(user);
      // Custom with every weekday selected → treat as daily (shows on dashboard every day)
      const allDaysSelected =
        formRepeat === 'custom' &&
        Array.isArray(formDays) &&
        ALL_DAYS.every((d) => formDays.includes(d));
      const repeat = allDaysSelected || formRepeat === 'daily' ? 'daily' : formRepeat;
      const days = repeat === 'daily' ? [...ALL_DAYS] : formDays;

      const remId = editingItem ? String(editingItem.id || editingItem._id) : null;
      const payload = {
        title: formTitle.trim(),
        time: formTime,
        repeat,
        days,
        appointmentDate:
          formTitle === 'Doctor Appointment' && formApptDate
            ? wallLocalToIso(`${formApptDate}T${formTime || '00:00'}`, offset)
            : null,
        enabled: formEnabled,
        icon: formIcon,
        tzOffset: offset,
      };

      if (editingItem && remId) {
        // PUT update
        const res = await fetch(`${API_URL}/reminders/${remId}`, {
          method: 'PUT',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.status === 'success') {
          const updated = data.data;
          const uid = String(updated.id || updated._id);
          setDefaultReminders((prev) => prev.map((r) => (String(r.id || r._id) === uid ? updated : r)));
          setCustomReminders((prev) => prev.map((r) => (String(r.id || r._id) === uid ? updated : r)));
          setIsModalOpen(false);
          showToast(tr('reminders.toasts.saved'));
          window.dispatchEvent(new Event('diabuddy:reminders-refresh'));
        } else {
          showToast(data.message || tr('reminders.toasts.updateFailed'));
        }
      } else {
        // POST create custom
        const res = await fetch(`${API_URL}/reminders`, {
          method: 'POST',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.status === 'success') {
          setCustomReminders((prev) => [...prev, data.data]);
          setIsModalOpen(false);
          showToast(tr('reminders.toasts.created'));
          window.dispatchEvent(new Event('diabuddy:reminders-refresh'));
        } else {
          showToast(data.message || tr('reminders.toasts.createFailed'));
        }
      }
    } catch (err) {
      console.error('Save error:', err);
      showToast(tr('reminders.toasts.saveError'));
    } finally {
      setSaving(false);
    }
  };

  // Delete Custom Reminder
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      setDeleting(true);
      const res = await fetch(`${API_URL}/reminders/${deletingItem.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCustomReminders((prev) => prev.filter((r) => r.id !== deletingItem.id));
        setDeletingItem(null);
        showToast(tr('reminders.toasts.deleted'));
      } else {
        showToast(data.message || tr('reminders.toasts.deleteFailed'));
      }
    } catch (err) {
      showToast(tr('reminders.toasts.deleteError'));
    } finally {
      setDeleting(false);
    }
  };

  // Day toggle in form
  const toggleDayInForm = (day) => {
    if (formRepeat === 'weekly') {
      setFormDays([day]);
    } else if (formDays.includes(day)) {
      setFormDays(formDays.filter((d) => d !== day));
    } else {
      setFormDays([...formDays, day]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: `linear-gradient(180deg, ${t.pageFadeTop} 0%, ${t.bg} 45%)`, fontFamily: t.fontBody }}>
      <AppSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 80px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) navigate(-1);
                else navigate('/dashboard');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 14,
                border: 'none',
                background: 'none',
                color: t.inkSoft,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: t.fontBody,
                padding: 0,
              }}
            >
              <ArrowLeft size={16} />
              {tr('common.back')}
            </button>
            <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(26px, 5vw, 34px)', fontWeight: 500, color: t.ink }}>
              {tr('reminders.heading')}
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: t.inkSoft, lineHeight: 1.45 }}>
              {tr('reminders.lead')}
            </p>
          </div>

          {/* Web Push Notification Status Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              gap: 12,
              padding: '14px 18px',
              borderRadius: 16,
              background: pushStatus === 'granted' && pushSubscribed ? t.sageTint : t.goldTint,
              border: `1px solid ${pushStatus === 'granted' && pushSubscribed ? t.sage + '50' : t.gold + '50'}`,
              marginBottom: 28,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: pushStatus === 'granted' && pushSubscribed ? t.sageSoft : t.goldSoft,
                  color: pushStatus === 'granted' && pushSubscribed ? t.sageDeep : t.gold,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {pushStatus === 'granted' && pushSubscribed ? <Bell size={18} /> : <BellOff size={18} />}
              </span>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: t.ink }}>
                  {pushStatus === 'granted' && pushSubscribed ? tr('reminders.pushActive') : tr('reminders.pushEnable')}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: t.inkSoft }}>
                  {pushStatus === 'granted' && pushSubscribed
                    ? tr('reminders.pushActiveHint')
                    : tr('reminders.pushEnableHint')}
                </p>
              </div>
            </div>
            {pushStatus === 'granted' && pushSubscribed ? (
              <button
                type="button"
                onClick={handleDisablePush}
                style={{
                  border: `1px solid ${t.lineStrong}`,
                  background: t.surfaceSunken,
                  color: t.ink,
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: t.fontBody,
                }}
              >
                {tr('reminders.turnOffPush')}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEnablePush}
                style={{
                  border: 'none',
                  background: t.forest,
                  color: '#FFF',
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: t.fontBody,
                }}
              >
                {tr('reminders.enablePush')}
              </button>
            )}
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div
              style={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 9999,
                background: t.forest,
                color: '#FFF',
                padding: '12px 18px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                boxShadow: t.shadowLifted,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Check size={16} color={t.sageSoft} />
              {toastMessage}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: t.inkSoft, fontSize: 14 }}>
              {tr('reminders.loading')}
            </div>
          ) : error ? (
            <div
              style={{
                padding: '16px 20px',
                background: t.claySoft,
                color: t.clayDeep,
                borderRadius: 16,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                gap: 12,
                border: `1px solid ${t.clay + '40'}`,
              }}
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={fetchReminders}
                style={{
                  border: 'none',
                  background: t.clayDeep,
                  color: '#FFF',
                  padding: '7px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                  whiteSpace: 'nowrap',
                }}
              >
                {tr('reminders.retry')}
              </button>
            </div>
          ) : (
            <>
              {/* SECTION 1: DEFAULT REMINDERS */}
              <section style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', color: t.inkFaint }}>
                    {tr('reminders.defaultSection')}
                  </h2>
                  <span style={{ fontSize: 12, color: t.inkFaint }}>{tr('reminders.defaultHint')}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {defaultReminders.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '16px 18px',
                        borderRadius: 18,
                        border: `1.5px solid ${t.lineStrong}`,
                        background: t.surface,
                        boxShadow: t.shadowCard,
                        opacity: r.enabled ? 1 : 0.65,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          background: r.enabled ? t.sageSoft : t.surfaceSunken,
                          color: r.enabled ? t.sageDeep : t.inkFaint,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {getReminderIcon(r.icon, r.title)}
                      </span>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: t.ink }}>{translateReminderTitle(r.title, tr)}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 13, color: t.inkSoft, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={13} color={t.inkFaint} />
                          <strong>
                            {r.title === 'Doctor Appointment' && r.appointmentDate
                              ? `${formatTime12h(r.time, tr('reminders.notSet'))} · ${new Date(r.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                              : formatTime12h(r.time, tr('reminders.notSet'))}
                          </strong>
                          <span style={{ color: t.inkFaint, fontSize: 12 }}>
                            ({r.repeat === 'daily' ? tr('reminders.daily') : r.repeat === 'weekly' ? tr('reminders.weekly') : tr('reminders.customDays')})
                          </span>
                        </p>
                      </div>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => openEditModal(r)}
                        style={{
                          border: `1px solid ${t.line}`,
                          background: t.surfaceSunken,
                          color: t.ink,
                          padding: '7px 12px',
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          fontFamily: t.fontBody,
                        }}
                      >
                        <Edit2 size={13} />
                        {tr('reminders.edit')}
                      </button>

                      {/* Toggle ON/OFF Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggle(r.id)}
                        aria-pressed={r.enabled}
                        title={r.enabled ? tr('reminders.turnOff') : tr('reminders.turnOn')}
                        style={{
                          width: 48,
                          height: 28,
                          borderRadius: 999,
                          border: 'none',
                          background: r.enabled ? t.sageDeep : t.line,
                          cursor: 'pointer',
                          position: 'relative',
                          padding: 0,
                          transition: 'background 0.15s ease',
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: 3,
                            left: r.enabled ? 23 : 3,
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: '#FFF',
                            transition: 'left 0.15s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION 2: CUSTOM REMINDERS */}
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', color: t.inkFaint }}>
                    {tr('reminders.customSection')}
                  </h2>
                  <button
                    type="button"
                    onClick={openAddModal}
                    style={{
                      border: 'none',
                      background: t.forest,
                      color: '#FFF',
                      padding: '8px 14px',
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontFamily: t.fontBody,
                    }}
                  >
                    <Plus size={15} />
                    {tr('reminders.addCustom')}
                  </button>
                </div>

                {customReminders.length === 0 ? (
                  /* Empty State */
                  <div
                    style={{
                      padding: '36px 20px',
                      textAlign: 'center',
                      borderRadius: 18,
                      border: `1.5px dashed ${t.lineStrong}`,
                      background: t.surfaceSunken,
                    }}
                  >
                    <span
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 16,
                        background: t.skySoft,
                        color: t.skyDeep,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 10,
                      }}
                    >
                      <Bell size={22} />
                    </span>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: t.ink }}>{tr('reminders.emptyTitle')}</p>
                    <p style={{ margin: '4px 0 16px', fontSize: 13, color: t.inkSoft }}>
                      {tr('reminders.emptyHint')}
                    </p>
                    <button
                      type="button"
                      onClick={openAddModal}
                      style={{
                        border: `1px solid ${t.lineStrong}`,
                        background: t.surface,
                        color: t.ink,
                        padding: '8px 16px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontFamily: t.fontBody,
                      }}
                    >
                      <Plus size={14} />
                      {tr('reminders.addCustom')}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {customReminders.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          padding: '16px 18px',
                          borderRadius: 18,
                          border: `1.5px solid ${t.lineStrong}`,
                          background: t.surface,
                          boxShadow: t.shadowCard,
                          opacity: r.enabled ? 1 : 0.65,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 14,
                            background: r.enabled ? t.skySoft : t.surfaceSunken,
                            color: r.enabled ? t.skyDeep : t.inkFaint,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {getReminderIcon(r.icon, r.title)}
                        </span>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: t.ink }}>{r.title}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 13, color: t.inkSoft, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={13} color={t.inkFaint} />
                            <strong>{formatTime12h(r.time, tr('reminders.notSet'))}</strong>
                            <span style={{ color: t.inkFaint, fontSize: 12 }}>
                              ({r.repeat === 'daily' ? tr('reminders.daily') : r.repeat === 'weekly' ? tr('reminders.weekly') : tr('reminders.customDays')})
                            </span>
                          </p>
                        </div>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => openEditModal(r)}
                          style={{
                            border: `1px solid ${t.line}`,
                            background: t.surfaceSunken,
                            color: t.ink,
                            padding: '7px 12px',
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            fontFamily: t.fontBody,
                          }}
                        >
                          <Edit2 size={13} />
                          {tr('reminders.edit')}
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeletingItem(r)}
                          style={{
                            border: `1px solid ${t.clay + '40'}`,
                            background: t.claySoft,
                            color: t.clayDeep,
                            padding: '7px 12px',
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            fontFamily: t.fontBody,
                          }}
                        >
                          <Trash2 size={13} />
                          {tr('reminders.delete')}
                        </button>

                        {/* Toggle ON/OFF Switch */}
                        <button
                          type="button"
                          onClick={() => handleToggle(r.id)}
                          aria-pressed={r.enabled}
                          title={r.enabled ? tr('reminders.turnOff') : tr('reminders.turnOn')}
                          style={{
                            width: 48,
                            height: 28,
                            borderRadius: 999,
                            border: 'none',
                            background: r.enabled ? t.sageDeep : t.line,
                            cursor: 'pointer',
                            position: 'relative',
                            padding: 0,
                            transition: 'background 0.15s ease',
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              top: 3,
                              left: r.enabled ? 23 : 3,
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              background: '#FFF',
                              transition: 'left 0.15s ease',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      {/* EDIT / ADD MODAL */}
      {isModalOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              background: 'rgba(28, 32, 28, 0.52)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              boxSizing: 'border-box',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <div
              className="db-reminder-modal"
              style={{
                width: '100%',
                maxWidth: 440,
                margin: '0 auto',
                overflow: 'visible',
                background: t.surface,
                borderRadius: 20,
                boxShadow: t.shadowLifted,
                border: `1px solid ${t.lineStrong}`,
                display: 'flex',
                flexDirection: 'column',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: '14px 16px 10px',
                  borderBottom: `1px solid ${t.line}`,
                  background: t.surface,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <h3 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 18, color: t.ink, lineHeight: 1.25, minWidth: 0 }}>
                    {editingItem
                      ? editingItem.type === 'default'
                        ? tr('reminders.editDefaultTemplate').replace('{title}', translateReminderTitle(editingItem.title, tr))
                        : tr('reminders.editCustom')
                      : tr('reminders.addCustom')}
                  </h3>
                  <button
                    type="button"
                    aria-label={tr('reminders.cancel')}
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      flexShrink: 0,
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      border: `1px solid ${t.line}`,
                      background: t.surfaceSunken,
                      cursor: 'pointer',
                      color: t.inkFaint,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleSaveModal}
                style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '4px 16px 14px' }}
              >
                <div style={{ padding: '10px 0', borderBottom: `1px solid ${t.line}` }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.inkSoft, marginBottom: 6 }}>
                    {tr('reminders.reminderName')}
                  </label>
                  <input
                    type="text"
                    value={editingItem?.type === 'default' ? translateReminderTitle(formTitle, tr) : formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    disabled={editingItem && editingItem.type === 'default'}
                    placeholder={tr('reminders.titlePlaceholder')}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: `1px solid ${t.line}`,
                      background: editingItem && editingItem.type === 'default' ? t.surfaceSunken : t.surface,
                      fontSize: 14,
                      color: t.ink,
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: t.fontBody,
                    }}
                  />
                  {editingItem && editingItem.type === 'default' && (
                    <p style={{ margin: '6px 0 0', fontSize: 11, color: t.inkFaint, lineHeight: 1.35 }}>
                      {tr('reminders.defaultTitleLocked')}
                    </p>
                  )}
                </div>

                {(!editingItem || editingItem.type === 'custom') && (
                  <div style={{ padding: '10px 0', borderBottom: `1px solid ${t.line}` }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.inkSoft, marginBottom: 6 }}>
                      {tr('reminders.icon')}
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {REMINDER_ICON_OPTIONS.map(({ id, Icon }) => {
                        const selected = formIcon === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setFormIcon(id)}
                            aria-pressed={selected}
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 10,
                              border: selected ? `1.5px solid ${t.forest}` : `1.5px solid ${t.lineStrong}`,
                              background: selected ? t.sageTint : t.surface,
                              color: selected ? t.forest : t.inkSoft,
                              cursor: 'pointer',
                              display: 'grid',
                              placeItems: 'center',
                            }}
                          >
                            <Icon size={18} strokeWidth={2} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {isDoctorAppt ? (
                  <div style={{ padding: '10px 0', borderBottom: `1px solid ${t.line}` }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: t.inkSoft, marginBottom: 6 }}>
                      <Calendar size={13} /> {tr('reminders.apptDate')}
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '0.75fr 1.35fr 0.9fr', gap: 6, marginBottom: 10 }}>
                      <ThemedSelect
                        aria-label={tr('reminders.day')}
                        value={splitDateParts(formApptDate).day}
                        onChange={(day) => {
                          const p = splitDateParts(formApptDate);
                          setFormApptDate(joinDateParts(p.year, p.month, day));
                        }}
                        options={buildDayOptions(
                          splitDateParts(formApptDate).year,
                          splitDateParts(formApptDate).month
                        )}
                      />
                      <ThemedSelect
                        aria-label={tr('reminders.month')}
                        value={splitDateParts(formApptDate).month}
                        onChange={(month) => {
                          const p = splitDateParts(formApptDate);
                          setFormApptDate(joinDateParts(p.year, month, p.day));
                        }}
                        options={buildMonthOptions(tr)}
                      />
                      <ThemedSelect
                        aria-label={tr('reminders.year')}
                        value={splitDateParts(formApptDate).year}
                        onChange={(year) => {
                          const p = splitDateParts(formApptDate);
                          setFormApptDate(joinDateParts(year, p.month, p.day));
                        }}
                        options={buildYearOptions()}
                      />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: t.inkSoft, marginBottom: 6 }}>
                      <Clock size={13} /> {tr('reminders.apptTime')}
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      <ThemedSelect
                        aria-label={tr('reminders.hour')}
                        value={splitTime12(formTime).hour12}
                        onChange={(hour12) => {
                          const p = splitTime12(formTime);
                          setFormTime(joinTime12(hour12, p.minute, p.period));
                        }}
                        options={buildHourOptions()}
                      />
                      <ThemedSelect
                        aria-label={tr('reminders.minute')}
                        value={splitTime12(formTime).minute}
                        onChange={(minute) => {
                          const p = splitTime12(formTime);
                          setFormTime(joinTime12(p.hour12, minute, p.period));
                        }}
                        options={buildMinuteOptions(splitTime12(formTime).minute)}
                      />
                      <ThemedSelect
                        aria-label={tr('reminders.period')}
                        value={splitTime12(formTime).period}
                        onChange={(period) => {
                          const p = splitTime12(formTime);
                          setFormTime(joinTime12(p.hour12, p.minute, period));
                        }}
                        options={[
                          { value: 'AM', label: tr('reminders.am') },
                          { value: 'PM', label: tr('reminders.pm') },
                        ]}
                      />
                    </div>
                    <p style={{ margin: '8px 0 0', fontSize: 11, color: t.inkFaint }}>
                      {tr('reminders.timezoneNote').replace('{tz}', timezoneLabel(tzName))}
                    </p>
                  </div>
                ) : (
                  <div style={{ padding: '10px 0', borderBottom: `1px solid ${t.line}` }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: t.inkSoft, marginBottom: 6 }}>
                      <Clock size={13} /> {tr('reminders.timeLabel')}
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      <ThemedSelect
                        aria-label={tr('reminders.hour')}
                        value={splitTime12(formTime).hour12}
                        onChange={(hour12) => {
                          const p = splitTime12(formTime);
                          setFormTime(joinTime12(hour12, p.minute, p.period));
                        }}
                        options={buildHourOptions()}
                      />
                      <ThemedSelect
                        aria-label={tr('reminders.minute')}
                        value={splitTime12(formTime).minute}
                        onChange={(minute) => {
                          const p = splitTime12(formTime);
                          setFormTime(joinTime12(p.hour12, minute, p.period));
                        }}
                        options={buildMinuteOptions(splitTime12(formTime).minute)}
                      />
                      <ThemedSelect
                        aria-label={tr('reminders.period')}
                        value={splitTime12(formTime).period}
                        onChange={(period) => {
                          const p = splitTime12(formTime);
                          setFormTime(joinTime12(p.hour12, p.minute, period));
                        }}
                        options={[
                          { value: 'AM', label: tr('reminders.am') },
                          { value: 'PM', label: tr('reminders.pm') },
                        ]}
                      />
                    </div>
                    <p style={{ margin: '8px 0 0', fontSize: 11, color: t.inkFaint }}>
                      {tr('reminders.timezoneNote').replace('{tz}', timezoneLabel(tzName))}
                    </p>
                  </div>
                )}

                <div style={{ padding: '10px 0', borderBottom: `1px solid ${t.line}` }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.inkSoft, marginBottom: 6 }}>
                    {tr('reminders.repeatSchedule')}
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: 6,
                    }}
                  >
                    {[
                      { id: 'daily', label: tr('reminders.daily') },
                      { id: 'weekly', label: tr('reminders.weekly') },
                      { id: 'custom', label: tr('reminders.customDays') },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          if (opt.id === formRepeat) return;
                          setFormRepeat(opt.id);
                          if (opt.id === 'daily') {
                            setFormDays([...ALL_DAYS]);
                          } else if (opt.id === 'weekly') {
                            const today = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
                            setFormDays(formDays.length === 1 ? formDays : [today]);
                          } else {
                            // Custom: keep selection, or default to every day so it appears on dashboard
                            setFormDays(formDays.length > 0 ? formDays : [...ALL_DAYS]);
                          }
                        }}
                        style={{
                          padding: '9px 4px',
                          borderRadius: 10,
                          border: formRepeat === opt.id
                            ? `1.5px solid ${t.forest}`
                            : `1.5px solid ${t.lineStrong}`,
                          background: formRepeat === opt.id ? t.sageTint : t.surface,
                          color: formRepeat === opt.id ? t.forest : t.ink,
                          fontWeight: 700,
                          fontSize: 11,
                          cursor: 'pointer',
                          fontFamily: t.fontBody,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {(formRepeat === 'weekly' || formRepeat === 'custom') && (
                    <div style={{ marginTop: 8 }}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: t.inkFaint, marginBottom: 6 }}>
                        {formRepeat === 'weekly' ? tr('reminders.selectDayOfWeek') : tr('reminders.selectActiveDays')}
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {ALL_DAYS.map((day) => {
                          const active = formDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDayInForm(day)}
                              style={{
                                minWidth: 36,
                                padding: '6px 8px',
                                borderRadius: 999,
                                border: active ? `1.5px solid ${t.forest}` : `1.5px solid ${t.lineStrong}`,
                                background: active ? t.sageTint : t.surface,
                                color: active ? t.forest : t.ink,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: t.fontBody,
                              }}
                            >
                              {tr(`reminders.days.${day}`)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '10px 0 4px',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.ink }}>{tr('reminders.notificationOn')}</div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formEnabled}
                    onClick={() => setFormEnabled(!formEnabled)}
                    style={{
                      flexShrink: 0,
                      width: 46,
                      height: 28,
                      borderRadius: 999,
                      border: 'none',
                      background: formEnabled ? t.forest : t.line,
                      cursor: 'pointer',
                      position: 'relative',
                      padding: 0,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 3,
                        left: formEnabled ? 21 : 3,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: '#FFF',
                        transition: 'left 0.15s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
                      }}
                    />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: 12,
                      border: `1px solid ${t.line}`,
                      background: t.surface,
                      color: t.ink,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: t.fontBody,
                    }}
                  >
                    {tr('reminders.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      flex: 1.35,
                      padding: '11px',
                      borderRadius: 12,
                      border: 'none',
                      background: t.forest,
                      color: '#FFF',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      opacity: saving ? 0.7 : 1,
                      fontFamily: t.fontBody,
                    }}
                  >
                    {saving ? tr('reminders.saving') : tr('reminders.saveReminder')}
                  </button>
                </div>
              </form>
              <style>{`
                .db-reminder-modal,
                .db-reminder-modal * {
                  scrollbar-width: none !important;
                  -ms-overflow-style: none !important;
                }
                .db-reminder-modal::-webkit-scrollbar,
                .db-reminder-modal *::-webkit-scrollbar {
                  width: 0 !important;
                  height: 0 !important;
                  display: none !important;
                }
                .db-reminder-modal .db-themed-select-trigger {
                  min-height: 38px;
                  padding: 8px 10px;
                  font-size: 13px;
                  border-radius: 10px;
                }
                .db-reminder-modal .db-themed-select-menu {
                  max-height: 168px;
                }
              `}</style>
            </div>
          </div>,
          document.body
        )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 99999,
              background: 'rgba(31, 30, 28, 0.45)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              boxSizing: 'border-box',
              margin: 0,
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 400,
                margin: '0 auto',
                background: t.surface,
                borderRadius: 20,
                padding: 24,
                boxShadow: t.shadowLifted,
                border: `1px solid ${t.lineStrong}`,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: t.claySoft,
                  color: t.clayDeep,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justify: 'center',
                  marginBottom: 14,
                }}
              >
                <ShieldAlert size={24} />
              </div>
              <h3 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 20, color: t.ink }}>
                {tr('reminders.deleteTitle')}
              </h3>
              <p style={{ margin: '8px 0 20px', fontSize: 14, color: t.inkSoft }}>
                {tr('reminders.deleteConfirmTemplate').replace('{title}', deletingItem.title)}
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setDeletingItem(null)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 12,
                    border: `1px solid ${t.line}`,
                    background: t.surfaceSunken,
                    color: t.ink,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: t.fontBody,
                  }}
                >
                  {tr('reminders.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 12,
                    border: 'none',
                    background: t.clayDeep,
                    color: '#FFF',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: deleting ? 0.7 : 1,
                    fontFamily: t.fontBody,
                  }}
                >
                  {deleting ? tr('reminders.deleting') : tr('reminders.delete')}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
