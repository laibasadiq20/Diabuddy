import React, { useMemo, useState } from 'react';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import {
  Calculator,
  Droplets,
  Activity,
  HeartPulse,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

const t = theme;

const TOOLS = [
  {
    id: 'bmi',
    title: 'BMI calculator',
    desc: 'Body mass index from height & weight',
    icon: Calculator,
    tint: t.skyTint,
    accent: t.skyDeep,
  },
  {
    id: 'bp',
    title: 'Blood pressure',
    desc: 'Classify a reading (AHA ranges)',
    icon: HeartPulse,
    tint: t.clayTint,
    accent: t.clay,
  },
  {
    id: 'water',
    title: 'Water guide',
    desc: 'Daily hydration estimate',
    icon: Droplets,
    tint: t.sageTint,
    accent: t.sageDeep,
  },
  {
    id: 'tdee',
    title: 'Calorie estimate',
    desc: 'TDEE from Mifflin–St Jeor',
    icon: Activity,
    tint: t.goldTint,
    accent: t.gold,
  },
];

function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: t.skyDeep, tip: 'Ask a clinician before making big diet changes.' };
  if (bmi < 25) return { label: 'Healthy range', color: t.sageDeep, tip: 'Keep steady habits — food, movement, sleep.' };
  if (bmi < 30) return { label: 'Overweight', color: t.gold, tip: 'Small daily shifts can lower long-term risk.' };
  return { label: 'Obese', color: t.clay, tip: 'Consider talking with a clinician about a plan.' };
}

