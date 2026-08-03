import React, { useMemo, useState } from 'react';
import { theme as t } from '../../../theme';
import { fieldStyle, labelStyle, resultPanel, eyebrow, ResultBadge, disclaimerStyle, resultRowStyle } from '../toolboxStyles';
import { useI18n } from '../../../i18n/I18nContext';

/**
 * Context-aware educational zones (mg/dL). Not a diagnosis.
 */
function glucoseZone(mgdl, context, tr) {
  const zk = (key) => tr(`toolboxTools.glucoseZone.zones.${key}.label`);
  const steps = (key) => [
    tr(`toolboxTools.glucoseZone.zones.${key}.step1`),
    tr(`toolboxTools.glucoseZone.zones.${key}.step2`),
  ];

  if (mgdl < 70) {
    return {
      label: zk('low'),
      tone: 'low',
      color: t.skyDeep,
      bg: t.skyTint,
      steps: steps('low'),
    };
  }

  if (context === 'fasting') {
    if (mgdl <= 100) {
      return { label: zk('fastingOk'), tone: 'ok', color: t.sageDeep, bg: t.sageTint, steps: steps('fastingOk') };
    }
    if (mgdl <= 130) {
      return { label: zk('fastingWarn'), tone: 'warn', color: t.gold, bg: t.goldTint, steps: steps('fastingWarn') };
    }
    if (mgdl <= 180) {
      return { label: zk('fastingHigh'), tone: 'high', color: t.clay, bg: t.clayTint, steps: steps('fastingHigh') };
    }
  }

  if (context === 'after') {
    if (mgdl <= 140) {
      return { label: zk('afterOk'), tone: 'ok', color: t.sageDeep, bg: t.sageTint, steps: steps('afterOk') };
    }
    if (mgdl <= 180) {
      return { label: zk('afterWarn'), tone: 'warn', color: t.gold, bg: t.goldTint, steps: steps('afterWarn') };
    }
  }

  // random / shared bands
  if (mgdl <= 140) {
    return { label: zk('generalOk'), tone: 'ok', color: t.sageDeep, bg: t.sageTint, steps: steps('generalOk') };
  }
  if (mgdl <= 180) {
    return { label: zk('generalWarn'), tone: 'warn', color: t.gold, bg: t.goldTint, steps: steps('generalWarn') };
  }
  if (mgdl <= 250) {
    return { label: zk('high'), tone: 'high', color: t.clay, bg: t.clayTint, steps: steps('high') };
  }
  return { label: zk('veryHigh'), tone: 'urgent', color: '#B91C1C', bg: t.clayTint, steps: steps('veryHigh') };
}

export default function GlucoseZoneTool() {
  const { t: tr } = useI18n();
  const [reading, setReading] = useState('110');
  const [context, setContext] = useState('random');

  const CONTEXTS = [
    { id: 'fasting', label: tr('toolboxTools.glucoseZone.contexts.fasting') },
    { id: 'after', label: tr('toolboxTools.glucoseZone.contexts.after') },
    { id: 'random', label: tr('toolboxTools.glucoseZone.contexts.random') },
  ];

  const value = parseFloat(reading);
  const outOfRange = reading !== '' && (!value || value < 20 || value > 600);

  const zone = useMemo(() => {
    const v = parseFloat(reading);
    if (!v || v < 20 || v > 600) return null;
    return { value: v, ...glucoseZone(v, context, tr) };
  }, [reading, context, tr]);

  const tabStyle = (active) => ({
    flex: '1 1 0',
    padding: '9px 8px',
    borderRadius: 9,
    border: 'none',
    background: active ? t.forest : 'transparent',
    color: active ? '#FFF' : t.inkSoft,
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: t.fontBody,
    whiteSpace: 'nowrap',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={disclaimerStyle}>
        {tr('toolboxTools.glucoseZone.disclaimer')}
      </div>

      <div>
        <label style={labelStyle}>{tr('toolboxTools.glucoseZone.readingLabel')}</label>
        <input
          type="number"
          min="20"
          max="600"
          value={reading}
          onChange={(e) => setReading(e.target.value)}
          style={{ ...fieldStyle, fontSize: 18, fontWeight: 600 }}
        />
        {outOfRange && (
          <p style={{ margin: '6px 0 0', fontSize: 12, color: t.clayDeep }}>{tr('toolboxTools.glucoseZone.outOfRangeError')}</p>
        )}
      </div>

      <div>
        <label style={labelStyle}>{tr('toolboxTools.glucoseZone.whenTaken')}</label>
        <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 12, background: t.surfaceSunken, border: `1px solid ${t.line}` }}>
          {CONTEXTS.map((c) => (
            <button key={c.id} type="button" style={tabStyle(context === c.id)} onClick={() => setContext(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {zone && (
        <div style={{ ...resultPanel, background: zone.bg, border: `1px solid ${zone.color}40` }}>
          <div style={resultRowStyle}>
            <div style={{ minWidth: 0, flex: '1 1 140px' }}>
              <p style={eyebrow}>{tr('toolboxTools.glucoseZone.reading')}</p>
              <p style={{ margin: '4px 0 0', fontFamily: t.fontDisplay, fontSize: 36, color: t.ink, fontWeight: 600 }}>
                {zone.value}
                <span style={{ fontSize: 14, fontFamily: t.fontBody, fontWeight: 500, color: t.inkFaint, marginLeft: 8 }}>mg/dL</span>
              </p>
            </div>
            <ResultBadge label={zone.label} color={zone.color} />
          </div>

          <ul style={{ margin: '12px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {zone.steps.map((step) => (
              <li key={step} style={{ fontSize: 13, color: t.inkSoft, lineHeight: 1.45 }}>{step}</li>
            ))}
          </ul>
        </div>
      )}

      <p style={{ margin: 0, fontSize: 11.5, color: t.inkFaint, lineHeight: 1.5 }}>
        {tr('toolboxTools.glucoseZone.footerNote')}
      </p>
    </div>
  );
}
