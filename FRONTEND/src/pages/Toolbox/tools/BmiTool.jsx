import React, { useMemo, useState } from 'react';
import { theme as t } from '../../../theme';
import { fieldStyle, labelStyle, resultPanel, eyebrow, ResultBadge, disclaimerStyle, resultRowStyle } from '../toolboxStyles';
import { useI18n } from '../../../i18n/I18nContext';

function bmiCategory(bmi, tr) {
  if (bmi < 18.5) return { label: tr('toolboxTools.bmi.underweight'), color: t.skyDeep, tip: tr('toolboxTools.bmi.tipUnderweight') };
  if (bmi < 25) return { label: tr('toolboxTools.bmi.healthyRange'), color: t.sageDeep, tip: tr('toolboxTools.bmi.tipHealthy') };
  if (bmi < 30) return { label: tr('toolboxTools.bmi.overweight'), color: t.gold, tip: tr('toolboxTools.bmi.tipOverweight') };
  return { label: tr('toolboxTools.bmi.obese'), color: t.clay, tip: tr('toolboxTools.bmi.tipObese') };
}

export default function BmiTool() {
  const { t: tr } = useI18n();
  const [heightCm, setHeightCm] = useState('170');
  const [weightKg, setWeightKg] = useState('70');

  const bmi = useMemo(() => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (!h || !w || h <= 0 || w <= 0) return null;
    const meters = h / 100;
    return +(w / (meters * meters)).toFixed(1);
  }, [heightCm, weightKg]);

  const category = bmi ? bmiCategory(bmi, tr) : null;
  const range = useMemo(() => {
    const h = parseFloat(heightCm);
    if (!h || h <= 0) return null;
    const m = h / 100;
    return { low: Math.round(18.5 * m * m), high: Math.round(24.9 * m * m) };
  }, [heightCm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={disclaimerStyle}>
        {tr('toolboxTools.bmi.disclaimer')}
      </div>
      <div className="db-tool-grid-2">
        <div>
          <label style={labelStyle}>{tr('toolboxTools.bmi.height')}</label>
          <input type="number" min="80" max="250" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>{tr('toolboxTools.bmi.weight')}</label>
          <input type="number" min="20" max="300" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} style={fieldStyle} />
        </div>
      </div>
      {bmi && category && (
        <div style={resultPanel}>
          <div style={resultRowStyle}>
            <div style={{ minWidth: 0, flex: '1 1 140px' }}>
              <p style={eyebrow}>{tr('toolboxTools.bmi.yourBmi')}</p>
              <p style={{ margin: '4px 0 0', fontFamily: t.fontDisplay, fontSize: 36, color: t.ink, fontWeight: 600 }}>{bmi}</p>
            </div>
            <ResultBadge label={category.label} color={category.color} />
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>{category.tip}</p>
          {range && (
            <p style={{ margin: '10px 0 0', fontSize: 13, color: t.inkSoft }}>
              {tr('toolboxTools.bmi.healthyWeightFor')} <strong style={{ color: t.ink }}>{range.low}–{range.high} kg</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
