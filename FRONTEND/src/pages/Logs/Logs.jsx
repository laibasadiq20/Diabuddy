import React from 'react';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { ClipboardList, Droplets, Syringe, Utensils } from 'lucide-react';

const t = theme;

const items = [
  { icon: Droplets, title: 'Glucose', desc: 'Log fingerstick or CGM readings' },
  { icon: Syringe, title: 'Insulin', desc: 'Track doses and timing' },
  { icon: Utensils, title: 'Meals', desc: 'Carbs, notes, and meal times' },
];

export default function Logs() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: `linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 45%)`, fontFamily: t.fontBody }}>
      <AppSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 64px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.inkFaint }}>
            Logs
          </p>
          <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 32, fontWeight: 500, color: t.ink }}>
            Health logs
          </h1>
          <p style={{ margin: '8px 0 24px', fontSize: 14, color: t.inkSoft }}>
            Meal, insulin, and glucose logging will live here. Coming next.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: 18,
                  borderRadius: 18,
                  border: `1.5px solid ${t.lineStrong}`,
                  background: '#FFF',
                  boxShadow: t.shadowCard,
                  opacity: 0.85,
                }}
              >
                <span style={{ width: 44, height: 44, borderRadius: 14, background: t.clayTint, color: t.clay, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} />
                </span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: t.ink }}>{title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: t.inkSoft }}>{desc}</p>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: t.inkFaint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Soon
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: 16, borderRadius: 14, background: t.surfaceSunken, border: `1px dashed ${t.lineStrong}`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <ClipboardList size={18} color={t.inkFaint} style={{ marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
              This screen is a placeholder entry from your dashboard. Full logging comes in a later pass.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
