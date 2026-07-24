import React from 'react';
import { theme } from '../../../theme';

const t = theme;

function Stat({ label, value }) {
  return (
    <div
      style={{
        background: t.surfaceRaised,
        border: `1.5px solid ${t.line}`,
        borderRadius: 14,
        padding: '12px 14px',
      }}
    >
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.inkFaint }}>
        {label}
      </p>
      <p style={{ margin: '6px 0 0', fontFamily: t.fontDisplay, fontSize: 20, fontWeight: 500, color: t.ink }}>
        {value ?? '—'}
      </p>
    </div>
  );
}

export default function LogStats({ stats }) {
  const a = stats?.averages || {};

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
        <Stat label="Avg glucose" value={a.avgGlucose != null ? `${a.avgGlucose} mg/dL` : null} />
        <Stat label="Highest" value={a.highestGlucose != null ? `${a.highestGlucose}` : null} />
        <Stat label="Lowest" value={a.lowestGlucose != null ? `${a.lowestGlucose}` : null} />
        <Stat label="Avg carbs" value={a.avgCarbs != null ? `${a.avgCarbs} g` : null} />
        <Stat label="Insulin total" value={a.totalInsulin != null ? `${a.totalInsulin} u` : null} />
        <Stat label="Water total" value={a.totalWater != null ? `${a.totalWater} ml` : null} />
        <Stat label="Exercise" value={a.totalExercise != null ? `${a.totalExercise} min` : null} />
        <Stat label="Avg sleep" value={a.avgSleep != null ? `${a.avgSleep} h` : null} />
        <Stat label="Weight Δ" value={a.weightChange != null ? `${a.weightChange} kg` : null} />
      </div>
    </div>
  );
}
