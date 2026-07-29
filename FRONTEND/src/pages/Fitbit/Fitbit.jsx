import React from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { ArrowLeft, Watch } from 'lucide-react';

const t = theme;

export default function Fitbit() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: `linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 45%)`, fontFamily: t.fontBody }}>
      <AppSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 64px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 16,
              border: 'none',
              background: 'none',
              color: t.inkSoft,
              fontSize: 13,
              fontWeight: 600,
              cursor: pointer,
              fontFamily: t.fontBody,
              padding: 0,
            }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.inkFaint }}>
            Activity
          </p>
          <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(26px, 6vw, 32px)', fontWeight: 500, color: t.ink }}>
            Connect smartwatch
          </h1>
          <p style={{ margin: '8px 0 24px', fontSize: 14, color: t.inkSoft, lineHeight: 1.5 }}>
            Sync steps and activity automatically. Until this is ready, you can still log steps manually in Activity.
          </p>

          <div
            style={{
              background: '#FFF',
              borderRadius: 20,
              border: `1.5px solid ${t.lineStrong}`,
              boxShadow: t.shadowCard,
              padding: 28,
              textAlign: 'center',
            }}
          >
            <span
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: t.goldSoft,
                color: t.gold,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Watch size={28} />
            </span>
            <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 17, color: t.ink }}>
              Coming soon
            </p>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
              Fitbit (and other watches) will connect here later. For now, add steps when you log exercise.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              <button
                type="button"
                disabled
                style={{
                  padding: '12px 22px',
                  borderRadius: 999,
                  border: 'none',
                  background: t.forest,
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: 14,
                  opacity: 0.55,
                  cursor: 'not-allowed',
                  fontFamily: t.fontBody,
                }}
              >
                Connect watch — soon
              </button>
              <button
                type="button"
                onClick={() => navigate('/logs/exercise')}
                style={{
                  padding: '12px 22px',
                  borderRadius: 999,
                  border: `1.5px solid ${t.lineStrong}`,
                  background: '#FFF',
                  color: t.ink,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                }}
              >
                Log activity manually
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
