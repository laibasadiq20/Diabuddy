import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarRange,
  Loader2,
  Minus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';

const t = theme;

const PRESETS = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '3 months' },
  { id: 'custom', label: 'Custom' },
];

const TIR_COLORS = {
  inRange: t.sage,
  high: t.clay,
  low: t.skyDeep,
};

function toInputDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function defaultCustomRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 13);
  return { start: toInputDate(start.toISOString()), end: toInputDate(end.toISOString()) };
}

function DeltaBadge({ value, invert = false, suffix = '' }) {
  if (value == null || Number.isNaN(Number(value))) {
    return <span className="db-rep-delta is-flat"><Minus size={12} /> —</span>;
  }
  const n = Number(value);
  const better = invert ? n < 0 : n > 0;
  const worse = invert ? n > 0 : n < 0;
  const Icon = n > 0 ? ArrowUpRight : n < 0 ? ArrowDownRight : Minus;
  return (
    <span className={`db-rep-delta${better ? ' is-up' : ''}${worse ? ' is-down' : ''}${n === 0 ? ' is-flat' : ''}`}>
      <Icon size={12} />
      {n > 0 ? '+' : ''}
      {n}
      {suffix}
    </span>
  );
}

function MetricCard({ label, value, unit, delta, invertDelta }) {
  return (
    <div className="db-rep-metric">
      <p className="db-rep-metric-label">{label}</p>
      <p className="db-rep-metric-value">
        {value == null || value === '' ? '—' : value}
        {value != null && value !== '' && unit ? <span>{unit}</span> : null}
      </p>
      {delta !== undefined ? <DeltaBadge value={delta} invert={invertDelta} /> : null}
    </div>
  );
}

function ChartCard({ title, subtitle, children, empty }) {
  return (
    <section className="db-rep-chart">
      <header className="db-rep-chart-head">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
      {empty ? <p className="db-rep-empty-inline">No data in this period.</p> : children}
    </section>
  );
}

const tooltipStyle = {
  background: '#fff',
  border: `1px solid ${t.lineStrong}`,
  borderRadius: 10,
  fontSize: 12,
  color: t.ink,
};

