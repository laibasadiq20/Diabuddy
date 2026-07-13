import React from 'react';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { Watch } from 'lucide-react';

const t = theme;

export default function Fitbit() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: `linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 45%)`, fontFamily: t.fontBody }}>
      <AppSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 64px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.inkFaint }}>
            Fitbit
          </p>
          <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 32, fontWeight: 500, color: t.ink }}>
            Connect Fitbit
          </h1>
          <p style={{ margin: '8px 0 24px', fontSize: 14, color: t.inkSoft, lineHeight: 1.5 }}>
            Sync steps, heart rate, and activity when the connection is ready.
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
                background: t.sageSoft,
                color: t.forest,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Watch size={28} />
            </span>
            <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 17, color: t.ink }}>
              Not connected yet
            </p>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
              Fitbit OAuth will plug in here. For now this is your dashboard entry point.
            </p>
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
              Connect Fitbit — soon
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
