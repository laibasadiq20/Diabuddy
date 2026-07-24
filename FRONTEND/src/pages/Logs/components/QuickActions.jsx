import React from 'react';
import { theme } from '../../../theme';
import {
  Droplets,
  Utensils,
  Syringe,
  Pill,
  Dumbbell,
  Scale,
  Moon,
  Activity,
  Smile,
} from 'lucide-react';

const t = theme;

const actions = [
  { type: 'glucose', label: 'Glucose', icon: Droplets, color: t.skyDeep, bg: t.skySoft },
  { type: 'meal', label: 'Meal', icon: Utensils, color: t.sageDeep, bg: t.sageSoft },
  { type: 'insulin', label: 'Insulin', icon: Syringe, color: t.clayDeep, bg: t.claySoft },
  { type: 'medication', label: 'Medication', icon: Pill, color: t.gold, bg: t.goldSoft },
  { type: 'exercise', label: 'Exercise', icon: Dumbbell, color: t.sageDeep, bg: t.sageTint },
  { type: 'weight', label: 'Weight', icon: Scale, color: t.forest, bg: t.surfaceSunken },
  { type: 'sleep', label: 'Sleep', icon: Moon, color: t.inkSoft, bg: t.skyTint },
  { type: 'symptoms', label: 'Symptoms', icon: Activity, color: t.clay, bg: t.clayTint },
  { type: 'mood', label: 'Mood', icon: Smile, color: t.clayDeep, bg: t.peachSoft },
];

export default function QuickActions({ onOpenModal }) {
  return (
    <div
      style={{
        background: '#FFF',
        border: `1.5px solid ${t.lineStrong}`,
        borderRadius: 18,
        padding: 16,
        boxShadow: t.shadowCard,
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontFamily: t.fontDisplay, fontSize: 18, fontWeight: 500, color: t.ink }}>
        Quick log
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.type}
              type="button"
              onClick={() => onOpenModal(a.type)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 999,
                border: `1.5px solid ${t.line}`,
                background: a.bg,
                color: a.color,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: t.fontBody,
              }}
            >
              <Icon size={15} />
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
