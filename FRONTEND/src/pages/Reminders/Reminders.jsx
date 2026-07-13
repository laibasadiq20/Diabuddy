import React, { useState } from 'react';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { Bell, Clock } from 'lucide-react';

const t = theme;

const starter = [
  { id: 1, title: 'Glucose check', time: '8:00 AM', on: true },
  { id: 2, title: 'Medication', time: '9:00 AM', on: true },
  { id: 3, title: 'Evening reading', time: '9:30 PM', on: false },
];

export default function Reminders() {
  const [items, setItems] = useState(starter);

  const toggle = (id) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, on: !r.on } : r)));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: `linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 45%)`, fontFamily: t.fontBody }}>
      <AppSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 64px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.inkFaint }}>
            Reminders
          </p>
          <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 32, fontWeight: 500, color: t.ink }}>
            Notifications
          </h1>
          <p style={{ margin: '8px 0 24px', fontSize: 14, color: t.inkSoft }}>
            Soft nudges for checks and meds. Toggle what’s on for now.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((r) => (
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
                }}
              >
                <span style={{ width: 42, height: 42, borderRadius: 14, background: t.goldTint, color: t.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {r.on ? <Bell size={18} /> : <Clock size={18} />}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: t.ink }}>{r.title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: t.inkSoft }}>{r.time}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(r.id)}
                  aria-pressed={r.on}
                  style={{
                    width: 48,
                    height: 28,
                    borderRadius: 999,
                    border: 'none',
                    background: r.on ? t.forest : t.line,
                    cursor: 'pointer',
                    position: 'relative',
                    padding: 0,
                    transition: 'background 0.15s',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 3,
                      left: r.on ? 23 : 3,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#FFF',
                      transition: 'left 0.15s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
