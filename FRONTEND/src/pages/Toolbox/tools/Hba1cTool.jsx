import React, { useEffect, useMemo, useState } from 'react';
import { theme as t } from '../../../theme';
import { fieldStyle, labelStyle, resultPanel, eyebrow } from '../toolboxStyles';
import { useI18n } from '../../../i18n/I18nContext';
import { useUnits } from '../../../hooks/useUnits';
import { fromMgdl, glucoseInputBounds, readingToMgdl } from '../../../utils/glucoseUnits';

/** ADA / Nathan formula: eAG (mg/dL) = 28.7 × A1C − 46.7 */
function a1cToEagMgdl(a1c) {
  return Math.round(28.7 * a1c - 46.7);
}

function eagMgdlToA1c(eag) {
  return +((eag + 46.7) / 28.7).toFixed(1);
}

export default function Hba1cTool() {
  const { t: tr } = useI18n();
  const { glucoseUnit, glucoseUnitLabel } = useUnits();
  const bounds = glucoseInputBounds(glucoseUnit);
  const [mode, setMode] = useState('a1c'); // a1c | eag
  const [a1c, setA1c] = useState('7.0');
  const [eag, setEag] = useState(() => String(fromMgdl(154, glucoseUnit)));

  useEffect(() => {
    setEag((prev) => {
      const n = parseFloat(prev);
      if (!Number.isFinite(n)) return String(fromMgdl(154, glucoseUnit));
      if (glucoseUnit === 'mmol/L' && n > 40) return String(fromMgdl(n, 'mmol/L'));
      if (glucoseUnit === 'mg/dL' && n <= 40) return String(fromMgdl(readingToMgdl(n, 'mmol/L'), 'mg/dL'));
      return prev;
    });
  }, [glucoseUnit]);

  const converted = useMemo(() => {
    if (mode === 'a1c') {
      const v = parseFloat(a1c);
      if (!v || v < 4 || v > 15) return null;
      const eagMgdl = a1cToEagMgdl(v);
      const primary = fromMgdl(eagMgdl, glucoseUnit);
      const secondaryUnit = glucoseUnit === 'mmol/L' ? 'mg/dL' : 'mmol/L';
      const secondary = fromMgdl(eagMgdl, secondaryUnit);
      return {
        label: tr('toolboxTools.hba1c.estimatedEag'),
        value: `${primary} ${glucoseUnitLabel}`,
        sub: `${secondary} ${secondaryUnit}`,
      };
    }
    const v = parseFloat(eag);
    if (!v || v < bounds.min || v > bounds.max) return null;
    const eagMgdl = readingToMgdl(v, glucoseUnit);
    if (eagMgdl == null) return null;
    return { label: tr('toolboxTools.hba1c.estimatedA1c'), value: `${eagMgdlToA1c(eagMgdl)}%`, sub: null };
  }, [mode, a1c, eag, tr, glucoseUnit, glucoseUnitLabel, bounds.min, bounds.max]);

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

  const ref6 = fromMgdl(126, glucoseUnit);
  const ref7 = fromMgdl(154, glucoseUnit);
  const ref8 = fromMgdl(183, glucoseUnit);
  const ref9 = fromMgdl(212, glucoseUnit);

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
          <label style={labelStyle}>
            {tr('toolboxTools.hba1c.eagLabel').replace('{unit}', glucoseUnitLabel)}
          </label>
          <input
            type="number"
            min={bounds.min}
            max={bounds.max}
            step={bounds.step}
            value={eag}
            onChange={(e) => setEag(e.target.value)}
            style={fieldStyle}
          />
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
        {tr('toolboxTools.hba1c.reference')
          .replace('{u}', glucoseUnitLabel)
          .replace('{r6}', String(ref6))
          .replace('{r7}', String(ref7))
          .replace('{r8}', String(ref8))
          .replace('{r9}', String(ref9))}
      </div>
    </div>
  );
}
