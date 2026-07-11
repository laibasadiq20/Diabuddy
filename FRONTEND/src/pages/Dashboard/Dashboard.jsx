import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import {
  Users,
  MessageSquare,
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
  UserRound,
  Sparkles,
} from 'lucide-react';

const t = theme;

const Panel = ({ children, style = {} }) => (
  <div
    style={{
      background: '#FFF',
      borderRadius: 18,
      border: `1.5px solid ${t.lineStrong}`,
      boxShadow: t.shadowCard,
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'Buddy';

  const [readings, setReadings] = useState([
    { id: 1, val: 98, state: 'Fasting' },
    { id: 2, val: 124, state: 'Post-meal' },
    { id: 3, val: 105, state: 'Bedtime' },
  ]);
  const [newVal, setNewVal] = useState('');
  const [newState, setNewState] = useState('Fasting');

  const addReading = (e) => {
    e.preventDefault();
    const val = parseInt(newVal, 10);
    if (isNaN(val) || val <= 0) return;
    setReadings([...readings, { id: Date.now(), val, state: newState }]);
    setNewVal('');
  };

  const avg = readings.length
    ? Math.round(readings.reduce((s, r) => s + r.val, 0) / readings.length)
    : 0;
  const inRangePct = readings.length
    ? Math.round((readings.filter((r) => r.val >= 70 && r.val <= 140).length / readings.length) * 100)
    : 0;
  const spikes = readings.filter((r) => r.val > 140).length;

  const [checklistState, setChecklistState] = useState({
    meds: false,
    glucose: false,
    meal: false,
    exercise: false,
  });
  const toggleCheck = (key) => setChecklistState((prev) => ({ ...prev, [key]: !prev[key] }));
  const doneTasks = Object.values(checklistState).filter(Boolean).length;

  const checklist = [
    { key: 'meds', icon: <Pill size={16} color={t.clay} />, label: 'Take morning medication', accent: t.clay },
    { key: 'glucose', icon: <Droplets size={16} color={t.skyDeep} />, label: 'Log glucose reading', accent: t.skyDeep },
    { key: 'meal', icon: <Utensils size={16} color={t.gold} />, label: "Log today's meals", accent: t.gold },
    { key: 'exercise', icon: <Zap size={16} color={t.sageDeep} />, label: '30 min of exercise', accent: t.sageDeep },
  ];

  const shortcuts = [
    { icon: Users, label: 'Community', sub: 'Forum & topics', path: '/community', color: t.sageDeep },
    { icon: MessageSquare, label: 'Messages', sub: 'Direct chats', path: '/messages', color: t.skyDeep },
    { icon: PlusCircle, label: 'New post', sub: 'Share a tip', path: '/community/new-post', color: t.forest },
    { icon: UserRound, label: 'My Account', sub: 'Personalize', path: '/account', color: t.clay },
    { icon: TestTube2, label: 'Risk test', sub: 'About 60 sec', path: '/learn/risk-assessment', color: t.gold },
    { icon: Sparkles, label: 'Best answers', sub: 'Verified Q&A', path: '/community?sort=best_answers', color: t.olive },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: `linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 40%)`, fontFamily: t.fontBody }}>
      <AppSidebar />

      <main style={{ flex: 1, minWidth: 0, padding: '28px 24px 56px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Hero */}
          <section
            style={{
              position: 'relative',
              borderRadius: 24,
              overflow: 'hidden',
              background: `linear-gradient(125deg, ${t.forestDeep} 0%, ${t.forest} 45%, #3d5c4a 100%)`,
              padding: '36px 32px',
              color: '#F7F3EC',
              boxShadow: '0 16px 40px rgba(22,33,25,0.28)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: -40,
                top: -40,
                width: 220,
                height: 220,
                borderRadius: '50%',
                background: 'rgba(232,184,154,0.16)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: 80,
                bottom: -60,
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: 'rgba(94,135,160,0.18)',
                pointerEvents: 'none',
              }}
            />

            <p style={{ margin: '0 0 8px', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(247,243,236,0.55)', fontWeight: 600 }}>
              Today · Diabuddy
            </p>
            <h1 style={{ margin: '0 0 8px', fontFamily: t.fontDisplay, fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 500 }}>
              Hello, {firstName}
            </h1>
            <p style={{ margin: 0, maxWidth: 420, fontSize: 15, lineHeight: 1.55, color: 'rgba(247,243,236,0.72)' }}>
              Your health snapshot, community, and messages — in one place.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
              {[
                { label: 'Forum posts', value: user?.postsCount ?? 0 },
                { label: 'Rep score', value: `${user?.reputationScore ?? 0} pts` },
                { label: 'Goals done', value: `${doneTasks}/4` },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: 14,
                    padding: '12px 16px',
                    minWidth: 100,
                  }}
                >
                  <p style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 22, fontWeight: 600 }}>{s.value}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(247,243,236,0.6)' }}>{s.label}</p>
                </div>
              ))}
              {user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => navigate('/admin/reports')}
                  style={{
                    background: t.clay,
                    color: '#FFF',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <AlertTriangle size={14} /> Reports
                </button>
              )}
            </div>
          </section>

          {/* Shortcuts */}
          <section>
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: t.inkSoft, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Quick access
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 12,
              }}
            >
              {shortcuts.map(({ icon: Icon, label, sub, path, color }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(path)}
                  style={{
                    textAlign: 'left',
                    padding: '16px',
                    borderRadius: 16,
                    border: `1.5px solid ${t.lineStrong}`,
                    background: '#FFF',
                    cursor: 'pointer',
                    boxShadow: t.shadowCard,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `${color}18`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <Icon size={18} color={color} />
                  </div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: t.ink }}>{label}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: t.inkSoft }}>{sub}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Glucose + Checklist */}
          <div
            className="db-dash-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}
          >
            <Panel>
              <div style={{ padding: 26 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: t.skySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Droplets size={19} color={t.skyDeep} />
                    </div>
                    <span style={{ fontFamily: t.fontDisplay, fontSize: 19, color: t.ink, fontWeight: 500 }}>Glucose log</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.skyDeep, background: t.skySoft, borderRadius: 20, padding: '3px 10px' }}>
                    DEMO
                  </span>
                </div>

                <form onSubmit={addReading} style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                  <input
                    type="number"
                    value={newVal}
                    onChange={(e) => setNewVal(e.target.value)}
                    placeholder="mg/dL"
                    style={{
                      flex: '1 1 100px',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: `1.5px solid ${t.lineStrong}`,
                      background: t.surfaceSunken,
                      color: t.ink,
                      fontSize: 14,
                      outline: 'none',
                      fontFamily: t.fontBody,
                    }}
                  />
                  <select
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    style={{
                      padding: '10px',
                      borderRadius: 10,
                      border: `1.5px solid ${t.lineStrong}`,
                      background: t.surfaceSunken,
                      color: t.ink,
                      fontSize: 13,
                      outline: 'none',
                      fontFamily: t.fontBody,
                    }}
                  >
                    <option>Fasting</option>
                    <option>Pre-meal</option>
                    <option>Post-meal</option>
                    <option>Bedtime</option>
                  </select>
                  <button
                    type="submit"
                    style={{
                      background: t.skyDeep,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Log
                  </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, marginBottom: 16, paddingBottom: 4, borderBottom: `1.5px solid ${t.line}` }}>
                  {readings.slice(-10).map((r) => {
                    const pct = Math.min(100, Math.round((r.val / 200) * 100));
                    const ok = r.val >= 70 && r.val <= 140;
                    return (
                      <div key={r.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: ok ? t.sageDeep : t.clay }}>{r.val}</span>
                        <div
                          style={{
                            width: '100%',
                            borderRadius: '4px 4px 0 0',
                            background: ok ? `${t.sageDeep}cc` : `${t.clay}cc`,
                            height: `${pct * 0.7}px`,
                          }}
                        />
                        <span style={{ fontSize: 8, color: t.inkFaint, width: '100%', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.state}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Average', val: `${avg}`, unit: 'mg/dL', icon: <Activity size={13} color={t.skyDeep} /> },
                    { label: 'In range', val: `${inRangePct}%`, unit: '70–140', icon: <TrendingUp size={13} color={t.sageDeep} /> },
                    { label: 'Spikes', val: `${spikes}`, unit: '>140', icon: <TrendingDown size={13} color={t.clay} /> },
                  ].map((m) => (
                    <div key={m.label} style={{ background: t.surfaceSunken, borderRadius: 10, padding: 10, textAlign: 'center', border: `1px solid ${t.line}` }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>{m.icon}</div>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.ink, fontFamily: t.fontDisplay }}>{m.val}</p>
                      <p style={{ margin: 0, fontSize: 9, color: t.inkFaint }}>{m.unit}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 10, color: t.inkSoft }}>{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel>
              <div style={{ padding: 26 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: t.sageSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ClipboardList size={19} color={t.sageDeep} />
                    </div>
                    <span style={{ fontFamily: t.fontDisplay, fontSize: 19, color: t.ink, fontWeight: 500 }}>Today&apos;s checklist</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: doneTasks === 4 ? t.sageDeep : t.inkSoft }}>
                    {doneTasks}/4
                  </span>
                </div>

                <div style={{ height: 6, borderRadius: 20, background: t.line, overflow: 'hidden', marginBottom: 18 }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(doneTasks / 4) * 100}%`,
                      background: doneTasks === 4
                        ? `linear-gradient(90deg, ${t.sageDeep}, ${t.sage})`
                        : `linear-gradient(90deg, ${t.skyDeep}, ${t.sky})`,
                      borderRadius: 20,
                      transition: 'width 0.35s ease',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {checklist.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleCheck(item.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 14px',
                        borderRadius: 12,
                        background: checklistState[item.key] ? `${item.accent}14` : t.surfaceSunken,
                        border: `1.5px solid ${checklistState[item.key] ? `${item.accent}50` : t.line}`,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          flexShrink: 0,
                          border: `2px solid ${checklistState[item.key] ? item.accent : t.lineStrong}`,
                          background: checklistState[item.key] ? item.accent : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {checklistState[item.key] && <CheckCircle2 size={14} color="#fff" strokeWidth={3} />}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        {item.icon}
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: t.ink,
                            textDecoration: checklistState[item.key] ? 'line-through' : 'none',
                            opacity: checklistState[item.key] ? 0.55 : 1,
                          }}
                        >
                          {item.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div
                  style={{
                    background: doneTasks === 4 ? t.sageSoft : t.surfaceSunken,
                    borderRadius: 12,
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    border: `1px solid ${doneTasks === 4 ? `${t.sage}55` : t.line}`,
                  }}
                >
                  <Target size={16} color={doneTasks === 4 ? t.sageDeep : t.inkFaint} />
                  <span style={{ fontSize: 13, color: doneTasks === 4 ? t.sageDeep : t.inkSoft, fontWeight: 500 }}>
                    {doneTasks === 4
                      ? 'All tasks complete — great work today!'
                      : `${4 - doneTasks} task${4 - doneTasks > 1 ? 's' : ''} remaining.`}
                  </span>
                </div>
              </div>
            </Panel>
          </div>

          {/* Community strip */}
          <Panel>
            <div style={{ padding: '22px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 20, color: t.ink }}>Community forum</p>
                <p style={{ margin: '6px 0 0', fontSize: 14, color: t.inkSoft, maxWidth: 420 }}>
                  Ask questions, share victories, and get support from people who understand.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/community')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: t.forest,
                  color: '#FFF',
                  border: 'none',
                  borderRadius: 12,
                  padding: '11px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Open forum <ChevronRight size={15} />
              </button>
            </div>
          </Panel>
        </div>
      </main>

      <style>{`
        @media (max-width: 900px) {
          .db-dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
