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
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

const t = theme;

const modules = [
  {
    key: 'community',
    title: 'Community',
    desc: 'Forum & direct messages',
    path: '/community',
    icon: Users,
    accent: t.sageDeep,
    tint: t.sageTint,
  },
  {
    key: 'toolbox',
    title: 'Toolbox',
    desc: 'BMI and health calculators',
    path: '/toolbox',
    icon: Wrench,
    accent: t.skyDeep,
    tint: t.skyTint,
  },
  {
    key: 'logs',
    title: 'Logs',
    desc: 'Meals, insulin & glucose',
    path: '/logs',
    icon: ClipboardList,
    accent: t.clay,
    tint: t.clayTint,
  },
  {
    key: 'fitbit',
    title: 'Fitbit',
    desc: 'Connect your wearable',
    path: '/fitbit',
    icon: Watch,
    accent: t.forest,
    tint: t.sageSoft,
  },
  {
    key: 'reminders',
    title: 'Reminders',
    desc: 'Notifications & nudges',
    path: '/reminders',
    icon: Bell,
    accent: t.gold,
    tint: t.goldTint,
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'Buddy';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 45%)`,
        fontFamily: t.fontBody,
      }}
    >
      <AppSidebar />

      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 64px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <header style={{ marginBottom: 28 }}>
            <p
              style={{
                margin: '0 0 6px',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: t.inkFaint,
              }}
            >
              Home
            </p>
            <h1
              style={{
                margin: 0,
                fontFamily: t.fontDisplay,
                fontSize: 'clamp(28px, 5vw, 36px)',
                fontWeight: 500,
                color: t.ink,
                letterSpacing: '-0.02em',
              }}
            >
              Hello, {firstName}
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 15, color: t.inkSoft, lineHeight: 1.5 }}>
              Pick a space to continue.
            </p>
          </header>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 14,
            }}
          >
            {modules.map(({ key, title, desc, path, icon: Icon, accent, tint }) => (
              <button
                key={key}
                type="button"
                onClick={() => navigate(path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '20px 18px',
                  borderRadius: 20,
                  border: `1.5px solid ${t.lineStrong}`,
                  background: '#FFF',
                  boxShadow: t.shadowCard,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  fontFamily: t.fontBody,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = t.shadowLifted;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = t.shadowCard;
                }}
              >
                <span
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: tint,
                    color: accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={24} strokeWidth={1.75} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 17,
                      fontWeight: 700,
                      color: t.ink,
                      marginBottom: 2,
                    }}
                  >
                    {title}
                  </span>
                  <span style={{ display: 'block', fontSize: 13, color: t.inkSoft }}>
                    {desc}
                  </span>
                </span>
                <ChevronRight size={18} color={t.inkFaint} />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate('/messages')}
            style={{
              marginTop: 16,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px',
              borderRadius: 14,
              border: `1.5px dashed ${t.lineStrong}`,
              background: 'transparent',
              color: t.inkSoft,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: t.fontBody,
            }}
          >
            <MessageSquare size={16} />
            Open direct messages
          </button>
        </div>
      </main>
    </div>
  );
}
