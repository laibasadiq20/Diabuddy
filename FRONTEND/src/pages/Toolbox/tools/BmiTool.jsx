import React, { useEffect, useMemo, useState } from 'react';
import { theme as t } from '../../../theme';
import { fieldStyle, labelStyle, resultPanel, eyebrow, ResultBadge, disclaimerStyle, resultRowStyle } from '../toolboxStyles';
import { useI18n } from '../../../i18n/I18nContext';
import { useUnits } from '../../../hooks/useUnits';
import {
  cmToFtIn,
  ftInToCm,
  formatWeight,
  kgToLbs,
  lbsToKg,
  round1,
} from '../../../utils/bodyUnits';

function bmiCategory(bmi, tr) {
  if (bmi < 18.5) return { label: tr('toolboxTools.bmi.underweight'), color: t.skyDeep, tip: tr('toolboxTools.bmi.tipUnderweight') };
  if (bmi < 25) return { label: tr('toolboxTools.bmi.healthyRange'), color: t.sageDeep, tip: tr('toolboxTools.bmi.tipHealthy') };
  if (bmi < 30) return { label: tr('toolboxTools.bmi.overweight'), color: t.gold, tip: tr('toolboxTools.bmi.tipOverweight') };
  return { label: tr('toolboxTools.bmi.obese'), color: t.clay, tip: tr('toolboxTools.bmi.tipObese') };
}

export default function BmiTool() {
  const { t: tr } = useI18n();
  const { weightUnit, heightUnit } = useUnits();

  const [heightCm, setHeightCm] = useState('170');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('7');
  const [weightDisplay, setWeightDisplay] = useState(weightUnit === 'lbs' ? '154' : '70');

  useEffect(() => {
    if (heightUnit === 'ft_in') {
      const { feet: f, inches: i } = cmToFtIn(Number(heightCm) || 170);
      setFeet(String(f));
      setInches(String(i));
    } else {
      const cm = ftInToCm(feet, inches);
      if (Number.isFinite(cm) && cm > 0) setHeightCm(String(round1(cm)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heightUnit]);

  useEffect(() => {
    const kg = weightUnit === 'lbs' ? lbsToKg(weightDisplay) : Number(weightDisplay);
    if (Number.isFinite(kg) && kg > 0) {
      setWeightDisplay(weightUnit === 'lbs' ? String(round1(kgToLbs(kg))) : String(round1(kg)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weightUnit]);

  const resolvedCm = heightUnit === 'ft_in' ? ftInToCm(feet, inches) : parseFloat(heightCm);
  const resolvedKg = weightUnit === 'lbs' ? lbsToKg(weightDisplay) : parseFloat(weightDisplay);

  const bmi = useMemo(() => {
    const h = resolvedCm;
    const w = resolvedKg;
    if (!h || !w || h <= 0 || w <= 0) return null;
    const meters = h / 100;
    return +(w / (meters * meters)).toFixed(1);
  }, [resolvedCm, resolvedKg]);

  const category = bmi ? bmiCategory(bmi, tr) : null;
  const range = useMemo(() => {
    const h = resolvedCm;
    if (!h || h <= 0) return null;
    const m = h / 100;
    const lowKg = Math.round(18.5 * m * m);
    const highKg = Math.round(24.9 * m * m);
    return {
      low: formatWeight(lowKg, weightUnit),
      high: formatWeight(highKg, weightUnit),
    };
  }, [resolvedCm, weightUnit]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={disclaimerStyle}>{tr('toolboxTools.bmi.disclaimer')}</div>
      <div className="db-tool-grid-2">
        {heightUnit === 'ft_in' ? (
          <>
            <div>
              <label style={labelStyle}>{tr('toolboxTools.bmi.heightFeet')}</label>
              <input type="number" min="3" max="8" value={feet} onChange={(e) => setFeet(e.target.value)} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>{tr('toolboxTools.bmi.heightInches')}</label>
              <input type="number" min="0" max="11.9" step="0.5" value={inches} onChange={(e) => setInches(e.target.value)} style={fieldStyle} />
            </div>
          </>
        ) : (
          <div>
            <label style={labelStyle}>{tr('toolboxTools.bmi.heightCm')}</label>
            <input
              type="number"
              min="80"
              max="250"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              style={fieldStyle}
            />
          </div>
        )}
        <div style={heightUnit === 'cm' ? undefined : { gridColumn: '1 / -1' }}>
          <label style={labelStyle}>
            {weightUnit === 'lbs' ? tr('toolboxTools.bmi.weightLbs') : tr('toolboxTools.bmi.weightKg')}
          </label>
          <input
            type="number"
            min={weightUnit === 'lbs' ? 44 : 20}
            max={weightUnit === 'lbs' ? 660 : 300}
            step="0.1"
            value={weightDisplay}
            onChange={(e) => setWeightDisplay(e.target.value)}
            style={fieldStyle}
          />
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
              {tr('toolboxTools.bmi.healthyWeightFor')}{' '}
              <strong style={{ color: t.ink }}>
                {range.low}–{range.high}
              </strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
