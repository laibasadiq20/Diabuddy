import React, { useEffect, useMemo, useState } from 'react';
import { theme as t } from '../../../theme';
import { fieldStyle, labelStyle, resultPanel, eyebrow, disclaimerStyle } from '../toolboxStyles';
import { useI18n } from '../../../i18n/I18nContext';
import { useUnits } from '../../../hooks/useUnits';
import { fromMgdl, glucoseInputBounds } from '../../../utils/glucoseUnits';

export default function InsulinHelperTool() {
  const { t: tr } = useI18n();
  const { glucoseUnit, glucoseUnitLabel } = useUnits();
  const bounds = glucoseInputBounds(glucoseUnit);
  const defaults = glucoseUnit === 'mmol/L'
    ? { current: '12.2', target: '6.7', isf: '2.8' }
    : { current: '220', target: '120', isf: '50' };

  const [current, setCurrent] = useState(defaults.current);
  const [target, setTarget] = useState(defaults.target);
  const [isf, setIsf] = useState(defaults.isf);
  const [showMath, setShowMath] = useState(false);

  useEffect(() => {
    setCurrent(defaults.current);
    setTarget(defaults.target);
    setIsf(defaults.isf);
    setShowMath(false);
  }, [glucoseUnit, defaults.current, defaults.target, defaults.isf]);

  const result = useMemo(() => {
    const c = parseFloat(current);
    const tgt = parseFloat(target);
    const factor = parseFloat(isf);
    if (!c || !tgt || !factor || factor <= 0) return null;
    // Arithmetic is unit-agnostic when current, target, and ISF share the same unit.
    const raw = (c - tgt) / factor;
    if (raw <= 0) {
      return { kind: 'none', note: tr('toolboxTools.insulin.atOrBelowTarget') };
    }
    return {
      kind: 'math',
      note: tr('toolboxTools.insulin.onlyArithmetic'),
      raw: +raw.toFixed(2),
    };
  }, [current, target, isf, tr]);

  const isfExample = fromMgdl(50, glucoseUnit);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={disclaimerStyle}>
        <strong>{tr('toolboxTools.insulin.disclaimerStrong')}</strong> {tr('toolboxTools.insulin.disclaimerBody')}
      </div>

      <p style={{ margin: 0, fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
        {tr('toolboxTools.insulin.formulaExplain')}
      </p>

      <div className="db-tool-grid-3">
        <div>
          <label style={labelStyle}>
            {tr('toolboxTools.insulin.current').replace('{unit}', glucoseUnitLabel)}
          </label>
          <input
            type="number"
            min={bounds.min}
            max={bounds.max}
            step={bounds.step}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            style={fieldStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>
            {tr('toolboxTools.insulin.target').replace('{unit}', glucoseUnitLabel)}
          </label>
          <input
            type="number"
            min={glucoseUnit === 'mmol/L' ? 3.9 : 70}
            max={glucoseUnit === 'mmol/L' ? 10 : 180}
            step={bounds.step}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            style={fieldStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>{tr('toolboxTools.insulin.isf')}</label>
          <input type="number" min="0.1" step={glucoseUnit === 'mmol/L' ? 0.1 : 1} value={isf} onChange={(e) => setIsf(e.target.value)} style={fieldStyle} />
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 12, color: t.inkFaint, lineHeight: 1.45 }}>
        {tr('toolboxTools.insulin.isfHint')
          .replace('{drop}', String(isfExample))
          .replace('{unit}', glucoseUnitLabel)}
      </p>

      {result && (
        <div style={resultPanel}>
          <p style={eyebrow}>{tr('toolboxTools.insulin.educationalResult')}</p>
          {result.kind === 'none' ? (
            <p style={{ margin: '8px 0 0', fontSize: 14, color: t.inkSoft, lineHeight: 1.5 }}>{result.note}</p>
          ) : (
            <>
              <p style={{ margin: '8px 0 0', fontSize: 14, color: t.ink, lineHeight: 1.55, fontWeight: 600 }}>
                {tr('toolboxTools.insulin.walkthroughAvailable')}
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>{result.note}</p>
              <button
                type="button"
                onClick={() => setShowMath((v) => !v)}
                style={{
                  marginTop: 12,
                  background: 'none',
                  border: `1.5px solid ${t.line}`,
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: t.inkSoft,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                }}
              >
                {showMath ? tr('toolboxTools.insulin.hideCalculation') : tr('toolboxTools.insulin.showCalculation')}
              </button>
              {showMath && (
                <p style={{ margin: '12px 0 0', fontSize: 13, color: t.inkFaint, lineHeight: 1.55, fontFamily: 'ui-monospace, monospace' }}>
                  ({current} − {target}) ÷ {isf} = {result.raw}
                  <br />
                  <span style={{ fontFamily: t.fontBody }}>
                    {tr('toolboxTools.insulin.calcFootnote')}
                  </span>
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
