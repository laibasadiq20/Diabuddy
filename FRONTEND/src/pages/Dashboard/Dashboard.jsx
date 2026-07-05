import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  Users,
  MessageSquare,
  Sparkles,
  PlusCircle,
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Droplets,
  Target,
  CheckCircle2,
  ClipboardList,
  Zap,
  Pill,
  Utensils,
  TestTube2,
} from 'lucide-react';

const t = theme;

/* ── Tiny helpers ── */
const Card = ({ children, style = {} }) => (
  <div style={{
    background: t.surface,
    borderRadius: '20px',
    border: `1.5px solid ${t.line}`,
    boxShadow: t.shadowCard,
    overflow: 'hidden',
    ...style,
  }}>
    {children}
  </div>
);

const QuickLink = ({ icon, label, sub, onClick, accent }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '1 1 140px',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        gap: '8px', padding: '18px 16px',
        background: hov ? accent + '12' : t.surfaceSunken,
        border: `1.5px solid ${hov ? accent + '50' : t.line}`,
        borderRadius: '16px', cursor: 'pointer',
        transition: 'all 0.18s', textAlign: 'left',
      }}
    >
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: t.ink }}>{label}</p>
        <p style={{ margin: 0, fontSize: '11px', color: t.inkFaint, marginTop: '2px' }}>{sub}</p>
      </div>
    </button>
  );
};

