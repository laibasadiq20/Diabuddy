import React, { useMemo, useState } from 'react';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { Calculator, Droplets, Ruler, Activity } from 'lucide-react';

const t = theme;

function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: t.skyDeep, tip: 'Ask a clinician before making big diet changes.' };
  if (bmi < 25) return { label: 'Healthy range', color: t.sageDeep, tip: 'Keep steady habits — food, movement, sleep.' };
  if (bmi < 30) return { label: 'Overweight', color: t.gold, tip: 'Small daily shifts can lower long-term risk.' };
  return { label: 'Obese', color: t.clay, tip: 'Consider talking with a clinician about a plan.' };
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section
      style={{
        background: '#FFF',
        borderRadius: 20,
        border: `1.5px solid ${t.lineStrong}`,
        boxShadow: t.shadowCard,
        padding: 22,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: t.skyTint,
            color: t.skyDeep,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={18} />
        </span>
        <h2 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 20, color: t.ink, fontWeight: 600 }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

const fieldStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: 12,
  border: `1.5px solid ${t.lineStrong}`,
  background: t.surfaceSunken,
  fontSize: 14,
  fontFamily: t.fontBody,
  color: t.ink,
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: t.inkSoft,
  marginBottom: 6,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

export default function Toolbox() {
  const [heightCm, setHeightCm] = useState('170');
  const [weightKg, setWeightKg] = useState('70');
  const [age, setAge] = useState('35');
  const [sex, setSex] = useState('female');
  const [activity, setActivity] = useState('1.55');

  const bmi = useMemo(() => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (!h || !w || h <= 0 || w <= 0) return null;
    const meters = h / 100;
    return +(w / (meters * meters)).toFixed(1);
  }, [heightCm, weightKg]);

  const category = bmi ? bmiCategory(bmi) : null;

  const waterLiters = useMemo(() => {
    const w = parseFloat(weightKg);
    if (!w || w <= 0) return null;
    return +((w * 0.033)).toFixed(1);
  }, [weightKg]);

  const tdee = useMemo(() => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    const a = parseFloat(age);
    const act = parseFloat(activity);
    if (!h || !w || !a || !act) return null;
    // Mifflin–St Jeor
    const bmr = sex === 'male'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;
    return Math.round(bmr * act);
  }, [heightCm, weightKg, age, sex, activity]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 45%)`,
        fontFamily: t.fontBody,
      }}
    >
      <AppSidebar />

      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 64px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <header>
            <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.inkFaint }}>
              Toolbox
            </p>
            <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 500, color: t.ink }}>
              Health calculators
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: t.inkSoft, lineHeight: 1.5 }}>
              Quick estimates only — not a diagnosis. Always check with your clinician.
            </p>
          </header>

          <Panel title="BMI calculator" icon={Calculator}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Height (cm)</label>
                <input
                  type="number"
                  min="80"
                  max="250"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Weight (kg)</label>
                <input
                  type="number"
                  min="20"
                  max="300"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  style={fieldStyle}
                />
              </div>
            </div>

            {bmi && category && (
              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  borderRadius: 16,
                  background: t.surfaceSunken,
                  border: `1px solid ${t.line}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: t.inkFaint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Your BMI
                    </p>
                    <p style={{ margin: '4px 0 0', fontFamily: t.fontDisplay, fontSize: 36, color: t.ink, fontWeight: 600 }}>
                      {bmi}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      background: '#FFF',
                      border: `1.5px solid ${category.color}55`,
                      color: category.color,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {category.label}
                  </span>
                </div>
                <p style={{ margin: '10px 0 0', fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
                  {category.tip}
                </p>
              </div>
            )}
          </Panel>

          <Panel title="Daily water guide" icon={Droplets}>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: t.inkSoft, lineHeight: 1.5 }}>
              Rough target from body weight (~33 ml per kg). Adjust for heat, activity, and medical advice.
            </p>
            <p style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 32, color: t.ink, fontWeight: 600 }}>
              {waterLiters ? `${waterLiters} L` : '—'}
              <span style={{ fontSize: 14, fontFamily: t.fontBody, fontWeight: 500, color: t.inkFaint, marginLeft: 8 }}>
                per day
              </span>
            </p>
          </Panel>

          <Panel title="Calorie estimate (TDEE)" icon={Activity}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Age</label>
                <input
                  type="number"
                  min="12"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Sex</label>
                <select value={sex} onChange={(e) => setSex(e.target.value)} style={fieldStyle}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Activity</label>
                <select value={activity} onChange={(e) => setActivity(e.target.value)} style={fieldStyle}>
                  <option value="1.2">Sedentary</option>
                  <option value="1.375">Lightly active</option>
                  <option value="1.55">Moderately active</option>
                  <option value="1.725">Very active</option>
                </select>
              </div>
            </div>
            <div
              style={{
                marginTop: 16,
                padding: 16,
                borderRadius: 16,
                background: t.sageTint,
                border: `1px solid ${t.sage}40`,
              }}
            >
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: t.inkFaint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Estimated daily needs
              </p>
              <p style={{ margin: '4px 0 0', fontFamily: t.fontDisplay, fontSize: 32, color: t.ink, fontWeight: 600 }}>
                {tdee ? `${tdee.toLocaleString()} kcal` : '—'}
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: t.inkSoft }}>
                Uses Mifflin–St Jeor. Diabetes care may need different targets — confirm with your care team.
              </p>
            </div>
          </Panel>

          <Panel title="Healthy BMI weight range" icon={Ruler}>
            {(() => {
              const h = parseFloat(heightCm);
              if (!h || h <= 0) return <p style={{ margin: 0, color: t.inkSoft }}>Enter height above.</p>;
              const m = h / 100;
              const low = Math.round(18.5 * m * m);
              const high = Math.round(24.9 * m * m);
              return (
                <p style={{ margin: 0, fontSize: 15, color: t.ink, lineHeight: 1.6 }}>
                  For <strong>{h} cm</strong>, a BMI of 18.5–24.9 is about{' '}
                  <strong>{low}–{high} kg</strong>.
                </p>
              );
            })()}
          </Panel>
        </div>
      </main>
    </div>
  );
}
