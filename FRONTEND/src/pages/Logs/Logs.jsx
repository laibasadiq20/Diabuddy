import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';
import AppSidebar from '../../components/AppSidebar';
import { ChevronRight, ClipboardList, Check, Flame, AlertTriangle, ArrowLeft } from 'lucide-react';
import { LOG_TYPES } from './logsConfig';
import { mlToUsFlOz, round0 } from '../../utils/waterUnits';
import { fromMgdl, glucoseUnitLabel, resolveGlucoseUnit } from '../../utils/glucoseUnits';
import { getCachedData, setCachedData } from '../../utils/appCache';

const t = theme;

const PRIORITY_IDS = ['glucose', 'meal', 'insulin', 'medication', 'exercise'];

const MOOD_VALUE_KEYS = {
  'Very Happy': 'veryHappy',
  Happy: 'happy',
  Neutral: 'neutral',
  Sad: 'sad',
  Anxious: 'anxious',
};

function typeStatus(summary, typeId, tr, glucoseUnit) {
  if (!summary) return { done: false, detail: '' };
  switch (typeId) {
    case 'glucose': {
      const count = summary.glucose?.count || 0;
      const display =
        summary.glucose?.valueMgDl != null
          ? `${fromMgdl(summary.glucose.valueMgDl, glucoseUnit)} ${glucoseUnitLabel(glucoseUnit)}`
          : summary.glucose?.value;
      return {
        done: count > 0,
        detail: display
          ? tr(count === 1 ? 'logs.typeStatus.glucoseOne' : 'logs.typeStatus.glucoseMany')
              .replace('{value}', display)
              .replace('{count}', String(count))
          : '',
      };
    }
    case 'meal':
      return {
        done: (summary.meals?.value || 0) > 0,
        detail: summary.meals?.value
          ? tr(summary.meals.value === 1 ? 'logs.typeStatus.mealTemplate' : 'logs.typeStatus.mealsTemplate').replace('{n}', summary.meals.value)
          : '',
      };
    case 'insulin':
      return {
        done: (summary.insulin?.value || 0) > 0,
        detail: summary.insulin?.value ? tr('logs.typeStatus.unitsTemplate').replace('{n}', summary.insulin.value) : '',
      };
    case 'medication':
      return {
        done: (summary.medications?.value || 0) > 0,
        detail: summary.medications?.value
          ? tr('logs.typeStatus.takenTemplate').replace('{n}', summary.medications.value)
          : '',
      };
    case 'water': {
      const ml = summary.water?.value || 0;
      const goalMl = summary.water?.goal || 2000;
      return {
        done: ml > 0,
        detail: ml
          ? tr('logs.typeStatus.mlOfGoalTemplate')
              .replace('{n}', round0(mlToUsFlOz(ml)))
              .replace('{goal}', round0(mlToUsFlOz(goalMl)))
          : '',
      };
    }
    case 'exercise':
      return {
        done: (summary.exercise?.value || 0) > 0,
        detail: summary.exercise?.value ? tr('logs.typeStatus.minTemplate').replace('{n}', summary.exercise.value) : '',
      };
    case 'sleep':
      return {
        done: (summary.sleep?.value || 0) > 0,
        detail: summary.sleep?.value ? tr('logs.typeStatus.hTemplate').replace('{n}', summary.sleep.value) : '',
      };
    case 'mood':
      return {
        done: !!summary.mood?.value,
        detail: summary.mood?.value
          ? tr(`logEntryForm.mood.moods.${MOOD_VALUE_KEYS[summary.mood.value]}`, summary.mood.value)
          : '',
      };
    default:
      return { done: false, detail: '' };
  }
}

function streakDetail(streak, tr) {
  if (!streak) return '';
  if (streak.atRisk) {
    return tr('logs.streak.atRisk').replace('{n}', String(streak.currentStreak));
  }
  if (streak.loggedToday) {
    if (streak.currentStreak > 1) {
      return tr('logs.streak.keepGoing').replace('{n}', String(streak.currentStreak));
    }
    return tr('logs.streak.everyDayCounts');
  }
  return tr('logs.streak.startToday');
}

