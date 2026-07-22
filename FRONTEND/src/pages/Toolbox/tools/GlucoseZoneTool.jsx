import React, { useMemo, useState } from 'react';
import { theme as t } from '../../../theme';
import { fieldStyle, labelStyle, resultPanel, eyebrow, ResultBadge, disclaimerStyle } from '../toolboxStyles';

/**
 * Context-aware educational zones (mg/dL). Not a diagnosis.
 */
function glucoseZone(mgdl, context) {
  if (mgdl < 70) {
    return {
      label: 'Low',
      tone: 'low',
      color: t.skyDeep,
      bg: t.skyTint,
      steps: [
        'Follow your personal hypoglycemia plan from your clinician.',
        'If you have severe symptoms, cannot swallow, or live alone and feel unsafe — seek emergency help.',
        'This app does not tell you what to eat or inject.',
      ],
    };
  }

  if (context === 'fasting') {
    if (mgdl <= 100) {
      return {
        label: 'In common fasting band',
        tone: 'ok',
        color: t.sageDeep,
        bg: t.sageTint,
        steps: [
          'Many care plans use roughly 70–100 mg/dL fasting — yours may differ.',
          'Keep logging patterns for clinic visits.',
          'Do not change meds based on a single reading here.',
        ],
      };
    }
    if (mgdl <= 130) {
      return {
        label: 'Upper fasting range',
        tone: 'warn',
        color: t.gold,
        bg: t.goldTint,
        steps: [
          'Some plans allow up to ~130 mg/dL fasting; ask what your target is.',
          'Note sleep, illness, and med timing for your clinician.',
          'Avoid self-adjusting insulin from this tool.',
        ],
      };
    }
    if (mgdl <= 180) {
      return {
        label: 'Above usual fasting targets',
        tone: 'high',
        color: t.clay,
        bg: t.clayTint,
        steps: [
          'Discuss repeated high fasting readings with your care team.',
          'Hydrate if that is part of your plan and you can safely drink.',
          'Seek care sooner if you feel unwell.',
        ],
      };
    }
  }

  if (context === 'after') {
    if (mgdl <= 140) {
      return {
        label: 'In common post-meal band',
        tone: 'ok',
        color: t.sageDeep,
        bg: t.sageTint,
        steps: [
          'Many plans aim under ~140–180 mg/dL 1–2 h after meals — confirm yours.',
          'Log food timing if you track patterns.',
          'Do not change treatment from this screen alone.',
        ],
      };
    }
    if (mgdl <= 180) {
      return {
        label: 'Upper post-meal range',
        tone: 'warn',
        color: t.gold,
        bg: t.goldTint,
        steps: [
          'Often discussed as an upper common target after meals — your plan may differ.',
          'Note carbs and activity for your clinician.',
          'Use only corrections your clinician prescribed.',
        ],
      };
    }
  }

  // random / shared high bands
  if (mgdl <= 140) {
    return {
      label: 'Common general band',
      tone: 'ok',
      color: t.sageDeep,
      bg: t.sageTint,
      steps: [
        'Context matters (fasting vs after meals). Pick the matching option above.',
        'Your clinician’s targets override this educational chart.',
        'Log the reading if you track patterns.',
      ],
    };
  }
  if (mgdl <= 180) {
    return {
      label: 'Slightly elevated (general)',
      tone: 'warn',
      color: t.gold,
      bg: t.goldTint,
      steps: [
        'May be expected after meals depending on your plan.',
        'Share trends with your care team — not a one-off panic.',
        'Do not invent a correction dose here.',
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
        'Follow the high-glucose / ketone plan your clinician gave you.',
        'Contact your care team if readings stay high or you feel unwell.',
        'This tool will not tell you to take insulin or check ketones on its own.',
      ],
    };
  }
  return {
    label: 'Very high',
    tone: 'urgent',
    color: '#B91C1C',
    bg: '#FEF2F2',
    steps: [
      'Use your sick-day / hyperglycemia plan from your clinician immediately.',
      'If you have severe symptoms (confusion, vomiting you cannot stop, breathing changes), seek urgent medical care.',
      'DiaBuddy does not provide emergency triage.',
    ],
  };
}

export default function GlucoseZoneTool() {
  const [reading, setReading] = useState('110');
  const [context, setContext] = useState('random');

  const zone = useMemo(() => {
    const v = parseFloat(reading);
    if (!v || v < 20 || v > 600) return null;
    return { value: v, ...glucoseZone(v, context) };
  }, [reading, context]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={disclaimerStyle}>
        Educational zones only — not a diagnosis or treatment plan. Your clinician’s targets and action plans always come first.
      </div>

      <p style={{ margin: 0, fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
        Enter a reading and context. Suggested “next steps” are general safety reminders, not personalized medical orders.
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
            General reminders
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {zone.steps.map((step) => (
              <li key={step} style={{ fontSize: 13, color: t.inkSoft, lineHeight: 1.45 }}>{step}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: 11 }}>
        {[
          { l: 'Fasting (common)', r: '~70–100 / up to ~130' },
          { l: 'After meal (common)', r: 'often under 140–180' },
          { l: 'Low alert', r: 'under 70 — use your hypo plan' },
          { l: 'Very high', r: 'over 250 — use your sick-day plan' },
        ].map((z) => (
          <div key={z.l} style={{ padding: '8px 10px', borderRadius: 10, background: t.surfaceSunken, border: `1px solid ${t.line}` }}>
            <div style={{ fontWeight: 700, color: t.inkSoft }}>{z.l}</div>
            <div style={{ color: t.inkFaint, marginTop: 2 }}>{z.r}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
