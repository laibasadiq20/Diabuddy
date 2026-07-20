import React, { useMemo, useState } from 'react';
import { theme as t } from '../../../theme';
import { fieldStyle, labelStyle, resultPanel, eyebrow, ResultBadge } from '../toolboxStyles';

/**
 * General guidance zones for fingerstick / CGM readings (mg/dL).
 * Not a diagnosis — fasting vs post-meal targets differ by care plan.
 */
function glucoseZone(mgdl) {
  if (mgdl < 70) {
    return {
      label: 'Low',
      tone: 'low',
      color: t.skyDeep,
      bg: t.skyTint,
      steps: [
        'Treat hypoglycemia per your care plan (e.g. 15 g fast carbs).',
        'Recheck in 15 minutes.',
        'If severe symptoms or you cannot swallow, seek emergency help.',
      ],
    };
  }
  if (mgdl <= 140) {
    return {
      label: 'Normal',
      tone: 'ok',
      color: t.sageDeep,
      bg: t.sageTint,
      steps: [
        'Reading is in a commonly accepted target band.',
        'Continue your usual food, meds, and activity plan.',
        'Log the reading if you track patterns for clinic visits.',
      ],
    };
  }
  if (mgdl <= 180) {
    return {
      label: 'Slightly high',
      tone: 'warn',
      color: t.gold,
      bg: t.goldTint,
      steps: [
        'Often seen after meals — note what you ate and timing.',
        'Drink water; light walking can help if safe for you.',
        'Follow any correction plan your clinician gave you.',
      ],
    };
  }
  if (mgdl <= 250) {
    return {
      label: 'High',
      tone: 'high',
      color: t.clay,
      bg: t.clayTint,
      steps: [
        'Check for ketones if your care plan says to (especially type 1).',
        'Hydrate and follow your high-glucose action plan.',
        'Contact your care team if readings stay high or you feel unwell.',
      ],
    };
  }
  return {
    label: 'Very high',
    tone: 'urgent',
    color: '#B91C1C',
    bg: '#FEF2F2',
    steps: [
      'Follow your sick-day / hyperglycemia plan immediately.',
      'Watch for nausea, vomiting, confusion, or breathing changes.',
      'Seek urgent medical care if symptoms are severe or you cannot keep fluids down.',
    ],
  };
}

export default function GlucoseZoneTool() {
  const [reading, setReading] = useState('110');
  const [context, setContext] = useState('random');

  const zone = useMemo(() => {
    const v = parseFloat(reading);
    if (!v || v < 20 || v > 600) return null;
    return { value: v, ...glucoseZone(v) };
  }, [reading]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ margin: 0, fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
        Enter a glucose reading to see a simple zone and suggested next steps. Your personal targets from your clinician always come first.
      </p>

      <div className="db-tool-grid-2">
        <div>
          <label style={labelStyle}>Glucose (mg/dL)</label>
          <input type="number" min="20" max="600" value={reading} onChange={(e) => setReading(e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Context</label>
          <select value={context} onChange={(e) => setContext(e.target.value)} style={fieldStyle}>
            <option value="fasting">Fasting / before meal</option>
            <option value="after">1–2 h after meal</option>
            <option value="random">Random / other</option>
          </select>
        </div>
      </div>

      {zone && (
        <div style={{ ...resultPanel, background: zone.bg, border: `1px solid ${zone.color}40` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p style={eyebrow}>Reading</p>
              <p style={{ margin: '4px 0 0', fontFamily: t.fontDisplay, fontSize: 36, color: t.ink, fontWeight: 600 }}>
                {zone.value}
                <span style={{ fontSize: 14, fontFamily: t.fontBody, fontWeight: 500, color: t.inkFaint, marginLeft: 8 }}>mg/dL</span>
              </p>
            </div>
            <ResultBadge label={zone.label} color={zone.color} />
          </div>

          <p style={{ margin: '12px 0 6px', fontSize: 12, fontWeight: 700, color: t.inkFaint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Suggested next steps
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {zone.steps.map((step) => (
              <li key={step} style={{ fontSize: 13, color: t.inkSoft, lineHeight: 1.45 }}>{step}</li>
            ))}
          </ul>

          {context === 'fasting' && zone.value > 130 && zone.value <= 180 && (
            <p style={{ margin: '12px 0 0', fontSize: 12, color: t.inkFaint, lineHeight: 1.45 }}>
              Note: Many fasting targets are closer to 80–130 mg/dL. Ask your clinician what applies to you.
            </p>
          )}
          {context === 'after' && zone.value <= 180 && zone.value > 140 && (
            <p style={{ margin: '12px 0 0', fontSize: 12, color: t.inkFaint, lineHeight: 1.45 }}>
              Note: Under 180 mg/dL after meals is a common ADA-style target — your plan may differ.
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, fontSize: 11, textAlign: 'center' }}>
        {[
          { l: 'Low', r: '<70', c: t.skyDeep },
          { l: 'Normal', r: '70–140', c: t.sageDeep },
          { l: 'Slight', r: '141–180', c: t.gold },
          { l: 'High', r: '>180', c: t.clay },
        ].map((z) => (
          <div key={z.l} style={{ padding: '8px 4px', borderRadius: 10, background: t.surfaceSunken, border: `1px solid ${t.line}` }}>
            <div style={{ fontWeight: 700, color: z.c }}>{z.l}</div>
            <div style={{ color: t.inkFaint, marginTop: 2 }}>{z.r}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