export default function Logs() {
  const navigate = useNavigate();
  const { user, authHeaders } = useAuth();
  const { t: tr } = useI18n();
  const glucoseUnit = resolveGlucoseUnit(user);
  const [summary, setSummary] = useState(null);
  const [streak, setStreak] = useState(null);
  const [streakLoading, setStreakLoading] = useState(true);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;

    // Instant 0ms render from cache if previously loaded
    const cachedSum = getCachedData('logs_summary');
    const cachedStr = getCachedData('logs_streak');
    if (cachedSum) setSummary(cachedSum);
    if (cachedStr) {
      setStreak(cachedStr);
      setStreakLoading(false);
    }

    const load = async () => {
      if (!cachedSum && !cachedStr) setStreakLoading(true);
      try {
        const tzOffset = new Date().getTimezoneOffset();
        const headers = { ...authHeaders() };
        const [sumRes, streakRes] = await Promise.allSettled([
          fetch(`${API_URL}/health-logs/summary?tzOffset=${tzOffset}`, {
            credentials: 'include',
            headers,
          }),
          fetch(`${API_URL}/health-logs/streak?tzOffset=${tzOffset}`, {
            credentials: 'include',
            headers,
          }),
        ]);

        if (cancelled) return;

        if (sumRes.status === 'fulfilled' && sumRes.value.ok) {
          const data = await sumRes.value.json();
          if (data?.status === 'success') {
            setSummary(data.data);
            setCachedData('logs_summary', data.data);
          }
        }
        if (streakRes.status === 'fulfilled' && streakRes.value.ok) {
          const data = await streakRes.value.json();
          if (data?.status === 'success') {
            setStreak(data.data);
            setCachedData('logs_streak', data.data);
          }
        }
      } catch {
        /* keep hub usable without summary */
      } finally {
        if (!cancelled) setStreakLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user, authHeaders]);

  const priority = LOG_TYPES.filter((x) => PRIORITY_IDS.includes(x.id));
  const more = LOG_TYPES.filter((x) => !PRIORITY_IDS.includes(x.id));

  const renderCard = (item, featured = false) => {
    const Icon = item.icon;
    const status = typeStatus(summary, item.id, tr, glucoseUnit);
    const label = tr(`logs.types.${item.id}.label`, item.label);
    const hubLine = tr(`logs.types.${item.id}.hubLine`, item.hubLine);
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => navigate(`/logs/${item.path}`)}
        className={`db-logs-hub-card${featured ? ' is-featured' : ''}`}
      >
        <span className="db-logs-hub-icon">
          <Icon size={featured ? 20 : 18} strokeWidth={1.75} />
        </span>
        <span className="db-logs-hub-copy">
          <span className="db-logs-hub-label-row">
            <span className="db-logs-hub-label">{label}</span>
            {status.done && (
              <span className="db-logs-hub-done" title={tr('logs.loggedToday')}>
                <Check size={12} strokeWidth={2.5} />
                {tr('logs.today')}
              </span>
            )}
          </span>
          <span className="db-logs-hub-line">
            {status.detail || hubLine}
          </span>
        </span>
        <ChevronRight size={18} color={t.inkFaint} style={{ flexShrink: 0 }} />
      </button>
    );
  };

  return (
    <div className="db-logs-hub">
      <AppSidebar />
      <main className="db-logs-hub-main">
        <div className="db-logs-hub-inner">
          <header className="db-logs-hub-header">
            <button
              type="button"
              className="db-logs-hub-back"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={16} />
              {tr('common.back')}
            </button>
            <h1 className="db-logs-hub-title">
              <ClipboardList size={26} color={t.forest} strokeWidth={1.75} />
              {tr('logs.title')}
            </h1>
            <p className="db-logs-hub-subtitle">{tr('logs.eyebrow')}</p>
            <p className="db-logs-hub-lead">
              {tr('logs.lead')}
            </p>
          </header>

          {(streakLoading || streak) && (
            <div className={`db-logs-streak${streak?.atRisk ? ' is-risk' : ''}${streakLoading && !streak ? ' is-loading' : ''}`}>
              {streak ? (
                <>
                  <div className="db-logs-streak-main">
                    {streak.atRisk ? <AlertTriangle size={18} /> : <Flame size={18} />}
                    <div>
                      <strong>
                        {streak.currentStreak > 0
                          ? tr('logs.streak.dayStreakTemplate').replace('{n}', streak.currentStreak)
                          : tr('logs.streak.noStreak')}
                      </strong>
                      <p>{streakDetail(streak, tr)}</p>
                    </div>
                  </div>
                  {streak.last7?.length > 0 && (
                    <div className="db-logs-week" aria-label={tr('logs.thisWeek')}>
                      <span className="db-logs-week-label">{tr('logs.thisWeek')}</span>
                      <div className="db-logs-week-days">
                        {streak.last7.map((d) => {
                          const weekday = new Date(`${d.date}T12:00:00`).toLocaleDateString(undefined, {
                            weekday: 'narrow',
                          });
                          const status = d.logged ? tr('logs.dayStatus.logged') : d.isToday ? tr('logs.dayStatus.todayNotYet') : tr('logs.dayStatus.missed');
                          return (
                            <div
                              key={d.date}
                              className={`db-logs-day${d.logged ? ' is-on' : ''}${d.isToday ? ' is-today' : ''}`}
                              title={status}
                            >
                              <span className="db-logs-day-mark" aria-hidden>
                                {d.logged ? '✓' : d.isToday ? '·' : ''}
                              </span>
                              <span className="db-logs-day-name">{weekday}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="db-logs-streak-main" aria-busy="true" aria-live="polite">
                    <Flame size={18} className="db-logs-loading-icon" aria-hidden />
                    <div>
                      <strong>{tr('logs.streak.loading')}</strong>
                    </div>
                  </div>
                  <div className="db-logs-week" aria-hidden>
                    <span className="db-logs-week-label">{tr('logs.thisWeek')}</span>
                    <div className="db-logs-week-days">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="db-logs-day">
                          <span className="db-logs-skel db-logs-skel-day" />
                          <span className="db-logs-skel db-logs-skel-day-name" />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {summary && (
            <div className="db-logs-hub-strip" aria-label={tr('dashboard.glance.title')}>
              <span>
                <strong>{summary.glucose?.count || 0}</strong> {tr('logs.strip.glucose')}
              </span>
              <span>
                <strong>{summary.meals?.value || 0}</strong> {tr('logs.strip.meals')}
              </span>
              <span>
                <strong>{round0(mlToUsFlOz(summary.water?.value || 0))}</strong> {tr('logs.strip.water')}
              </span>
              <span>
                <strong>{summary.medications?.value || 0}</strong> {tr('logs.strip.meds')}
              </span>
              <span>
                <strong>{summary.exercise?.value || 0}</strong> {tr('logs.strip.exercise')}
              </span>
            </div>
          )}

          <section className="db-logs-hub-section">
            <h2 className="db-logs-hub-section-title">{tr('logs.essentialsTitle')}</h2>
            <p className="db-logs-hub-section-note">{tr('logs.essentialsNote')}</p>
            <div className="db-logs-hub-list">{priority.map((item) => renderCard(item, true))}</div>
          </section>

          <section className="db-logs-hub-section">
            <h2 className="db-logs-hub-section-title">{tr('logs.lifestyleTitle')}</h2>
            <p className="db-logs-hub-section-note">{tr('logs.lifestyleNote')}</p>
            <div className="db-logs-hub-list">{more.map((item) => renderCard(item))}</div>
          </section>
        </div>
      </main>

      <style>{`
        .db-logs-hub {
          min-height: 100vh;
          display: flex;
          background: linear-gradient(180deg, ${t.pageFadeTop} 0%, ${t.bg} 40%);
          font-family: ${t.fontBody};
        }
        .db-logs-hub-main {
          flex: 1;
          min-width: 0;
          padding: 28px 20px 110px;
        }
        .db-logs-hub-inner {
          max-width: 720px;
          margin: 0 auto;
          width: 100%;
        }
        .db-logs-hub-header {
          margin-bottom: 4px;
        }
        .db-logs-hub-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin: 0 0 14px;
          padding: 0;
          border: none;
          background: none;
          color: ${t.inkSoft};
          font-family: ${t.fontBody};
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .db-logs-hub-subtitle {
          margin: 8px 0 0;
          font-size: 15px;
          font-weight: 600;
          color: ${t.inkSoft};
          line-height: 1.4;
        }
        .db-logs-hub-title {
          margin: 0;
          font-family: ${t.fontDisplay};
          font-size: clamp(26px, 6vw, 34px);
          font-weight: 500;
          color: ${t.ink};
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .db-logs-hub-lead {
          margin: 6px 0 0;
          font-size: 14px;
          color: ${t.inkFaint};
          line-height: 1.55;
          max-width: none;
        }
        .db-logs-streak {
          margin: 16px 0 0;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid ${t.lineStrong};
          background: ${t.surface};
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .db-logs-streak.is-risk {
          border-color: ${t.clay}55;
          background: ${t.clayTint};
        }
        .db-logs-streak-main {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: ${t.ink};
        }
        .db-logs-streak.is-risk .db-logs-streak-main { color: ${t.clayDeep}; }
        .db-logs-streak-main strong {
          display: block;
          font-size: 14px;
          font-weight: 700;
        }
        .db-logs-streak-main p {
          margin: 2px 0 0;
          font-size: 12px;
          color: ${t.inkSoft};
          line-height: 1.4;
        }
        .db-logs-streak.is-risk .db-logs-streak-main p { color: ${t.clayDeep}; }
        .db-logs-streak.is-loading {
          min-height: 148px;
        }
        .db-logs-loading-icon {
          flex-shrink: 0;
          margin-top: 2px;
          color: ${t.forest};
          animation: db-logs-loading-pulse 1s ease-in-out infinite;
        }
        @keyframes db-logs-loading-pulse {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 1; }
        }
        .db-logs-skel {
          display: block;
          border-radius: 8px;
          background: linear-gradient(
            90deg,
            ${t.surfaceSunken} 0%,
            color-mix(in srgb, ${t.surfaceRaised} 70%, ${t.surfaceSunken}) 50%,
            ${t.surfaceSunken} 100%
          );
          background-size: 200% 100%;
          animation: db-logs-skel-shine 1.1s ease-in-out infinite;
        }
        .db-logs-skel-icon {
          width: 18px;
          height: 18px;
          border-radius: 6px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .db-logs-skel-copy {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .db-logs-skel-title {
          width: 42%;
          height: 14px;
        }
        .db-logs-skel-line {
          width: 78%;
          height: 12px;
        }
        .db-logs-skel-week-label {
          width: 56px;
          height: 10px;
          margin-bottom: 8px;
        }
        .db-logs-skel-day {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 10px;
          min-height: 28px;
        }
        .db-logs-skel-day-name {
          width: 60%;
          height: 8px;
          margin: 4px auto 0;
        }
        @keyframes db-logs-skel-shine {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        .db-logs-week {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .db-logs-week-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${t.inkFaint};
        }
        .db-logs-week-days {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 6px;
        }
        .db-logs-day {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 0;
        }
        .db-logs-day-mark {
          width: 100%;
          aspect-ratio: 1;
          max-width: 36px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          line-height: 1;
          background: ${t.surfaceSunken};
          color: transparent;
          border: 1px solid transparent;
        }
        .db-logs-day.is-on .db-logs-day-mark {
          background: ${t.sageSoft};
          color: ${t.sageDeep};
        }
        .db-logs-streak.is-risk .db-logs-day.is-on .db-logs-day-mark {
          background: ${t.claySoft};
          color: ${t.clayDeep};
        }
        .db-logs-day.is-today:not(.is-on) .db-logs-day-mark {
          background: ${t.surface};
          border-color: ${t.forest};
          color: ${t.forest};
          box-shadow: inset 0 0 0 1px ${t.forest}22;
        }
        .db-logs-day-name {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: ${t.inkFaint};
          text-transform: uppercase;
        }
        .db-logs-day.is-today .db-logs-day-name {
          color: ${t.forest};
        }
        @media (max-width: 420px) {
          .db-logs-week-days { gap: 4px; }
          .db-logs-day-mark {
            border-radius: 8px;
            font-size: 11px;
          }
        }
        .db-logs-hub-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 14px;
          margin: 18px 0 22px;
          padding: 12px 14px;
          border-radius: 12px;
          background: ${t.surface};
          border: 1px solid ${t.lineStrong};
          font-size: 12px;
          color: ${t.inkSoft};
          font-weight: 600;
        }
        .db-logs-hub-strip strong {
          color: ${t.ink};
          font-weight: 700;
          margin-right: 4px;
        }
        .db-logs-hub-section {
          margin-bottom: 20px;
        }
        .db-logs-hub-section-title {
          margin: 0 0 4px;
          font-family: ${t.fontDisplay};
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.02em;
          text-transform: none;
          color: ${t.ink};
        }
        .db-logs-hub-section-note {
          margin: 0 0 10px;
          font-size: 13px;
          color: ${t.inkSoft};
          line-height: 1.4;
        }
        .db-logs-hub-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .db-logs-hub-card {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          text-align: left;
          padding: 12px 12px;
          border-radius: 14px;
          border: 1px solid ${t.lineStrong};
          background: ${t.surface};
          box-shadow: none;
          cursor: pointer;
          font-family: ${t.fontBody};
        }
        .db-logs-hub-card.is-featured {
          padding: 14px;
          border-color: ${t.lineStrong};
        }
        .db-logs-hub-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          background: ${t.surfaceSunken};
          color: ${t.forest};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .db-logs-hub-copy {
          flex: 1;
          min-width: 0;
        }
        .db-logs-hub-label-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 2px;
        }
        .db-logs-hub-label {
          font-size: 15px;
          font-weight: 600;
          color: ${t.ink};
        }
        .db-logs-hub-done {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 10px;
          font-weight: 700;
          color: ${t.sageDeep};
          background: ${t.sageTint};
          padding: 2px 6px;
          border-radius: 999px;
        }
        .db-logs-hub-line {
          display: block;
          font-size: 13px;
          color: ${t.inkSoft};
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @media (hover: hover) and (pointer: fine) {
          .db-logs-hub-back:hover {
            color: ${t.forest};
          }
          .db-logs-hub-card:hover {
            border-color: ${t.forest};
          }
        }
        @media (max-width: 640px) {
          .db-logs-hub-main {
            padding: 14px 14px calc(112px + env(safe-area-inset-bottom, 0px));
          }
          .db-logs-hub-back {
            margin-bottom: 12px;
            min-height: 36px;
          }
          .db-logs-hub-title {
            font-size: clamp(24px, 7vw, 30px);
            gap: 10px;
          }
          .db-logs-hub-title svg {
            width: 22px;
            height: 22px;
          }
          .db-logs-hub-lead {
            margin-top: 10px;
            font-size: 14px;
            max-width: none;
          }
          .db-logs-streak {
            margin-top: 14px;
            padding: 12px;
            border-radius: 12px;
            gap: 12px;
          }
          .db-logs-streak.is-loading {
            min-height: 132px;
          }
          .db-logs-week-days {
            gap: 4px;
          }
          .db-logs-hub-strip {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            margin: 14px 0 18px;
            padding: 12px;
          }
          .db-logs-hub-strip span {
            display: flex;
            align-items: baseline;
            gap: 4px;
            min-width: 0;
            padding: 8px 10px;
            border-radius: 10px;
            background: ${t.surfaceSunken};
            line-height: 1.3;
          }
          .db-logs-hub-strip strong {
            margin-right: 0;
            font-size: 15px;
          }
          .db-logs-hub-section-title {
            font-size: 17px;
          }
          .db-logs-hub-section-note {
            font-size: 12px;
            margin-bottom: 8px;
          }
          .db-logs-hub-card,
          .db-logs-hub-card.is-featured {
            padding: 12px;
            gap: 10px;
            border-radius: 12px;
          }
          .db-logs-hub-icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
          }
          .db-logs-hub-label {
            font-size: 14px;
          }
          .db-logs-hub-line {
            font-size: 12px;
            white-space: normal;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }
        @media (max-width: 380px) {
          .db-logs-hub-main {
            padding-left: 12px;
            padding-right: 12px;
          }
          .db-logs-hub-strip {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
