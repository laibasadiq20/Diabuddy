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
import { useI18n } from '../../i18n/I18nContext';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';
import AppSidebar from '../../components/AppSidebar';
import { fromMgdl, glucoseUnitLabel } from '../../utils/glucoseUnits';
import { formatWaterShort, mlToLiters, mlToUsFlOz, round0, round1 } from '../../utils/waterUnits';
import { getUserTzOffset } from '../../utils/timezone';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  Circle,
  ClipboardList,
  Droplets,
  Eye,
  Flame,
  Footprints,
  GlassWater,
  Leaf,
  Lightbulb,
  Moon,
  Pill,
  Route,
  Stethoscope,
  Syringe,
  Target,
  Users,
  Utensils,
  Watch,
} from 'lucide-react';
import WalkingPerson from '../../components/icons/WalkingPerson';

const t = theme;
// Backend always reports glucose in mg/dL; these are the mg/dL thresholds
// converted for display via fromMgdl() based on the user's glucoseUnit preference.
const TIR_LOW_MGDL = 70;
const TIR_HIGH_MGDL = 180;
const WEEKDAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatSteps(n) {
  if (n == null || n <= 0) return '—';
  return n.toLocaleString();
}

function isSameDayInOffset(a, b, tzOffset) {
  if (!a || !b) return false;
  const d = new Date(a);
  const e = new Date(b);
  if (Number.isNaN(d.getTime()) || Number.isNaN(e.getTime())) return false;
  const sa = new Date(d.getTime() - tzOffset * 60000);
  const sb = new Date(e.getTime() - tzOffset * 60000);
  return (
    sa.getUTCFullYear() === sb.getUTCFullYear() &&
    sa.getUTCMonth() === sb.getUTCMonth() &&
    sa.getUTCDate() === sb.getUTCDate()
  );
}

function weekdayKeyInOffset(dayDate, tzOffset) {
  const shifted = new Date(dayDate.getTime() - tzOffset * 60000);
  return WEEKDAY_KEYS[shifted.getUTCDay()];
}

/** Does this reminder belong on the given calendar day (user timezone)? */
function reminderAppliesOn(r, dayDate, tzOffset = 0) {
  if (!r || r.enabled === false) return false;

  if (r.appointmentDate) {
    return isSameDayInOffset(r.appointmentDate, dayDate, tzOffset);
  }

  if (r.repeat === 'daily') return true;

  const days = Array.isArray(r.days) ? r.days : [];
  if (days.length === 0) return false;
  // All 7 days selected ≈ daily
  if (days.length >= 7) return true;

  if (r.repeat === 'weekly' || r.repeat === 'custom') {
    return days.includes(weekdayKeyInOffset(dayDate, tzOffset));
  }
  return false;
}

function withCompletedFlag(r, now, tzOffset) {
  return {
    ...r,
    id: r.id || r._id,
    isCompletedToday: isSameDayInOffset(r.lastCompletedAt, now, tzOffset),
  };
}

function buildTodayReminders(all, tzOffset) {
  const now = new Date();
  return (Array.isArray(all) ? all : [])
    .filter((r) => reminderAppliesOn(r, now, tzOffset))
    .map((r) => withCompletedFlag(r, now, tzOffset))
    .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
}

function formatReminderTime(time, notSetLabel) {
  if (time && /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
  }
  return notSetLabel;
}

function reminderIconEl(r) {
  const iconName = String(r.icon || '').trim();
  const titleLower = (r.title || '').toLowerCase();
  const size = 15;
  if (iconName === 'syringe' || iconName === '💉' || titleLower.includes('insulin')) return <Syringe size={size} />;
  if (iconName === 'pill' || iconName === '💊' || titleLower.includes('med')) return <Pill size={size} />;
  if (iconName === 'droplets' || iconName === '🩸' || titleLower.includes('glucose')) return <Droplets size={size} />;
  if (iconName === 'moon' || iconName === '🌙' || titleLower.includes('bed')) return <Moon size={size} />;
  if (iconName === 'calendar' || iconName === '📅' || titleLower.includes('doctor')) return <Calendar size={size} />;
  if (iconName === 'stethoscope' || iconName === '🩺') return <Stethoscope size={size} />;
  if (iconName === 'eye' || iconName === '👁️' || iconName === '👁') return <Eye size={size} />;
  return <Bell size={size} />;
}

const REMINDER_TITLE_KEYS = {
  'Take Insulin': 'reminders.titles.takeInsulin',
  'Take Medicine': 'reminders.titles.takeMedicine',
  'Check Blood Glucose': 'reminders.titles.checkBloodGlucose',
  Bedtime: 'reminders.titles.bedtime',
  'Doctor Appointment': 'reminders.titles.doctorAppointment',
};

const tooltipStyle = {
  background: t.surface,
  border: `1px solid ${t.lineStrong}`,
  borderRadius: 10,
  fontSize: 12,
  color: t.ink,
  boxShadow: t.shadowCard,
};

