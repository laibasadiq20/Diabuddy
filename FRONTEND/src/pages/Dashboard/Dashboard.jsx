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
import { fromMgdl, glucoseUnitLabel } from '../../utils/glucoseUnits';
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Droplets,
  Dumbbell,
  Flame,
  Footprints,
  GlassWater,
  Lightbulb,
  Pill,
  Syringe,
  Target,
  Users,
  Utensils,
  Watch,
} from 'lucide-react';

const t = theme;
// Backend always reports glucose in mg/dL; these are the mg/dL thresholds
// converted for display via fromMgdl() based on the user's glucoseUnit preference.
const TIR_LOW_MGDL = 70;
const TIR_HIGH_MGDL = 180;

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

  const glucoseUnit = user?.glucoseUnit === 'mmol/L' ? 'mmol/L' : 'mg/dL';
  const unitLabel = glucoseUnitLabel(glucoseUnit);
  const latestGlucose = fromMgdl(summary?.glucose?.valueMgDl, glucoseUnit);
  const glucoseCount = summary?.glucose?.count || 0;
  const tirLow = fromMgdl(TIR_LOW_MGDL, glucoseUnit);
  const tirHigh = fromMgdl(TIR_HIGH_MGDL, glucoseUnit);
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
        avgGlucose: fromMgdl(d.avgGlucose, glucoseUnit),
      }));
  }, [weekReport, glucoseUnit]);

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

  const waterLabel =
    waterToday > 0
      ? waterToday >= 1000
        ? `${(waterToday / 1000).toFixed(1)} L`
        : `${waterToday} ml`
      : '—';

  const waterPct = Math.min(100, Math.round((waterToday / waterGoal) * 100));
  const stepsPct = Math.min(100, Math.round((stepsToday / stepsGoal) * 100));

  const nextAction = useMemo(() => {
    if (loading) return null;
    if (!glucoseCount) {
      return { label: 'Log a glucose reading', path: '/logs/glucose' };
    }
    if (!mealsToday && hour >= 11) {
      return { label: 'Add a meal when you eat', path: '/logs/meal' };
    }
    if (mealsToday > 0 && !insulinToday && hour >= 12) {
      return { label: 'Log insulin if you took a dose', path: '/logs/insulin' };
    }
    if (waterToday < waterGoal * 0.4) {
      return { label: 'Log water toward your daily goal', path: '/logs/water' };
    }
    if (!exerciseToday && stepsToday === 0 && hour >= 16) {
      return { label: 'Log activity or connect a watch for steps', path: '/logs/exercise' };
    }
    return { label: 'Review your weekly report', path: '/reports' };
  }, [
    loading,
    glucoseCount,
    mealsToday,
    insulinToday,
    waterToday,
    waterGoal,
    exerciseToday,
    stepsToday,
    hour,
  ]);

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
                  : 'A clear view of your logs, trends, and community.'}
              </p>
            </div>
            <button type="button" className="db-home-hero-cta" onClick={() => navigate('/logs')}>
              Open logs
              <ArrowRight size={16} />
            </button>
          </header>

          {streak?.atRisk && (
            <button
              type="button"
              className="db-home-alert"
              onClick={() => navigate('/logs')}
            >
              <AlertTriangle size={16} />
              <span>
                <strong>{streak.currentStreak}-day streak at risk.</strong>
                {' '}Log anything today to keep it.
              </span>
              <ArrowRight size={14} />
            </button>
          )}

          {nextAction && (
            <button
              type="button"
              className="db-home-next"
              onClick={() => navigate(nextAction.path)}
            >
              <span>Next</span>
              <strong>{nextAction.label}</strong>
              <ArrowRight size={14} />
            </button>
          )}

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
                  {latestGlucose != null ? <small>{unitLabel}</small> : null}
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
                <span className="db-home-glance-sub">{tirLow}–{tirHigh} {unitLabel} · 7 days</span>
              </button>

              <button type="button" className="db-home-glance-card" onClick={() => navigate('/logs/exercise')}>
                <span className="db-home-glance-icon" style={{ background: t.goldSoft, color: t.gold }}>
                  <Footprints size={16} />
                </span>
                <span className="db-home-glance-label">Steps</span>
                <strong>{formatSteps(stepsToday)}</strong>
                <span className="db-home-glance-sub">
                  {stepsToday > 0
                    ? `of ${stepsGoal.toLocaleString()} goal`
                    : 'Manual activity or watch'}
                </span>
                <span className="db-home-glance-bar" aria-hidden>
                  <span style={{ width: `${stepsPct}%` }} />
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
                <span className="db-home-glance-bar" aria-hidden>
                  <span style={{ width: `${waterPct}%` }} />
                </span>
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

          <button
            type="button"
            className="db-home-watch"
            onClick={() => navigate('/google-health')}
          >
            <span className="db-home-watch-icon">
              <Watch size={18} strokeWidth={1.75} />
            </span>
            <span className="db-home-watch-copy">
              <strong>Connect smartwatch</strong>
              <em>Sync steps, calories, and distance with Google Health.</em>
            </span>
            <span className="db-home-watch-cta">
              Open
              <ArrowRight size={14} />
            </span>
          </button>

          <div className="db-home-mid">
            <section className="db-home-chart-card" aria-label="Glucose trend">
              <header className="db-home-card-head">
                <div>
                  <p className="db-home-kicker">Glucose</p>
                  <h2>7-day trend</h2>
                </div>
                <button type="button" className="db-home-text-link" onClick={() => navigate('/reports')}>
                  Full report
                  <ArrowRight size={14} />
                </button>
              </header>

              {chartData.length > 0 ? (
                <div className="db-home-chart-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dbHomeGlu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={t.sage} stopOpacity={0.3} />
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
                        width={34}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => [`${value} ${unitLabel}`, 'Avg']}
                      />
                      <ReferenceLine y={tirHigh} stroke={t.clay} strokeDasharray="4 4" strokeOpacity={0.5} />
                      <ReferenceLine y={tirLow} stroke={t.sky} strokeDasharray="4 4" strokeOpacity={0.5} />
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
                  <p>No glucose readings in the last 7 days.</p>
                  <button type="button" onClick={() => navigate('/logs/glucose')}>
                    Log a reading
                  </button>
                </div>
              )}

              {latestGlucose != null && (
                <p className="db-home-chart-footnote">
                  Latest today <strong>{latestGlucose} {unitLabel}</strong>
                  {glucoseCount > 0 ? ` · ${glucoseCount} reading${glucoseCount === 1 ? '' : 's'}` : ''}
                </p>
              )}
            </section>

            <section className="db-home-today-panel" aria-label="Today’s logs">
              <header className="db-home-card-head">
                <div>
                  <p className="db-home-kicker">Today</p>
                  <h2>Log summary</h2>
                </div>
              </header>
              <div className="db-home-today-grid">
                <button type="button" className="db-home-today-cell" onClick={() => navigate('/logs/meal')}>
                  <Utensils size={16} />
                  <strong>{mealsToday}</strong>
                  <span>Meals</span>
                </button>
                <button type="button" className="db-home-today-cell" onClick={() => navigate('/logs/insulin')}>
                  <Syringe size={16} />
                  <strong>{insulinToday > 0 ? insulinToday : '—'}</strong>
                  <span>Insulin{insulinToday > 0 ? ' u' : ''}</span>
                </button>
                <button type="button" className="db-home-today-cell" onClick={() => navigate('/logs/medication')}>
                  <Pill size={16} />
                  <strong>{medsToday > 0 ? medsToday : '—'}</strong>
                  <span>Meds</span>
                </button>
                <button type="button" className="db-home-today-cell" onClick={() => navigate('/logs/water')}>
                  <GlassWater size={16} />
                  <strong>{waterLabel}</strong>
                  <span>Water</span>
                </button>
                <button type="button" className="db-home-today-cell" onClick={() => navigate('/logs/exercise')}>
                  <Dumbbell size={16} />
                  <strong>
                    {exerciseToday > 0 || stepsToday > 0
                      ? `${exerciseToday > 0 ? `${exerciseToday}m` : '—'}${stepsToday > 0 ? ` · ${formatSteps(stepsToday)}` : ''}`
                      : '—'}
                  </strong>
                  <span>Exercise</span>
                </button>
                <button type="button" className="db-home-today-cell" onClick={() => navigate('/logs')}>
                  <ClipboardList size={16} />
                  <strong>All</strong>
                  <span>Open logs</span>
                </button>
              </div>
            </section>
          </div>

          <div className="db-home-duo">
            <section className="db-home-panel db-home-panel--insights">
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
                      <Lightbulb size={16} />
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

            <button
              type="button"
              className="db-home-community-fill"
              onClick={() =>
                navigate(latestPost?._id ? `/community/posts/${latestPost._id}` : '/community')
              }
            >
              <div className="db-home-community-fill-top">
                <p className="db-home-kicker">Community</p>
                <span className="db-home-community-badge">
                  <Users size={14} />
                  Forum
                </span>
              </div>
              <h2>{latestPost?.title || 'Join the DiaBuddy community'}</h2>
              <p>
                {latestPost?.title
                  ? 'Latest from the forum — open to read and reply.'
                  : 'Ask questions, share what works, and learn with people who get it.'}
              </p>
              <span className="db-home-community-cta">
                {latestPost?._id ? 'Read post' : 'Open community'}
                <ArrowRight size={16} />
              </span>
            </button>
          </div>
        </div>
      </main>

      <style>{`
        .db-home {
          min-height: 100dvh;
          display: flex;
          background:
            radial-gradient(ellipse 60% 38% at 0% -6%, rgba(125, 143, 111, 0.16), transparent 55%),
            radial-gradient(ellipse 42% 28% at 100% 0%, rgba(94, 135, 160, 0.1), transparent 50%),
            linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 36%);
          font-family: ${t.fontBody};
          color: ${t.ink};
        }
        .db-home-main {
          flex: 1;
          min-width: 0;
          padding: 28px 22px calc(110px + env(safe-area-inset-bottom, 0px));
        }
        .db-home-inner {
          max-width: 1040px;
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
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
          padding-bottom: 18px;
          border-bottom: 1px solid ${t.line};
        }
        .db-home-hero h1 {
          margin: 0;
          font-family: ${t.fontDisplay};
          font-size: clamp(28px, 4.8vw, 40px);
          font-weight: 500;
          letter-spacing: -0.03em;
          line-height: 1.1;
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
          max-width: 40ch;
        }
        .db-home-hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          border: none;
          border-radius: 12px;
          padding: 12px 16px;
          background: ${t.forest};
          color: #F7F3EC;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: ${t.fontBody};
          min-height: 44px;
        }

        .db-home-alert {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
          margin-bottom: 10px;
          padding: 11px 14px;
          border-radius: 12px;
          border: 1px solid ${t.clay}55;
          background: ${t.claySoft};
          color: ${t.clayDeep};
          cursor: pointer;
          font-family: ${t.fontBody};
          font-size: 13px;
          line-height: 1.4;
        }
        .db-home-alert svg:first-child { flex-shrink: 0; }
        .db-home-alert span { flex: 1; min-width: 0; }
        .db-home-alert strong { font-weight: 700; }
        .db-home-alert svg:last-child { flex-shrink: 0; opacity: 0.7; }

        .db-home-next {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
          margin-bottom: 16px;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid ${t.line};
          background: rgba(255, 255, 255, 0.72);
          cursor: pointer;
          font-family: ${t.fontBody};
        }
        .db-home-next > span:first-child {
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${t.inkFaint};
        }
        .db-home-next strong {
          flex: 1;
          min-width: 0;
          font-size: 13px;
          font-weight: 600;
          color: ${t.ink};
        }
        .db-home-next svg {
          flex-shrink: 0;
          color: ${t.forest};
        }

        .db-home-glance { margin-bottom: 14px; }
        .db-home-glance-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
        }
        .db-home-glance-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          text-align: left;
          padding: 14px 14px 16px;
          border-radius: 16px;
          border: 1px solid ${t.lineStrong};
          background: rgba(255, 255, 255, 0.92);
          cursor: pointer;
          font-family: ${t.fontBody};
          min-width: 0;
          box-shadow: ${t.shadowCard};
          transition: border-color 0.15s ease;
          overflow: hidden;
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
        .db-home-glance-bar {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 3px;
          background: ${t.line};
        }
        .db-home-glance-bar > span {
          display: block;
          height: 100%;
          background: ${t.sage};
          border-radius: 0 2px 0 0;
          max-width: 100%;
        }

        .db-home-watch {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
          margin-bottom: 16px;
          padding: 11px 14px;
          border-radius: 14px;
          border: 1px solid ${t.gold}40;
          background: linear-gradient(100deg, ${t.goldTint} 0%, #fff 58%);
          cursor: pointer;
          font-family: ${t.fontBody};
        }
        .db-home-watch-icon {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: ${t.goldSoft};
          color: ${t.gold};
          flex-shrink: 0;
        }
        .db-home-watch-copy {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .db-home-watch-copy strong {
          font-size: 13px;
          font-weight: 700;
          color: ${t.ink};
        }
        .db-home-watch-copy em {
          font-style: normal;
          font-size: 12px;
          color: ${t.inkSoft};
          line-height: 1.35;
        }
        .db-home-watch-cta {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
          font-size: 12px;
          font-weight: 700;
          color: ${t.gold};
        }

        .db-home-mid {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.85fr);
          gap: 14px;
          margin-bottom: 14px;
          align-items: stretch;
        }
        .db-home-chart-card,
        .db-home-today-panel,
        .db-home-panel {
          background: #fff;
          border: 1px solid ${t.lineStrong};
          border-radius: 18px;
          padding: 16px 18px;
          box-shadow: ${t.shadowCard};
        }
        .db-home-card-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }
        .db-home-card-head h2,
        .db-home-community-fill h2 {
          margin: 0;
          font-family: ${t.fontDisplay};
          font-size: 22px;
          font-weight: 500;
          letter-spacing: -0.02em;
          color: ${t.ink};
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
          min-height: 36px;
        }
        .db-home-chart-body {
          height: 250px;
          width: 100%;
          min-width: 0;
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
          padding: 16px;
          text-align: center;
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
          min-height: 40px;
        }
        .db-home-chart-footnote {
          margin: 10px 0 0;
          font-size: 12px;
          color: ${t.inkSoft};
        }
        .db-home-chart-footnote strong { color: ${t.ink}; }

        .db-home-today-panel {
          display: flex;
          flex-direction: column;
          min-height: 100%;
        }
        .db-home-today-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          flex: 1;
        }
        .db-home-today-cell {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          text-align: left;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid ${t.line};
          background: ${t.surfaceSunken};
          cursor: pointer;
          font-family: ${t.fontBody};
          color: ${t.inkFaint};
          min-height: 92px;
        }
        .db-home-today-cell strong {
          font-size: 20px;
          font-weight: 700;
          color: ${t.ink};
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .db-home-today-cell span {
          font-size: 12px;
          font-weight: 600;
          color: ${t.inkSoft};
        }

        .db-home-duo {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
          align-items: stretch;
        }
        .db-home-panel--insights {
          display: flex;
          flex-direction: column;
          min-height: 220px;
        }
        .db-home-insights {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .db-home-insights li {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          flex: 1;
          padding: 14px;
          border-radius: 14px;
          background: ${t.surfaceSunken};
          color: ${t.inkSoft};
          font-size: 13px;
          line-height: 1.5;
        }
        .db-home-insights li svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: ${t.sageDeep};
        }
        .db-home-empty-note {
          margin: 0;
          flex: 1;
          display: flex;
          align-items: center;
          font-size: 13px;
          color: ${t.inkSoft};
          line-height: 1.5;
          padding: 14px;
          border-radius: 14px;
          background: ${t.surfaceSunken};
        }

        .db-home-community-fill {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          min-height: 220px;
          width: 100%;
          text-align: left;
          padding: 20px;
          border-radius: 18px;
          border: 1px solid ${t.sage}66;
          background:
            radial-gradient(ellipse 80% 70% at 100% 0%, rgba(232, 184, 154, 0.28), transparent 55%),
            linear-gradient(155deg, ${t.forest} 0%, #314a39 42%, ${t.sageDeep} 100%);
          color: #F4F0E8;
          cursor: pointer;
          font-family: ${t.fontBody};
          box-shadow: 0 12px 32px rgba(39, 57, 46, 0.22);
        }
        .db-home-community-fill-top {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .db-home-community-fill .db-home-kicker {
          color: rgba(244, 240, 232, 0.62);
          margin: 0;
        }
        .db-home-community-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          color: #F4F0E8;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .db-home-community-fill h2 {
          color: #FFF;
          font-size: clamp(20px, 2.4vw, 26px);
          line-height: 1.2;
          max-width: 18ch;
        }
        .db-home-community-fill > p {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: rgba(244, 240, 232, 0.78);
          max-width: 34ch;
        }
        .db-home-community-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: auto;
          padding: 10px 14px;
          border-radius: 999px;
          background: #FFF;
          color: ${t.forest};
          font-size: 13px;
          font-weight: 700;
          min-height: 40px;
        }

        @media (hover: hover) and (pointer: fine) {
          .db-home-glance-card:hover { border-color: ${t.forest}; }
          .db-home-watch:hover { border-color: ${t.gold}; }
          .db-home-today-cell:hover { border-color: ${t.forest}; }
          .db-home-hero-cta:hover { background: ${t.forestDeep}; }
          .db-home-alert:hover { border-color: ${t.clay}; }
          .db-home-next:hover { border-color: ${t.forest}; }
          .db-home-community-fill:hover .db-home-community-cta {
            background: ${t.peachSoft};
          }
        }

        @media (max-width: 1100px) {
          .db-home-glance-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .db-home-glance-grid .db-home-glance-card:nth-child(4),
          .db-home-glance-grid .db-home-glance-card:nth-child(5) {
            grid-column: span 1;
          }
        }
        @media (max-width: 960px) {
          .db-home-mid,
          .db-home-duo { grid-template-columns: 1fr; }
          .db-home-mid { gap: 12px; }
          .db-home-panel--insights,
          .db-home-community-fill { min-height: 0; }
        }
        @media (max-width: 720px) {
          .db-home-main {
            padding: 16px 14px calc(112px + env(safe-area-inset-bottom, 0px));
          }
          .db-home-hero {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            margin-bottom: 14px;
            padding-bottom: 14px;
          }
          .db-home-hero h1 { font-size: clamp(26px, 7vw, 34px); }
          .db-home-lead { max-width: none; font-size: 13px; }
          .db-home-hero-cta { width: 100%; justify-content: center; }
          .db-home-glance-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
          .db-home-glance-grid .db-home-glance-card:last-child { grid-column: 1 / -1; }
          .db-home-glance-card { padding: 12px 12px 14px; }
          .db-home-glance-card strong { font-size: 20px; }
          .db-home-alert,
          .db-home-next { padding: 12px; }
          .db-home-watch {
            gap: 10px;
            padding: 12px;
          }
          .db-home-chart-card,
          .db-home-today-panel,
          .db-home-panel { padding: 14px; border-radius: 16px; }
          .db-home-card-head h2 { font-size: 20px; }
          .db-home-chart-body { height: 200px; }
          .db-home-chart-empty { height: 180px; }
          .db-home-today-cell { min-height: 84px; padding: 12px; }
          .db-home-community-fill {
            min-height: 0;
            padding: 16px;
            border-radius: 16px;
          }
          .db-home-community-fill h2 { max-width: none; }
          .db-home-community-fill > p { max-width: none; }
        }
        @media (max-width: 380px) {
          .db-home-main { padding-left: 12px; padding-right: 12px; }
          .db-home-glance-card strong { font-size: 18px; }
          .db-home-today-grid { gap: 6px; }
          .db-home-today-cell { min-height: 78px; padding: 10px; }
          .db-home-today-cell strong { font-size: 18px; }
        }
      `}</style>
    </div>
  );
}
