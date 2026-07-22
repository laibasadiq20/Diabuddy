import React, { useMemo, useState } from 'react';
import { theme as t } from '../../../theme';
import { fieldStyle, labelStyle, resultPanel, eyebrow, ResultBadge, disclaimerStyle } from '../toolboxStyles';

function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: t.skyDeep, tip: 'Ask a clinician before making big diet changes.' };
  if (bmi < 25) return { label: 'Healthy range', color: t.sageDeep, tip: 'Steady habits with food, movement, and sleep help glucose control.' };
  if (bmi < 30) return { label: 'Overweight', color: t.gold, tip: 'Even modest weight loss can improve insulin sensitivity — discuss a plan with your care team.' };
  return { label: 'Obese', color: t.clay, tip: 'Talk with your care team about a weight plan that fits your diabetes treatment.' };
}

export default function BmiTool() {
  const [heightCm, setHeightCm] = useState('170');
  const [weightKg, setWeightKg] = useState('70');

  const bmi = useMemo(() => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (!h || !w || h <= 0 || w <= 0) return null;
    const meters = h / 100;
    return +(w / (meters * meters)).toFixed(1);
  }, [heightCm, weightKg]);

  const category = bmi ? bmiCategory(bmi) : null;
  const range = useMemo(() => {
    const h = parseFloat(heightCm);
    if (!h || h <= 0) return null;
    const m = h / 100;
    return { low: Math.round(18.5 * m * m), high: Math.round(24.9 * m * m) };
  }, [heightCm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={disclaimerStyle}>
        BMI is a screening number, not a diagnosis. Muscle mass, ethnicity, and pregnancy change how it should be interpreted. Do not start restrictive diets without clinical advice.
      </div>
      <div className="db-tool-grid-2">
        <div>
          <label style={labelStyle}>Height (cm)</label>
          <input type="number" min="80" max="250" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Weight (kg)</label>
          <input type="number" min="20" max="300" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} style={fieldStyle} />
        </div>
      </div>
      {bmi && category && (
        <div style={resultPanel}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p style={eyebrow}>Your BMI</p>
              <p style={{ margin: '4px 0 0', fontFamily: t.fontDisplay, fontSize: 36, color: t.ink, fontWeight: 600 }}>{bmi}</p>
            </div>
            <ResultBadge label={category.label} color={category.color} />
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>{category.tip}</p>
          {range && (
            <p style={{ margin: '10px 0 0', fontSize: 13, color: t.inkSoft }}>
              Healthy weight for this height: <strong style={{ color: t.ink }}>{range.low}–{range.high} kg</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
