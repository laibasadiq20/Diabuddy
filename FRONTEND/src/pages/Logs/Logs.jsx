import React from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { ChevronRight, ClipboardList } from 'lucide-react';
import { LOG_TYPES } from './logsConfig';

const t = theme;

export default function Logs() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 40%)`,
        fontFamily: t.fontBody,
      }}
    >
      <AppSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 110px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p
            style={{
              margin: '0 0 6px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: t.inkFaint,
            }}
          >
            Daily record
          </p>
          <h1
            style={{
              margin: 0,
              fontFamily: t.fontDisplay,
              fontSize: 'clamp(28px, 5vw, 34px)',
              fontWeight: 500,
              color: t.ink,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <ClipboardList size={28} color={t.forest} strokeWidth={1.75} />
            Health logs
          </h1>
          <p style={{ margin: '12px 0 8px', fontSize: 15, color: t.inkSoft, lineHeight: 1.65, maxWidth: 560 }}>
            A calm place to record glucose, meals, medicines, and daily habits. Built for people living with
            diabetes in Pakistan—where roti, rice, heat, and family routines shape your numbers.
          </p>
          <p style={{ margin: '0 0 28px', fontSize: 13, color: t.inkFaint, lineHeight: 1.55, maxWidth: 560 }}>
            Choose a log type to open its page. Each page explains why that record matters and how to fill it
            in. Entries save to your account for clinic visits and your own review—this is not medical advice.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LOG_TYPES.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(`/logs/${item.path}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    width: '100%',
                    textAlign: 'left',
                    padding: '16px 16px',
                    borderRadius: 14,
                    border: `1px solid ${t.lineStrong}`,
                    background: '#FFF',
                    boxShadow: '0 1px 2px rgba(43,42,40,0.04)',
                    cursor: 'pointer',
                    fontFamily: t.fontBody,
                  }}
                >
                  <span
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 11,
                      background: t.surfaceSunken,
                      color: t.forest,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 16,
                        fontWeight: 650,
                        color: t.ink,
                        marginBottom: 4,
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 13,
                        color: t.inkSoft,
                        lineHeight: 1.5,
                      }}
                    >
                      {item.why.length > 120 ? `${item.why.slice(0, 117)}…` : item.why}
                    </span>
                  </span>
                  <ChevronRight size={18} color={t.inkFaint} style={{ marginTop: 12, flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
