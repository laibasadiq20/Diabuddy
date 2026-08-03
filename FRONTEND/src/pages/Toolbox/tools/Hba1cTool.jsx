import React, { useMemo, useState } from 'react';
import { theme as t } from '../../../theme';
import { fieldStyle, labelStyle, resultPanel, eyebrow } from '../toolboxStyles';
import { useI18n } from '../../../i18n/I18nContext';

/** ADA / Nathan formula: eAG (mg/dL) = 28.7 × A1C − 46.7 */
function a1cToEag(a1c) {
  return Math.round(28.7 * a1c - 46.7);
}

function eagToA1c(eag) {
  return +((eag + 46.7) / 28.7).toFixed(1);
}

export default function Hba1cTool() {
  const { t: tr } = useI18n();
  const [mode, setMode] = useState('a1c'); // a1c | eag
  const [a1c, setA1c] = useState('7.0');
  const [eag, setEag] = useState('154');

  const converted = useMemo(() => {
    if (mode === 'a1c') {
      const v = parseFloat(a1c);
      if (!v || v < 4 || v > 15) return null;
      return { label: tr('toolboxTools.hba1c.estimatedEag'), value: `${a1cToEag(v)} mg/dL`, sub: `${+(a1cToEag(v) / 18.018).toFixed(1)} mmol/L` };
    }
    const v = parseFloat(eag);
    if (!v || v < 50 || v > 400) return null;
    return { label: tr('toolboxTools.hba1c.estimatedA1c'), value: `${eagToA1c(v)}%`, sub: null };
  }, [mode, a1c, eag, tr]);

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
        {tr('toolboxTools.hba1c.intro')}
      </p>

      <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 12, background: t.surfaceSunken, border: `1px solid ${t.line}` }}>
        <button type="button" style={tabStyle(mode === 'a1c')} onClick={() => setMode('a1c')}>
          {tr('toolboxTools.hba1c.tabToEag')}
        </button>
        <button type="button" style={tabStyle(mode === 'eag')} onClick={() => setMode('eag')}>
          {tr('toolboxTools.hba1c.tabToA1c')}
        </button>
      </div>

      {mode === 'a1c' ? (
        <div>
          <label style={labelStyle}>{tr('toolboxTools.hba1c.a1cLabel')}</label>
          <input type="number" min="4" max="15" step="0.1" value={a1c} onChange={(e) => setA1c(e.target.value)} style={fieldStyle} />
        </div>
      ) : (
        <div>
          <label style={labelStyle}>{tr('toolboxTools.hba1c.eagLabel')}</label>
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
        {tr('toolboxTools.hba1c.reference')}
      </div>
    </div>
  );
}