export default function Reports() {
  const { user, authHeaders } = useAuth();
  const navigate = useNavigate();
  const [preset, setPreset] = useState('7d');
  const [custom, setCustom] = useState(defaultCustomRange);
  const [compare, setCompare] = useState(false);
  const [compareCustom, setCompareCustom] = useState(() => {
    const end = new Date();
    end.setDate(end.getDate() - 14);
    const start = new Date(end);
    start.setDate(end.getDate() - 13);
    return { start: toInputDate(start.toISOString()), end: toInputDate(end.toISOString()) };
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        preset,
        tzOffset: String(new Date().getTimezoneOffset()),
        compare: compare ? 'true' : 'false',
      });
      if (preset === 'custom') {
        if (!custom.start || !custom.end) {
          setError('Choose a start and end date for the custom range.');
          setLoading(false);
          return;
        }
        params.set('startDate', custom.start);
        params.set('endDate', custom.end);
      }
      if (compare) {
        if (compareCustom.start && compareCustom.end) {
          params.set('compareStartDate', compareCustom.start);
          params.set('compareEndDate', compareCustom.end);
        }
      }

      const res = await fetch(`${API_URL}/health-logs/report?${params}`, {
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not load report');
      setReport(data.data);
    } catch (err) {
      setError(err.message || 'Could not load report');
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [user, preset, custom, compare, compareCustom]);

  useEffect(() => {
    load();
  }, [load]);

  const period = report?.period;
  const metrics = period?.metrics;
  const charts = period?.charts;
  const deltas = report?.deltas;
  const comparePeriod = report?.comparePeriod;

  const tirPie = useMemo(() => {
    if (!charts?.tir) return [];
    return [
      { name: 'In range', value: charts.tir.inRange, color: TIR_COLORS.inRange },
      { name: 'High', value: charts.tir.high, color: TIR_COLORS.high },
      { name: 'Low', value: charts.tir.low, color: TIR_COLORS.low },
    ].filter((x) => x.value > 0);
  }, [charts]);

  const dailyGlucose = useMemo(
    () => (charts?.daily || []).filter((d) => d.avgGlucose != null),
    [charts]
  );

  const hasAnyData = metrics && (
    metrics.glucoseReadings > 0 ||
    metrics.mealsLogged > 0 ||
    metrics.totalInsulinUnits > 0 ||
    metrics.medicationsLogged > 0 ||
    metrics.totalWaterMl > 0 ||
    metrics.totalExerciseMinutes > 0 ||
    metrics.sleepNights > 0 ||
    metrics.moodEntries > 0
  );

  return (
    <div className="db-rep">
      <AppSidebar />
      <main className="db-rep-main">
        <div className="db-rep-inner">
          <header className="db-rep-header">
            <div>
              <p className="db-rep-eyebrow">From your logs</p>
              <h1>
                <BarChart3 size={26} strokeWidth={1.75} color={t.forest} />
                Health reports
              </h1>
              <p className="db-rep-lead">
                Patterns from your real glucose, meals, insulin, meds, and lifestyle entries.
              </p>
            </div>
            <button type="button" className="db-rep-ghost" onClick={() => navigate('/logs')}>
              Open logs
            </button>
          </header>

          <div className="db-rep-controls">
            <div className="db-rep-presets" role="tablist" aria-label="Report range">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={preset === p.id}
                  className={`db-rep-preset${preset === p.id ? ' is-active' : ''}`}
                  onClick={() => setPreset(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {preset === 'custom' && (
              <div className="db-rep-dates">
                <label>
                  From
                  <input
                    type="date"
                    value={custom.start}
                    max={custom.end || undefined}
                    onChange={(e) => setCustom((c) => ({ ...c, start: e.target.value }))}
                  />
                </label>
                <label>
                  To
                  <input
                    type="date"
                    value={custom.end}
                    min={custom.start || undefined}
                    onChange={(e) => setCustom((c) => ({ ...c, end: e.target.value }))}
                  />
                </label>
              </div>
            )}

            <label className="db-rep-compare-toggle">
              <input
                type="checkbox"
                checked={compare}
                onChange={(e) => setCompare(e.target.checked)}
              />
              Compare two periods
            </label>

            {compare && (
              <div className="db-rep-dates db-rep-dates--compare">
                <p>
                  <CalendarRange size={14} /> Compare against
                </p>
                <label>
                  From
                  <input
                    type="date"
                    value={compareCustom.start}
                    max={compareCustom.end || undefined}
                    onChange={(e) => setCompareCustom((c) => ({ ...c, start: e.target.value }))}
                  />
                </label>
                <label>
                  To
                  <input
                    type="date"
                    value={compareCustom.end}
                    min={compareCustom.start || undefined}
                    onChange={(e) => setCompareCustom((c) => ({ ...c, end: e.target.value }))}
                  />
                </label>
              </div>
            )}
          </div>

          {loading ? (
            <div className="db-rep-state">
              <Loader2 className="db-spin" size={22} />
              Building report from your logs…
            </div>
          ) : error ? (
            <div className="db-rep-state db-rep-state--error">
              <p>{error}</p>
              <button type="button" onClick={load}>Try again</button>
            </div>
          ) : !hasAnyData ? (
            <div className="db-rep-state">
              <h2>No log data in this range</h2>
              <p>Add glucose, meals, or meds for these dates, then reopen the report.</p>
              <button type="button" className="db-rep-primary" onClick={() => navigate('/logs')}>
                Go to logs
              </button>
            </div>
          ) : (
            <>
              <div className="db-rep-period-line">
                <strong>{period.label}</strong>
                <span>{period.shortLabel}</span>
                {comparePeriod ? (
                  <span className="db-rep-vs">
                    vs {comparePeriod.label} ({comparePeriod.shortLabel})
                  </span>
                ) : null}
              </div>

              <div className="db-rep-metrics">
                <MetricCard
                  label="Avg glucose"
                  value={metrics.avgGlucose}
                  unit=" mg/dL"
                  delta={deltas?.avgGlucose}
                  invertDelta
                />
                <MetricCard
                  label="Time in range"
                  value={metrics.timeInRangePercent}
                  unit="%"
                  delta={deltas?.timeInRangePercent}
                />
                <MetricCard
                  label="Insulin total"
                  value={metrics.totalInsulinUnits}
                  unit=" u"
                  delta={deltas?.totalInsulinUnits}
                  invertDelta
                />
                <MetricCard
                  label="Med adherence"
                  value={metrics.adherencePercent}
                  unit="%"
                  delta={deltas?.adherencePercent}
                />
                <MetricCard
                  label="Avg sleep"
                  value={metrics.avgSleepHours}
                  unit=" h"
                  delta={deltas?.avgSleepHours}
                />
                <MetricCard
                  label="Activity"
                  value={metrics.totalExerciseMinutes}
                  unit=" min"
                  delta={deltas?.totalExerciseMinutes}
                />
              </div>

              {report.insights?.length > 0 && (
                <section className="db-rep-insights">
                  <h2>Insights</h2>
                  <ul>
                    {report.insights.map((ins) => (
                      <li key={ins.message} className={`is-${(ins.type || 'Suggestion').toLowerCase()}`}>
                        <span>{ins.type}</span>
                        {ins.message}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="db-rep-grid">
                <ChartCard
                  title="Daily average glucose"
                  subtitle={`Target range ${report?.tirTarget?.low ?? 70}–${report?.tirTarget?.high ?? 180} mg/dL`}
                  empty={!dailyGlucose.length}
                >
                  <div className="db-rep-chart-body">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                      <AreaChart data={dailyGlucose} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gluFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={t.sky} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={t.sky} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke={t.line} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} width={40} domain={['auto', 'auto']} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area
                          type="monotone"
                          dataKey="avgGlucose"
                          name="Avg mg/dL"
                          stroke={t.skyDeep}
                          fill="url(#gluFill)"
                          strokeWidth={2}
                          connectNulls
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title="Time in range" subtitle="Share of readings" empty={!tirPie.length}>
                  <div className="db-rep-chart-body db-rep-chart-body--pie">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                      <PieChart>
                        <Pie
                          data={tirPie}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={58}
                          outerRadius={88}
                          paddingAngle={2}
                        >
                          {tirPie.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    {metrics.timeInRangePercent != null && (
                      <p className="db-rep-tir-center">{metrics.timeInRangePercent}%</p>
                    )}
                  </div>
                </ChartCard>

                <ChartCard title="Carbs by day" subtitle="From meal logs" empty={!charts?.daily?.some((d) => d.carbs > 0)}>
                  <div className="db-rep-chart-body">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                      <BarChart data={charts?.daily || []} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke={t.line} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="carbs" name="Carbs (g)" fill={t.sage} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title="Insulin by day" subtitle="Units logged" empty={!charts?.daily?.some((d) => d.insulin > 0)}>
                  <div className="db-rep-chart-body">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                      <BarChart data={charts?.daily || []} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke={t.line} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="insulin" name="Units" fill={t.clay} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title="Water & activity" subtitle="Daily totals" empty={!charts?.daily?.some((d) => d.water > 0 || d.exercise > 0)}>
                  <div className="db-rep-chart-body">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                      <LineChart data={charts?.daily || []} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke={t.line} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="water" name="Water (ml)" stroke={t.skyDeep} strokeWidth={2} dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="exercise" name="Activity (min)" stroke={t.gold} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title="Sleep" subtitle="Hours per night" empty={!charts?.daily?.some((d) => d.sleepHours != null)}>
                  <div className="db-rep-chart-body">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                      <AreaChart data={charts?.daily || []} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke={t.line} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} width={32} domain={[0, 'auto']} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area
                          type="monotone"
                          dataKey="sleepHours"
                          name="Hours"
                          stroke={t.forest}
                          fill={t.sageTint}
                          strokeWidth={2}
                          connectNulls
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                {charts?.insulinByType?.length > 0 && (
                  <ChartCard title="Insulin by type" subtitle="Total units in period">
                    <div className="db-rep-chart-body">
                      <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                        <BarChart data={charts?.insulinByType || []} layout="vertical" margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                          <CartesianGrid stroke={t.line} strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" width={90} tick={{ fill: t.inkSoft, fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="units" name="Units" fill={t.clay} radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                )}

                {charts?.mood?.length > 0 && (
                  <ChartCard title="Mood entries" subtitle="Counts in period">
                    <div className="db-rep-chart-body">
                      <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                        <BarChart data={charts?.mood || []} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                          <CartesianGrid stroke={t.line} strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: t.inkFaint, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                          <YAxis allowDecimals={false} tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="count" name="Entries" fill={t.peach} radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                )}
              </div>

              <section className="db-rep-summary">
                <h2>Period totals</h2>
                <div className="db-rep-summary-grid">
                  <p><strong>{metrics.glucoseReadings}</strong> glucose readings</p>
                  <p><strong>{metrics.mealsLogged}</strong> meals · <strong>{metrics.totalCarbs}</strong> g carbs</p>
                  <p><strong>{metrics.medsTaken}</strong> meds taken · <strong>{metrics.medsMissed + metrics.medsSkipped}</strong> missed/skipped</p>
                  <p><strong>{metrics.totalWaterMl}</strong> ml water · avg <strong>{metrics.avgWaterPerDay ?? '—'}</strong>/day</p>
                  <p><strong>{metrics.loggingDays}</strong> of <strong>{metrics.dayCount}</strong> days had at least one log</p>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <style>{`
        .db-rep {
          min-height: 100dvh;
          display: flex;
          background: linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 42%);
          font-family: ${t.fontBody};
        }
        .db-rep-main {
          flex: 1;
          min-width: 0;
          padding: 24px 18px 100px;
        }
        .db-rep-inner {
          max-width: 1080px;
          margin: 0 auto;
        }
        .db-rep-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }
        .db-rep-eyebrow {
          margin: 0 0 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${t.inkFaint};
        }
        .db-rep-header h1 {
          margin: 0;
          font-family: ${t.fontDisplay};
          font-size: clamp(26px, 5vw, 34px);
          font-weight: 500;
          color: ${t.ink};
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .db-rep-lead {
          margin: 8px 0 0;
          font-size: 14px;
          color: ${t.inkSoft};
          max-width: 44ch;
          line-height: 1.5;
        }
        .db-rep-ghost {
          border: 1px solid ${t.lineStrong};
          background: #fff;
          color: ${t.inkSoft};
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: ${t.fontBody};
          flex-shrink: 0;
        }
        .db-rep-primary {
          border: none;
          background: ${t.forest};
          color: #fff;
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: ${t.fontBody};
        }
        .db-rep-controls {
          background: #fff;
          border: 1px solid ${t.lineStrong};
          border-radius: 14px;
          padding: 12px;
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .db-rep-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .db-rep-preset {
          border: 1px solid ${t.lineStrong};
          background: #fff;
          color: ${t.inkSoft};
          border-radius: 999px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: ${t.fontBody};
        }
        .db-rep-preset.is-active {
          background: ${t.forest};
          border-color: ${t.forest};
          color: #fff;
        }
        .db-rep-dates {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: flex-end;
        }
        .db-rep-dates label {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          color: ${t.inkFaint};
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .db-rep-dates input {
          border: 1px solid ${t.lineStrong};
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 14px;
          font-family: ${t.fontBody};
          color: ${t.ink};
          background: ${t.surfaceSunken};
        }
        .db-rep-dates--compare {
          padding-top: 4px;
          border-top: 1px solid ${t.line};
        }
        .db-rep-dates--compare > p {
          width: 100%;
          margin: 0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: ${t.inkSoft};
          text-transform: none;
          letter-spacing: 0;
        }
        .db-rep-compare-toggle {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: ${t.ink};
          cursor: pointer;
        }
        .db-rep-state {
          background: #fff;
          border: 1px solid ${t.lineStrong};
          border-radius: 14px;
          padding: 36px 20px;
          text-align: center;
          color: ${t.inkSoft};
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .db-rep-state h2 {
          margin: 0;
          font-family: ${t.fontDisplay};
          font-size: 22px;
          color: ${t.ink};
          font-weight: 500;
        }
        .db-rep-state--error { color: ${t.clayDeep}; background: ${t.clayTint}; }
        .db-rep-state--error button {
          border: none;
          background: ${t.clay};
          color: #fff;
          border-radius: 8px;
          padding: 8px 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .db-rep-period-line {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 12px;
          align-items: baseline;
          margin-bottom: 14px;
          color: ${t.inkSoft};
          font-size: 13px;
        }
        .db-rep-period-line strong { color: ${t.ink}; font-size: 15px; }
        .db-rep-vs { color: ${t.inkFaint}; }
        .db-rep-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 16px;
        }
        .db-rep-metric {
          background: #fff;
          border: 1px solid ${t.lineStrong};
          border-radius: 12px;
          padding: 12px 14px;
        }
        .db-rep-metric-label {
          margin: 0;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: ${t.inkFaint};
        }
        .db-rep-metric-value {
          margin: 6px 0 0;
          font-size: 22px;
          font-weight: 700;
          color: ${t.ink};
        }
        .db-rep-metric-value span {
          font-size: 13px;
          font-weight: 600;
          color: ${t.inkSoft};
        }
        .db-rep-delta {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          margin-top: 6px;
          font-size: 11px;
          font-weight: 700;
          color: ${t.inkFaint};
        }
        .db-rep-delta.is-up { color: ${t.sageDeep}; }
        .db-rep-delta.is-down { color: ${t.clayDeep}; }
        .db-rep-insights {
          background: #fff;
          border: 1px solid ${t.lineStrong};
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 16px;
        }
        .db-rep-insights h2 {
          margin: 0 0 10px;
          font-family: ${t.fontDisplay};
          font-size: 18px;
          font-weight: 500;
          color: ${t.ink};
        }
        .db-rep-insights ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .db-rep-insights li {
          font-size: 13px;
          color: ${t.inkSoft};
          line-height: 1.45;
          background: ${t.surfaceSunken};
          border-radius: 10px;
          padding: 10px 12px;
        }
        .db-rep-insights li span {
          display: inline-block;
          margin-right: 8px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: ${t.forest};
        }
        .db-rep-insights li.is-warning span { color: ${t.clayDeep}; }
        .db-rep-insights li.is-achievement span { color: ${t.sageDeep}; }
        .db-rep-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .db-rep-chart {
          background: #fff;
          border: 1px solid ${t.lineStrong};
          border-radius: 14px;
          padding: 14px;
          min-width: 0;
        }
        .db-rep-chart-head h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: ${t.ink};
        }
        .db-rep-chart-head p {
          margin: 4px 0 0;
          font-size: 12px;
          color: ${t.inkFaint};
        }
        .db-rep-chart-body {
          margin-top: 8px;
          width: 100%;
          height: 260px;
          min-height: 260px;
        }
        .db-rep-chart-body--pie {
          position: relative;
        }
        .db-rep-tir-center {
          position: absolute;
          left: 50%;
          top: 46%;
          transform: translate(-50%, -50%);
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: ${t.ink};
          pointer-events: none;
        }
        .db-rep-empty-inline {
          margin: 24px 0;
          text-align: center;
          color: ${t.inkFaint};
          font-size: 13px;
        }
        .db-rep-summary {
          margin-top: 16px;
          background: #fff;
          border: 1px solid ${t.lineStrong};
          border-radius: 14px;
          padding: 14px 16px;
        }
        .db-rep-summary h2 {
          margin: 0 0 10px;
          font-family: ${t.fontDisplay};
          font-size: 18px;
          font-weight: 500;
        }
        .db-rep-summary-grid {
          display: grid;
          gap: 8px;
          font-size: 13px;
          color: ${t.inkSoft};
        }
        .db-rep-summary-grid strong { color: ${t.ink}; }
        .db-spin { animation: db-spin 0.9s linear infinite; }
        @keyframes db-spin { to { transform: rotate(360deg); } }
        @media (max-width: 860px) {
          .db-rep-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .db-rep-grid { grid-template-columns: 1fr; }
          .db-rep-chart-body {
            height: 240px;
            min-height: 240px;
          }
        }
        @media (max-width: 640px) {
          .db-rep {
            overflow-x: hidden;
          }
          .db-rep-main {
            padding: 12px 12px calc(112px + env(safe-area-inset-bottom, 0px));
          }
          .db-rep-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            margin-bottom: 14px;
          }
          .db-rep-header h1 {
            font-size: clamp(22px, 6.5vw, 28px);
            gap: 8px;
          }
          .db-rep-header h1 svg {
            width: 22px;
            height: 22px;
            flex-shrink: 0;
          }
          .db-rep-lead {
            font-size: 13px;
            max-width: none;
          }
          .db-rep-ghost {
            width: 100%;
            text-align: center;
            min-height: 44px;
          }
          .db-rep-primary {
            width: 100%;
            min-height: 44px;
          }
          .db-rep-controls {
            padding: 10px;
            border-radius: 12px;
            gap: 10px;
          }
          .db-rep-presets {
            display: flex;
            flex-wrap: nowrap;
            gap: 6px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            margin: 0 -2px;
            padding: 2px;
          }
          .db-rep-presets::-webkit-scrollbar { display: none; }
          .db-rep-preset {
            flex: 0 0 auto;
            padding: 8px 14px;
            font-size: 12px;
            min-height: 36px;
          }
          .db-rep-dates {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .db-rep-dates label {
            width: 100%;
          }
          .db-rep-dates input {
            width: 100%;
            box-sizing: border-box;
            font-size: 16px;
            min-height: 44px;
          }
          .db-rep-compare-toggle {
            min-height: 40px;
            font-size: 13px;
          }
          .db-rep-metrics {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .db-rep-metric {
            padding: 10px 12px;
            border-radius: 10px;
          }
          .db-rep-metric-value {
            font-size: 18px;
          }
          .db-rep-metric-value span {
            font-size: 12px;
          }
          .db-rep-period-line {
            flex-direction: column;
            gap: 4px;
            font-size: 12px;
          }
          .db-rep-period-line strong {
            font-size: 14px;
          }
          .db-rep-insights,
          .db-rep-summary,
          .db-rep-chart,
          .db-rep-state {
            border-radius: 12px;
            padding: 12px;
          }
          .db-rep-insights h2,
          .db-rep-summary h2 {
            font-size: 16px;
          }
          .db-rep-insights li {
            font-size: 12px;
            padding: 9px 10px;
          }
          .db-rep-chart-head h3 {
            font-size: 14px;
          }
          .db-rep-chart-body {
            height: 200px;
            min-height: 200px;
          }
          .db-rep-chart-body .recharts-responsive-container {
            min-height: 200px !important;
          }
          .db-rep-tir-center {
            font-size: 18px;
            top: 44%;
          }
          .db-rep-summary-grid {
            font-size: 12px;
            gap: 6px;
          }
          .db-rep-state {
            padding: 28px 16px;
          }
          .db-rep-state h2 {
            font-size: 18px;
          }
        }
        @media (max-width: 380px) {
          .db-rep-metrics {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
