import React, { useEffect, useMemo, useState } from 'react';
import { theme as t } from '../../../theme';
import { fieldStyle, labelStyle, eyebrow, disclaimerStyle } from '../toolboxStyles';
import { useI18n } from '../../../i18n/I18nContext';
import { useAuth } from '../../../context/AuthContext';
import { cmToFtIn, ftInToCm, kgToLbs, lbsToKg, round1 } from '../../../utils/bodyUnits';

export default function CalorieTool() {
  const { t: tr } = useI18n();
  const { user } = useAuth();
  const weightUnit = user?.weightUnit === 'lbs' ? 'lbs' : 'kg';
  const heightUnit = user?.heightUnit === 'ft_in' ? 'ft_in' : 'cm';

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
    }
    const kg = weightUnit === 'lbs' ? lbsToKg(weightDisplay) : Number(weightDisplay);
    if (Number.isFinite(kg) && kg > 0) {
      setWeightDisplay(weightUnit === 'lbs' ? String(round1(kgToLbs(kg))) : String(round1(kg)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weightUnit, heightUnit]);

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
        <div>
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
          <select value={sex} onChange={(e) => setSex(e.target.value)} style={fieldStyle}>
            <option value="female">{tr('toolboxTools.calorie.genderFemale')}</option>
            <option value="male">{tr('toolboxTools.calorie.genderMale')}</option>
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>{tr('toolboxTools.calorie.activityLevel')}</label>
          <select value={activity} onChange={(e) => setActivity(e.target.value)} style={fieldStyle}>
            <option value="1.2">{tr('toolboxTools.calorie.activitySedentary')}</option>
            <option value="1.375">{tr('toolboxTools.calorie.activityLight')}</option>
            <option value="1.55">{tr('toolboxTools.calorie.activityModerate')}</option>
            <option value="1.725">{tr('toolboxTools.calorie.activityVery')}</option>
          </select>
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
