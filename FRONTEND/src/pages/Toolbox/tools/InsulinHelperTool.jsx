import React, { useMemo, useState } from 'react';
import { theme as t } from '../../../theme';
import { fieldStyle, labelStyle, resultPanel, eyebrow, disclaimerStyle } from '../toolboxStyles';

export default function InsulinHelperTool() {
  const [current, setCurrent] = useState('220');
  const [target, setTarget] = useState('120');
  const [isf, setIsf] = useState('50');

  const dose = useMemo(() => {
    const c = parseFloat(current);
    const tgt = parseFloat(target);
    const factor = parseFloat(isf);
    if (!c || !tgt || !factor || factor <= 0) return null;
    const raw = (c - tgt) / factor;
    if (raw <= 0) return { units: 0, note: 'Glucose is at or below target — no correction suggested by this formula.' };
    return { units: +raw.toFixed(1), note: null };
  }, [current, target, isf]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={disclaimerStyle}>
        For educational purposes only. Follow your healthcare provider&apos;s advice. Do not change insulin without clinical guidance.
      </div>

      <p style={{ margin: 0, fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
        Correction dose formula: (Current − Target) ÷ Insulin sensitivity factor (ISF).
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Current (mg/dL)</label>
          <input type="number" min="40" max="600" value={current} onChange={(e) => setCurrent(e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Target (mg/dL)</label>
          <input type="number" min="70" max="180" value={target} onChange={(e) => setTarget(e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>ISF</label>
          <input type="number" min="1" step="1" value={isf} onChange={(e) => setIsf(e.target.value)} style={fieldStyle} />
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 12, color: t.inkFaint, lineHeight: 1.45 }}>
        ISF example: if 1 unit lowers glucose by 50 mg/dL, enter 50. Use the factor your care team gave you.
      </p>

      {dose && (
        <div style={resultPanel}>
          <p style={eyebrow}>Estimated correction</p>
          <p style={{ margin: '4px 0 0', fontFamily: t.fontDisplay, fontSize: 36, color: t.ink, fontWeight: 600 }}>
            {dose.units}
            <span style={{ fontSize: 14, fontFamily: t.fontBody, fontWeight: 500, color: t.inkFaint, marginLeft: 8 }}>units</span>
          </p>
          {dose.note ? (
            <p style={{ margin: '10px 0 0', fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>{dose.note}</p>
          ) : (
            <p style={{ margin: '10px 0 0', fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
              Round as your clinician instructed. This ignores meal carbs, active insulin, and illness — all of which matter.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
