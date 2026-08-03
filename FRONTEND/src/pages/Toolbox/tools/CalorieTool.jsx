import React, { useEffect, useMemo, useState } from 'react';
import { theme as t } from '../../../theme';
import { fieldStyle, labelStyle, eyebrow, disclaimerStyle } from '../toolboxStyles';
import { useI18n } from '../../../i18n/I18nContext';
import { useUnits } from '../../../hooks/useUnits';
import { cmToFtIn, ftInToCm, kgToLbs, lbsToKg, round1 } from '../../../utils/bodyUnits';
import ThemedSelect from '../../../components/ThemedSelect';

export default function CalorieTool() {
  const { t: tr } = useI18n();
  const { weightUnit, heightUnit } = useUnits();

  const [heightCm, setHeightCm] = useState('170');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('7');
  const [weightDisplay, setWeightDisplay] = useState(weightUnit === 'lbs' ? '154' : '70');
  const [age, setAge] = useState('35');
  const [sex, setSex] = useState('female');
  const [activity, setActivity] = useState('1.55');

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

  const result = useMemo(() => {
    const h = resolvedCm;
    const w = resolvedKg;
    const a = parseFloat(age);
    const act = parseFloat(activity);
    if (!h || !w || !a || !act) return null;
    const bmr = sex === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = Math.round(bmr * act);
    return { bmr: Math.round(bmr), tdee };
  }, [resolvedCm, resolvedKg, age, sex, activity]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={disclaimerStyle}>{tr('toolboxTools.calorie.disclaimer')}</div>
      <p style={{ margin: 0, fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>{tr('toolboxTools.calorie.intro')}</p>
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
            <label style={labelStyle}>{tr('toolboxTools.calorie.heightCm')}</label>
            <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} style={fieldStyle} />
          </div>
        )}
        <div style={heightUnit === 'cm' ? undefined : { gridColumn: '1 / -1' }}>
          <label style={labelStyle}>
            {weightUnit === 'lbs' ? tr('toolboxTools.calorie.weightLbs') : tr('toolboxTools.calorie.weightKg')}
          </label>
          <input type="number" step="0.1" value={weightDisplay} onChange={(e) => setWeightDisplay(e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>{tr('toolboxTools.calorie.age')}</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>{tr('toolboxTools.calorie.gender')}</label>
          <ThemedSelect
            value={sex}
            onChange={setSex}
            options={[
              { value: 'female', label: tr('toolboxTools.calorie.genderFemale') },
              { value: 'male', label: tr('toolboxTools.calorie.genderMale') },
            ]}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>{tr('toolboxTools.calorie.activityLevel')}</label>
          <ThemedSelect
            value={activity}
            onChange={setActivity}
            options={[
              { value: '1.2', label: tr('toolboxTools.calorie.activitySedentary') },
              { value: '1.375', label: tr('toolboxTools.calorie.activityLight') },
              { value: '1.55', label: tr('toolboxTools.calorie.activityModerate') },
              { value: '1.725', label: tr('toolboxTools.calorie.activityVery') },
            ]}
          />
        </div>
      </div>
      {result && (
        <div className="db-tool-grid-2">
          <div style={{ padding: 16, borderRadius: 16, background: t.surfaceSunken, border: `1px solid ${t.line}` }}>
            <p style={eyebrow}>{tr('toolboxTools.calorie.bmr')}</p>
            <p style={{ margin: '4px 0 0', fontFamily: t.fontDisplay, fontSize: 26, color: t.ink, fontWeight: 600 }}>
              {result.bmr.toLocaleString()}
              <span style={{ fontSize: 13, fontFamily: t.fontBody, fontWeight: 500, color: t.inkFaint, marginLeft: 6 }}>kcal</span>
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>{tr('toolboxTools.calorie.atRest')}</p>
          </div>
          <div style={{ padding: 16, borderRadius: 16, background: t.goldTint, border: `1px solid ${t.gold}40` }}>
            <p style={eyebrow}>{tr('toolboxTools.calorie.dailyNeeds')}</p>
            <p style={{ margin: '4px 0 0', fontFamily: t.fontDisplay, fontSize: 26, color: t.ink, fontWeight: 600 }}>
              {result.tdee.toLocaleString()}
              <span style={{ fontSize: 13, fontFamily: t.fontBody, fontWeight: 500, color: t.inkFaint, marginLeft: 6 }}>kcal</span>
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>{tr('toolboxTools.calorie.withActivity')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
