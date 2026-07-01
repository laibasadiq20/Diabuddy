import { useState, useEffect } from 'react';
import {
  LogOut, Plus, TrendingUp, TrendingDown, Pill, Apple, Activity,
  MessageSquare, Settings, Bell, Search, ChevronRight, Home,
  BarChart2, BookOpen, User, Droplet, Footprints, Dumbbell, AlarmClock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { theme, statusColor } from '../../theme';

const t = theme;

function Sparkline({ points, color }) {
  // points: array of numbers, render as a small smooth-ish line chart
  const w = 200, h = 48, pad = 4;
  const min = Math.min(...points) - 10;
  const max = Math.max(...points) + 10;
  const stepX = (w - pad * 2) / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((p - min) / (max - min)) * (h - pad * 2);
    return [x, y];
  });
  const path = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const last = coords[coords.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill={color} />
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, unit, accent, accentSoft, note }) {
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.line}`, borderRadius: '16px',
      padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px',
      transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s', cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent + '60'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = t.shadowCard; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = t.line; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} color={accent} />
        </div>
        {note && <span style={{ fontSize: '11px', color: accent, background: accentSoft, padding: '3px 9px', borderRadius: '20px', fontWeight: '600' }}>{note}</span>}
      </div>
      <div>
        <p style={{ color: t.inkFaint, fontSize: '11px', fontWeight: '600', letterSpacing: '0.6px', marginBottom: '4px' }}>{label.toUpperCase()}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ color: t.ink, fontSize: '22px', fontWeight: '600', letterSpacing: '-0.3px', fontFamily: t.fontDisplay }}>{value}</span>
          <span style={{ color: t.inkSoft, fontSize: '13px' }}>{unit}</span>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 14px', borderRadius: '10px', border: 'none',
        background: active ? t.sageTint : 'none',
        color: active ? t.sageDeep : t.inkSoft,
        fontSize: '14px', fontWeight: active ? '600' : '400',
        cursor: 'pointer', width: '100%', textAlign: 'left',
        transition: 'all 0.15s', fontFamily: 'inherit',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = t.surfaceSunken; e.currentTarget.style.color = t.ink; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = t.inkSoft; } }}
    >
      <Icon size={17} />
      {label}
      {active && <div style={{ marginLeft: 'auto', width: '5px', height: '5px', borderRadius: '50%', background: t.sage }} />}
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeNav, setActiveNav] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok) {
          const resData = await response.json();
          if (resData.status === 'success' && resData.data) {
            setUser(resData.data);
          } else {
            localStorage.removeItem('token');
            navigate('/login');
          }
        } else {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch {
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fontBody }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', border: `3px solid ${t.line}`, borderTopColor: t.sky, borderRadius: '50%', margin: '0 auto 16px', animation: 'db-spin 0.8s linear infinite' }} />
          <p style={{ color: t.inkSoft, fontSize: '14px' }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const firstName = (user?.name || user?.fullName)?.split(' ')[0] || 'there';

  const glucoseHistory = [128, 132, 118, 140, 152, 145];
  const glucoseTrendUp = glucoseHistory[glucoseHistory.length - 1] > glucoseHistory[glucoseHistory.length - 2];
  const glucoseStatus = statusColor('high'); // 145 mg/dL is above the typical post-meal target

  const stats = [
    { icon: Pill, label: 'Medications', value: '3/3', unit: 'taken', accent: t.sageDeep, accentSoft: t.sageSoft, note: 'Done' },
    { icon: Apple, label: 'Meals', value: '2/3', unit: 'logged', accent: t.gold, accentSoft: t.goldSoft, note: null },
    { icon: Footprints, label: 'Steps', value: '4,250', unit: 'today', accent: t.skyDeep, accentSoft: t.skySoft, note: null },
  ];

  const recentLogs = [
    { type: 'Blood glucose', value: '145 mg/dL', time: '10:30 AM', icon: Droplet, status: 'high' },
    { type: 'Meal logged', value: 'Breakfast — Oatmeal & fruit', time: '8:00 AM', icon: Apple, status: 'ok' },
    { type: 'Medication taken', value: 'Metformin 500mg', time: '7:30 AM', icon: Pill, status: 'ok' },
  ];

  const quickActions = [
    { icon: Droplet, label: 'Log glucose', accent: t.clay, accentSoft: t.claySoft },
    { icon: Pill, label: 'Log medication', accent: t.sageDeep, accentSoft: t.sageSoft },
    { icon: Apple, label: 'Log meal', accent: t.gold, accentSoft: t.goldSoft },
    { icon: Dumbbell, label: 'Log exercise', accent: t.skyDeep, accentSoft: t.skySoft },
  ];

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', fontFamily: t.fontBody, color: t.ink }}>

      {/* Sidebar */}
      <aside style={{
        width: '224px', flexShrink: 0,
        background: t.surfaceRaised, borderRight: `1px solid ${t.line}`,
        flexDirection: 'column',
        padding: '24px 12px', position: 'sticky', top: 0, height: '100vh',
      }} className="hidden lg:flex">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px', marginBottom: '32px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: t.sky, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={16} color="#fff" />
          </div>
          <span style={{ fontSize: '17px', fontWeight: '600', color: t.ink, fontFamily: t.fontDisplay }}>DiaBuddy</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{ color: t.inkFaint, fontSize: '10px', fontWeight: '700', letterSpacing: '0.8px', padding: '0 14px', marginBottom: '8px' }}>MAIN</p>
          <NavItem icon={Home} label="Home" active={activeNav === 'home'} onClick={() => setActiveNav('home')} />
          <NavItem icon={BarChart2} label="Analytics" active={activeNav === 'analytics'} onClick={() => setActiveNav('analytics')} />
          <NavItem icon={BookOpen} label="Health logs" active={activeNav === 'logs'} onClick={() => setActiveNav('logs')} />
          <NavItem icon={MessageSquare} label="Community" active={activeNav === 'community'} onClick={() => setActiveNav('community')} />

          <p style={{ color: t.inkFaint, fontSize: '10px', fontWeight: '700', letterSpacing: '0.8px', padding: '0 14px', marginBottom: '8px', marginTop: '20px' }}>ACCOUNT</p>
          <NavItem icon={User} label="Profile" active={activeNav === 'profile'} onClick={() => setActiveNav('profile')} />
          <NavItem icon={Settings} label="Settings" active={activeNav === 'settings'} onClick={() => setActiveNav('settings')} />
        </nav>

        {/* User card */}
        <div style={{ borderTop: `1px solid ${t.line}`, paddingTop: '16px', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '10px', background: t.surface }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: t.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: '#fff', flexShrink: 0, fontFamily: t.fontDisplay }}>
              {firstName[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: t.ink, fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || user?.fullName}</p>
              <p style={{ color: t.inkFaint, fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
            </div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.inkFaint, padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.color = t.clay}
              onMouseLeave={e => e.currentTarget.style.color = t.inkFaint}
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{ background: t.surfaceRaised, borderBottom: `1px solid ${t.line}`, padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="lg:hidden">
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: t.sky, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={14} color="#fff" />
            </div>
            <span style={{ fontSize: '15px', fontWeight: '600', fontFamily: t.fontDisplay }}>DiaBuddy</span>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '320px', marginLeft: '0' }} className="hidden md:block">
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: t.inkFaint }} />
            <input
              type="text"
              placeholder="Search logs, medications…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                paddingLeft: '36px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px',
                background: t.surfaceSunken, border: `1px solid ${t.line}`, borderRadius: '9px',
                color: t.ink, fontSize: '13px', outline: 'none', fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = t.sky}
              onBlur={e => e.target.style.borderColor = t.line}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            {/* Notification */}
            <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: t.inkSoft, padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = t.surfaceSunken}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <Bell size={18} />
              <span style={{ position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px', background: t.clay, borderRadius: '50%', border: `1.5px solid ${t.surfaceRaised}` }} />
            </button>

            {/* Mobile logout */}
            <button onClick={handleLogout} className="lg:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.clay, padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 24px', overflowY: 'auto' }}>

          {/* Welcome */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ color: t.ink, fontSize: '24px', fontWeight: '500', marginBottom: '4px', letterSpacing: '-0.2px', fontFamily: t.fontDisplay }}>
                  Good morning, {firstName}
                </h1>
                <p style={{ color: t.inkSoft, fontSize: '13px' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · Here's your health snapshot
                </p>
              </div>
              <button style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', background: t.sky,
                border: 'none', borderRadius: '10px', color: '#fff',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = t.skyDeep}
                onMouseLeave={e => e.currentTarget.style.background = t.sky}
              >
                <Plus size={15} /> New log
              </button>
            </div>
          </div>

          {/* Signature element: glucose journal entry */}
          <div style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: '18px',
            padding: '24px 28px', marginBottom: '20px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', boxShadow: t.shadowCard,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: t.inkFaint, fontSize: '11px', fontWeight: '600', letterSpacing: '0.6px', marginBottom: '6px' }}>LATEST BLOOD GLUCOSE</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontFamily: t.fontDisplay, fontSize: '64px', fontWeight: '500', lineHeight: 1, color: t.ink, letterSpacing: '-1px' }}>
                    {glucoseHistory[glucoseHistory.length - 1]}
                  </span>
                  <span style={{ fontSize: '14px', color: t.inkSoft, fontWeight: 500, paddingBottom: '8px' }}>mg/dL</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px', paddingBottom: '8px',
                    color: glucoseStatus.fg, fontSize: '13px', fontWeight: 600,
                  }}>
                    {glucoseTrendUp ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                  </span>
                </div>
                {/* hand-drawn-feeling baseline rule */}
                <div style={{ height: '2px', width: '180px', background: `linear-gradient(90deg, ${t.clay}80, transparent)`, marginTop: '10px', borderRadius: '2px' }} />
                <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: glucoseStatus.bg, padding: '3px 10px', borderRadius: '20px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: glucoseStatus.fg }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: glucoseStatus.fg }}>Above target — logged 10:30 AM</span>
                </div>
              </div>

              <div style={{ paddingBottom: '6px' }}>
                <p style={{ color: t.inkFaint, fontSize: '11px', fontWeight: '600', letterSpacing: '0.6px', marginBottom: '8px' }}>LAST 6 READINGS</p>
                <Sparkline points={glucoseHistory} color={t.clay} />
              </div>
            </div>

            <button style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 16px', background: t.claySoft,
              border: `1px solid ${t.clay}40`, borderRadius: '10px', color: t.clayDeep,
              fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.15s', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#eccdba'}
              onMouseLeave={e => e.currentTarget.style.background = t.claySoft}
            >
              <Droplet size={15} /> Log new reading
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            {stats.map((s, i) => <StatCard key={i} {...s} />)}
          </div>

          {/* Content grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }} className="grid-dashboard">
            <style>{`@media(max-width:900px){ .grid-dashboard { grid-template-columns: 1fr !important; } }`}</style>

            {/* Left — activity card */}
            <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: '16px', overflow: 'hidden' }}>
              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${t.line}` }}>
                {['Overview', 'Logs', 'Analytics'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    style={{
                      flex: 1, padding: '14px 0', fontSize: '13px', fontWeight: activeTab === tab.toLowerCase() ? '600' : '500',
                      color: activeTab === tab.toLowerCase() ? t.skyDeep : t.inkSoft,
                      background: 'none', border: 'none', borderBottom: activeTab === tab.toLowerCase() ? `2px solid ${t.sky}` : '2px solid transparent',
                      cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', marginBottom: '-1px',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div style={{ padding: '20px' }}>
                {activeTab === 'overview' && (
                  <div>
                    <p style={{ color: t.inkFaint, fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '14px' }}>TODAY'S ACTIVITY</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {recentLogs.map((log, i) => {
                        const sc = statusColor(log.status);
                        const Icon = log.icon;
                        return (
                          <div
                            key={i}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '14px',
                              padding: '14px', background: t.surfaceSunken, borderRadius: '12px',
                              border: `1px solid ${t.line}`, cursor: 'pointer', transition: 'border-color 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = t.sky + '50'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = t.line}
                          >
                            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Icon size={16} color={sc.fg} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ color: t.ink, fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>{log.type}</p>
                              <p style={{ color: t.inkSoft, fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.value}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                              <span style={{ color: t.inkFaint, fontSize: '12px' }}>{log.time}</span>
                              <span style={{
                                fontSize: '11px', padding: '2px 9px', borderRadius: '20px', fontWeight: '600',
                                background: sc.bg, color: sc.fg,
                              }}>
                                {log.status === 'high' ? 'High' : 'OK'}
                              </span>
                              <ChevronRight size={15} color={t.inkFaint} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'logs' && (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <BookOpen size={36} color={t.lineStrong} style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: t.inkSoft, fontSize: '14px', marginBottom: '16px' }}>All your health logs in one place</p>
                    <button style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: t.sky, border: 'none', borderRadius: '9px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <Plus size={15} /> Add first log
                    </button>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <TrendingUp size={36} color={t.sky} style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: t.ink, fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Analytics coming soon</p>
                    <p style={{ color: t.inkSoft, fontSize: '13px' }}>Your trends and insights will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Quick actions */}
              <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: '16px', padding: '20px' }}>
                <p style={{ color: t.inkFaint, fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '14px' }}>QUICK LOG</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {quickActions.map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <button
                        key={i}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '11px 12px', background: t.surfaceSunken,
                          border: `1px solid ${t.line}`, borderRadius: '10px',
                          cursor: 'pointer', transition: 'all 0.15s', width: '100%', textAlign: 'left',
                          fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = a.accent + '50'; e.currentTarget.style.background = a.accentSoft; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = t.line; e.currentTarget.style.background = t.surfaceSunken; }}
                      >
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: a.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={14} color={a.accent} />
                        </div>
                        <span style={{ color: t.ink, fontSize: '13px', fontWeight: '500', flex: 1 }}>{a.label}</span>
                        <ChevronRight size={14} color={t.inkFaint} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Next reminder */}
              <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: '16px', padding: '20px' }}>
                <p style={{ color: t.inkFaint, fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '14px' }}>NEXT REMINDER</p>
                <div style={{ background: t.goldTint, border: `1px solid ${t.gold}30`, borderRadius: '12px', padding: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: t.goldSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlarmClock size={17} color={t.gold} />
                  </div>
                  <div>
                    <p style={{ color: t.ink, fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>Insulin shot</p>
                    <p style={{ color: '#8a6b22', fontSize: '12px' }}>In 2 hours · 2:30 PM</p>
                  </div>
                </div>
              </div>

              {/* Community */}
              <div style={{ background: t.sageTint, border: `1px solid ${t.sage}30`, borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <MessageSquare size={18} color={t.sageDeep} />
                  <p style={{ color: t.ink, fontSize: '14px', fontWeight: '600' }}>Community forum</p>
                </div>
                <p style={{ color: t.inkSoft, fontSize: '12px', lineHeight: '1.6', marginBottom: '14px' }}>
                  Connect with 12,000+ members. Share experiences and get support.
                </p>
                <button style={{ width: '100%', padding: '10px', background: t.sageSoft, border: `1px solid ${t.sage}50`, borderRadius: '9px', color: t.sageDeep, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#d3dcc6'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = t.sageSoft; }}
                >
                  Visit forum →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
