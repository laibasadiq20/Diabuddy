import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import {
  Users,
  Wrench,
  ClipboardList,
  Watch,
  Bell,
  ArrowUpRight,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

const t = theme;

const modules = [
  {
    key: 'community',
    title: 'Community',
    desc: 'Forum threads and peer support',
    path: '/community',
    icon: Users,
    span: 'wide',
    gradient: `linear-gradient(135deg, ${t.forestDeep} 0%, ${t.forest} 55%, #3d5c4a 100%)`,
    text: '#F7F3EC',
    muted: 'rgba(247,243,236,0.7)',
    iconBg: 'rgba(232,184,154,0.22)',
    iconColor: t.peach,
  },
  {
    key: 'toolbox',
    title: 'Toolbox',
    desc: 'BMI, blood pressure & more',
    path: '/toolbox',
    icon: Wrench,
    span: 'normal',
    gradient: `linear-gradient(160deg, ${t.skyTint} 0%, #FFF 70%)`,
    text: t.ink,
    muted: t.inkSoft,
    iconBg: t.skySoft,
    iconColor: t.skyDeep,
    border: t.sky + '40',
  },
  {
    key: 'logs',
    title: 'Logs',
    desc: 'Meals, insulin, glucose',
    path: '/logs',
    icon: ClipboardList,
    span: 'normal',
    gradient: `linear-gradient(160deg, ${t.clayTint} 0%, #FFF 70%)`,
    text: t.ink,
    muted: t.inkSoft,
    iconBg: t.claySoft,
    iconColor: t.clay,
    border: t.clay + '35',
  },
  {
    key: 'fitbit',
    title: 'Fitbit',
    desc: 'Sync your wearable',
    path: '/fitbit',
    icon: Watch,
    span: 'normal',
    gradient: `linear-gradient(160deg, ${t.sageTint} 0%, #FFF 70%)`,
    text: t.ink,
    muted: t.inkSoft,
    iconBg: t.sageSoft,
    iconColor: t.sageDeep,
    border: t.sage + '40',
  },
  {
    key: 'reminders',
    title: 'Reminders',
    desc: 'Soft daily nudges',
    path: '/reminders',
    icon: Bell,
    span: 'normal',
    gradient: `linear-gradient(160deg, ${t.goldTint} 0%, #FFF 70%)`,
    text: t.ink,
    muted: t.inkSoft,
    iconBg: t.goldSoft,
    iconColor: t.gold,
    border: t.gold + '40',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'Buddy';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: t.bg,
        fontFamily: t.fontBody,
        position: 'relative',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 60% 40% at 10% -10%, rgba(125,143,111,0.18), transparent 55%),
            radial-gradient(ellipse 50% 35% at 100% 0%, rgba(194,114,79,0.12), transparent 50%),
            radial-gradient(ellipse 40% 30% at 80% 100%, rgba(94,135,160,0.12), transparent 45%)
          `,
        }}
      />

      <AppSidebar />

      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 64px', position: 'relative' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          {/* Hero strip */}
          <section
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 28,
              padding: '32px 28px',
              marginBottom: 22,
              background: `linear-gradient(120deg, ${t.forestDeep} 0%, ${t.forest} 42%, #355544 100%)`,
              color: '#F7F3EC',
              boxShadow: '0 20px 48px rgba(22,33,25,0.28)',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                right: -30,
                top: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(232,184,154,0.18)',
              }}
            />
            <div
              aria-hidden
              style={{
                position: 'absolute',
                right: 70,
                bottom: -70,
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: 'rgba(94,135,160,0.2)',
              }}
            />

            <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: '0 0 8px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(247,243,236,0.55)' }}>
                  <Sparkles size={13} /> {greeting}
                </p>
                <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(30px, 5vw, 40px)', fontWeight: 500, letterSpacing: '-0.02em' }}>
                  {firstName}
                </h1>
                <p style={{ margin: '10px 0 0', maxWidth: 360, fontSize: 15, lineHeight: 1.55, color: 'rgba(247,243,236,0.72)' }}>
                  Your companion for community, tools, logs, and gentle reminders.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/messages')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 18px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.22)',
                  background: 'rgba(255,255,255,0.12)',
                  color: '#F7F3EC',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <MessageSquare size={15} />
                Messages
              </button>
            </div>
          </section>

          {/* Bento modules */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 14,
            }}
            className="db-dash-grid"
          >
            {modules.map((m) => {
              const Icon = m.icon;
              const isWide = m.span === 'wide';
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => navigate(m.path)}
                  className={isWide ? 'db-dash-wide' : undefined}
                  style={{
                    gridColumn: isWide ? '1 / -1' : 'auto',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: isWide ? 148 : 150,
                    padding: isWide ? '26px 24px' : '22px 20px',
                    borderRadius: 24,
                    border: m.border ? `1.5px solid ${m.border}` : '1px solid transparent',
                    background: m.gradient,
                    color: m.text,
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: t.shadowCard,
                    fontFamily: t.fontBody,
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = t.shadowLifted;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = t.shadowCard;
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, height: '100%' }}>
                    <div>
                      <span
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 16,
                          background: m.iconBg,
                          color: m.iconColor,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 14,
                        }}
                      >
                        <Icon size={22} strokeWidth={1.75} />
                      </span>
                      <p style={{ margin: 0, fontSize: isWide ? 24 : 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
                        {m.title}
                      </p>
                      <p style={{ margin: '6px 0 0', fontSize: 13, color: m.muted, lineHeight: 1.45, maxWidth: isWide ? 320 : 180 }}>
                        {m.desc}
                      </p>
                    </div>
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: isWide ? 'rgba(255,255,255,0.12)' : 'rgba(31,30,28,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isWide ? '#F7F3EC' : t.inkSoft,
                        flexShrink: 0,
                      }}
                    >
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <style>{`
            @media (max-width: 640px) {
              .db-dash-grid { grid-template-columns: 1fr !important; }
              .db-dash-wide { grid-column: auto !important; }
            }
          `}</style>
        </div>
      </main>
    </div>
  );
}
