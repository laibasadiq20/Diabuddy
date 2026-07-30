import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';
import AppSidebar from '../../components/AppSidebar';
import {
  Bell,
  BellOff,
  Calendar,
  Check,
  Clock,
  Droplets,
  Edit2,
  Moon,
  Pill,
  Plus,
  ShieldAlert,
  Syringe,
  Trash2,
  X,
} from 'lucide-react';

const t = theme;

// Helper to format 24h HH:mm string to 12h AM/PM string for display
function formatTime12h(time24) {
  if (!time24 || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time24)) {
    return 'Not Set';
  }
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const mStr = m.toString().padStart(2, '0');
  return `${h12}:${mStr} ${period}`;
}

// Icon mapping helper
function getReminderIcon(iconName, title) {
  const iconStr = String(iconName || '').trim();
  const titleLower = (title || '').toLowerCase();

  if (iconStr === '💉' || titleLower.includes('insulin')) return <Syringe size={20} />;
  if (iconStr === '💊' || titleLower.includes('medicine') || titleLower.includes('vitamin')) return <Pill size={20} />;
  if (iconStr === '🩸' || titleLower.includes('glucose')) return <Droplets size={20} />;
  if (iconStr === '🌙' || titleLower.includes('bedtime')) return <Moon size={20} />;
  if (iconStr === '📅' || titleLower.includes('doctor') || titleLower.includes('appointment')) return <Calendar size={20} />;
  return <Bell size={20} />;
}

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Reminders() {
  const { user, authHeaders } = useAuth();

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
  const [formIcon, setFormIcon] = useState('💊');
  const [saving, setSaving] = useState(false);

  // Delete Confirmation Modal State
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchReminders = async (retryCount = 0) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/reminders`, {
        headers: authHeaders(),
        credentials: 'include',
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        if (retryCount < 2) {
          setTimeout(() => fetchReminders(retryCount + 1), 500);
          return;
        }
        throw new Error('Server returned invalid response');
      }

      const data = await res.json();

      if (res.ok && (data?.status === 'success' || data?.defaultReminders)) {
        const payload = data.data || data;
        setDefaultReminders(payload.defaultReminders || []);
        setCustomReminders(payload.customReminders || []);
        setError(null);
      } else if (res.status === 401) {
        setError('Please sign in to view reminders');
      } else {
        if (retryCount < 1) {
          setTimeout(() => fetchReminders(retryCount + 1), 500);
          return;
        }
        setError(data?.message || 'Failed to load reminders');
      }
    } catch (err) {
      console.error('Fetch reminders error:', err);
      if (retryCount < 1) {
        setTimeout(() => fetchReminders(retryCount + 1), 500);
        return;
      }
      setError('Unable to connect to the server. Please verify backend is running.');
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
        showToast('Web Push Notifications are not supported in this browser.');
        return;
      }

      const perm = await Notification.requestPermission();
      setPushStatus(perm);

      if (perm !== 'granted') {
        showToast('Notification permission was denied. Please allow notifications in browser settings.');
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

      if (vapidPublicKey) {
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        }).catch((e) => {
          console.warn('VAPID subscription warning:', e);
          return null;
        });
      }

      if (sub) {
        const subJson = sub.toJSON();
        await fetch(`${API_URL}/reminders/push-subscription`, {
          method: 'POST',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ subscription: subJson }),
        });
        setPushSubscribed(true);
        showToast('Web Push Notifications enabled successfully!');
      } else {
        showToast('Browser notifications active for in-app alerts.');
      }
    } catch (err) {
      console.error('Push error:', err);
      showToast('Browser notifications active for in-app alerts.');
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
      showToast('Web Push Notifications turned off.');
    } catch (err) {
      console.error('Disable push error:', err);
      setPushSubscribed(false);
      showToast('Notifications turned off.');
    }
  };

  // Toggle ON/OFF switch
  const handleToggle = async (id) => {
    try {
      const res = await fetch(`${API_URL}/reminders/${id}/toggle`, {
        method: 'PATCH',
        headers: authHeaders(),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.status === 'success') {
        const updated = data.data;
        setDefaultReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
        setCustomReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
        showToast(`Reminder ${updated.enabled ? 'enabled' : 'disabled'}`);
      }
    } catch (err) {
      showToast('Error updating status');
    }
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setFormTitle(item.title || '');
    setFormTime(item.time || '08:00');
    setFormRepeat(item.repeat || 'daily');
    setFormDays(item.days && item.days.length > 0 ? item.days : ALL_DAYS);
    setFormApptDate(item.appointmentDate ? new Date(item.appointmentDate).toISOString().slice(0, 16) : '');
    setFormEnabled(item.enabled !== false);
    setFormIcon(item.icon || '💊');
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
    setFormIcon('💊');
    setIsModalOpen(true);
  };

  // Save Modal Form (Create or Update)
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Please enter a reminder title.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: formTitle.trim(),
        time: formTime,
        repeat: formRepeat,
        days: formRepeat === 'daily' ? ALL_DAYS : formDays,
        appointmentDate: formApptDate ? new Date(formApptDate).toISOString() : null,
        enabled: formEnabled,
        icon: formIcon,
      };

      if (editingItem) {
        // PUT update
        const res = await fetch(`${API_URL}/reminders/${editingItem.id}`, {
          method: 'PUT',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.status === 'success') {
          const updated = data.data;
          setDefaultReminders((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          setCustomReminders((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          setIsModalOpen(false);
          showToast('Reminder saved successfully!');
        } else {
          showToast(data.message || 'Failed to update reminder');
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
          showToast('Custom reminder created!');
        } else {
          showToast(data.message || 'Failed to create custom reminder');
        }
      }
    } catch (err) {
      console.error('Save error:', err);
      showToast('Error saving reminder');
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
        showToast('Custom reminder deleted!');
      } else {
        showToast(data.message || 'Failed to delete reminder');
      }
    } catch (err) {
      showToast('Error deleting reminder');
    } finally {
      setDeleting(false);
    }
  };

  // Day toggle in form
  const toggleDayInForm = (day) => {
    if (formRepeat === 'weekly') {
      setFormDays([day]);
    } else {
      if (formDays.includes(day)) {
        if (formDays.length > 1) {
          setFormDays(formDays.filter((d) => d !== day));
        }
      } else {
        setFormDays([...formDays, day]);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: `linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 45%)`, fontFamily: t.fontBody }}>
      <AppSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 64px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.inkFaint }}>
            Reminders
          </p>
          <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(26px, 6vw, 32px)', fontWeight: 500, color: t.ink }}>
            Reminders
          </h1>
          <p style={{ margin: '8px 0 24px', fontSize: 14, color: t.inkSoft }}>
            A preview of soft nudges for checks and meds. Reminders aren’t sending yet — toggle what you’d want on so it’s ready when they go live.
          </p>

      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 80px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.inkFaint }}>
              DiaBuddy Care
            </p>
            <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(26px, 5vw, 34px)', fontWeight: 500, color: t.ink }}>
              Reminder Management
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: t.inkSoft, lineHeight: 1.45 }}>
              Hybrid reminder system. Manage default health routines and create custom nudges for meds, checks, and appointments.
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
                  {pushStatus === 'granted' && pushSubscribed ? 'Web Push Notifications Active' : 'Enable Web Push Notifications'}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: t.inkSoft }}>
                  {pushStatus === 'granted' && pushSubscribed
                    ? 'Scheduled push alerts will ring directly on this device.'
                    : 'Get gentle push notifications on time even when DiaBuddy is closed.'}
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
                Turn Off Push
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
                Enable Push
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
              Loading your reminders...
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
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* SECTION 1: DEFAULT REMINDERS */}
              <section style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', color: t.inkFaint }}>
                    Default Reminders
                  </h2>
                  <span style={{ fontSize: 12, color: t.inkFaint }}>Core health routines</span>
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
                        background: '#FFF',
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
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: t.ink }}>{r.title}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 13, color: t.inkSoft, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={13} color={t.inkFaint} />
                          <strong>
                            {r.title === 'Doctor Appointment' && r.appointmentDate
                              ? `${formatTime12h(r.time)} · ${new Date(r.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                              : formatTime12h(r.time)}
                          </strong>
                          <span style={{ color: t.inkFaint, fontSize: 12 }}>
                            ({r.repeat === 'daily' ? 'Daily' : r.repeat === 'weekly' ? 'Weekly' : 'Custom Days'})
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
                        Edit
                      </button>

                      {/* Toggle ON/OFF Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggle(r.id)}
                        aria-pressed={r.enabled}
                        title={r.enabled ? 'Turn OFF' : 'Turn ON'}
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
                    Custom Reminders
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
                    Add Custom Reminder
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
                      background: 'rgba(255, 255, 255, 0.6)',
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
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: t.ink }}>No custom reminders yet</p>
                    <p style={{ margin: '4px 0 16px', fontSize: 13, color: t.inkSoft }}>
                      Create tailored reminders for vitamins, BP checks, eye drops, or custom health activities.
                    </p>
                    <button
                      type="button"
                      onClick={openAddModal}
                      style={{
                        border: `1px solid ${t.lineStrong}`,
                        background: '#FFF',
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
                      Add Custom Reminder
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
                          background: '#FFF',
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
                            <strong>{formatTime12h(r.time)}</strong>
                            <span style={{ color: t.inkFaint, fontSize: 12 }}>
                              ({r.repeat === 'daily' ? 'Daily' : r.repeat === 'weekly' ? 'Weekly' : 'Custom Days'})
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
                          Edit
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
                          Delete
                        </button>

                        {/* Toggle ON/OFF Switch */}
                        <button
                          type="button"
                          onClick={() => handleToggle(r.id)}
                          aria-pressed={r.enabled}
                          title={r.enabled ? 'Turn OFF' : 'Turn ON'}
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
                maxWidth: 480,
                maxHeight: '90vh',
                margin: '0 auto',
                overflowY: 'auto',
                background: '#FFF',
                borderRadius: 24,
                padding: 24,
                boxShadow: t.shadowLifted,
                border: `1px solid ${t.lineStrong}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 20, color: t.ink }}>
                  {editingItem ? (editingItem.type === 'default' ? `Edit ${editingItem.title}` : 'Edit Custom Reminder') : 'Add Custom Reminder'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: t.inkFaint, padding: 4 }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveModal} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Title */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: t.inkFaint, textTransform: 'uppercase', marginBottom: 6 }}>
                    Reminder Name
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    disabled={editingItem && editingItem.type === 'default'}
                    placeholder="e.g., Vitamin D, Check BP"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: `1.5px solid ${t.line}`,
                      background: editingItem && editingItem.type === 'default' ? t.surfaceSunken : '#FFF',
                      fontSize: 14,
                      color: t.ink,
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: t.fontBody,
                    }}
                  />
                  {editingItem && editingItem.type === 'default' && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: t.inkFaint }}>
                      Default reminder titles cannot be changed.
                    </p>
                  )}
                </div>

                {/* Icon selector for Custom */}
                {(!editingItem || editingItem.type === 'custom') && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: t.inkFaint, textTransform: 'uppercase', marginBottom: 6 }}>
                      Icon
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['💊', '🩺', '👁️', '💉', '🩸', '🌙', '📅', '🔔'].map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setFormIcon(icon)}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            border: formIcon === icon ? `2px solid ${t.sageDeep}` : `1px solid ${t.line}`,
                            background: formIcon === icon ? t.sageSoft : t.surfaceSunken,
                            fontSize: 18,
                            cursor: 'pointer',
                          }}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doctor Appointment Date / Time */}
                {formTitle === 'Doctor Appointment' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: t.inkFaint, textTransform: 'uppercase', marginBottom: 6 }}>
                      Appointment Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formApptDate}
                      onChange={(e) => {
                        setFormApptDate(e.target.value);
                        if (e.target.value) {
                          const d = new Date(e.target.value);
                          const h = d.getHours().toString().padStart(2, '0');
                          const m = d.getMinutes().toString().padStart(2, '0');
                          setFormTime(`${h}:${m}`);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 12,
                        border: `1.5px solid ${t.line}`,
                        background: '#FFF',
                        fontSize: 14,
                        color: t.ink,
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontFamily: t.fontBody,
                      }}
                    />
                  </div>
                ) : (
                  /* Time */
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: t.inkFaint, textTransform: 'uppercase', marginBottom: 6 }}>
                      Time (24-Hour Format)
                    </label>
                    <input
                      type="time"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 12,
                        border: `1.5px solid ${t.line}`,
                        background: '#FFF',
                        fontSize: 14,
                        color: t.ink,
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontFamily: t.fontBody,
                      }}
                    />
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: t.inkSoft }}>
                      Display time: <strong>{formatTime12h(formTime)}</strong>
                    </p>
                  </div>
                )}

                {/* Repeat Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: t.inkFaint, textTransform: 'uppercase', marginBottom: 6 }}>
                    Repeat Schedule
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {[
                      { id: 'daily', label: 'Daily' },
                      { id: 'weekly', label: 'Weekly' },
                      { id: 'custom', label: 'Custom Days' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setFormRepeat(opt.id);
                          if (opt.id === 'daily') setFormDays([...ALL_DAYS]);
                        }}
                        style={{
                          padding: '9px 10px',
                          borderRadius: 10,
                          border: formRepeat === opt.id ? `2px solid ${t.sageDeep}` : `1px solid ${t.line}`,
                          background: formRepeat === opt.id ? t.sageTint : t.surfaceSunken,
                          color: formRepeat === opt.id ? t.sageDeep : t.ink,
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                          fontFamily: t.fontBody,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom / Weekly Days Selector */}
                {(formRepeat === 'weekly' || formRepeat === 'custom') && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: t.inkFaint, textTransform: 'uppercase', marginBottom: 6 }}>
                      {formRepeat === 'weekly' ? 'Select Day of Week' : 'Select Active Days'}
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {ALL_DAYS.map((day) => {
                        const active = formDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDayInForm(day)}
                            style={{
                              flex: 1,
                              padding: '8px 0',
                              borderRadius: 8,
                              border: active ? `2px solid ${t.forest}` : `1px solid ${t.line}`,
                              background: active ? t.forest : t.surfaceSunken,
                              color: active ? '#FFF' : t.ink,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontFamily: t.fontBody,
                            }}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Enable Switch */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.ink }}>Notification On</span>
                  <button
                    type="button"
                    onClick={() => setFormEnabled(!formEnabled)}
                    style={{
                      width: 48,
                      height: 28,
                      borderRadius: 999,
                      border: 'none',
                      background: formEnabled ? t.sageDeep : t.line,
                      cursor: 'pointer',
                      position: 'relative',
                      padding: 0,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 3,
                        left: formEnabled ? 23 : 3,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: '#FFF',
                        transition: 'left 0.15s ease',
                      }}
                    />
                  </button>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 12,
                      border: 'none',
                      background: t.forest,
                      color: '#FFF',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      opacity: saving ? 0.7 : 1,
                      fontFamily: t.fontBody,
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Reminder'}
                  </button>
                </div>
              </form>
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
                background: '#FFF',
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
                Delete Custom Reminder?
              </h3>
              <p style={{ margin: '8px 0 20px', fontSize: 14, color: t.inkSoft }}>
                Are you sure you want to delete <strong>"{deletingItem.title}"</strong>? This action cannot be undone.
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
                  Cancel
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
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