export default function Dashboard() {
  const { user, authHeaders } = useAuth();
  const { t: tr } = useI18n();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [weekReport, setWeekReport] = useState(null);
  const [streak, setStreak] = useState(null);
  const [latestPost, setLatestPost] = useState(null);
  const [todayReminders, setTodayReminders] = useState([]);
  const [tomorrowReminders, setTomorrowReminders] = useState([]);
  const [googleHealth, setGoogleHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleReminderComplete = async (id) => {
    const remId = String(id);
    setTodayReminders((prev) =>
      prev.map((r) =>
        String(r.id || r._id) === remId ? { ...r, isCompletedToday: true } : r
      )
    );
    try {
      const res = await fetch(`${API_URL}/reminders/${remId}/complete`, {
        method: 'PATCH',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          completed: true,
          tzOffset: getUserTzOffset(user),
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        const updated = data.data;
        setTodayReminders((prev) =>
          prev.map((r) =>
            String(r.id || r._id) === remId
              ? { ...updated, id: updated.id || updated._id, isCompletedToday: true }
              : r
          )
        );
      } else {
        setTodayReminders((prev) =>
          prev.map((r) =>
            String(r.id || r._id) === remId ? { ...r, isCompletedToday: false } : r
          )
        );
      }
    } catch (err) {
      console.error('Toggle complete error:', err);
      setTodayReminders((prev) =>
        prev.map((r) =>
          String(r.id || r._id) === remId ? { ...r, isCompletedToday: false } : r
        )
      );
    }
  };

  const firstName = user?.name?.split(' ')[0] || tr('dashboard.buddyFallback');
  const hour = new Date().getHours();
  const dayOfMonth = new Date().getDate();
  const weekday = new Date().getDay(); // 0 Sun … 6 Sat
  const timeBucket = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
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

    const loadReminders = async (headers, tzOffset) => {
      const [remRes, allRemRes] = await Promise.all([
        fetch(`${API_URL}/reminders/today?tzOffset=${tzOffset}`, {
          credentials: 'include',
          headers,
        }),
        fetch(`${API_URL}/reminders?tzOffset=${tzOffset}`, {
          credentials: 'include',
          headers,
        }),
      ]);

      let all = [];
      if (allRemRes.ok) {
        const data = await allRemRes.json();
        if (data?.status === 'success') {
          const raw = data.data;
          if (Array.isArray(raw)) {
            all = raw;
          } else if (raw && typeof raw === 'object') {
            all =
              raw.reminders ||
              [...(raw.defaultReminders || []), ...(raw.customReminders || [])];
          }
          if (!Array.isArray(all)) all = [];
        }
      }

      // Always derive "today" from the full list so Daily / Custom (all days) match.
      const fromAll = buildTodayReminders(all, tzOffset);
      if (!cancelled) {
        if (fromAll.length > 0) {
          setTodayReminders(fromAll);
        } else if (remRes.ok) {
          const data = await remRes.json();
          if (data?.status === 'success') {
            setTodayReminders(Array.isArray(data.data) ? data.data : []);
          } else {
            setTodayReminders([]);
          }
        } else {
          setTodayReminders([]);
        }
      }

      if (!cancelled && Array.isArray(all)) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 0, 0, 0);
        const list = all
          .filter((r) => reminderAppliesOn(r, tomorrow, tzOffset))
          .map((r) => withCompletedFlag(r, tomorrow, tzOffset))
          .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
        setTomorrowReminders(list);
      }
    };

    const load = async () => {
      try {
        const headers = { ...authHeaders() };
        const tzOffset = getUserTzOffset(user);
        const [sumRes, reportRes, streakRes, postRes, ghRes] = await Promise.all([
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
          fetch(`${API_URL}/google-health/status`, {
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
        if (ghRes.ok) {
          const data = await ghRes.json();
          if (data?.status === 'success') setGoogleHealth(data.data || null);
        }

        await loadReminders(headers, tzOffset);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const id = setInterval(load, 30000);

    const onRemindersRefresh = () => {
      const headers = { ...authHeaders() };
      const tzOffset = getUserTzOffset(user);
      loadReminders(headers, tzOffset).catch(() => {});
    };
    window.addEventListener('diabuddy:reminders-refresh', onRemindersRefresh);
    window.addEventListener('focus', onRemindersRefresh);

    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener('diabuddy:reminders-refresh', onRemindersRefresh);
      window.removeEventListener('focus', onRemindersRefresh);
    };
  }, [user]);

  const waterLabel = formatWaterShort(waterToday);
  const waterGoalL = round1(mlToLiters(waterGoal));
  const waterGoalOz = round0(mlToUsFlOz(waterGoal));

  const waterPct = Math.min(100, Math.round((waterToday / waterGoal) * 100));
  const stepsPct = Math.min(100, Math.round((stepsToday / stepsGoal) * 100));
  const glucoseEmpty = latestGlucose == null;
  const waterEmpty = waterToday <= 0;
  const stepsEmpty = stepsToday <= 0;
  const streakEmpty = !(streak?.currentStreak > 0);
  const pendingReminders = useMemo(
    () => todayReminders.filter((r) => !r.isCompletedToday),
    [todayReminders]
  );
  const visibleReminders = pendingReminders.slice(0, 4);
  const moreRemindersCount = Math.max(0, pendingReminders.length - 4);
  const remindersEmpty = pendingReminders.length === 0;
  const remindersAllDone = remindersEmpty && todayReminders.length > 0;
  const tomorrowPreview = tomorrowReminders.slice(0, 3);
  const ghConnected = Boolean(googleHealth?.connected);
  const ghSteps = Number(googleHealth?.lastSteps) || stepsToday || 0;
  const ghDistanceKm = Number(googleHealth?.lastDistanceKm) || 0;
  const ghCalories = Number(googleHealth?.lastCalories) || 0;
  const ghLastSyncLabel = useMemo(() => {
    if (!googleHealth?.lastSyncAt) return null;
    const d = new Date(googleHealth.lastSyncAt);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }, [googleHealth?.lastSyncAt]);

  const heroCopy = useMemo(() => {
    const greetKeys =
      timeBucket === 'morning'
        ? ['dashboard.greet.morningA', 'dashboard.greet.morningB', 'dashboard.greet.morningC']
        : timeBucket === 'afternoon'
          ? ['dashboard.greet.afternoonA', 'dashboard.greet.afternoonB', 'dashboard.greet.afternoonC']
          : ['dashboard.greet.eveningA', 'dashboard.greet.eveningB', 'dashboard.greet.eveningC'];
    const greeting = tr(greetKeys[dayOfMonth % greetKeys.length]);

    if (loading) {
      return { greeting, lead: tr('dashboard.loadingLead') };
    }

    if (streak?.atRisk && streak?.currentStreak > 0) {
      return {
        greeting,
        lead: tr('dashboard.leads.streakAtRisk').replace('{n}', String(streak.currentStreak)),
      };
    }
    if (remindersAllDone) {
      return { greeting, lead: tr('dashboard.leads.remindersDone') };
    }
    if ((streak?.currentStreak || 0) >= 5) {
      return {
        greeting,
        lead: tr('dashboard.leads.streakStrong').replace('{n}', String(streak.currentStreak)),
      };
    }
    if ((streak?.currentStreak || 0) >= 3) {
      return { greeting, lead: tr('dashboard.leads.greatWeek') };
    }
    if (glucoseCount > 0 && mealsToday > 0) {
      return { greeting, lead: tr('dashboard.leads.loggingWell') };
    }
    if (glucoseCount > 0) {
      return { greeting, lead: tr('dashboard.leads.glucoseLogged') };
    }
    if (waterPct >= 60) {
      return { greeting, lead: tr('dashboard.leads.hydrateGood') };
    }
    if (weekday === 1) {
      return { greeting, lead: tr('dashboard.leads.monday') };
    }
    if (weekday === 0 || weekday === 6) {
      return { greeting, lead: tr('dashboard.leads.weekend') };
    }

    const fallbackKeys =
      timeBucket === 'morning'
        ? ['dashboard.leads.healthyDay', 'dashboard.leads.smallLogs', 'dashboard.leads.freshStart']
        : timeBucket === 'afternoon'
          ? ['dashboard.leads.keepGoing', 'dashboard.leads.smallLogs', 'dashboard.leads.checkIn']
          : ['dashboard.leads.eveningCalm', 'dashboard.leads.smallLogs', 'dashboard.leads.restWell'];
    return {
      greeting,
      lead: tr(fallbackKeys[dayOfMonth % fallbackKeys.length]),
    };
  }, [
    loading,
    timeBucket,
    dayOfMonth,
    weekday,
    streak,
    remindersAllDone,
    glucoseCount,
    mealsToday,
    waterPct,
    tr,
  ]);

  return (
    <div className="db-home">
      <AppSidebar />

      <main className="db-home-main">
        <div className="db-home-inner">
          <header className="db-home-hero">
            <p className="db-home-kicker db-home-hero-date">{today}</p>
            <h1 className="db-home-hero-title">
              {heroCopy.greeting}, <em>{firstName}</em>
            </h1>
            <p className="db-home-lead">{heroCopy.lead}</p>
          </header>

          {streak?.atRisk && (
            <button
              type="button"
              className="db-home-alert"
              onClick={() => navigate('/logs')}
            >
              <AlertTriangle size={16} />
              <span>
                <strong>{tr('dashboard.streakAtRiskTemplate').replace('{n}', streak.currentStreak)}</strong>
                {' '}{tr('dashboard.logAnythingToday')}
              </span>
              <ArrowRight size={14} />
            </button>
          )}

          <section className="db-home-glance" aria-label={tr('dashboard.glance.title')}>
            <p className="db-home-kicker">{tr('dashboard.glance.title')}</p>
            <div className="db-home-glance-grid">
              <div className="db-home-glance-card">
                <span className="db-home-glance-icon" style={{ background: t.skySoft, color: t.skyDeep }}>
                  <Droplets size={16} />
                </span>
                <span className="db-home-glance-label">{tr('dashboard.glance.glucose')}</span>
                {!glucoseEmpty ? (
                  <strong>
                    {latestGlucose}
                    <small>{unitLabel}</small>
                  </strong>
                ) : (
                  <strong className="is-empty">{tr('dashboard.glance.ctaGlucose')}</strong>
                )}
                {glucoseCount > 0 ? (
                  <span className="db-home-glance-sub">
                    {tr(glucoseCount === 1 ? 'dashboard.glance.readingOne' : 'dashboard.glance.readingMany').replace('{n}', glucoseCount)}
                  </span>
                ) : null}
              </div>

              <div className="db-home-glance-card">
                <span
                  className="db-home-glance-icon db-home-glance-ring"
                  style={{ background: t.goldSoft, color: t.gold }}
                >
                  <svg className="db-home-glance-ring-svg" viewBox="0 0 36 36" aria-hidden>
                    <circle className="db-home-glance-ring-track" cx="18" cy="18" r="15.5" pathLength="100" />
                    <circle
                      className="db-home-glance-ring-prog"
                      cx="18"
                      cy="18"
                      r="15.5"
                      pathLength="100"
                      style={{ stroke: t.gold, strokeDasharray: `${stepsPct} 100` }}
                    />
                  </svg>
                  <Footprints size={15} />
                </span>
                <span className="db-home-glance-label">{tr('dashboard.glance.steps')}</span>
                {!stepsEmpty ? (
                  <strong>{formatSteps(stepsToday)}</strong>
                ) : (
                  <strong className="is-empty">{tr('dashboard.glance.ctaSteps')}</strong>
                )}
                <span className="db-home-glance-sub">
                  {!stepsEmpty
                    ? `${tr('dashboard.glance.ofGoal').replace('{n}', stepsGoal.toLocaleString())} · ${stepsPct}%`
                    : tr('dashboard.glance.manualOrWatch')}
                </span>
              </div>

              <div className="db-home-glance-card">
                <span
                  className="db-home-glance-icon db-home-glance-ring"
                  style={{ background: t.skyTint, color: t.sky }}
                >
                  <svg className="db-home-glance-ring-svg" viewBox="0 0 36 36" aria-hidden>
                    <circle className="db-home-glance-ring-track" cx="18" cy="18" r="15.5" pathLength="100" />
                    <circle
                      className="db-home-glance-ring-prog"
                      cx="18"
                      cy="18"
                      r="15.5"
                      pathLength="100"
                      style={{ stroke: t.sky, strokeDasharray: `${waterPct} 100` }}
                    />
                  </svg>
                  <GlassWater size={15} />
                </span>
                <span className="db-home-glance-label">{tr('dashboard.glance.water')}</span>
                {!waterEmpty ? (
                  <strong>
                    {waterToday >= 1000 ? (
                      <>
                        {round1(mlToLiters(waterToday))}
                        <small>L</small>
                      </>
                    ) : (
                      <>
                        {round0(mlToUsFlOz(waterToday))}
                        <small>oz</small>
                      </>
                    )}
                  </strong>
                ) : (
                  <strong className="is-empty">{tr('dashboard.glance.ctaWater')}</strong>
                )}
                <span className="db-home-glance-sub">
                  {tr('dashboard.glance.ofGoalLOz')
                    .replace('{L}', String(waterGoalL))
                    .replace('{oz}', String(waterGoalOz))}
                  {!waterEmpty ? ` · ${waterPct}%` : ''}
                </span>
              </div>

              <div className="db-home-glance-card">
                <span className="db-home-glance-icon" style={{ background: t.claySoft, color: t.clayDeep }}>
                  <Flame size={16} />
                </span>
                <span className="db-home-glance-label">{tr('dashboard.glance.streak')}</span>
                {!streakEmpty ? (
                  <strong>
                    {streak.currentStreak}
                    <small>{tr('dashboard.glance.daysWord')}</small>
                  </strong>
                ) : (
                  <strong className="is-empty">{tr('dashboard.glance.ctaStreak')}</strong>
                )}
                <span className="db-home-glance-sub">
                  {streak?.atRisk
                    ? tr('dashboard.glance.atRiskLogToday')
                    : !streakEmpty
                      ? tr('dashboard.glance.keepItGoing')
                      : tr('dashboard.glance.logAnythingToday')}
                </span>
              </div>

              <div className="db-home-glance-card db-home-glance-card--report">
                <span className="db-home-glance-icon" style={{ background: t.sageSoft, color: t.sageDeep }}>
                  <Target size={16} />
                </span>
                <span className="db-home-glance-label">{tr('dashboard.glance.timeInRange')}</span>
                {tir != null ? (
                  <strong>{tir}%</strong>
                ) : (
                  <strong className="is-empty">{tr('dashboard.glance.noTir')}</strong>
                )}
                <span className="db-home-glance-sub">{tirLow}–{tirHigh} {unitLabel} · {tr('dashboard.glance.days7')}</span>
              </div>
            </div>
          </section>

          <button
            type="button"
            className={`db-home-watch${ghConnected ? ' is-connected' : ''}`}
            onClick={() => navigate('/google-health')}
          >
            {ghConnected ? (
              <>
                <div className="db-home-watch-top">
                  <span className="db-home-watch-icon is-ok">
                    <CheckCircle2 size={22} strokeWidth={2} />
                  </span>
                  <span className="db-home-watch-copy">
                    <strong>{tr('dashboard.watch.syncedTitle')}</strong>
                    <em>
                      {ghLastSyncLabel
                        ? tr('dashboard.watch.lastSynced').replace('{time}', ghLastSyncLabel)
                        : tr('dashboard.watch.syncedHint')}
                    </em>
                  </span>
                </div>
                <div className="db-home-watch-stats" aria-label={tr('dashboard.watch.today')}>
                  <p className="db-home-watch-today-label">{tr('dashboard.watch.today')}</p>
                  <span className="db-home-watch-stat">
                    <Footprints size={14} />
                    {tr('dashboard.watch.stepsValue').replace('{n}', (ghSteps || 0).toLocaleString())}
                  </span>
                  <span className="db-home-watch-stat">
                    <Route size={14} />
                    {tr('dashboard.watch.distanceValue').replace('{n}', String(round1(ghDistanceKm)))}
                  </span>
                  <span className="db-home-watch-stat">
                    <Flame size={14} />
                    {tr('dashboard.watch.kcalValue').replace('{n}', String(Math.round(ghCalories)))}
                  </span>
                </div>
                <span className="db-home-watch-cta">
                  {tr('dashboard.watch.viewDetails')}
                  <ArrowRight size={14} />
                </span>
              </>
            ) : (
              <>
                <div className="db-home-watch-top db-home-watch-top--connect">
                  <span className="db-home-watch-icon">
                    <Watch size={22} strokeWidth={1.75} />
                  </span>
                  <span className="db-home-watch-copy">
                    <strong>{tr('dashboard.watch.title')}</strong>
                    <em>{tr('dashboard.watch.subtitle')}</em>
                    <span className="db-home-watch-status">{tr('dashboard.watch.notConnected')}</span>
                  </span>
                  <span className="db-home-watch-cta">
                    {tr('dashboard.watch.connect')}
                    <ArrowRight size={14} />
                  </span>
                </div>
              </>
            )}
          </button>

          <div className="db-home-mid">
            <section className="db-home-today-panel" aria-label={tr('dashboard.todayPanel.title')}>
              <header className="db-home-card-head">
                <div>
                  <p className="db-home-kicker">{tr('dashboard.todayPanel.kicker')}</p>
                  <h2>{tr('dashboard.todayPanel.title')}</h2>
                </div>
              </header>
              <div className="db-home-today-grid">
                <button type="button" className="db-home-today-cell" onClick={() => navigate('/logs/meal')}>
                  <Utensils size={16} />
                  <span className="db-home-today-cat">{tr('dashboard.todayPanel.meals')}</span>
                  <strong>{mealsToday}</strong>
                  <span className="db-home-today-meta">{tr('dashboard.todayPanel.logged')}</span>
                  <ArrowRight size={14} className="db-home-today-arrow" aria-hidden />
                </button>
                <button type="button" className="db-home-today-cell" onClick={() => navigate('/logs/insulin')}>
                  <Syringe size={16} />
                  <span className="db-home-today-cat">{tr('dashboard.todayPanel.insulin')}</span>
                  <strong>{insulinToday > 0 ? insulinToday : 0}</strong>
                  <span className="db-home-today-meta">{tr('dashboard.todayPanel.units')}</span>
                  <ArrowRight size={14} className="db-home-today-arrow" aria-hidden />
                </button>
                <button type="button" className="db-home-today-cell" onClick={() => navigate('/logs/medication')}>
                  <Pill size={16} />
                  <span className="db-home-today-cat">{tr('dashboard.todayPanel.medication')}</span>
                  <strong>{medsToday > 0 ? medsToday : 0}</strong>
                  <span className="db-home-today-meta">{tr('dashboard.todayPanel.taken')}</span>
                  <ArrowRight size={14} className="db-home-today-arrow" aria-hidden />
                </button>
                <button type="button" className="db-home-today-cell" onClick={() => navigate('/logs/water')}>
                  <GlassWater size={16} />
                  <span className="db-home-today-cat">{tr('dashboard.todayPanel.water')}</span>
                  <strong>{waterToday > 0 ? waterLabel : 0}</strong>
                  <span className="db-home-today-meta">{tr('dashboard.todayPanel.logged')}</span>
                  <ArrowRight size={14} className="db-home-today-arrow" aria-hidden />
                </button>
                <button type="button" className="db-home-today-cell" onClick={() => navigate('/logs/exercise')}>
                  <WalkingPerson size={16} />
                  <span className="db-home-today-cat">{tr('dashboard.todayPanel.exercise')}</span>
                  <strong>
                    {exerciseToday > 0 || stepsToday > 0
                      ? [
                          exerciseToday > 0
                            ? tr('dashboard.todayPanel.minValue').replace('{n}', String(exerciseToday))
                            : null,
                          stepsToday > 0
                            ? tr('dashboard.todayPanel.stepsValue').replace(
                                '{n}',
                                formatSteps(stepsToday)
                              )
                            : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')
                      : 0}
                  </strong>
                  <span className="db-home-today-meta">
                    {exerciseToday > 0 && stepsToday > 0
                      ? tr('dashboard.todayPanel.activity')
                      : stepsToday > 0
                        ? tr('dashboard.todayPanel.steps')
                        : tr('dashboard.todayPanel.minutes')}
                  </span>
                  <ArrowRight size={14} className="db-home-today-arrow" aria-hidden />
                </button>
                <button type="button" className="db-home-today-cell" onClick={() => navigate('/logs')}>
                  <ClipboardList size={16} />
                  <span className="db-home-today-cat">{tr('dashboard.todayPanel.all')}</span>
                  <strong className="db-home-today-open">{tr('dashboard.todayPanel.openLogs')}</strong>
                  <ArrowRight size={14} className="db-home-today-arrow" aria-hidden />
                </button>
              </div>
            </section>

            <section
              className={`db-home-panel db-home-reminders${remindersEmpty ? ' is-empty' : ''}`}
              aria-label={tr('reminders.dashboard.title')}
            >
              <header className="db-home-card-head">
                <div>
                  <p className="db-home-kicker">{tr('reminders.dashboard.kicker')}</p>
                  <h2>{tr('reminders.dashboard.title')}</h2>
                </div>
                <button type="button" className="db-home-text-link" onClick={() => navigate('/reminders')}>
                  {tr('reminders.dashboard.manage')}
                  <ArrowRight size={14} />
                </button>
              </header>

              {!remindersEmpty ? (
                <div className="db-home-reminder-list">
                  {visibleReminders.map((r) => {
                    const displayTitle = REMINDER_TITLE_KEYS[r.title]
                      ? tr(REMINDER_TITLE_KEYS[r.title])
                      : r.title;
                    const timeStr = formatReminderTime(r.time, tr('reminders.notSet'));

                    return (
                      <div key={r.id || r._id} className="db-home-reminder-row">
                        <span className="db-home-reminder-icon">{reminderIconEl(r)}</span>
                        <div className="db-home-reminder-copy">
                          <p className="db-home-reminder-title">{displayTitle}</p>
                          <p className="db-home-reminder-time">{timeStr}</p>
                        </div>
                        <button
                          type="button"
                          className="db-home-reminder-check"
                          onClick={() => toggleReminderComplete(r.id || r._id)}
                          title={tr('reminders.dashboard.markCompleted')}
                          aria-label={tr('reminders.dashboard.markCompleted')}
                        >
                          <Circle size={22} />
                        </button>
                      </div>
                    );
                  })}
                  {moreRemindersCount > 0 ? (
                    <button
                      type="button"
                      className="db-home-reminder-more"
                      onClick={() => navigate('/reminders')}
                    >
                      {tr('reminders.dashboard.viewMore').replace('{n}', String(moreRemindersCount))}
                      <ArrowRight size={14} />
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="db-home-reminder-done">
                  <span className="db-home-reminder-done-badge" aria-hidden>
                    <CheckCircle2 size={28} strokeWidth={2} />
                  </span>
                  <p className="db-home-reminder-done-title">
                    {remindersAllDone
                      ? tr('reminders.dashboard.allDoneTitle')
                      : tr('reminders.dashboard.emptyTitle')}
                  </p>
                  <p className="db-home-reminder-done-sub">
                    {remindersAllDone
                      ? tr('reminders.dashboard.allDoneSub')
                      : tr('reminders.dashboard.emptySub')}
                    {remindersAllDone ? (
                      <Leaf size={14} className="db-home-reminder-done-leaf" aria-hidden />
                    ) : null}
                  </p>

                  {tomorrowPreview.length > 0 ? (
                    <div className="db-home-reminder-tomorrow">
                      <p className="db-home-reminder-tomorrow-kicker">
                        {tr('reminders.dashboard.tomorrow')}
                      </p>
                      {tomorrowPreview.map((r) => {
                        const displayTitle = REMINDER_TITLE_KEYS[r.title]
                          ? tr(REMINDER_TITLE_KEYS[r.title])
                          : r.title;
                        return (
                          <div key={r.id || r._id} className="db-home-reminder-row is-tomorrow">
                            <span className="db-home-reminder-icon">{reminderIconEl(r)}</span>
                            <div className="db-home-reminder-copy">
                              <p className="db-home-reminder-title">{displayTitle}</p>
                              <p className="db-home-reminder-time">
                                {formatReminderTime(r.time, tr('reminders.notSet'))}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              )}
            </section>
          </div>

          <section className="db-home-chart-card" aria-label={tr('dashboard.chart.kicker')}>
            <header className="db-home-card-head">
              <div>
                <p className="db-home-kicker">{tr('dashboard.chart.kicker')}</p>
                <h2 className="db-home-chart-title">
                  {tr('dashboard.chart.title').replace(/(\d+)/g, '|||$1|||').split('|||').map((part, i) =>
                    /^\d+$/.test(part) ? (
                      <span key={i} className="db-home-chart-num">{part}</span>
                    ) : (
                      <React.Fragment key={i}>{part}</React.Fragment>
                    )
                  )}
                </h2>
              </div>
              <button type="button" className="db-home-text-link" onClick={() => navigate('/reports')}>
                {tr('dashboard.chart.fullReport')}
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
                      formatter={(value) => [`${value} ${unitLabel}`, tr('dashboard.avgTooltip')]}
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
                <p>{tr('dashboard.chart.empty')}</p>
                <button type="button" onClick={() => navigate('/logs/glucose')}>
                  {tr('dashboard.chart.logReading')}
                </button>
              </div>
            )}

            {latestGlucose != null && (
              <p className="db-home-chart-footnote">
                {tr('dashboard.chart.latestToday')} <strong>{latestGlucose} {unitLabel}</strong>
                {glucoseCount > 0 ? ` · ${tr(glucoseCount === 1 ? 'dashboard.glance.readingOne' : 'dashboard.glance.readingMany').replace('{n}', glucoseCount)}` : ''}
              </p>
            )}
          </section>

          <div className="db-home-duo">
            <section className="db-home-panel db-home-panel--insights">
              <header className="db-home-card-head">
                <div>
                  <p className="db-home-kicker">{tr('dashboard.insights.kicker')}</p>
                  <h2>{tr('dashboard.insights.title')}</h2>
                </div>
                <button type="button" className="db-home-text-link" onClick={() => navigate('/reports')}>
                  {tr('dashboard.insights.more')}
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
                  {tr('dashboard.insights.empty')}
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
                <p className="db-home-kicker">{tr('dashboard.community.kicker')}</p>
                <span className="db-home-community-badge">
                  <Users size={14} />
                  {tr('dashboard.community.badge')}
                </span>
              </div>
              <h2>{latestPost?.title || tr('dashboard.community.joinTitle')}</h2>
              <p>
                {latestPost?.title
                  ? tr('dashboard.community.latestNote')
                  : tr('dashboard.community.askNote')}
              </p>
              <span className="db-home-community-cta">
                {latestPost?._id ? tr('dashboard.community.readPost') : tr('dashboard.community.openCommunity')}
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
            linear-gradient(180deg, ${t.pageFadeTop} 0%, ${t.bg} 36%);
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
          display: block;
          margin: 0 0 22px;
          padding: 18px 20px 20px;
          border-radius: 18px;
          border: 1px solid ${t.sage}66;
          background:
            radial-gradient(ellipse 80% 70% at 100% 0%, rgba(232, 184, 154, 0.22), transparent 55%),
            linear-gradient(155deg, ${t.forest} 0%, #314a39 48%, ${t.forestDeep} 100%);
          color: #F4F0E8;
          box-shadow: 0 12px 32px rgba(39, 57, 46, 0.22);
        }
        .db-home-hero-date {
          margin: 0 0 8px;
          color: rgba(244, 240, 232, 0.62);
        }
        .db-home-hero .db-home-kicker {
          color: rgba(244, 240, 232, 0.62);
        }
        .db-home-hero-title {
          margin: 0;
          font-family: ${t.fontDisplay};
          font-size: clamp(32px, 5.5vw, 44px);
          font-weight: 500;
          letter-spacing: -0.035em;
          line-height: 1.08;
          color: #FFF;
        }
        .db-home-hero-title em {
          font-style: italic;
          color: ${t.peach};
        }
        .db-home-lead {
          margin: 10px 0 0;
          font-size: 15px;
          color: rgba(244, 240, 232, 0.78);
          line-height: 1.45;
          max-width: 42ch;
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
          background: color-mix(in srgb, ${t.surfaceRaised} 92%, transparent);
          cursor: default;
          font-family: ${t.fontBody};
          min-width: 0;
          box-shadow: ${t.shadowCard};
          transition: background 0.15s ease;
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
          position: relative;
        }
        .db-home-glance-ring {
          width: 36px;
          height: 36px;
          border-radius: 999px;
        }
        .db-home-glance-ring-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }
        .db-home-glance-ring-track,
        .db-home-glance-ring-prog {
          fill: none;
          stroke-width: 2.75;
        }
        .db-home-glance-ring-track {
          stroke: color-mix(in srgb, currentColor 22%, transparent);
        }
        .db-home-glance-ring-prog {
          stroke-linecap: round;
          transition: stroke-dasharray 0.35s ease;
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
        .db-home-glance-card strong.is-empty {
          font-size: 14px;
          font-weight: 650;
          letter-spacing: -0.01em;
          line-height: 1.3;
          color: ${t.inkSoft};
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

        .db-home-watch {
          width: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 14px;
          text-align: left;
          margin-bottom: 16px;
          padding: 18px 20px;
          border-radius: 18px;
          border: 1.5px solid ${t.lineStrong};
          background: ${t.surface};
          box-shadow: ${t.shadowCard};
          cursor: pointer;
          font-family: ${t.fontBody};
          min-height: 0;
        }
        .db-home-watch:not(.is-connected) {
          border-color: ${t.gold};
          background: linear-gradient(105deg, ${t.goldTint} 0%, ${t.surface} 55%);
        }
        .db-home-watch.is-connected {
          border: 1.5px solid ${t.lineStrong};
          background: ${t.surface};
        }
        .db-home-watch-top {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          min-width: 0;
        }
        .db-home-watch-top--connect {
          align-items: center;
        }
        .db-home-watch-top--connect .db-home-watch-cta {
          align-self: center;
          flex-shrink: 0;
          margin-left: auto;
        }
        .db-home-watch-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: ${t.goldSoft};
          color: ${t.gold};
          flex-shrink: 0;
          border: 1.5px solid ${t.gold}45;
        }
        .db-home-watch-icon.is-ok {
          background: ${t.sageTint};
          color: ${t.sageDeep};
          border-color: ${t.sage}45;
        }
        .db-home-watch-copy {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .db-home-watch-copy strong {
          font-size: 16px;
          font-weight: 700;
          color: ${t.ink};
        }
        .db-home-watch-copy em {
          font-style: normal;
          font-size: 13px;
          color: ${t.inkSoft};
          line-height: 1.4;
        }
        .db-home-watch-status {
          margin-top: 2px;
          align-self: flex-start;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: ${t.inkFaint};
          background: ${t.surfaceSunken};
          border: 1px solid ${t.lineStrong};
          border-radius: 999px;
          padding: 4px 10px;
        }
        .db-home-watch-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }
        .db-home-watch-today-label {
          grid-column: 1 / -1;
          margin: 0;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${t.inkFaint};
        }
        .db-home-watch-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          padding: 10px 10px;
          border-radius: 12px;
          background: ${t.surface};
          border: 1px solid ${t.line};
          color: ${t.ink};
          font-size: 12px;
          font-weight: 650;
          line-height: 1.25;
        }
        .db-home-watch-stat svg {
          flex-shrink: 0;
          color: ${t.sageDeep};
        }
        .db-home-watch-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          align-self: flex-end;
          font-size: 13px;
          font-weight: 700;
          color: ${t.gold};
          padding: 10px 14px;
          border-radius: 12px;
          background: ${t.surface};
          border: 1.5px solid ${t.gold}50;
          min-height: 42px;
        }
        .db-home-watch.is-connected .db-home-watch-cta {
          color: ${t.forest};
          border-color: ${t.sage}55;
        }

        .db-home-reminder-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .db-home-reminder-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid ${t.line};
          background: ${t.surfaceSunken};
          min-width: 0;
        }
        .db-home-reminder-row.is-done {
          background: ${t.sageTint};
          border-color: ${t.sage}55;
        }
        .db-home-reminder-icon {
          display: flex;
          flex-shrink: 0;
          color: ${t.ink};
        }
        .db-home-reminder-row.is-done .db-home-reminder-icon {
          color: ${t.sageDeep};
        }
        .db-home-reminder-copy {
          flex: 1;
          min-width: 0;
        }
        .db-home-reminder-title {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: ${t.ink};
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .db-home-reminder-time {
          margin: 2px 0 0;
          font-size: 12px;
          color: ${t.inkSoft};
        }
        .db-home-reminder-check {
          flex-shrink: 0;
          margin-left: auto;
          border: none;
          background: none;
          cursor: pointer;
          color: ${t.inkFaint};
          padding: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          min-height: 40px;
          border-radius: 999px;
        }
        .db-home-reminder-row.is-done .db-home-reminder-check {
          color: ${t.sageDeep};
        }
        .db-home-reminder-more {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          margin-top: 2px;
          padding: 11px 12px;
          border-radius: 12px;
          border: 1.5px dashed ${t.lineStrong};
          background: transparent;
          color: ${t.forest};
          font-size: 13px;
          font-weight: 700;
          font-family: ${t.fontBody};
          cursor: pointer;
          min-height: 44px;
        }

        .db-home-mid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 14px;
          align-items: stretch;
        }
        .db-home-chart-card {
          margin-bottom: 14px;
        }
        .db-home-chart-card,
        .db-home-today-panel,
        .db-home-panel {
          background: ${t.surface};
          border: 1px solid ${t.lineStrong};
          border-radius: 18px;
          padding: 16px 18px;
          box-shadow: ${t.shadowCard};
        }
        .db-home-reminders {
          margin-bottom: 0;
          display: flex;
          flex-direction: column;
          min-height: 100%;
        }
        .db-home-reminders .db-home-reminder-list {
          flex: 1;
        }
        .db-home-reminder-done {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 8px;
          padding: 12px 8px 8px;
          min-height: 0;
        }
        .db-home-reminder-done-badge {
          width: 56px;
          height: 56px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: ${t.sageTint};
          color: ${t.sageDeep};
          border: 1.5px solid ${t.sage}45;
          margin-bottom: 4px;
        }
        .db-home-reminder-done-title {
          margin: 0;
          font-family: ${t.fontDisplay};
          font-size: 20px;
          font-weight: 500;
          letter-spacing: -0.02em;
          color: ${t.ink};
          line-height: 1.25;
        }
        .db-home-reminder-done-sub {
          margin: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 13px;
          color: ${t.inkSoft};
          line-height: 1.4;
        }
        .db-home-reminder-done-leaf {
          color: ${t.sageDeep};
          flex-shrink: 0;
        }
        .db-home-reminder-tomorrow {
          width: 100%;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid ${t.line};
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
        }
        .db-home-reminder-tomorrow-kicker {
          margin: 0;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${t.inkFaint};
        }
        .db-home-reminder-row.is-tomorrow {
          opacity: 0.92;
          background: ${t.surface};
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
          font-variant-numeric: lining-nums;
          font-feature-settings: "lnum" 1;
        }
        .db-home-chart-card .db-home-card-head h2 {
          font-variant-numeric: lining-nums tabular-nums;
          font-feature-settings: "lnum" 1, "tnum" 1;
        }
        .db-home-chart-num {
          font-family: ${t.fontBody};
          font-weight: 700;
          font-size: 0.95em;
          letter-spacing: 0;
          vertical-align: 0.02em;
          font-variant-numeric: lining-nums tabular-nums;
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
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          text-align: left;
          padding: 14px 28px 14px 14px;
          border-radius: 14px;
          border: 1px solid ${t.line};
          background: ${t.surfaceSunken};
          cursor: pointer;
          font-family: ${t.fontBody};
          color: ${t.inkFaint};
          min-height: 92px;
          transition:
            border-color 0.15s ease,
            background 0.15s ease;
        }
        .db-home-today-arrow {
          position: absolute;
          top: 14px;
          right: 12px;
          color: ${t.inkFaint};
          opacity: 0.55;
          transition: opacity 0.15s ease, transform 0.15s ease, color 0.15s ease;
        }
        .db-home-today-cat {
          font-size: 12px;
          font-weight: 700;
          color: ${t.inkSoft};
          letter-spacing: 0.01em;
        }
        .db-home-today-cell strong {
          font-size: 22px;
          font-weight: 700;
          color: ${t.ink};
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-top: 2px;
        }
        .db-home-today-cell strong.db-home-today-open {
          font-size: 15px;
          font-weight: 650;
          letter-spacing: -0.01em;
          color: ${t.forest};
          margin-top: 6px;
        }
        .db-home-today-meta {
          font-size: 12px;
          font-weight: 600;
          color: ${t.inkFaint};
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
            radial-gradient(ellipse 80% 70% at 100% 0%, rgba(232, 184, 154, 0.22), transparent 55%),
            linear-gradient(155deg, ${t.forest} 0%, #314a39 48%, ${t.forestDeep} 100%);
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
          background: ${t.surfaceRaised};
          color: ${t.forest};
          font-size: 13px;
          font-weight: 700;
          min-height: 40px;
        }

        @media (hover: hover) and (pointer: fine) {
          .db-home-glance-card:hover {
            background: color-mix(in srgb, ${t.ink} 5%, ${t.surfaceRaised});
          }
          .db-home-watch:hover { border-color: ${t.forest}; }
          .db-home-watch.is-connected:hover { border-color: ${t.sageDeep}; }
          .db-home-today-cell:hover {
            border-color: ${t.forest};
            background: color-mix(in srgb, ${t.sageTint} 45%, ${t.surfaceSunken});
          }
          .db-home-today-cell:hover .db-home-today-arrow {
            opacity: 1;
            color: ${t.forest};
            transform: translateX(2px);
          }
          .db-home-alert:hover { border-color: ${t.clay}; }
          .db-home-reminder-more:hover { border-color: ${t.forest}; background: ${t.sageTint}; }
          .db-home-community-fill:hover .db-home-community-cta {
            background: ${t.peachSoft};
          }
        }

        @media (max-width: 1100px) {
          .db-home-glance-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 960px) {
          .db-home-mid,
          .db-home-duo { grid-template-columns: 1fr; }
          .db-home-mid {
            gap: 12px;
            align-items: start;
          }
          .db-home-reminders {
            min-height: 0;
            width: 100%;
          }
          .db-home-reminders.is-empty {
            min-height: 0;
            height: auto;
            padding-top: 12px;
            padding-bottom: 12px;
          }
          .db-home-reminders.is-empty .db-home-reminder-done {
            flex: 0;
            padding: 4px 4px 2px;
            gap: 6px;
          }
          .db-home-reminders.is-empty .db-home-reminder-done-badge {
            width: 44px;
            height: 44px;
          }
          .db-home-reminders.is-empty .db-home-reminder-done-badge svg {
            width: 22px;
            height: 22px;
          }
          .db-home-reminders.is-empty .db-home-reminder-done-title {
            font-size: 17px;
          }
          .db-home-reminders.is-empty .db-home-card-head {
            margin-bottom: 6px;
          }
          .db-home-panel--insights,
          .db-home-community-fill { min-height: 0; }
        }
        @media (max-width: 720px) {
          .db-home-main {
            padding: 16px 14px calc(112px + env(safe-area-inset-bottom, 0px));
          }
          .db-home-hero {
            margin-bottom: 16px;
            padding: 14px 14px 16px;
          }
          .db-home-hero-title { font-size: clamp(28px, 8vw, 36px); }
          .db-home-lead { max-width: none; font-size: 14px; }
          .db-home-glance-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
          .db-home-glance-grid .db-home-glance-card--report { grid-column: 1 / -1; }
          .db-home-glance-card { padding: 12px 12px 14px; }
          .db-home-glance-card strong { font-size: 20px; }
          .db-home-alert { padding: 12px; }
          .db-home-watch {
            gap: 12px;
            padding: 16px;
          }
          .db-home-watch-icon {
            width: 44px;
            height: 44px;
          }
          .db-home-watch-stats {
            grid-template-columns: 1fr;
          }
          .db-home-watch-today-label {
            margin-bottom: 2px;
          }
          .db-home-watch-cta {
            align-self: stretch;
            width: 100%;
          }
          .db-home-watch-top--connect {
            flex-wrap: wrap;
          }
          .db-home-watch-top--connect .db-home-watch-cta {
            align-self: center;
            width: auto;
            margin-left: auto;
          }
          .db-home-chart-card,
          .db-home-today-panel,
          .db-home-panel { padding: 14px; border-radius: 16px; }
          .db-home-card-head h2 { font-size: 20px; }
          .db-home-chart-body { height: 200px; }
          .db-home-chart-empty { height: 180px; }
          .db-home-today-cell { min-height: 84px; padding: 12px; }
          .db-home-reminder-title { white-space: normal; }
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
          .db-home-watch-cta { width: 100%; justify-content: center; margin-left: 0; }
          .db-home-watch-top--connect .db-home-watch-cta {
            width: auto;
            margin-left: auto;
          }
        }
      `}</style>
    </div>
  );
}
