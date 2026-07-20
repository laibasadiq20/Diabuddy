import React, { useMemo, useState } from 'react';
import { theme as t } from '../../../theme';
import { fieldStyle, labelStyle, eyebrow } from '../toolboxStyles';

export default function CalorieTool() {
  const [heightCm, setHeightCm] = useState('170');
  const [weightKg, setWeightKg] = useState('70');
  const [age, setAge] = useState('35');
  const [sex, setSex] = useState('female');
  const [activity, setActivity] = useState('1.55');

  const result = useMemo(() => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    const a = parseFloat(age);
    const act = parseFloat(activity);
    if (!h || !w || !a || !act) return null;
    const bmr = sex === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = Math.round(bmr * act);
    return { bmr: Math.round(bmr), tdee };
  }, [heightCm, weightKg, age, sex, activity]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ margin: 0, fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
        Estimates daily calorie needs (Mifflin–St Jeor). Useful when managing weight alongside diabetes — confirm goals with your care team.
      </p>
      <div className="db-tool-grid-2">
        <div>
          <label style={labelStyle}>Height (cm)</label>
          <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Weight (kg)</label>
          <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Age</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Gender</label>
          <select value={sex} onChange={(e) => setSex(e.target.value)} style={fieldStyle}>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Activity level</label>
          <select value={activity} onChange={(e) => setActivity(e.target.value)} style={fieldStyle}>
            <option value="1.2">Sedentary (little or no exercise)</option>
            <option value="1.375">Lightly active (1–3 days/week)</option>
            <option value="1.55">Moderately active (3–5 days/week)</option>
            <option value="1.725">Very active (6–7 days/week)</option>
          </select>
        </div>
      </div>
      {result && (
        <div className="db-tool-grid-2">
          <div style={{ padding: 16, borderRadius: 16, background: t.surfaceSunken, border: `1px solid ${t.line}` }}>
            <p style={eyebrow}>BMR</p>
            <p style={{ margin: '4px 0 0', fontFamily: t.fontDisplay, fontSize: 26, color: t.ink, fontWeight: 600 }}>
              {result.bmr.toLocaleString()}
              <span style={{ fontSize: 13, fontFamily: t.fontBody, fontWeight: 500, color: t.inkFaint, marginLeft: 6 }}>kcal</span>
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>At rest</p>
          </div>
          <div style={{ padding: 16, borderRadius: 16, background: t.goldTint, border: `1px solid ${t.gold}40` }}>
            <p style={eyebrow}>Daily needs</p>
            <p style={{ margin: '4px 0 0', fontFamily: t.fontDisplay, fontSize: 26, color: t.ink, fontWeight: 600 }}>
              {result.tdee.toLocaleString()}
              <span style={{ fontSize: 13, fontFamily: t.fontBody, fontWeight: 500, color: t.inkFaint, marginLeft: 6 }}>kcal</span>
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>With activity</p>
          </div>
        </div>
      )}
    </div>
  );
}