function bpCategory(sys, dia) {
  if (sys >= 180 || dia >= 120) return { label: 'Hypertensive crisis', color: '#B91C1C', tip: 'Seek emergency care if you have symptoms like chest pain or shortness of breath.' };
  if (sys >= 140 || dia >= 90) return { label: 'High — Stage 2', color: t.clay, tip: 'Talk with a clinician soon about blood pressure management.' };
  if (sys >= 130 || dia >= 80) return { label: 'High — Stage 1', color: t.gold, tip: 'Lifestyle changes help; follow up with your care team.' };
  if (sys >= 120 && dia < 80) return { label: 'Elevated', color: '#B45309', tip: 'Watch sodium, stress, and movement — recheck regularly.' };
  if (sys < 90 || dia < 60) return { label: 'Low', color: t.skyDeep, tip: 'If you feel dizzy or faint, sit down and check with a clinician.' };
  return { label: 'Normal', color: t.sageDeep, tip: 'Nice range — keep checking periodically.' };
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

function BmiTool() {
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
        <div style={{ padding: 16, borderRadius: 16, background: t.surfaceSunken, border: `1px solid ${t.line}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: t.inkFaint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your BMI</p>
              <p style={{ margin: '4px 0 0', fontFamily: t.fontDisplay, fontSize: 36, color: t.ink, fontWeight: 600 }}>{bmi}</p>
            </div>
            <span style={{ padding: '6px 12px', borderRadius: 999, background: '#FFF', border: `1.5px solid ${category.color}55`, color: category.color, fontSize: 13, fontWeight: 700 }}>
              {category.label}
            </span>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>{category.tip}</p>
          {range && (
            <p style={{ margin: '10px 0 0', fontSize: 13, color: t.inkSoft }}>
              Healthy BMI weight for this height: <strong style={{ color: t.ink }}>{range.low}–{range.high} kg</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function BpTool() {
  const [sys, setSys] = useState('120');
  const [dia, setDia] = useState('80');

  const result = useMemo(() => {
    const s = parseInt(sys, 10);
    const d = parseInt(dia, 10);
    if (!s || !d || s <= 0 || d <= 0) return null;
    return bpCategory(s, d);
  }, [sys, dia]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ margin: 0, fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
        Enter a resting reading. This classifies the numbers — it is not a diagnosis.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Systolic (upper)</label>
          <input type="number" min="60" max="250" value={sys} onChange={(e) => setSys(e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Diastolic (lower)</label>
          <input type="number" min="40" max="150" value={dia} onChange={(e) => setDia(e.target.value)} style={fieldStyle} />
        </div>
      </div>
      {result && (
        <div style={{ padding: 16, borderRadius: 16, background: t.surfaceSunken, border: `1px solid ${t.line}` }}>
          <p style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 28, color: t.ink, fontWeight: 600 }}>
            {sys}/{dia}
            <span style={{ marginLeft: 10, fontSize: 14, fontFamily: t.fontBody, fontWeight: 700, color: result.color }}>{result.label}</span>
          </p>
          <p style={{ margin: '10px 0 0', fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>{result.tip}</p>
        </div>
      )}
    </div>
  );
}

function WaterTool() {
  const [weightKg, setWeightKg] = useState('70');
  const liters = useMemo(() => {
    const w = parseFloat(weightKg);
    if (!w || w <= 0) return null;
    return +(w * 0.033).toFixed(1);
  }, [weightKg]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={labelStyle}>Weight (kg)</label>
        <input type="number" min="20" max="300" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} style={fieldStyle} />
      </div>
      <p style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 32, color: t.ink, fontWeight: 600 }}>
        {liters ? `${liters} L` : '—'}
        <span style={{ fontSize: 14, fontFamily: t.fontBody, fontWeight: 500, color: t.inkFaint, marginLeft: 8 }}>per day</span>
      </p>
      <p style={{ margin: 0, fontSize: 13, color: t.inkSoft }}>Rough guide (~33 ml/kg). Adjust for heat, activity, and medical advice.</p>
    </div>
  );
}

function TdeeTool() {
  const [heightCm, setHeightCm] = useState('170');
  const [weightKg, setWeightKg] = useState('70');
  const [age, setAge] = useState('35');
  const [sex, setSex] = useState('female');
  const [activity, setActivity] = useState('1.55');

  const tdee = useMemo(() => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    const a = parseFloat(age);
    const act = parseFloat(activity);
    if (!h || !w || !a || !act) return null;
    const bmr = sex === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    return Math.round(bmr * act);
  }, [heightCm, weightKg, age, sex, activity]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
      <div style={{ padding: 16, borderRadius: 16, background: t.sageTint, border: `1px solid ${t.sage}40` }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: t.inkFaint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Estimated daily needs</p>
        <p style={{ margin: '4px 0 0', fontFamily: t.fontDisplay, fontSize: 32, color: t.ink, fontWeight: 600 }}>
          {tdee ? `${tdee.toLocaleString()} kcal` : '—'}
        </p>
      </div>
    </div>
  );
}

const TOOL_VIEWS = {
  bmi: BmiTool,
  bp: BpTool,
  water: WaterTool,
  tdee: TdeeTool,
};

export default function Toolbox() {
  const [active, setActive] = useState(null);
  const ActiveView = active ? TOOL_VIEWS[active] : null;
  const meta = TOOLS.find((x) => x.id === active);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: `linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 45%)`, fontFamily: t.fontBody }}>
      <AppSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 64px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {!active ? (
            <>
              <header style={{ marginBottom: 22 }}>
                <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.inkFaint }}>Toolbox</p>
                <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 500, color: t.ink }}>Choose a tool</h1>
                <p style={{ margin: '8px 0 0', fontSize: 14, color: t.inkSoft }}>Estimates only — not medical advice.</p>
              </header>

              <div style={{ display: 'grid', gap: 12 }}>
                {TOOLS.map(({ id, title, desc, icon: Icon, tint, accent }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActive(id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '18px 16px',
                      borderRadius: 18,
                      border: `1.5px solid ${t.lineStrong}`,
                      background: '#FFF',
                      boxShadow: t.shadowCard,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: t.fontBody,
                    }}
                  >
                    <span style={{ width: 48, height: 48, borderRadius: 14, background: tint, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={22} />
                    </span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontWeight: 700, fontSize: 16, color: t.ink }}>{title}</span>
                      <span style={{ display: 'block', fontSize: 13, color: t.inkSoft, marginTop: 2 }}>{desc}</span>
                    </span>
                    <ChevronRight size={18} color={t.inkFaint} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActive(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 18,
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: `1.5px solid ${t.lineStrong}`,
                  background: '#FFF',
                  color: t.inkSoft,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                }}
              >
                <ArrowLeft size={15} /> All tools
              </button>

              <section style={{ background: '#FFF', borderRadius: 20, border: `1.5px solid ${t.lineStrong}`, boxShadow: t.shadowCard, padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 12, background: meta.tint, color: meta.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <meta.icon size={18} />
                  </span>
                  <h2 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 22, color: t.ink, fontWeight: 600 }}>{meta.title}</h2>
                </div>
                <ActiveView />
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
