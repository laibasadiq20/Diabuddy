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
  BarChart3,
  CalendarRange,
  FileText,
  Loader2,
  Activity,
  Droplets,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/axios';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { downloadReportPdf } from './reportExport';
import { fromMgdl, glucoseUnitLabel } from '../../utils/glucoseUnits';

const t = theme;

const PRESETS = [
  { id: '1d', label: 'Daily' },
  { id: '7d', label: 'Weekly' },
  { id: '30d', label: 'Monthly' },
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

function DeltaBadge({ value, invert = false, against, unit = '' }) {
  if (value == null || Number.isNaN(Number(value))) {
    return null;
  }
  const n = Number(value);
  const better = invert ? n < 0 : n > 0;
  const worse = invert ? n > 0 : n < 0;
  const abs = Math.abs(n);
  const text =
    n === 0
      ? `No change${against ? ` from ${against}` : ''}`
      : `${n > 0 ? '↑' : '↓'} ${abs}${unit}${against ? ` from ${against}` : ''}`;
  return (
    <span className={`db-rep-delta${better ? ' is-up' : ''}${worse ? ' is-down' : ''}${n === 0 ? ' is-flat' : ''}`}>
      {text}
    </span>
  );
}

function MetricCard({ label, value, unit, delta, invertDelta, hint, against }) {
  return (
    <div className="db-rep-metric">
      <p className="db-rep-metric-label">{label}</p>
      <p className="db-rep-metric-value">
        {value == null || value === '' ? '—' : value}
        {value != null && value !== '' && unit ? <span>{unit}</span> : null}
      </p>
      {hint ? <p className="db-rep-metric-hint">{hint}</p> : null}
      {delta !== undefined && delta !== null ? (
        <DeltaBadge value={delta} invert={invertDelta} against={against} unit={unit || ''} />
      ) : null}
    </div>
  );
}

function ChartCard({ title, subtitle, children, empty, wide }) {
  return (
    <section className={`db-rep-chart${wide ? ' is-wide' : ''}`}>
      <header className="db-rep-chart-head">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
      {empty ? <p className="db-rep-empty-inline">No data in this period.</p> : children}
    </section>
  );
}

// Surfaces the same warm "care letter" narrative that reportExport.js renders in the
// PDF, so it's readable in-app too — above the charts, not buried in a download.
function CareLetter({ story }) {
  if (!story?.careLetter && !story?.narrative && !story?.summary) return null;
  const letter = story.careLetter || story.narrative || story.summary;
  const rating = story.rating || 'fair';
  return (
    <section className="db-rep-letter">
      <p className="db-rep-letter-eyebrow">From DiaBuddy</p>
      <div className="db-rep-letter-head">
        <h2>{story.careLetterTitle || story.headline || 'Your care letter'}</h2>
        {story.ratingLabel ? (
          <span className={`db-rep-letter-rating is-${rating}`}>{story.ratingLabel}</span>
        ) : null}
      </div>
      <p className="db-rep-letter-body">{letter}</p>
      <p className="db-rep-letter-signoff">— Your DiaBuddy companion</p>
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
  const { user } = useAuth();
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
  const [exportError, setExportError] = useState('');

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
      if (compare && compareCustom.start && compareCustom.end) {
        params.set('compareStartDate', compareCustom.start);
        params.set('compareEndDate', compareCustom.end);
      }

      const { data } = await api.get(`/health-logs/report?${params}`);
      if (data?.status !== 'success' || !data?.data) {
        throw new Error(data?.message || 'Could not load report');
      }
      setReport(data.data);
    } catch (err) {
      const raw = err.response?.data;
      let message = raw?.message || err.message || 'Could not load report';
      if (typeof raw === 'string' && /<!DOCTYPE|<\/html>/i.test(raw)) {
        message = 'Reports API did not respond with data. Make sure the backend is running and up to date.';
      } else if (/Unexpected token|is not valid JSON/i.test(String(message))) {
        message = 'Reports API did not respond with data. Make sure the backend is running and up to date.';
      } else if (err.response?.status === 401) {
        message = 'Please sign in again to view reports.';
      } else if (err.response?.status === 404) {
        message = raw?.message || 'Report endpoint not found. Redeploy or restart the backend.';
      }
      setError(message);
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
  const compareAgainst = report?.compareAgainst;
  const story = report?.story;

  // Backend always reports glucose in mg/dL — convert for display based on the
  // signed-in user's glucoseUnit preference (Account page).
  const glucoseUnit = user?.glucoseUnit === 'mmol/L' ? 'mmol/L' : 'mg/dL';
  const unitLabel = glucoseUnitLabel(glucoseUnit);

  const tirPie = useMemo(() => {
    if (!charts?.tir) return [];
    return [
      { name: 'In range', value: charts.tir.inRange, color: TIR_COLORS.inRange },
      { name: 'High', value: charts.tir.high, color: TIR_COLORS.high },
      { name: 'Low', value: charts.tir.low, color: TIR_COLORS.low },
    ].filter((x) => x.value > 0);
  }, [charts]);

  const dailyGlucose = useMemo(
    () =>
      (charts?.daily || [])
        .filter((d) => d.avgGlucose != null)
        .map((d) => ({ ...d, avgGlucose: fromMgdl(d.avgGlucose, glucoseUnit) })),
    [charts, glucoseUnit]
  );

  const readingTypeChart = useMemo(
    () => (charts?.glucoseByReadingType || []).map((r) => ({ ...r, avgGlucose: fromMgdl(r.avgGlucose, glucoseUnit) })),
    [charts, glucoseUnit]
  );

  const avgGlucoseDisplay = fromMgdl(metrics?.avgGlucose, glucoseUnit);
  const glucoseStdDevDisplay = fromMgdl(metrics?.glucoseStdDev, glucoseUnit);
  const avgGlucoseDeltaDisplay = deltas?.avgGlucose != null ? fromMgdl(deltas.avgGlucose, glucoseUnit) : deltas?.avgGlucose;
  const glucoseStdDevDeltaDisplay =
    deltas?.glucoseStdDev != null ? fromMgdl(deltas.glucoseStdDev, glucoseUnit) : deltas?.glucoseStdDev;
  const glucoseRangeHint =
    metrics?.lowestGlucose != null
      ? `Range ${fromMgdl(metrics.lowestGlucose, glucoseUnit)}–${fromMgdl(metrics.highestGlucose, glucoseUnit)}`
      : undefined;
  const tirTargetLow = fromMgdl(report?.tirTarget?.low ?? 70, glucoseUnit);
  const tirTargetHigh = fromMgdl(report?.tirTarget?.high ?? 180, glucoseUnit);

  const hasAnyData =
    metrics &&
    (metrics.glucoseReadings > 0 ||
      metrics.mealsLogged > 0 ||
      metrics.totalInsulinUnits > 0 ||
      metrics.medicationsLogged > 0 ||
      metrics.totalWaterMl > 0 ||
      metrics.totalExerciseMinutes > 0 ||
      metrics.sleepNights > 0 ||
      metrics.moodEntries > 0);

  const exportUserName = user?.name || user?.fullName || user?.email || '';

  const handleExportPdf = () => {
    if (!report) return;
    setExportError('');
    try {
      downloadReportPdf(report, { userName: exportUserName });
    } catch (err) {
      setExportError(err.message || 'Could not export PDF');
    }
  };

  const generatedLabel = report?.generatedAt
    ? new Date(report.generatedAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="db-rep">
      <AppSidebar />
      <main className="db-rep-main">
        <div className="db-rep-inner">
          <header className="db-rep-hero">
            <div className="db-rep-hero-copy">
              <p className="db-rep-eyebrow">Progress reporting</p>
              <h1>Health reports</h1>
              <p className="db-rep-lead">
                Daily, weekly, and monthly summaries built from your logged glucose, meals,
                insulin, medications, and lifestyle data.
              </p>
            </div>
            <div className="db-rep-header-actions">
              <button
                type="button"
                className="db-rep-export db-rep-export--primary"
                onClick={handleExportPdf}
                disabled={!hasAnyData || loading}
              >
                <FileText size={15} strokeWidth={2} />
                Export PDF
              </button>
              <button type="button" className="db-rep-ghost" onClick={() => navigate('/logs')}>
                Open logs
              </button>
            </div>
          </header>
          {exportError ? <p className="db-rep-export-error">{exportError}</p> : null}

          <div className="db-rep-controls">
            <div className="db-rep-controls-top">
              <div>
                <p className="db-rep-controls-label">Report period</p>
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
              </div>
              <label className="db-rep-compare-toggle">
                <input
                  type="checkbox"
                  checked={compare}
                  onChange={(e) => setCompare(e.target.checked)}
                />
                Compare periods
              </label>
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
              <button type="button" onClick={load}>
                Try again
              </button>
            </div>
          ) : !hasAnyData ? (
            <div className="db-rep-state">
              <BarChart3 size={28} color={t.inkFaint} />
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
                {generatedLabel ? <span className="db-rep-generated">Generated {generatedLabel}</span> : null}
              </div>

              <CareLetter story={story} />

              <div className="db-rep-metrics">
                <MetricCard
                  label="Avg glucose"
                  value={avgGlucoseDisplay}
                  unit={` ${unitLabel}`}
                  delta={avgGlucoseDeltaDisplay}
                  invertDelta
                  against={compareAgainst}
                  hint={glucoseRangeHint}
                />
                <MetricCard
                  label="Time in range"
                  value={metrics.timeInRangePercent}
                  unit="%"
                  delta={deltas?.timeInRangePercent}
                  against={compareAgainst}
                />
                <MetricCard
                  label="Est. A1c"
                  value={metrics.estimatedA1c}
                  unit="%"
                  delta={deltas?.estimatedA1c}
                  invertDelta
                  against={compareAgainst}
                  hint="From logged average"
                />
                <MetricCard
                  label="Variability"
                  value={glucoseStdDevDisplay}
                  unit={` ${unitLabel}`}
                  delta={glucoseStdDevDeltaDisplay}
                  invertDelta
                  against={compareAgainst}
                  hint="Std. deviation"
                />
                <MetricCard
                  label="Insulin total"
                  value={metrics.totalInsulinUnits}
                  unit=" u"
                  delta={deltas?.totalInsulinUnits}
                  invertDelta
                  against={compareAgainst}
                />
                <MetricCard
                  label="Med adherence"
                  value={metrics.adherencePercent}
                  unit="%"
                  delta={deltas?.adherencePercent}
                  against={compareAgainst}
                />
                <MetricCard
                  label="Avg sleep"
                  value={metrics.avgSleepHours}
                  unit=" h"
                  delta={deltas?.avgSleepHours}
                  against={compareAgainst}
                />
                <MetricCard
                  label="Activity"
                  value={metrics.totalExerciseMinutes}
                  unit=" min"
                  delta={deltas?.totalExerciseMinutes}
                  against={compareAgainst}
                />
              </div>

              <p className="db-rep-section-label">Trends & charts</p>
              <div className="db-rep-grid">
                <ChartCard
                  title="Daily average glucose"
                  subtitle={`Target ${tirTargetLow}–${tirTargetHigh} ${unitLabel}`}
                  empty={!dailyGlucose.length}
                  wide
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
                          name={`Avg ${unitLabel}`}
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

                <ChartCard
                  title="Glucose by reading type"
                  subtitle={`Average ${unitLabel} · fasting vs meals`}
                  empty={!readingTypeChart.length}
                >
                  <div className="db-rep-chart-body">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                      <BarChart data={readingTypeChart} layout="vertical" margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                        <CartesianGrid stroke={t.line} strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={88}
                          tick={{ fill: t.inkSoft, fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          formatter={(value, _n, item) => [
                            `${value} ${unitLabel} · ${item?.payload?.count ?? 0} readings`,
                            'Average',
                          ]}
                        />
                        <Bar dataKey="avgGlucose" name={`Avg ${unitLabel}`} fill={t.skyDeep} radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
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

                <ChartCard
                  title="Water & activity"
                  subtitle="Daily totals"
                  empty={!charts?.daily?.some((d) => d.water > 0 || d.exercise > 0)}
                >
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
                        <BarChart data={charts.insulinByType} layout="vertical" margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
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
                        <BarChart data={charts.mood} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
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

              <section className="db-rep-totals">
                <h2>Period totals</h2>
                <div className="db-rep-totals-grid">
                  <div>
                    <Droplets size={16} />
                    <p>
                      <strong>{metrics.glucoseReadings}</strong> glucose readings
                    </p>
                  </div>
                  <div>
                    <Activity size={16} />
                    <p>
                      <strong>{metrics.mealsLogged}</strong> meals · <strong>{metrics.totalCarbs}</strong> g carbs
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>{metrics.medsTaken}</strong> meds taken ·{' '}
                      <strong>{(metrics.medsMissed || 0) + (metrics.medsSkipped || 0)}</strong> missed/skipped
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>{metrics.totalWaterMl}</strong> ml water · avg{' '}
                      <strong>{metrics.avgWaterPerDay ?? '—'}</strong>/day
                    </p>
                  </div>
                  <div>
                    <p>
                      Logged on <strong>{metrics.loggingDays}</strong> of <strong>{metrics.dayCount}</strong> days
                    </p>
                  </div>
                </div>
                <p className="db-rep-disclaimer">
                  Informational self-management summary only — not a substitute for clinical advice or lab results.
                </p>
              </section>
            </>
          )}
        </div>
      </main>

      <style>{`
        .db-rep {
          min-height: 100dvh;
          display: flex;
          background:
            radial-gradient(ellipse at 0% 0%, rgba(94,135,160,0.08), transparent 42%),
            linear-gradient(180deg, #E8E1D4 0%, ${t.bg} 38%);
          font-family: ${t.fontBody};
        }
        .db-rep-main {
          flex: 1;
          min-width: 0;
          padding: 28px 20px 110px;
        }
        .db-rep-inner {
          max-width: 1120px;
          margin: 0 auto;
        }
        .db-rep-hero {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
          padding: 22px 24px;
          border-radius: 18px;
          background: linear-gradient(135deg, ${t.forest} 0%, #1f3228 55%, #2f4a38 100%);
          color: #f3eee2;
          box-shadow: ${t.shadowLifted};
        }
        .db-rep-eyebrow {
          margin: 0 0 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(243,238,226,0.62);
        }
        .db-rep-hero h1 {
          margin: 0;
          font-family: ${t.fontDisplay};
          font-size: clamp(28px, 5vw, 38px);
          font-weight: 500;
          letter-spacing: -0.02em;
          color: #fff;
        }
        .db-rep-lead {
          margin: 10px 0 0;
          font-size: 14px;
          color: rgba(243,238,226,0.82);
          max-width: 48ch;
          line-height: 1.55;
        }
        .db-rep-header-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          flex-shrink: 0;
        }
        .db-rep-ghost {
          border: 1px solid rgba(243,238,226,0.28);
          background: transparent;
          color: #f3eee2;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: ${t.fontBody};
        }
        .db-rep-ghost:hover { background: rgba(255,255,255,0.08); }
        .db-rep-export {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid transparent;
          background: #fff;
          color: ${t.forest};
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: ${t.fontBody};
        }
        .db-rep-export:disabled { opacity: 0.45; cursor: not-allowed; }
        .db-rep-export--primary:hover:not(:disabled) {
          background: ${t.goldSoft};
        }
        .db-rep-export-error {
          margin: -8px 0 12px;
          font-size: 12px;
          font-weight: 600;
          color: ${t.clayDeep};
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
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: ${t.shadowCard};
        }
        .db-rep-controls-top {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-end;
        }
        .db-rep-controls-label {
          margin: 0 0 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${t.inkFaint};
        }
        .db-rep-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .db-rep-preset {
          border: 1px solid ${t.lineStrong};
          background: ${t.surfaceSunken};
          color: ${t.inkSoft};
          border-radius: 10px;
          padding: 8px 14px;
          font-size: 13px;
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
          padding-top: 10px;
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
          border-radius: 16px;
          padding: 40px 20px;
          text-align: center;
          color: ${t.inkSoft};
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          box-shadow: ${t.shadowCard};
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
        .db-rep-letter {
          background: linear-gradient(180deg, #fcfaf5 0%, ${t.surfaceRaised} 100%);
          border: 1px solid ${t.lineStrong};
          border-radius: 16px;
          padding: 20px 22px;
          margin-bottom: 18px;
          box-shadow: ${t.shadowCard};
        }
        .db-rep-letter-eyebrow {
          margin: 0 0 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${t.inkFaint};
        }
        .db-rep-letter-head {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
        }
        .db-rep-letter-head h2 {
          margin: 0;
          font-family: ${t.fontDisplay};
          font-size: 22px;
          font-weight: 500;
          color: ${t.ink};
          letter-spacing: -0.01em;
        }
        .db-rep-letter-rating {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
          background: ${t.surfaceSunken};
          color: ${t.inkSoft};
        }
        .db-rep-letter-rating.is-excellent, .db-rep-letter-rating.is-good {
          background: ${t.sageSoft};
          color: ${t.sageDeep};
        }
        .db-rep-letter-rating.is-fair { background: ${t.goldSoft}; color: ${t.forest}; }
        .db-rep-letter-rating.is-needs_attention { background: ${t.claySoft}; color: ${t.clayDeep}; }
        .db-rep-letter-body {
          margin: 14px 0 0;
          font-size: 14px;
          line-height: 1.7;
          color: ${t.inkSoft};
          max-width: 74ch;
        }
        .db-rep-letter-signoff {
          margin: 12px 0 0;
          font-size: 12px;
          font-weight: 700;
          color: ${t.forest};
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
        .db-rep-generated { margin-left: auto; font-size: 11px; color: ${t.inkFaint}; }
        .db-rep-section-label {
          margin: 4px 0 10px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${t.inkFaint};
        }
        .db-rep-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 18px;
        }
        .db-rep-metric {
          background: #fff;
          border: 1px solid ${t.lineStrong};
          border-radius: 14px;
          padding: 14px 15px;
          box-shadow: ${t.shadowCard};
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
          margin: 8px 0 0;
          font-size: 24px;
          font-weight: 700;
          color: ${t.ink};
          letter-spacing: -0.02em;
        }
        .db-rep-metric-value span {
          font-size: 13px;
          font-weight: 600;
          color: ${t.inkSoft};
        }
        .db-rep-metric-hint {
          margin: 4px 0 0;
          font-size: 11px;
          color: ${t.inkFaint};
        }
        .db-rep-delta {
          display: inline-flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 2px;
          margin-top: 6px;
          font-size: 11px;
          font-weight: 700;
          color: ${t.inkFaint};
          line-height: 1.35;
        }
        .db-rep-delta.is-up { color: ${t.sageDeep}; }
        .db-rep-delta.is-down { color: ${t.clayDeep}; }
        .db-rep-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .db-rep-chart {
          background: #fff;
          border: 1px solid ${t.lineStrong};
          border-radius: 16px;
          padding: 16px;
          min-width: 0;
          box-shadow: ${t.shadowCard};
        }
        .db-rep-chart.is-wide {
          grid-column: 1 / -1;
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
        .db-rep-chart-body--pie { position: relative; }
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
        .db-rep-totals {
          margin-top: 16px;
          background: #fff;
          border: 1px solid ${t.lineStrong};
          border-radius: 16px;
          padding: 18px 20px;
          box-shadow: ${t.shadowCard};
        }
        .db-rep-totals h2 {
          margin: 0 0 12px;
          font-family: ${t.fontDisplay};
          font-size: 20px;
          font-weight: 500;
        }
        .db-rep-totals-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          font-size: 13px;
          color: ${t.inkSoft};
        }
        .db-rep-totals-grid > div {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          background: ${t.surfaceSunken};
          border-radius: 10px;
        }
        .db-rep-totals-grid p { margin: 0; }
        .db-rep-totals-grid strong { color: ${t.ink}; }
        .db-rep-disclaimer {
          margin: 14px 0 0;
          font-size: 11px;
          color: ${t.inkFaint};
          line-height: 1.45;
        }
        .db-spin { animation: db-spin 0.9s linear infinite; }
        @keyframes db-spin { to { transform: rotate(360deg); } }
        @media (max-width: 960px) {
          .db-rep-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 860px) {
          .db-rep-grid { grid-template-columns: 1fr; }
          .db-rep-chart.is-wide { grid-column: auto; }
          .db-rep-chart-body { height: 240px; min-height: 240px; }
          .db-rep-totals-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .db-rep-main {
            padding: 12px 12px calc(112px + env(safe-area-inset-bottom, 0px));
          }
          .db-rep-hero {
            flex-direction: column;
            padding: 18px 16px;
            border-radius: 14px;
          }
          .db-rep-header-actions { width: 100%; }
          .db-rep-ghost,
          .db-rep-export {
            flex: 1 1 auto;
            justify-content: center;
            min-height: 44px;
          }
          .db-rep-presets {
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .db-rep-presets::-webkit-scrollbar { display: none; }
          .db-rep-preset { flex: 0 0 auto; }
          .db-rep-dates { flex-direction: column; align-items: stretch; }
          .db-rep-dates input { width: 100%; box-sizing: border-box; font-size: 16px; min-height: 44px; }
          .db-rep-metrics { grid-template-columns: 1fr 1fr; gap: 8px; }
          .db-rep-metric-value { font-size: 20px; }
          .db-rep-period-line { flex-direction: column; gap: 4px; }
          .db-rep-generated { margin-left: 0; }
          .db-rep-chart-body { height: 200px; min-height: 200px; }
        }
        @media (max-width: 380px) {
          .db-rep-metrics { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
