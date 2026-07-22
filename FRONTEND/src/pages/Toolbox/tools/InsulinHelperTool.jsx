import React, { useMemo, useState } from 'react';
import { theme as t } from '../../../theme';
import { fieldStyle, labelStyle, resultPanel, eyebrow, disclaimerStyle } from '../toolboxStyles';

export default function InsulinHelperTool() {
  const [current, setCurrent] = useState('220');
  const [target, setTarget] = useState('120');
  const [isf, setIsf] = useState('50');
  const [showMath, setShowMath] = useState(false);

  const result = useMemo(() => {
    const c = parseFloat(current);
    const tgt = parseFloat(target);
    const factor = parseFloat(isf);
    if (!c || !tgt || !factor || factor <= 0) return null;
    const raw = (c - tgt) / factor;
    if (raw <= 0) {
      return { kind: 'none', note: 'With these inputs, glucose is at or below target — the educational formula does not suggest a correction.' };
    }
    return {
      kind: 'math',
      note: 'This is only the arithmetic of a common classroom formula. It is not a dose recommendation.',
      raw: +raw.toFixed(2),
    };
  }, [current, target, isf]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={disclaimerStyle}>
        <strong>Not for dosing decisions.</strong> This tool explains a correction formula for learning only.
        Never change insulin based on this screen. Use the plan from your clinician / diabetes educator.
        If you are unsure or feel unwell, contact your care team or emergency services.
      </div>

      <p style={{ margin: 0, fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
        Educational formula: (Current − Target) ÷ Insulin sensitivity factor (ISF). Your real plan may use different numbers and rules (carbs, active insulin, illness).
      </p>

      <div className="db-tool-grid-3">
        <div>
          <label style={labelStyle}>Current (mg/dL)</label>
          <input type="number" min="40" max="600" value={current} onChange={(e) => setCurrent(e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Target (mg/dL)</label>
          <input type="number" min="70" max="180" value={target} onChange={(e) => setTarget(e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>ISF (from your plan)</label>
          <input type="number" min="1" step="1" value={isf} onChange={(e) => setIsf(e.target.value)} style={fieldStyle} />
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 12, color: t.inkFaint, lineHeight: 1.45 }}>
        ISF example: if 1 unit lowers glucose by 50 mg/dL in your prescribed plan, enter 50. Always use the factor your care team gave you.
      </p>

      {result && (
        <div style={resultPanel}>
          <p style={eyebrow}>Educational result</p>
          {result.kind === 'none' ? (
            <p style={{ margin: '8px 0 0', fontSize: 14, color: t.inkSoft, lineHeight: 1.5 }}>{result.note}</p>
          ) : (
            <>
              <p style={{ margin: '8px 0 0', fontSize: 14, color: t.ink, lineHeight: 1.55, fontWeight: 600 }}>
                Formula walkthrough available — not a prescribed dose
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
                {showMath ? 'Hide calculation' : 'Show calculation (advanced)'}
              </button>
              {showMath && (
                <p style={{ margin: '12px 0 0', fontSize: 13, color: t.inkFaint, lineHeight: 1.55, fontFamily: 'ui-monospace, monospace' }}>
                  ({current} − {target}) ÷ {isf} = {result.raw}
                  <br />
                  <span style={{ fontFamily: t.fontBody }}>
                    Rounding, meal boluses, and “insulin on board” are not included. Do not inject based on this number.
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
