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
import { useI18n } from '../../i18n/I18nContext';
import api from '../../config/axios';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { downloadReportPdf } from './reportExport';
import { fromMgdl, glucoseUnitLabel } from '../../utils/glucoseUnits';

const t = theme;

const PRESETS = [
  { id: '1d', labelKey: 'reports.presets.daily' },
  { id: '7d', labelKey: 'reports.presets.weekly' },
  { id: '30d', labelKey: 'reports.presets.monthly' },
  { id: '90d', labelKey: 'reports.presets.threeMonths' },
  { id: 'custom', labelKey: 'reports.presets.custom' },
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

function DeltaBadge({ value, invert = false, against, unit = '', tr }) {
  if (value == null || Number.isNaN(Number(value))) {
    return null;
  }
  const n = Number(value);
  const better = invert ? n < 0 : n > 0;
  const worse = invert ? n > 0 : n < 0;
  const abs = Math.abs(n);
  const fromSuffix = against ? ` ${tr('reports.fromTemplate').replace('{against}', against)}` : '';
  const text =
    n === 0
      ? `${tr('reports.noChange')}${fromSuffix}`
      : `${n > 0 ? '↑' : '↓'} ${abs}${unit}${fromSuffix}`;
  return (
    <span className={`db-rep-delta${better ? ' is-up' : ''}${worse ? ' is-down' : ''}${n === 0 ? ' is-flat' : ''}`}>
      {text}
    </span>
  );
}

function MetricCard({ label, value, unit, delta, invertDelta, hint, against, tr }) {
  return (
    <div className="db-rep-metric">
      <p className="db-rep-metric-label">{label}</p>
      <p className="db-rep-metric-value">
        {value == null || value === '' ? '—' : value}
        {value != null && value !== '' && unit ? <span>{unit}</span> : null}
      </p>
      {hint ? <p className="db-rep-metric-hint">{hint}</p> : null}
      {delta !== undefined && delta !== null ? (
        <DeltaBadge value={delta} invert={invertDelta} against={against} unit={unit || ''} tr={tr} />
      ) : null}
    </div>
  );
}

function ChartCard({ title, subtitle, children, empty, wide, emptyLabel }) {
  return (
    <section className={`db-rep-chart${wide ? ' is-wide' : ''}`}>
      <header className="db-rep-chart-head">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
      {empty ? <p className="db-rep-empty-inline">{emptyLabel}</p> : children}
    </section>
  );
}

// Surfaces the same warm "care letter" narrative that reportExport.js renders in the
// PDF, so it's readable in-app too — above the charts, not buried in a download.
function CareLetter({ story, tr }) {
  if (!story?.careLetter && !story?.narrative && !story?.summary) return null;
  const letter = story.careLetter || story.narrative || story.summary;
  const rating = story.rating || 'fair';
  return (
    <section className="db-rep-letter">
      <p className="db-rep-letter-eyebrow">{tr('reports.letter.from')}</p>
      <div className="db-rep-letter-head">
        <h2>{story.careLetterTitle || story.headline || tr('reports.letter.defaultTitle')}</h2>
        {story.ratingLabel ? (
          <span className={`db-rep-letter-rating is-${rating}`}>{story.ratingLabel}</span>
        ) : null}
      </div>
      <p className="db-rep-letter-body">{letter}</p>
      <p className="db-rep-letter-signoff">{tr('reports.letter.signoff')}</p>
    </section>
  );
}

const tooltipStyle = {
  background: t.surface,
  border: `1px solid ${t.lineStrong}`,
  borderRadius: 10,
  fontSize: 12,
  color: t.ink,
};

export default function Reports() {
  const { user } = useAuth();
  const { t: tr } = useI18n();
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
          setError(tr('reports.errors.chooseDates'));
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
        throw new Error(data?.message || tr('reports.errors.couldNotLoad'));
      }
      setReport(data.data);
    } catch (err) {
      const raw = err.response?.data;
      let message = raw?.message || err.message || tr('reports.errors.couldNotLoad');
      if (typeof raw === 'string' && /<!DOCTYPE|<\/html>/i.test(raw)) {
        message = tr('reports.errors.apiNoData');
      } else if (/Unexpected token|is not valid JSON/i.test(String(message))) {
        message = tr('reports.errors.apiNoData');
      } else if (err.response?.status === 401) {
        message = tr('reports.errors.signInAgain');
      } else if (err.response?.status === 404) {
        message = raw?.message || tr('reports.errors.endpointNotFound');
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
  // signed-in user's glucoseUnit preference (Settings page).
  const glucoseUnit = user?.glucoseUnit === 'mmol/L' ? 'mmol/L' : 'mg/dL';
  const unitLabel = glucoseUnitLabel(glucoseUnit);

  const tirPie = useMemo(() => {
    if (!charts?.tir) return [];
    return [
      { name: tr('reports.pie.inRange'), value: charts.tir.inRange, color: TIR_COLORS.inRange },
      { name: tr('reports.pie.high'), value: charts.tir.high, color: TIR_COLORS.high },
      { name: tr('reports.pie.low'), value: charts.tir.low, color: TIR_COLORS.low },
    ].filter((x) => x.value > 0);
  }, [charts, tr]);

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
      ? tr('reports.rangeHintTemplate')
          .replace('{low}', fromMgdl(metrics.lowestGlucose, glucoseUnit))
          .replace('{high}', fromMgdl(metrics.highestGlucose, glucoseUnit))
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
      downloadReportPdf(report, { userName: exportUserName, tr });
    } catch (err) {
      setExportError(err.message || tr('reports.errors.exportFailed'));
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
              <p className="db-rep-eyebrow">{tr('reports.eyebrow')}</p>
              <h1>{tr('reports.title')}</h1>
              <p className="db-rep-lead">
                {tr('reports.lead')}
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
                {tr('reports.exportPdf')}
              </button>
              <button type="button" className="db-rep-ghost" onClick={() => navigate('/logs')}>
                {tr('reports.openLogs')}
              </button>
            </div>
          </header>
          {exportError ? <p className="db-rep-export-error">{exportError}</p> : null}

          <div className="db-rep-controls">
            <div className="db-rep-controls-top">
              <div>
                <p className="db-rep-controls-label">{tr('reports.reportPeriod')}</p>
                <div className="db-rep-presets" role="tablist" aria-label={tr('reports.reportPeriod')}>
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      role="tab"
                      aria-selected={preset === p.id}
                      className={`db-rep-preset${preset === p.id ? ' is-active' : ''}`}
                      onClick={() => setPreset(p.id)}
                    >
                      {tr(p.labelKey)}
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
                {tr('reports.comparePeriods')}
              </label>
            </div>

            {preset === 'custom' && (
              <div className="db-rep-dates">
                <label>
                  {tr('reports.from')}
                  <input
                    type="date"
                    value={custom.start}
                    max={custom.end || undefined}
                    onChange={(e) => setCustom((c) => ({ ...c, start: e.target.value }))}
                  />
                </label>
                <label>
                  {tr('reports.to')}
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
                  <CalendarRange size={14} /> {tr('reports.compareAgainst')}
                </p>
                <label>
                  {tr('reports.from')}
                  <input
                    type="date"
                    value={compareCustom.start}
                    max={compareCustom.end || undefined}
                    onChange={(e) => setCompareCustom((c) => ({ ...c, start: e.target.value }))}
                  />
                </label>
                <label>
                  {tr('reports.to')}
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
              {tr('reports.buildingReport')}
            </div>
          ) : error ? (
            <div className="db-rep-state db-rep-state--error">
              <p>{error}</p>
              <button type="button" onClick={load}>
                {tr('common.retry')}
              </button>
            </div>
          ) : !hasAnyData ? (
            <div className="db-rep-state">
              <BarChart3 size={28} color={t.inkFaint} />
              <h2>{tr('reports.noDataTitle')}</h2>
              <p>{tr('reports.noDataBody')}</p>
              <button type="button" className="db-rep-primary" onClick={() => navigate('/logs')}>
                {tr('reports.goToLogs')}
              </button>
            </div>
          ) : (
            <>
              <div className="db-rep-period-line">
                <strong>{period.label}</strong>
                <span>{period.shortLabel}</span>
                {comparePeriod ? (
                  <span className="db-rep-vs">
                    {tr('reports.vs')} {comparePeriod.label} ({comparePeriod.shortLabel})
                  </span>
                ) : null}
                {generatedLabel ? <span className="db-rep-generated">{tr('reports.generated')} {generatedLabel}</span> : null}
              </div>

              <CareLetter story={story} tr={tr} />

              <div className="db-rep-metrics">
                <MetricCard
                  label={tr('reports.metrics.avgGlucose')}
                  value={avgGlucoseDisplay}
                  unit={` ${unitLabel}`}
                  delta={avgGlucoseDeltaDisplay}
                  invertDelta
                  against={compareAgainst}
                  hint={glucoseRangeHint}
                  tr={tr}
                />
                <MetricCard
                  label={tr('reports.metrics.timeInRange')}
                  value={metrics.timeInRangePercent}
                  unit="%"
                  delta={deltas?.timeInRangePercent}
                  against={compareAgainst}
                  tr={tr}
                />
                <MetricCard
                  label={tr('reports.metrics.estA1c')}
                  value={metrics.estimatedA1c}
                  unit="%"
                  delta={deltas?.estimatedA1c}
                  invertDelta
                  against={compareAgainst}
                  hint={tr('reports.hints.fromLoggedAverage')}
                  tr={tr}
                />
                <MetricCard
                  label={tr('reports.metrics.variability')}
                  value={glucoseStdDevDisplay}
                  unit={` ${unitLabel}`}
                  delta={glucoseStdDevDeltaDisplay}
                  invertDelta
                  against={compareAgainst}
                  hint={tr('reports.hints.stdDeviation')}
                  tr={tr}
                />
                <MetricCard
                  label={tr('reports.metrics.insulinTotal')}
                  value={metrics.totalInsulinUnits}
                  unit=" u"
                  delta={deltas?.totalInsulinUnits}
                  invertDelta
                  against={compareAgainst}
                  tr={tr}
                />
                <MetricCard
                  label={tr('reports.metrics.medAdherence')}
                  value={metrics.adherencePercent}
                  unit="%"
                  delta={deltas?.adherencePercent}
                  against={compareAgainst}
                  tr={tr}
                />
                <MetricCard
                  label={tr('reports.metrics.avgSleep')}
                  value={metrics.avgSleepHours}
                  unit=" h"
                  delta={deltas?.avgSleepHours}
                  against={compareAgainst}
                  tr={tr}
                />
                <MetricCard
                  label={tr('reports.metrics.activity')}
                  value={metrics.totalExerciseMinutes}
                  unit=" min"
                  delta={deltas?.totalExerciseMinutes}
                  against={compareAgainst}
                  tr={tr}
                />
              </div>

              <p className="db-rep-section-label">{tr('reports.sectionLabel')}</p>
              <div className="db-rep-grid">
                <ChartCard
                  title={tr('reports.charts.dailyAvgGlucoseTitle')}
                  subtitle={tr('reports.charts.targetTemplate').replace('{low}', tirTargetLow).replace('{high}', tirTargetHigh).replace('{unit}', unitLabel)}
                  empty={!dailyGlucose.length}
                  emptyLabel={tr('reports.charts.noData')}
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
                          name={tr('reports.chartNames.avgTemplate').replace('{unit}', unitLabel)}
                          stroke={t.skyDeep}
                          fill="url(#gluFill)"
                          strokeWidth={2}
                          connectNulls
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title={tr('reports.charts.timeInRangeTitle')} subtitle={tr('reports.charts.shareOfReadings')} empty={!tirPie.length} emptyLabel={tr('reports.charts.noData')}>
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
                  title={tr('reports.charts.byReadingTypeTitle')}
                  subtitle={tr('reports.charts.avgFastingVsMealsTemplate').replace('{unit}', unitLabel)}
                  empty={!readingTypeChart.length}
                  emptyLabel={tr('reports.charts.noData')}
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
                            tr('reports.chartNames.readingsTemplate')
                              .replace('{value}', value)
                              .replace('{unit}', unitLabel)
                              .replace('{count}', item?.payload?.count ?? 0),
                            tr('reports.chartNames.average'),
                          ]}
                        />
                        <Bar dataKey="avgGlucose" name={tr('reports.chartNames.avgTemplate').replace('{unit}', unitLabel)} fill={t.skyDeep} radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title={tr('reports.charts.carbsByDayTitle')} subtitle={tr('reports.charts.fromMealLogs')} empty={!charts?.daily?.some((d) => d.carbs > 0)} emptyLabel={tr('reports.charts.noData')}>
                  <div className="db-rep-chart-body">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                      <BarChart data={charts?.daily || []} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke={t.line} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="carbs" name={tr('reports.chartNames.carbsG')} fill={t.sage} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title={tr('reports.charts.insulinByDayTitle')} subtitle={tr('reports.charts.unitsLogged')} empty={!charts?.daily?.some((d) => d.insulin > 0)} emptyLabel={tr('reports.charts.noData')}>
                  <div className="db-rep-chart-body">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                      <BarChart data={charts?.daily || []} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke={t.line} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="insulin" name={tr('reports.chartNames.units')} fill={t.clay} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard
                  title={tr('reports.charts.waterActivityTitle')}
                  subtitle={tr('reports.charts.dailyTotals')}
                  empty={!charts?.daily?.some((d) => d.water > 0 || d.exercise > 0)}
                  emptyLabel={tr('reports.charts.noData')}
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
                        <Line yAxisId="left" type="monotone" dataKey="water" name={tr('reports.chartNames.waterMl')} stroke={t.skyDeep} strokeWidth={2} dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="exercise" name={tr('reports.chartNames.activityMin')} stroke={t.gold} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title={tr('reports.charts.sleepTitle')} subtitle={tr('reports.charts.hoursPerNight')} empty={!charts?.daily?.some((d) => d.sleepHours != null)} emptyLabel={tr('reports.charts.noData')}>
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
                          name={tr('reports.chartNames.hours')}
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
                  <ChartCard title={tr('reports.charts.insulinByTypeTitle')} subtitle={tr('reports.charts.totalUnitsInPeriod')}>
                    <div className="db-rep-chart-body">
                      <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                        <BarChart data={charts.insulinByType} layout="vertical" margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                          <CartesianGrid stroke={t.line} strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" width={90} tick={{ fill: t.inkSoft, fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="units" name={tr('reports.chartNames.units')} fill={t.clay} radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                )}

                {charts?.mood?.length > 0 && (
                  <ChartCard title={tr('reports.charts.moodEntriesTitle')} subtitle={tr('reports.charts.countsInPeriod')}>
                    <div className="db-rep-chart-body">
                      <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                        <BarChart data={charts.mood} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                          <CartesianGrid stroke={t.line} strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: t.inkFaint, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                          <YAxis allowDecimals={false} tick={{ fill: t.inkFaint, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="count" name={tr('reports.chartNames.entries')} fill={t.peach} radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                )}
              </div>

              <section className="db-rep-totals">
                <h2>{tr('reports.periodTotals.heading')}</h2>
                <div className="db-rep-totals-grid">
                  <div>
                    <Droplets size={16} />
                    <p>
                      <strong>{metrics.glucoseReadings}</strong> {tr('reports.periodTotals.glucoseReadings')}
                    </p>
                  </div>
                  <div>
                    <Activity size={16} />
                    <p>
                      <strong>{metrics.mealsLogged}</strong> {tr('reports.periodTotals.meals')} · <strong>{metrics.totalCarbs}</strong> {tr('reports.periodTotals.gCarbs')}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>{metrics.medsTaken}</strong> {tr('reports.periodTotals.medsTaken')} ·{' '}
                      <strong>{(metrics.medsMissed || 0) + (metrics.medsSkipped || 0)}</strong> {tr('reports.periodTotals.missedSkipped')}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>{metrics.totalWaterMl}</strong> {tr('reports.periodTotals.mlWater')} · {tr('reports.periodTotals.avg')}{' '}
                      <strong>{metrics.avgWaterPerDay ?? '—'}</strong>/{tr('reports.periodTotals.day')}
                    </p>
                  </div>
                  <div>
                    <p>
                      {tr('reports.periodTotals.loggedOn')} <strong>{metrics.loggingDays}</strong> {tr('reports.periodTotals.of')} <strong>{metrics.dayCount}</strong> {tr('reports.periodTotals.days')}
                    </p>
                  </div>
                </div>
                <p className="db-rep-disclaimer">
                  {tr('reports.disclaimer')}
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
            linear-gradient(180deg, ${t.pageFadeTop} 0%, ${t.bg} 38%);
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
          background: ${t.surface};
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
          background: ${t.surface};
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
          background: ${t.surface};
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
          background: linear-gradient(180deg, ${t.surface} 0%, ${t.surfaceRaised} 100%);
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
          background: ${t.surface};
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
          background: ${t.surface};
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
          background: ${t.surface};
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
