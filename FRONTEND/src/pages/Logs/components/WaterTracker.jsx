import React from 'react';
import { theme } from '../../../theme';
import { GlassWater, Trash2 } from 'lucide-react';

const t = theme;
const QUICK = [250, 500, 750];

export default function WaterTracker({ todayIntake = 0, goal = 2000, waterLogs = [], onAddWater, onDeleteWater }) {
  const pct = Math.min(100, Math.round((todayIntake / Math.max(goal, 1)) * 100));

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: t.skySoft,
            color: t.skyDeep,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GlassWater size={18} />
        </span>
        <div>
          <h3 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 18, fontWeight: 500, color: t.ink }}>
            Water today
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: t.inkSoft }}>
            {todayIntake} / {goal} ml ({pct}%)
          </p>
        </div>
      </div>

      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: t.surfaceSunken,
          overflow: 'hidden',
          marginBottom: 14,
        }}
      >
        <div style={{ width: `${pct}%`, height: '100%', background: t.sky, borderRadius: 999 }} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {QUICK.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => onAddWater(amount)}
            style={{
              padding: '8px 14px',
              borderRadius: 999,
              border: `1.5px solid ${t.sky}`,
              background: t.skyTint,
              color: t.skyDeep,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: t.fontBody,
            }}
          >
            +{amount} ml
          </button>
        ))}
      </div>

      {waterLogs.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: t.inkFaint }}>No water logged yet today.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {waterLogs.map((log) => (
            <div
              key={log._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 12,
                background: t.surfaceSunken,
              }}
            >
              <span style={{ fontSize: 13, color: t.ink }}>
                {log.title || `${log.raw?.amount ?? ''} ml`} · {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <button
                type="button"
                aria-label="Delete water log"
                onClick={() => onDeleteWater(log._id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.inkFaint, padding: 4 }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
