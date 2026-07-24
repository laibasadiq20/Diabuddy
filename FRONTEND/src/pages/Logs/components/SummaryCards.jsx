import React from 'react';
import { theme } from '../../../theme';
import {
  Droplets,
  Utensils,
  Syringe,
  Pill,
  GlassWater,
  Dumbbell,
  Moon,
  Scale,
  Smile,
} from 'lucide-react';

const t = theme;

const cards = [
  { key: 'glucose', label: 'Glucose', icon: Droplets, color: t.skyDeep, bg: t.skySoft, get: (s) => s?.glucose?.value || '—', sub: (s) => `${s?.glucose?.count ?? 0} reading(s)` },
  { key: 'meals', label: 'Meals', icon: Utensils, color: t.sageDeep, bg: t.sageSoft, get: (s) => `${s?.meals?.value ?? 0}/${s?.meals?.goal ?? 3}`, sub: () => 'today' },
  { key: 'insulin', label: 'Insulin', icon: Syringe, color: t.clayDeep, bg: t.claySoft, get: (s) => `${s?.insulin?.value ?? 0} u`, sub: () => 'today' },
  { key: 'medications', label: 'Meds taken', icon: Pill, color: t.gold, bg: t.goldSoft, get: (s) => s?.medications?.value ?? 0, sub: () => 'taken today' },
  { key: 'water', label: 'Water', icon: GlassWater, color: t.skyDeep, bg: t.skyTint, get: (s) => `${s?.water?.value ?? 0} ml`, sub: (s) => `goal ${s?.water?.goal ?? 2000} ml` },
  { key: 'exercise', label: 'Exercise', icon: Dumbbell, color: t.sageDeep, bg: t.sageTint, get: (s) => `${s?.exercise?.value ?? 0} min`, sub: (s) => `goal ${s?.exercise?.goal ?? 30} min` },
  { key: 'sleep', label: 'Sleep', icon: Moon, color: t.inkSoft, bg: t.surfaceSunken, get: (s) => `${s?.sleep?.value ?? 0} h`, sub: (s) => `goal ${s?.sleep?.goal ?? 8} h` },
  { key: 'weight', label: 'Weight', icon: Scale, color: t.forest, bg: t.sageSoft, get: (s) => (s?.weight?.value != null ? `${s.weight.value} kg` : '—'), sub: () => 'latest' },
  { key: 'mood', label: 'Mood', icon: Smile, color: t.clayDeep, bg: t.clayTint, get: (s) => s?.mood?.value || '—', sub: () => 'latest' },
];

export default function SummaryCards({ summary }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 12,
      }}
    >
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.key}
            style={{
              background: '#FFF',
              border: `1.5px solid ${t.lineStrong}`,
              borderRadius: 16,
              padding: '14px 14px 12px',
              boxShadow: t.shadowCard,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: c.bg,
                  color: c.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={16} />
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: t.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {c.label}
              </span>
            </div>
            <p style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 20, fontWeight: 500, color: t.ink }}>
              {c.get(summary)}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: t.inkSoft }}>{c.sub(summary)}</p>
          </div>
        );
      })}
    </div>
  );
}
