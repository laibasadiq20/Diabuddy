import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';
import AppSidebar from '../../components/AppSidebar';
import {
  ArrowRight,
  BarChart3,
  Bell,
  ClipboardList,
  Droplets,
  Dumbbell,
  Flame,
  Footprints,
  GlassWater,
  Lightbulb,
  MessageSquare,
  Pill,
  Syringe,
  Target,
  Users,
  Utensils,
  Wrench,
} from 'lucide-react';

const t = theme;
const TIR_LOW = 70;
const TIR_HIGH = 180;

function parseGlucoseNumber(value) {
  if (value == null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
  const n = parseFloat(String(value));
  return Number.isFinite(n) ? Math.round(n) : null;
}

function formatSteps(n) {
  if (n == null || n <= 0) return '—';
  return n.toLocaleString();
}

const tooltipStyle = {
  background: '#fff',
  border: `1px solid ${t.lineStrong}`,
  borderRadius: 10,
  fontSize: 12,
  color: t.ink,
  boxShadow: t.shadowCard,
};

export default function Dashboard() {
  const { user, authHeaders } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [weekReport, setWeekReport] = useState(null);
  const [streak, setStreak] = useState(null);
  const [latestPost, setLatestPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name?.split(' ')[0] || 'Buddy';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const latestGlucose = parseGlucoseNumber(summary?.glucose?.value);
  const glucoseCount = summary?.glucose?.count || 0;
  const mealsToday = summary?.meals?.value || 0;
  const insulinToday = summary?.insulin?.value || 0;
  const medsToday = summary?.medications?.value || 0;
  const waterToday = summary?.water?.value || 0;
  const waterGoal = summary?.water?.goal || 2000;
  const exerciseToday = summary?.exercise?.value || 0;
  const stepsToday = summary?.steps?.value || 0;
  const stepsGoal = summary?.steps?.goal || 8000;

  const weekMetrics = weekReport?.period?.metrics;
  const tir = weekMetrics?.timeInRangePercent;
  const insights = (weekReport?.insights || []).slice(0, 2);

  const chartData = useMemo(() => {
    const daily = weekReport?.period?.charts?.daily || [];
    return daily
      .filter((d) => d.avgGlucose != null)
      .map((d) => ({
        label: d.label,
        avgGlucose: d.avgGlucose,
      }));
  }, [weekReport]);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;

    const load = async () => {
      try {
        const headers = { ...authHeaders() };
        const tzOffset = new Date().getTimezoneOffset();
        const [sumRes, reportRes, streakRes, postRes] = await Promise.all([
          fetch(`${API_URL}/health-logs/summary?tzOffset=${tzOffset}`, {
            credentials: 'include',
            headers,
          }),
          fetch(`${API_URL}/health-logs/report?preset=7d&tzOffset=${tzOffset}`, {
            credentials: 'include',
            headers,
          }),
          fetch(`${API_URL}/health-logs/streak?tzOffset=${tzOffset}`, {
            credentials: 'include',
            headers,
          }),
          fetch(`${API_URL}/posts?sort=latest&page=1&limit=1`, {
            credentials: 'include',
            headers,
          }),
        ]);

        if (cancelled) return;

        if (sumRes.ok) {
          const data = await sumRes.json();
          if (data?.status === 'success') setSummary(data.data);
        }
        if (reportRes.ok) {
          const data = await reportRes.json();
          if (data?.status === 'success') setWeekReport(data.data);
        }
        if (streakRes.ok) {
          const data = await streakRes.json();
          if (data?.status === 'success') setStreak(data.data);
        }
        if (postRes.ok) {
          const data = await postRes.json();
          setLatestPost(data?.posts?.[0] || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const id = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [user]);

  return (
    <div className="db-home">
      <AppSidebar />

      <main className="db-home-main">
        <div className="db-home-inner">
          <header className="db-home-hero">
            <div>
              <p className="db-home-kicker">{today}</p>
              <h1>
                {greeting}, <em>{firstName}</em>
              </h1>
              <p className="db-home-lead">
                {loading
                  ? 'Loading today’s picture…'
                  : 'Here’s how your health looks from your logs.'}
              </p>
            </div>
          </header>

          {/* Glance */}
          <section className="db-home-glance" aria-label="Today at a glance">
            <p className="db-home-kicker">Today at a glance</p>
            <div className="db-home-glance-grid">
              <button type="button" className="db-home-glance-card" onClick={() => navigate('/logs/glucose')}>
                <span className="db-home-glance-icon" style={{ background: t.skySoft, color: t.skyDeep }}>
                  <Droplets size={16} />
                </span>
                <span className="db-home-glance-label">Glucose</span>
                <strong>
                  {latestGlucose != null ? latestGlucose : '—'}
                  {latestGlucose != null ? <small>mg/dL</small> : null}
                </strong>
                <span className="db-home-glance-sub">
                  {glucoseCount > 0 ? `${glucoseCount} reading${glucoseCount === 1 ? '' : 's'}` : 'No reading yet'}
                </span>
              </button>

              <button type="button" className="db-home-glance-card" onClick={() => navigate('/reports')}>
                <span className="db-home-glance-icon" style={{ background: t.sageSoft, color: t.sageDeep }}>
                  <Target size={16} />
                </span>
                <span className="db-home-glance-label">Time in range</span>
                <strong>{tir != null ? `${tir}%` : '—'}</strong>
                <span className="db-home-glance-sub">{TIR_LOW}–{TIR_HIGH} mg/dL · 7 days</span>
              </button>

              <button type="button" className="db-home-glance-card" onClick={() => navigate('/logs/exercise')}>
                <span className="db-home-glance-icon" style={{ background: t.goldSoft, color: t.gold }}>
                  <Footprints size={16} />
                </span>
                <span className="db-home-glance-label">Steps</span>
                <strong>{formatSteps(stepsToday)}</strong>
                <span className="db-home-glance-sub">
                  {stepsToday > 0 ? `of ${stepsGoal.toLocaleString()} goal` : 'Log activity to add steps'}
                </span>
              </button>

              <button type="button" className="db-home-glance-card" onClick={() => navigate('/logs/water')}>
                <span className="db-home-glance-icon" style={{ background: t.skyTint, color: t.sky }}>
                  <GlassWater size={16} />
                </span>
                <span className="db-home-glance-label">Water</span>
                <strong>
                  {waterToday > 0 ? (waterToday >= 1000 ? `${(waterToday / 1000).toFixed(1)}` : waterToday) : '—'}
                  {waterToday > 0 ? <small>{waterToday >= 1000 ? 'L' : 'ml'}</small> : null}
                </strong>
                <span className="db-home-glance-sub">of {(waterGoal / 1000).toFixed(1)} L goal</span>
              </button>

              <button type="button" className="db-home-glance-card" onClick={() => navigate('/logs')}>
                <span className="db-home-glance-icon" style={{ background: t.claySoft, color: t.clayDeep }}>
                  <Flame size={16} />
                </span>
                <span className="db-home-glance-label">Streak</span>
                <strong>
                  {streak?.currentStreak ?? 0}
                  <small>days</small>
                </strong>
                <span className="db-home-glance-sub">
                  {streak?.atRisk ? 'At risk — log today' : streak?.currentStreak ? 'Keep it going' : 'Start today'}
                </span>
              </button>
            </div>
          </section>

          {/* Chart + chips row */}
          <div className="db-home-mid">
            <section className="db-home-chart-card" aria-label="Glucose trend">
              <header className="db-home-card-head">
                <div>
                  <p className="db-home-kicker">Glucose trend</p>
                  <h2>Last 7 days</h2>
                </div>
                <button type="button" className="db-home-text-link" onClick={() => navigate('/reports')}>
                  Full report
                  <ArrowRight size={14} />
                </button>
              </header>

              {chartData.length > 0 ? (
                <div className="db-home-chart-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dbHomeGlu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={t.sage} stopOpacity={0.28} />
                          <stop offset="100%" stopColor={t.sage} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={t.line} strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: t.inkFaint, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fill: t.inkFaint, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={36}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => [`${value} mg/dL`, 'Avg']}
                      />
                      <ReferenceLine y={TIR_HIGH} stroke={t.clay} strokeDasharray="4 4" strokeOpacity={0.55} />
                      <ReferenceLine y={TIR_LOW} stroke={t.sky} strokeDasharray="4 4" strokeOpacity={0.55} />
                      <Area
                        type="monotone"
                        dataKey="avgGlucose"
                        stroke={t.sageDeep}
                        fill="url(#dbHomeGlu)"
                        strokeWidth={2.25}
                        dot={false}
                        activeDot={{ r: 4, fill: t.sageDeep }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="db-home-chart-empty">
                  <p>No glucose readings in the last 7 days yet.</p>
                  <button type="button" onClick={() => navigate('/logs/glucose')}>
                    Log a reading
                  </button>
                </div>
              )}

              {latestGlucose != null && (
                <p className="db-home-chart-footnote">
                  Latest today: <strong>{latestGlucose} mg/dL</strong>
                  {glucoseCount > 0 ? ` · ${glucoseCount} reading${glucoseCount === 1 ? '' : 's'}` : ''}
                </p>
              )}
            </section>

            <section className="db-home-side-stack">
              <div className="db-home-panel">
                <header className="db-home-card-head">
                  <div>
                    <p className="db-home-kicker">Logs summary</p>
                    <h2>Today</h2>
                  </div>
                </header>
                <div className="db-home-chips">
                  <button type="button" className="db-home-chip" onClick={() => navigate('/logs/meal')}>
                    <Utensils size={15} />
                    <span>
                      <strong>Meals</strong>
                      <em>{mealsToday} logged</em>
                    </span>
                  </button>
                  <button type="button" className="db-home-chip" onClick={() => navigate('/logs/insulin')}>
                    <Syringe size={15} />
                    <span>
                      <strong>Insulin</strong>
                      <em>{insulinToday > 0 ? `${insulinToday} u` : 'None yet'}</em>
                    </span>
                  </button>
                  <button type="button" className="db-home-chip" onClick={() => navigate('/logs/medication')}>
                    <Pill size={15} />
                    <span>
                      <strong>Medications</strong>
                      <em>{medsToday > 0 ? `${medsToday} taken` : 'None yet'}</em>
                    </span>
                  </button>
                  <button type="button" className="db-home-chip" onClick={() => navigate('/logs/water')}>
                    <GlassWater size={15} />
                    <span>
                      <strong>Water</strong>
                      <em>
                        {waterToday > 0
                          ? `${waterToday >= 1000 ? `${(waterToday / 1000).toFixed(1)} L` : `${waterToday} ml`}`
                          : 'None yet'}
                      </em>
                    </span>
                  </button>
                  <button type="button" className="db-home-chip" onClick={() => navigate('/logs/exercise')}>
                    <Dumbbell size={15} />
                    <span>
                      <strong>Exercise</strong>
                      <em>
                        {exerciseToday > 0
                          ? `${exerciseToday} min${stepsToday > 0 ? ` · ${stepsToday.toLocaleString()} steps` : ''}`
                          : 'None yet'}
                      </em>
                    </span>
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div className="db-home-duo">
            <section className="db-home-panel">
              <header className="db-home-card-head">
                <div>
                  <p className="db-home-kicker">Insights</p>
                  <h2>For you</h2>
                </div>
                <button type="button" className="db-home-text-link" onClick={() => navigate('/reports')}>
                  More
                  <ArrowRight size={14} />
                </button>
              </header>
              {insights.length > 0 ? (
                <ul className="db-home-insights">
                  {insights.map((ins) => (
                    <li key={ins.message}>
                      <Lightbulb size={15} />
                      <span>{ins.message}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="db-home-empty-note">
                  Log glucose or meals this week to unlock short insights.
                </p>
              )}
            </section>

            <section className="db-home-panel db-home-panel--community">
              <header className="db-home-card-head">
                <div>
                  <p className="db-home-kicker">Community</p>
                  <h2>From the forum</h2>
                </div>
                <button type="button" className="db-home-text-link" onClick={() => navigate('/community')}>
                  Open
                  <ArrowRight size={14} />
                </button>
              </header>
              <button
                type="button"
                className="db-home-community"
                onClick={() =>
                  navigate(latestPost?._id ? `/community/posts/${latestPost._id}` : '/community')
                }
              >
                <span className="db-home-community-icon">
                  <Users size={18} strokeWidth={1.75} />
                </span>
                <span className="db-home-community-body">
                  <strong>
                    {latestPost?.title || 'Join the conversation'}
                  </strong>
                  <em>
                    {latestPost?.title
                      ? 'Latest post in the community'
                      : 'Ask a question or see what others shared'}
                  </em>
                </span>
                <ArrowRight size={16} color={t.sageDeep} />
              </button>
            </section>
          </div>

          {/* Quick actions */}
          <section className="db-home-actions" aria-label="Quick actions">
            <header className="db-home-card-head">
              <div>
                <p className="db-home-kicker">Navigate</p>
                <h2>Quick actions</h2>
              </div>
            </header>
            <div className="db-home-action-row">
              <button type="button" className="db-home-action" onClick={() => navigate('/logs')}>
                <ClipboardList size={16} />
                Logs
              </button>
              <button type="button" className="db-home-action" onClick={() => navigate('/reports')}>
                <BarChart3 size={16} />
                Reports
              </button>
              <button type="button" className="db-home-action" onClick={() => navigate('/messages')}>
                <MessageSquare size={16} />
                Messages
              </button>
              <button type="button" className="db-home-action" onClick={() => navigate('/reminders')}>
                <Bell size={16} />
                Reminders
              </button>
              <button type="button" className="db-home-action" onClick={() => navigate('/toolbox')}>
                <Wrench size={16} />
                Toolbox
              </button>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        .db-home {
          min-height: 100dvh;
          display: flex;
          background:
            radial-gradient(ellipse 65% 40% at 0% -8%, rgba(125, 143, 111, 0.18), transparent 55%),
            radial-gradient(ellipse 45% 30% at 100% 0%, rgba(94, 135, 160, 0.12), transparent 50%),
            linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 42%);
          font-family: ${t.fontBody};
          color: ${t.ink};
        }
        .db-home-main {
          flex: 1;
          min-width: 0;
          padding: 26px 20px calc(110px + env(safe-area-inset-bottom, 0px));
        }
        .db-home-inner {
          max-width: 980px;
          margin: 0 auto;
        }
        .db-home-kicker {
          margin: 0 0 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${t.inkFaint};
        }
        .db-home-hero {
          margin-bottom: 22px;
        }
        .db-home-hero h1 {
          margin: 0;
          font-family: ${t.fontDisplay};
          font-size: clamp(28px, 5vw, 38px);
          font-weight: 500;
          letter-spacing: -0.03em;
          line-height: 1.12;
        }
        .db-home-hero h1 em {
          font-style: italic;
          color: ${t.sageDeep};
        }
        .db-home-lead {
          margin: 8px 0 0;
          font-size: 14px;
          color: ${t.inkSoft};
          line-height: 1.45;
        }

        .db-home-glance { margin-bottom: 18px; }
        .db-home-glance-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
        }
        .db-home-glance-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          text-align: left;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid ${t.lineStrong};
          background: rgba(255,255,255,0.88);
          cursor: pointer;
          font-family: ${t.fontBody};
          min-width: 0;
          transition: border-color 0.15s ease;
        }
        .db-home-glance-icon {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2px;
        }
        .db-home-glance-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: ${t.inkFaint};
        }
        .db-home-glance-card strong {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: ${t.ink};
        }
        .db-home-glance-card strong small {
          margin-left: 4px;
          font-size: 11px;
          font-weight: 600;
          color: ${t.inkSoft};
        }
        .db-home-glance-sub {
          font-size: 11px;
          color: ${t.inkSoft};
          line-height: 1.35;
        }

        .db-home-mid {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.9fr);
          gap: 14px;
          margin-bottom: 18px;
          align-items: start;
        }
        .db-home-chart-card,
        .db-home-panel,
        .db-home-actions {
          background: #fff;
          border: 1px solid ${t.lineStrong};
          border-radius: 18px;
          padding: 16px;
          box-shadow: ${t.shadowCard};
        }
        .db-home-card-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }
        .db-home-card-head h2 {
          margin: 0;
          font-family: ${t.fontDisplay};
          font-size: 20px;
          font-weight: 500;
          letter-spacing: -0.02em;
        }
        .db-home-text-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: none;
          background: none;
          color: ${t.forest};
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          font-family: ${t.fontBody};
          padding: 2px 0;
          flex-shrink: 0;
        }
        .db-home-chart-body {
          height: 240px;
          width: 100%;
        }
        .db-home-chart-empty {
          height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: ${t.inkSoft};
          font-size: 13px;
          background: ${t.surfaceSunken};
          border-radius: 12px;
        }
        .db-home-chart-empty button {
          border: none;
          background: ${t.forest};
          color: #fff;
          border-radius: 10px;
          padding: 9px 14px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          font-family: ${t.fontBody};
        }
        .db-home-chart-footnote {
          margin: 10px 0 0;
          font-size: 12px;
          color: ${t.inkSoft};
        }
        .db-home-chart-footnote strong { color: ${t.ink}; }

        .db-home-side-stack {
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-width: 0;
        }
        .db-home-duo {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 18px;
          align-items: stretch;
        }
        .db-home-duo > .db-home-panel {
          min-height: 100%;
        }
        .db-home-panel--community {
          background: linear-gradient(165deg, ${t.sageTint} 0%, #fff 48%, ${t.skyTint} 100%);
          border-color: ${t.sage}55;
          box-shadow: 0 1px 2px rgba(98, 121, 90, 0.06), 0 10px 28px rgba(98, 121, 90, 0.08);
        }
        .db-home-panel--community .db-home-kicker {
          color: ${t.sageDeep};
        }
        .db-home-panel--community .db-home-text-link {
          color: ${t.sageDeep};
        }
        .db-home-chips {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .db-home-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          text-align: left;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid ${t.line};
          background: ${t.surfaceSunken};
          cursor: pointer;
          font-family: ${t.fontBody};
          color: ${t.inkSoft};
        }
        .db-home-chip span {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }
        .db-home-chip strong {
          font-size: 13px;
          font-weight: 700;
          color: ${t.ink};
        }
        .db-home-chip em {
          font-style: normal;
          font-size: 12px;
          color: ${t.inkSoft};
        }

        .db-home-insights {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .db-home-insights li {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 10px 12px;
          border-radius: 12px;
          background: ${t.sageTint};
          color: ${t.inkSoft};
          font-size: 13px;
          line-height: 1.45;
        }
        .db-home-insights li svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: ${t.sageDeep};
        }
        .db-home-empty-note {
          margin: 0;
          font-size: 13px;
          color: ${t.inkSoft};
          line-height: 1.45;
        }
        .db-home-community {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          text-align: left;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid ${t.sage}40;
          background: rgba(255, 255, 255, 0.72);
          cursor: pointer;
          font-family: ${t.fontBody};
        }
        .db-home-community-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: ${t.sageSoft};
          color: ${t.sageDeep};
          flex-shrink: 0;
        }
        .db-home-community-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .db-home-community-body strong {
          font-size: 14px;
          font-weight: 700;
          color: ${t.ink};
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .db-home-community-body em {
          font-style: normal;
          font-size: 12px;
          color: ${t.inkSoft};
        }

        .db-home-action-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .db-home-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid ${t.lineStrong};
          background: ${t.surfaceSunken};
          color: ${t.ink};
          border-radius: 999px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          font-family: ${t.fontBody};
          min-height: 40px;
        }
        .db-home-action--muted {
          background: #fff;
          color: ${t.inkSoft};
        }

        @media (hover: hover) and (pointer: fine) {
          .db-home-glance-card:hover,
          .db-home-chip:hover,
          .db-home-action:hover {
            border-color: ${t.forest};
          }
        }

        @media (max-width: 900px) {
          .db-home-mid { grid-template-columns: 1fr; }
          .db-home-duo { grid-template-columns: 1fr; }
          .db-home-glance-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .db-home-main {
            padding: 16px 14px calc(112px + env(safe-area-inset-bottom, 0px));
          }
          .db-home-glance-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .db-home-glance-grid .db-home-glance-card:last-child {
            grid-column: 1 / -1;
          }
          .db-home-chart-body { height: 200px; }
          .db-home-action-row { gap: 8px; }
          .db-home-action { flex: 1 1 calc(50% - 8px); justify-content: center; }
        }
      `}</style>
    </div>
  );
}