/* ── Main Dashboard ── */
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Glucose tracker state
  const [readings, setReadings] = useState([
    { id: 1, val: 98, state: 'Fasting' },
    { id: 2, val: 124, state: 'Post-meal' },
    { id: 3, val: 105, state: 'Bedtime' },
  ]);
  const [newVal, setNewVal] = useState('');
  const [newState, setNewState] = useState('Fasting');

  const addReading = (e) => {
    e.preventDefault();
    const val = parseInt(newVal);
    if (isNaN(val) || val <= 0) return;
    setReadings([...readings, { id: Date.now(), val, state: newState }]);
    setNewVal('');
  };

  const avg = readings.length ? Math.round(readings.reduce((s, r) => s + r.val, 0) / readings.length) : 0;
  const inRangePct = readings.length ? Math.round((readings.filter(r => r.val >= 70 && r.val <= 140).length / readings.length) * 100) : 0;
  const spikes = readings.filter(r => r.val > 140).length;

  // Checklist state
  const [checklistState, setChecklistState] = useState({
    meds: false,
    glucose: false,
    meal: false,
    exercise: false,
  });

  const toggleCheck = (key) => setChecklistState(prev => ({ ...prev, [key]: !prev[key] }));
  const doneTasks = Object.values(checklistState).filter(Boolean).length;

  const checklist = [
    { key: 'meds', icon: <Pill size={16} color={t.clay} />, label: 'Take morning medication', accent: t.clay },
    { key: 'glucose', icon: <Droplets size={16} color={t.skyDeep} />, label: 'Log glucose reading', accent: t.skyDeep },
    { key: 'meal', icon: <Utensils size={16} color={t.gold} />, label: 'Log today\'s meals', accent: t.gold },
    { key: 'exercise', icon: <Zap size={16} color={t.sageDeep} />, label: '30 min of exercise', accent: t.sageDeep },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: t.bg, fontFamily: t.fontBody }}>
      <Navbar />

      <main style={{ flexGrow: 1, paddingTop: '96px', paddingBottom: '72px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* ── Welcome banner with inline stats ── */}
          <div style={{
            background: `linear-gradient(135deg, ${t.sageDeep} 0%, #4a7a5e 60%, ${t.skyDeep} 100%)`,
            borderRadius: '24px', padding: '32px 36px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '24px',
            boxShadow: '0 8px 32px rgba(98,121,90,0.25)',
          }}>
            <div>
              <p style={{ fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', margin: '0 0 6px 0' }}>
                Your Dashboard
              </p>
              <h1 style={{ fontFamily: t.fontDisplay, fontSize: '30px', color: '#fff', margin: '0 0 4px 0', fontWeight: '600' }}>
                Hello, {user?.name?.split(' ')[0] || 'Buddy'} 👋
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>
                Here's your health snapshot for today.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { label: 'Forum Posts', value: user?.postsCount ?? 0, icon: '✍️' },
                { label: 'Rep Score', value: (user?.reputationScore ?? 0) + ' pts', icon: '⭐' },
                { label: 'Goals Done', value: `${doneTasks}/4`, icon: '🎯' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'rgba(255,255,255,0.14)', borderRadius: '14px', padding: '12px 18px',
                  border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', minWidth: '90px',
                }}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '20px', fontWeight: '700', color: '#fff', fontFamily: t.fontDisplay }}>{s.icon} {s.value}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.5px' }}>{s.label}</p>
                </div>
              ))}

              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin/reports')}
                  style={{
                    background: t.clay + 'cc', color: '#fff', border: 'none',
                    borderRadius: '12px', padding: '10px 18px', fontSize: '13px', fontWeight: '600',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  <AlertTriangle size={14} /> Reports
                </button>
              )}
            </div>
          </div>

          {/* ── Quick links row ── */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: '700', color: t.inkFaint, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px 0' }}>
              Quick Access
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <QuickLink icon={<Users size={18} color={t.sageDeep} />} label="Community" sub="Browse topics" onClick={() => navigate('/community')} accent={t.sageDeep} />
              <QuickLink icon={<PlusCircle size={18} color={t.skyDeep} />} label="New Post" sub="Share a thought" onClick={() => navigate('/community/new-post')} accent={t.skyDeep} />
              <QuickLink icon={<MessageSquare size={18} color={t.gold} />} label="Messages" sub="Your inbox" onClick={() => navigate('/messages')} accent={t.gold} />
              <QuickLink icon={<TestTube2 size={18} color={t.clay} />} label="Risk Test" sub="Free · 60 sec" onClick={() => navigate('/learn/risk-assessment')} accent={t.clay} />
              <QuickLink icon={<Sparkles size={18} color={t.forest} />} label="Best Answers" sub="Top community picks" onClick={() => navigate('/community?sort=best_answers')} accent={t.forest} />
            </div>
          </div>

          {/* ── 2 column: Glucose + Checklist ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>

            {/* Glucose Tracker */}
            <Card>
              <div style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: t.skySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Droplets size={19} color={t.skyDeep} />
                    </div>
                    <span style={{ fontFamily: t.fontDisplay, fontSize: '19px', color: t.ink, fontWeight: '500' }}>Glucose Log</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: t.skyDeep, background: t.skySoft, borderRadius: '20px', padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Demo</span>
                </div>

                {/* Log form */}
                <form onSubmit={addReading} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <input
                    type="number"
                    value={newVal}
                    onChange={e => setNewVal(e.target.value)}
                    placeholder="mg/dL"
                    style={{
                      flex: 1, padding: '9px 12px', borderRadius: '10px',
                      border: `1.5px solid ${t.line}`, background: t.surfaceSunken,
                      color: t.ink, fontSize: '14px', outline: 'none', fontFamily: t.fontBody,
                    }}
                  />
                  <select
                    value={newState}
                    onChange={e => setNewState(e.target.value)}
                    style={{
                      padding: '9px 10px', borderRadius: '10px',
                      border: `1.5px solid ${t.line}`, background: t.surfaceSunken,
                      color: t.ink, fontSize: '13px', outline: 'none', fontFamily: t.fontBody,
                    }}
                  >
                    <option>Fasting</option>
                    <option>Pre-meal</option>
                    <option>Post-meal</option>
                    <option>Bedtime</option>
                  </select>
                  <button type="submit" style={{
                    background: t.skyDeep, color: '#fff', border: 'none',
                    borderRadius: '10px', padding: '9px 16px', fontSize: '13px',
                    fontWeight: '600', cursor: 'pointer', fontFamily: t.fontBody,
                  }}>Log</button>
                </form>

                {/* Bar sparkline */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px', marginBottom: '16px', paddingBottom: '4px', borderBottom: `1.5px solid ${t.line}` }}>
                  {readings.slice(-10).map(r => {
                    const pct = Math.min(100, Math.round((r.val / 200) * 100));
                    const ok = r.val >= 70 && r.val <= 140;
                    return (
                      <div key={r.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <span style={{ fontSize: '9px', fontWeight: '700', color: ok ? t.sageDeep : t.clay }}>{r.val}</span>
                        <div style={{
                          width: '100%', borderRadius: '4px 4px 0 0',
                          background: ok ? t.sageDeep + 'cc' : t.clay + 'cc',
                          height: `${pct * 0.7}px`, transition: 'height 0.3s ease',
                        }} />
                        <span style={{ fontSize: '8px', color: t.inkFaint, overflow: 'hidden', width: '100%', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.state}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Summary stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { label: 'Average', val: `${avg}`, unit: 'mg/dL', icon: <Activity size={13} color={t.skyDeep} /> },
                    { label: 'In Range', val: `${inRangePct}%`, unit: '70–140', icon: <TrendingUp size={13} color={t.sageDeep} /> },
                    { label: 'Spikes', val: `${spikes}`, unit: '>140 mg/dL', icon: <TrendingDown size={13} color={t.clay} /> },
                  ].map(m => (
                    <div key={m.label} style={{ background: t.surfaceSunken, borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3px' }}>{m.icon}</div>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: t.ink, fontFamily: t.fontDisplay }}>{m.val}</p>
                      <p style={{ margin: 0, fontSize: '9px', color: t.inkFaint }}>{m.unit}</p>
                      <p style={{ margin: 0, fontSize: '10px', color: t.inkSoft, marginTop: '1px' }}>{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Today's Checklist */}
            <Card>
              <div style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: t.sageSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ClipboardList size={19} color={t.sageDeep} />
                    </div>
                    <span style={{ fontFamily: t.fontDisplay, fontSize: '19px', color: t.ink, fontWeight: '500' }}>Today's Checklist</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: doneTasks === 4 ? t.sageDeep : t.inkSoft }}>
                    {doneTasks}/4 done
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: '6px', borderRadius: '20px', background: t.line, overflow: 'hidden', marginBottom: '20px' }}>
                  <div style={{
                    height: '100%', background: doneTasks === 4
                      ? `linear-gradient(90deg, ${t.sageDeep}, ${t.sage})`
                      : `linear-gradient(90deg, ${t.skyDeep}, ${t.sky})`,
                    width: `${(doneTasks / 4) * 100}%`,
                    borderRadius: '20px', transition: 'width 0.4s ease',
                  }} />
                </div>

                {/* Checklist items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {checklist.map(item => (
                    <button
                      key={item.key}
                      onClick={() => toggleCheck(item.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 14px', borderRadius: '12px',
                        background: checklistState[item.key] ? item.accent + '12' : t.surfaceSunken,
                        border: `1.5px solid ${checklistState[item.key] ? item.accent + '40' : 'transparent'}`,
                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
                      }}
                    >
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${checklistState[item.key] ? item.accent : t.lineStrong}`,
                        background: checklistState[item.key] ? item.accent : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.18s',
                      }}>
                        {checklistState[item.key] && <CheckCircle2 size={14} color="#fff" strokeWidth={3} />}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        {item.icon}
                        <span style={{
                          fontSize: '14px', fontWeight: '500', color: t.ink,
                          textDecoration: checklistState[item.key] ? 'line-through' : 'none',
                          opacity: checklistState[item.key] ? 0.55 : 1,
                          transition: 'all 0.2s',
                        }}>{item.label}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Motivational footer */}
                <div style={{
                  background: doneTasks === 4 ? t.sageSoft : t.surfaceSunken,
                  borderRadius: '12px', padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  transition: 'background 0.3s',
                }}>
                  <Target size={16} color={doneTasks === 4 ? t.sageDeep : t.inkFaint} />
                  <span style={{ fontSize: '13px', color: doneTasks === 4 ? t.sageDeep : t.inkSoft, fontWeight: '500' }}>
                    {doneTasks === 4
                      ? '🎉 All tasks complete — great work today!'
                      : `${4 - doneTasks} task${4 - doneTasks > 1 ? 's' : ''} remaining. Keep it up!`}
                  </span>
                </div>
              </div>
            </Card>

          </div>

          {/* ── Community quick-access (slimline) ── */}
          <Card>
            <div style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: t.sageSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={19} color={t.sageDeep} />
                  </div>
                  <div>
                    <span style={{ fontFamily: t.fontDisplay, fontSize: '19px', color: t.ink, fontWeight: '500' }}>Community Forum</span>
                    <span style={{ marginLeft: '10px', fontSize: '11px', fontWeight: '700', color: t.sageDeep, background: t.sageSoft, borderRadius: '20px', padding: '2px 9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/community')}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: t.sageDeep, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Browse all <ChevronRight size={15} />
                </button>
              </div>

              <p style={{ fontSize: '14px', color: t.inkSoft, margin: '0 0 16px 0', lineHeight: '1.6' }}>
                Connect with thousands of patients and professionals. Ask questions, share victories, get real support.
              </p>

              {/* Topic chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { label: '💉 Insulin Tips', path: '/community' },
                  { label: '🥗 Low-GI Meals', path: '/community' },
                  { label: '🏃 Exercise', path: '/community' },
                  { label: '📊 CGM Devices', path: '/community' },
                  { label: '🧠 Mental Health', path: '/community' },
                  { label: '👶 T1D Parenting', path: '/community' },
                ].map(tag => (
                  <button
                    key={tag.label}
                    onClick={() => navigate(tag.path)}
                    style={{
                      padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                      background: t.sageTint, color: t.sageDeep,
                      border: `1px solid ${t.sage}40`, cursor: 'pointer',
                      fontFamily: t.fontBody, transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = t.sageSoft}
                    onMouseLeave={e => e.currentTarget.style.background = t.sageTint}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

        </div>
      </main>

      <Footer />
    </div>
  );
}
