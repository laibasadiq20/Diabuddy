import React, { useMemo, useState } from 'react';
import { theme as t } from '../../../theme';
import { fieldStyle, labelStyle, resultPanel, eyebrow } from '../toolboxStyles';

/** ADA / Nathan formula: eAG (mg/dL) = 28.7 × A1C − 46.7 */
function a1cToEag(a1c) {
  return Math.round(28.7 * a1c - 46.7);
}

function eagToA1c(eag) {
  return +((eag + 46.7) / 28.7).toFixed(1);
}

export default function Hba1cTool() {
  const [mode, setMode] = useState('a1c'); // a1c | eag
  const [a1c, setA1c] = useState('7.0');
  const [eag, setEag] = useState('154');

  const converted = useMemo(() => {
    if (mode === 'a1c') {
      const v = parseFloat(a1c);
      if (!v || v < 4 || v > 15) return null;
      return { label: 'Estimated average glucose', value: `${a1cToEag(v)} mg/dL`, sub: `${+(a1cToEag(v) / 18.018).toFixed(1)} mmol/L` };
    }
    const v = parseFloat(eag);
    if (!v || v < 50 || v > 400) return null;
    return { label: 'Estimated HbA1c', value: `${eagToA1c(v)}%`, sub: null };
  }, [mode, a1c, eag]);

  const tabStyle = (active) => ({
    flex: 1,
    padding: '10px 12px',
    borderRadius: 10,
    border: 'none',
    background: active ? t.forest : 'transparent',
    color: active ? '#FFF' : t.inkSoft,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: t.fontBody,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ margin: 0, fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
        Convert between HbA1c and estimated average glucose (eAG) — handy before doctor visits. Lab methods can differ slightly.
      </p>

      <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 12, background: t.surfaceSunken, border: `1px solid ${t.line}` }}>
        <button type="button" style={tabStyle(mode === 'a1c')} onClick={() => setMode('a1c')}>
          HbA1c → eAG
        </button>
        <button type="button" style={tabStyle(mode === 'eag')} onClick={() => setMode('eag')}>
          eAG → HbA1c
        </button>
      </div>

      {mode === 'a1c' ? (
        <div>
          <label style={labelStyle}>HbA1c (%)</label>
          <input type="number" min="4" max="15" step="0.1" value={a1c} onChange={(e) => setA1c(e.target.value)} style={fieldStyle} />
        </div>
      ) : (
        <div>
          <label style={labelStyle}>Average glucose (mg/dL)</label>
          <input type="number" min="50" max="400" value={eag} onChange={(e) => setEag(e.target.value)} style={fieldStyle} />
        </div>
      )}

      {converted && (
        <div style={{ ...resultPanel, background: t.skyTint, border: `1px solid ${t.sky}40` }}>
          <p style={eyebrow}>{converted.label}</p>
          <p style={{ margin: '4px 0 0', fontFamily: t.fontDisplay, fontSize: 34, color: t.ink, fontWeight: 600 }}>
            {converted.value}
          </p>
          {converted.sub && (
            <p style={{ margin: '6px 0 0', fontSize: 13, color: t.inkSoft }}>{converted.sub}</p>
          )}
        </div>
      )}

      <div style={{ fontSize: 12, color: t.inkFaint, lineHeight: 1.5 }}>
        Reference: ~6% ≈ 126 mg/dL · 7% ≈ 154 · 8% ≈ 183 · 9% ≈ 212
      </div>
    </div>
  );
}
