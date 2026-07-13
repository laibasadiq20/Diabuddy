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
} from 'lucide-react';

const t = theme;

const modules = [
  {
    key: 'community',
    title: 'Community',
    desc: 'Ask questions, share wins, find people who get it.',
    path: '/community',
    icon: Users,
    area: 'community',
    bg: `linear-gradient(145deg, ${t.forestDeep} 0%, ${t.forest} 50%, #3a5748 100%)`,
    text: '#F7F3EC',
    muted: 'rgba(247,243,236,0.68)',
    iconBg: 'rgba(232,184,154,0.2)',
    iconColor: t.peach,
    dark: true,
  },
  {
    key: 'toolbox',
    title: 'Toolbox',
    desc: 'Glucose, carbs, HbA1c & more',
    path: '/toolbox',
    icon: Wrench,
    area: 'toolbox',
    bg: `linear-gradient(165deg, #dce8ec 0%, #f7fbfc 55%, #fff 100%)`,
    text: t.ink,
    muted: t.inkSoft,
    iconBg: t.skySoft,
    iconColor: t.skyDeep,
    ring: t.sky + '45',
  },
  {
    key: 'logs',
    title: 'Logs',
    desc: 'Meals · insulin · glucose',
    path: '/logs',
    icon: ClipboardList,
    area: 'logs',
    bg: `linear-gradient(165deg, ${t.clayTint} 0%, #fff 70%)`,
    text: t.ink,
    muted: t.inkSoft,
    iconBg: t.claySoft,
    iconColor: t.clay,
    ring: t.clay + '40',
  },
  {
    key: 'fitbit',
    title: 'Fitbit',
    desc: 'Connect your wearable',
    path: '/fitbit',
    icon: Watch,
    area: 'fitbit',
    bg: `linear-gradient(165deg, ${t.sageTint} 0%, #fff 70%)`,
    text: t.ink,
    muted: t.inkSoft,
    iconBg: t.sageSoft,
    iconColor: t.sageDeep,
    ring: t.sage + '45',
  },
  {
    key: 'reminders',
    title: 'Reminders',
    desc: 'Soft daily nudges',
    path: '/reminders',
    icon: Bell,
    area: 'reminders',
    bg: `linear-gradient(165deg, ${t.goldTint} 0%, #fff 70%)`,
    text: t.ink,
    muted: t.inkSoft,
    iconBg: t.goldSoft,
    iconColor: t.gold,
    ring: t.gold + '45',
  },
];

function Blob({ style }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        borderRadius: '50%',
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'Buddy';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

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
            radial-gradient(ellipse 55% 40% at 0% 0%, rgba(125,143,111,0.22), transparent 55%),
            radial-gradient(ellipse 45% 35% at 100% 5%, rgba(194,114,79,0.14), transparent 50%),
            radial-gradient(ellipse 40% 30% at 70% 100%, rgba(94,135,160,0.14), transparent 45%)
          `,
        }}
      />

      <AppSidebar />

      <main style={{ flex: 1, minWidth: 0, padding: '24px 18px 72px', position: 'relative' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          {/* Greeting bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.inkFaint }}>
                {today}
              </p>
              <h1
                style={{
                  margin: 0,
                  fontFamily: t.fontDisplay,
                  fontSize: 'clamp(32px, 5vw, 44px)',
                  fontWeight: 500,
                  color: t.ink,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.05,
                }}
              >
                {greeting},{' '}
                <em style={{ fontStyle: 'italic', color: t.sageDeep }}>{firstName}</em>
              </h1>
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
                border: `1.5px solid ${t.lineStrong}`,
                background: '#FFF',
                color: t.ink,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: t.fontBody,
                boxShadow: t.shadowCard,
              }}
            >
              <MessageSquare size={15} />
              Messages
            </button>
          </div>

          {/* Asymmetric bento */}
          <div className="db-bento">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => navigate(m.path)}
                  className={`db-tile db-tile-${m.area}`}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 22,
                    borderRadius: 26,
                    border: m.ring ? `1.5px solid ${m.ring}` : '1px solid transparent',
                    background: m.bg,
                    color: m.text,
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: m.dark
                      ? '0 18px 40px rgba(22,33,25,0.28)'
                      : t.shadowCard,
                    fontFamily: t.fontBody,
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
                    e.currentTarget.style.boxShadow = t.shadowLifted;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = m.dark
                      ? '0 18px 40px rgba(22,33,25,0.28)'
                      : t.shadowCard;
                  }}
                >
                  {m.dark && (
                    <>
                      <Blob style={{ right: -40, top: -50, width: 180, height: 180, background: 'rgba(232,184,154,0.16)' }} />
                      <Blob style={{ right: 50, bottom: -60, width: 140, height: 140, background: 'rgba(94,135,160,0.18)' }} />
                    </>
                  )}
                  {!m.dark && (
                    <Blob
                      style={{
                        right: -24,
                        bottom: -28,
                        width: 110,
                        height: 110,
                        background: m.iconBg,
                        opacity: 0.7,
                      }}
                    />
                  )}

                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                      }}
                    >
                      <Icon size={22} strokeWidth={1.75} />
                    </span>
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: m.dark ? 'rgba(255,255,255,0.12)' : 'rgba(31,30,28,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: m.dark ? '#F7F3EC' : t.inkSoft,
                      }}
                    >
                      <ArrowUpRight size={15} />
                    </span>
                  </div>

                  <div style={{ position: 'relative', marginTop: 28 }}>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: m.dark ? t.fontDisplay : t.fontBody,
                        fontSize: m.area === 'community' ? 28 : 18,
                        fontWeight: m.dark ? 500 : 700,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {m.title}
                    </p>
                    <p style={{ margin: '8px 0 0', fontSize: 13, color: m.muted, lineHeight: 1.5, maxWidth: m.area === 'community' ? 340 : 200 }}>
                      {m.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <style>{`
            .db-bento {
              display: grid;
              grid-template-columns: repeat(12, 1fr);
              grid-auto-rows: minmax(140px, auto);
              gap: 14px;
            }
            .db-tile-community { grid-column: span 7; grid-row: span 2; min-height: 280px; }
            .db-tile-toolbox { grid-column: span 5; grid-row: span 2; min-height: 280px; }
            .db-tile-logs { grid-column: span 4; min-height: 160px; }
            .db-tile-fitbit { grid-column: span 4; min-height: 160px; }
            .db-tile-reminders { grid-column: span 4; min-height: 160px; }

            @media (max-width: 800px) {
              .db-bento { grid-template-columns: 1fr 1fr; }
              .db-tile-community,
              .db-tile-toolbox { grid-column: span 2; grid-row: span 1; min-height: 180px; }
              .db-tile-logs,
              .db-tile-fitbit,
              .db-tile-reminders { grid-column: span 1; min-height: 150px; }
            }
            @media (max-width: 520px) {
              .db-bento { grid-template-columns: 1fr; }
              .db-tile-community,
              .db-tile-toolbox,
              .db-tile-logs,
              .db-tile-fitbit,
              .db-tile-reminders { grid-column: span 1; min-height: 140px; }
            }
          `}</style>
        </div>
      </main>
    </div>
  );
}
