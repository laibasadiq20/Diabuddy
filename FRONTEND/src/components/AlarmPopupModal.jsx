import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import { API_URL } from '../config/api';
import { Clock, CheckCircle2, X, BellRing, Sparkles, AlarmClock } from 'lucide-react';

const t = theme;

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

// Play soft Web Audio API chime sound
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
    playNote(587.33, now, 0.4);        // D5
    playNote(880.00, now + 0.25, 0.6); // A5
  } catch (err) {
    // Ignore audio autoplay restrictions if user has not interacted
  }
}

export default function AlarmPopupModal() {
  const { user, authHeaders } = useAuth();
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [handledNotifIds, setHandledNotifIds] = useState([]);

  // Track triggered alarm IDs in session to avoid duplicate popups in the same minute
  const [handledAlarms, setHandledAlarms] = useState(() => {
    try {
      const saved = sessionStorage.getItem('diabuddy_handled_alarms');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Live digital clock string update
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll for due reminders and unread reminder notifications every 5 seconds
  useEffect(() => {
    if (!user) return;

    const checkDueReminders = async () => {
      try {
        const headers = authHeaders ? authHeaders() : {};

        // 1. Check unread inbox notifications for type === 'reminder'
        const notifRes = await fetch(`${API_URL}/notifications`, {
          headers,
          credentials: 'include',
        });
        const notifData = await notifRes.json().catch(() => null);

        if (notifRes.ok && Array.isArray(notifData?.notifications)) {
          const unreadReminderNotif = notifData.notifications.find(
            (n) => n.type === 'reminder' && !n.isRead && !handledNotifIds.includes(n._id)
          );

          if (unreadReminderNotif) {
            const rawMsg = unreadReminderNotif.message || 'DiaBuddy Reminder';
            let bodyStr = rawMsg;
            if (rawMsg.includes(':')) {
              bodyStr = rawMsg.split(':').slice(1).join(':').trim();
            }

            let icon = '🔔';
            let parsedTitle = 'Scheduled Reminder';
            const lowerMsg = rawMsg.toLowerCase();

            if (lowerMsg.includes('insulin')) {
              icon = '💉';
              parsedTitle = 'Take Insulin';
            } else if (lowerMsg.includes('medicine') || lowerMsg.includes('vitamin')) {
              icon = '💊';
              parsedTitle = 'Take Medicine';
            } else if (lowerMsg.includes('blood glucose') || lowerMsg.includes('glucose')) {
              icon = '🩸';
              parsedTitle = 'Check Blood Glucose';
            } else if (lowerMsg.includes('bedtime')) {
              icon = '🌙';
              parsedTitle = 'Bedtime';
            } else if (lowerMsg.includes('doctor') || lowerMsg.includes('appointment')) {
              icon = '📅';
              parsedTitle = 'Doctor Appointment';
            } else if (rawMsg.includes('Reminder:')) {
              parsedTitle = rawMsg.split('Reminder:')[1].replace(/\./g, '').trim();
            }

            const notifTime = new Date(unreadReminderNotif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const newAlarm = {
              id: unreadReminderNotif._id,
              notificationId: unreadReminderNotif._id,
              title: parsedTitle,
              message: bodyStr,
              icon,
              time: notifTime,
              isFromNotification: true,
            };

            if (!activeAlarm || activeAlarm.notificationId !== unreadReminderNotif._id) {
              setActiveAlarm(newAlarm);
              playAlarmChime();
            }
            return;
          }
        }

        // 2. Check today's reminders schedule
        const remRes = await fetch(`${API_URL}/reminders/today`, {
          headers,
          credentials: 'include',
        });
        const remData = await remRes.json().catch(() => null);

        if (remRes.ok && remData?.status === 'success' && Array.isArray(remData.data)) {
          const now = new Date();
          const currentHHMM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

          const due = remData.data.find((rem) => {
            if (!rem.enabled || rem.isCompletedToday) return false;
            const handledKey = `${rem.id}_${rem.time}_${now.toDateString()}`;
            if (handledAlarms.includes(handledKey)) return false;

            // 1. Exact match for current HH:mm
            if (rem.time === currentHHMM) return true;

            // 2. Reminder was triggered today by backend
            if (rem.lastTriggeredAt) {
              const triggeredDate = new Date(rem.lastTriggeredAt);
              if (triggeredDate.toDateString() === now.toDateString()) {
                return true;
              }
            }

            // 3. Reminder nextTriggerAt is past or due right now
            if (rem.nextTriggerAt) {
              const nextTrigger = new Date(rem.nextTriggerAt);
              if (nextTrigger <= now) {
                return true;
              }
            }

            return false;
          });

          if (due && (!activeAlarm || activeAlarm.id !== due.id)) {
            setActiveAlarm(due);
            playAlarmChime();
          }
        }
      } catch (err) {
        console.warn('Alarm poll error:', err);
      }
    };

    checkDueReminders();
    const pollInterval = setInterval(checkDueReminders, 3000);
    return () => clearInterval(pollInterval);
  }, [user, handledAlarms, handledNotifIds, activeAlarm]);

  // Listen for manual test trigger event from Reminders page
  useEffect(() => {
    const handleTestTrigger = (e) => {
      const demoReminder = e.detail || {
        id: 'test_demo_' + Date.now(),
        title: 'Take Insulin',
        message: 'Time to take your insulin.',
        time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
        icon: '💉',
        enabled: true,
        isCompletedToday: false,
      };
      setActiveAlarm(demoReminder);
      playAlarmChime();
    };

    window.addEventListener('diabuddy:trigger-test-alarm', handleTestTrigger);
    return () => window.removeEventListener('diabuddy:trigger-test-alarm', handleTestTrigger);
  }, []);

  const markHandled = (remId, remTime) => {
    const todayStr = new Date().toDateString();
    const handledKey = `${remId}_${remTime}_${todayStr}`;
    const nextHandled = [...handledAlarms, handledKey];
    setHandledAlarms(nextHandled);
    try {
      sessionStorage.setItem('diabuddy_handled_alarms', JSON.stringify(nextHandled));
    } catch {}
  };

  const handleDismiss = async () => {
    if (activeAlarm) {
      if (activeAlarm.notificationId) {
        setHandledNotifIds((prev) => [...prev, activeAlarm.notificationId]);
        fetch(`${API_URL}/notifications/${activeAlarm.notificationId}/read`, {
          method: 'PUT',
          headers: authHeaders ? authHeaders() : {},
          credentials: 'include',
        }).catch(() => {});
      } else {
        markHandled(activeAlarm.id, activeAlarm.time);
      }
    }
    setActiveAlarm(null);
  };

  const handleComplete = async () => {
    if (!activeAlarm) return;
    try {
      setCompleting(true);
      const headers = authHeaders ? authHeaders() : {};

      if (activeAlarm.notificationId) {
        setHandledNotifIds((prev) => [...prev, activeAlarm.notificationId]);
        fetch(`${API_URL}/notifications/${activeAlarm.notificationId}/read`, {
          method: 'PUT',
          headers,
          credentials: 'include',
        }).catch(() => {});
      }

      if (activeAlarm.id && !activeAlarm.isFromNotification) {
        await fetch(`${API_URL}/reminders/${activeAlarm.id}/complete`, {
          method: 'PATCH',
          headers,
          credentials: 'include',
        });
      }

      markHandled(activeAlarm.id, activeAlarm.time);
      setActiveAlarm(null);
      window.dispatchEvent(new Event('diabuddy:notifs-refresh'));
    } catch (err) {
      console.error('Complete error:', err);
    } finally {
      setCompleting(false);
    }
  };

  if (!activeAlarm) return null;

  const displayTime = activeAlarm.time
    ? (() => {
        const [h, m] = activeAlarm.time.split(':').map(Number);
        const p = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m.toString().padStart(2, '0')} ${p}`;
      })()
    : 'Now';

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
          background: '#FFF',
          borderRadius: 28,
          padding: '28px 24px 24px',
          boxShadow: '0 24px 48px -12px rgba(45, 90, 39, 0.25), 0 0 0 1.5px rgba(45, 90, 39, 0.15)',
          position: 'relative',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Decorative Top Ambient Glow */}
        <div
          style={{
            position: 'absolute',
            top: -60,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 200,
            height: 120,
            background: 'radial-gradient(circle, rgba(163, 177, 138, 0.45) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
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
            justify: 'center',
          }}
        >
          <X size={18} />
        </button>

        {/* Alarm Clock Icon (No Green Box) */}
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

        {/* Alarm Time Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 999,
            background: t.sageSoft,
            color: t.forest,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.04em',
            marginBottom: 12,
          }}
        >
          <BellRing size={13} />
          ALARM AT {displayTime}
        </div>

        {/* Live Digital Clock */}
        <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: t.inkFaint }}>
          Current Time: {currentTimeStr}
        </p>

        {/* Reminder Title */}
        <h2
          style={{
            margin: '6px 0 8px',
            fontFamily: t.fontDisplay,
            fontSize: 24,
            fontWeight: 700,
            color: t.ink,
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            gap: 8,
          }}
        >
          <span>{activeAlarm.icon || '🔔'}</span>
          <span>{activeAlarm.title}</span>
        </h2>

        {/* Description Message */}
        <p style={{ margin: '0 0 24px', fontSize: 14, color: t.inkSoft, lineHeight: 1.5, padding: '0 8px' }}>
          {activeAlarm.title?.toLowerCase().includes('insulin')
            ? 'Time to take your insulin.'
            : activeAlarm.title?.toLowerCase().includes('medicine')
            ? 'Time to take your medicine.'
            : activeAlarm.title?.toLowerCase().includes('blood glucose')
            ? 'Time to check your blood glucose level.'
            : `Scheduled reminder for ${activeAlarm.title}.`}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={handleDismiss}
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
            Snooze / Dismiss
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
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(45, 90, 39, 0.3)',
              fontFamily: t.fontBody,
              opacity: completing ? 0.7 : 1,
            }}
          >
            <CheckCircle2 size={18} />
            {completing ? 'Marking...' : 'Mark Completed'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
