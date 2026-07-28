import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';
import AppSidebar from '../../components/AppSidebar';
import { ChevronRight, ClipboardList, Check, Flame, AlertTriangle } from 'lucide-react';
import { LOG_TYPES } from './logsConfig';

const t = theme;

const PRIORITY_IDS = ['glucose', 'meal', 'insulin', 'medication'];

function typeStatus(summary, typeId) {
  if (!summary) return { done: false, detail: '' };
  switch (typeId) {
    case 'glucose':
      return {
        done: (summary.glucose?.count || 0) > 0,
        detail: summary.glucose?.value
          ? `${summary.glucose.value} · ${summary.glucose.count} today`
          : '',
      };
    case 'meal':
      return {
        done: (summary.meals?.value || 0) > 0,
        detail: summary.meals?.value
          ? `${summary.meals.value} meal${summary.meals.value === 1 ? '' : 's'}`
          : '',
      };
    case 'insulin':
      return {
        done: (summary.insulin?.value || 0) > 0,
        detail: summary.insulin?.value ? `${summary.insulin.value} u` : '',
      };
    case 'medication':
      return {
        done: (summary.medications?.value || 0) > 0,
        detail: summary.medications?.value
          ? `${summary.medications.value} taken`
          : '',
      };
    case 'water':
      return {
        done: (summary.water?.value || 0) > 0,
        detail: summary.water?.value
          ? `${summary.water.value} / ${summary.water.goal || 2000} ml`
          : '',
      };
    case 'exercise':
      return {
        done: (summary.exercise?.value || 0) > 0,
        detail: summary.exercise?.value ? `${summary.exercise.value} min` : '',
      };
    case 'sleep':
      return {
        done: (summary.sleep?.value || 0) > 0,
        detail: summary.sleep?.value ? `${summary.sleep.value} h` : '',
      };
    case 'mood':
      return {
        done: !!summary.mood?.value,
        detail: summary.mood?.value || '',
      };
    default:
      return { done: false, detail: '' };
  }
}

export default function Logs() {
  const navigate = useNavigate();
  const { user, authHeaders } = useAuth();
  const [summary, setSummary] = useState(null);
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    const load = async () => {
      try {
        const tzOffset = new Date().getTimezoneOffset();
        const headers = { ...authHeaders() };
        const [sumRes, streakRes] = await Promise.all([
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
        if (sumRes.ok) {
          const data = await sumRes.json();
          if (data?.status === 'success') setSummary(data.data);
        }
        if (streakRes.ok) {
          const data = await streakRes.json();
          if (data?.status === 'success') setStreak(data.data);
        }
      } catch {
        /* keep hub usable without summary */
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const priority = LOG_TYPES.filter((x) => PRIORITY_IDS.includes(x.id));
  const more = LOG_TYPES.filter((x) => !PRIORITY_IDS.includes(x.id));

  const renderCard = (item, featured = false) => {
    const Icon = item.icon;
    const status = typeStatus(summary, item.id);
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
            <span className="db-logs-hub-label">{item.label}</span>
            {status.done && (
              <span className="db-logs-hub-done" title="Logged today">
                <Check size={12} strokeWidth={2.5} />
                Today
              </span>
            )}
          </span>
          <span className="db-logs-hub-line">
            {status.detail || item.hubLine}
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
            <p className="db-logs-hub-eyebrow">Record what happened</p>
            <h1 className="db-logs-hub-title">
              <ClipboardList size={26} color={t.forest} strokeWidth={1.75} />
              Health logs
            </h1>
            <p className="db-logs-hub-lead">
              Tap a category below to add an entry. Items marked Today are already logged.
            </p>
          </header>

          {streak && (
            <div className={`db-logs-streak${streak.atRisk ? ' is-risk' : ''}`}>
              <div className="db-logs-streak-main">
                {streak.atRisk ? <AlertTriangle size={18} /> : <Flame size={18} />}
                <div>
                  <strong>
                    {streak.currentStreak > 0
                      ? `${streak.currentStreak}-day streak`
                      : 'No streak yet'}
                  </strong>
                  <p>{streak.message}</p>
                </div>
              </div>
              {streak.last7?.length > 0 && (
                <div className="db-logs-streak-dots" aria-hidden>
                  {streak.last7.map((d) => (
                    <span
                      key={d.date}
                      className={`db-logs-dot${d.logged ? ' is-on' : ''}${d.isToday ? ' is-today' : ''}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {summary && (
            <div className="db-logs-hub-strip" aria-label="Today at a glance">
              <span>
                <strong>{summary.glucose?.count || 0}</strong> glucose
              </span>
              <span>
                <strong>{summary.meals?.value || 0}</strong> meals
              </span>
              <span>
                <strong>{summary.water?.value || 0}</strong> ml water
              </span>
              <span>
                <strong>{summary.medications?.value || 0}</strong> meds
              </span>
            </div>
          )}

          <section className="db-logs-hub-section">
            <h2 className="db-logs-hub-section-title">Most used</h2>
            <p className="db-logs-hub-section-note">Glucose, meals, insulin, and medications</p>
            <div className="db-logs-hub-list">{priority.map((item) => renderCard(item, true))}</div>
          </section>

          <section className="db-logs-hub-section">
            <h2 className="db-logs-hub-section-title">Lifestyle</h2>
            <p className="db-logs-hub-section-note">Water, activity, sleep, and mood</p>
            <div className="db-logs-hub-list">{more.map((item) => renderCard(item))}</div>
          </section>
        </div>
      </main>

      <style>{`
        .db-logs-hub {
          min-height: 100vh;
          display: flex;
          background: linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 40%);
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
        .db-logs-hub-eyebrow {
          margin: 0 0 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: ${t.inkFaint};
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
          margin: 12px 0 0;
          font-size: 15px;
          color: ${t.inkSoft};
          line-height: 1.55;
          max-width: 42ch;
        }
        .db-logs-streak {
          margin: 16px 0 0;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid ${t.lineStrong};
          background: #fff;
          display: flex;
          flex-direction: column;
          gap: 10px;
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
        .db-logs-streak-dots {
          display: flex;
          gap: 6px;
        }
        .db-logs-dot {
          flex: 1;
          height: 7px;
          border-radius: 999px;
          background: ${t.line};
        }
        .db-logs-dot.is-on { background: ${t.sage}; }
        .db-logs-streak.is-risk .db-logs-dot.is-on { background: ${t.clay}; }
        .db-logs-dot.is-today { outline: 2px solid ${t.forest}; outline-offset: 1px; }
        .db-logs-hub-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 14px;
          margin: 18px 0 22px;
          padding: 12px 14px;
          border-radius: 12px;
          background: #fff;
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
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${t.inkFaint};
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
          background: #fff;
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
          .db-logs-hub-card:hover {
            border-color: ${t.forest};
          }
        }
        @media (max-width: 640px) {
          .db-logs-hub-main {
            padding: 14px 12px 120px !important;
          }
          .db-logs-hub-lead {
            font-size: 14px;
            max-width: none;
          }
          .db-logs-hub-line {
            white-space: normal;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          .db-logs-hub-strip {
            gap: 8px 12px;
            margin: 14px 0 18px;
          }
        }
      `}</style>
    </div>
  );
}
