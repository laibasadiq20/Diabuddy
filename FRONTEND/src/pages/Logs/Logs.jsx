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
      <main className="db-logs-hub-main" style={{ flex: 1, minWidth: 0, padding: '28px 20px 110px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>
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
              fontSize: 'clamp(26px, 6vw, 34px)',
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
          <p style={{ margin: '12px 0 24px', fontSize: 15, color: t.inkSoft, lineHeight: 1.6, maxWidth: 520 }}>
            Record glucose, meals, medicines, and daily habits. Select a log type to continue.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LOG_TYPES.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(`/logs/${item.path}`)}
                  className="db-logs-hub-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    width: '100%',
                    textAlign: 'left',
                    padding: '14px 14px',
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
                        marginBottom: 2,
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="db-logs-hub-desc"
                      style={{
                        display: 'block',
                        fontSize: 13,
                        color: t.inkSoft,
                        lineHeight: 1.45,
                      }}
                    >
                      {item.why}
                    </span>
                  </span>
                  <ChevronRight size={18} color={t.inkFaint} style={{ flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 640px) {
          .db-logs-hub-main {
            padding: 14px 12px 120px !important;
          }
          .db-logs-hub-card {
            align-items: flex-start !important;
            padding: 12px !important;
            gap: 12px !important;
          }
          .db-logs-hub-desc {
            display: -webkit-box !important;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
}
