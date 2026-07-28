import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';
import AppSidebar from '../../components/AppSidebar';
import {
  ClipboardList,
  MessageSquare,
  Users,
  ArrowRight,
  Droplets,
  PlusCircle,
  BarChart3,
  Flame,
  AlertTriangle,
} from 'lucide-react';

const t = theme;

function countUnreadConversations(conversations, user) {
  const myId = String(user?._id || user?.id || '');
  return (conversations || []).filter((conv) => {
    const last = conv.lastMessage;
    if (!last) return false;
    const senderId = String(last.senderId?._id || last.senderId || '');
    if (senderId === myId) return false;
    return !(last.readBy || []).some((r) => String(r?._id || r) === myId);
  }).length;
}

function summaryDoneCount(summary) {
  if (!summary) return 0;
  let n = 0;
  if (summary.glucose?.count > 0) n += 1;
  if (summary.meals?.value > 0) n += 1;
  if (summary.insulin?.value > 0) n += 1;
  if (summary.medications?.value > 0) n += 1;
  if (summary.water?.value > 0) n += 1;
  if (summary.exercise?.value > 0) n += 1;
  if (summary.sleep?.value > 0) n += 1;
  if (summary.mood?.value) n += 1;
  return n;
}

export default function Dashboard() {
  const { user, authHeaders } = useAuth();
  const navigate = useNavigate();
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [summary, setSummary] = useState(null);
  const [latestPost, setLatestPost] = useState(null);
  const [weekReport, setWeekReport] = useState(null);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name?.split(' ')[0] || 'Buddy';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  const loggedTypes = summaryDoneCount(summary);
  const latestGlucose = summary?.glucose?.value || null;
  const weekMetrics = weekReport?.period?.metrics;
  const tir = weekMetrics?.timeInRangePercent;
  const avgG = weekMetrics?.avgGlucose;
  const loggingDays = weekMetrics?.loggingDays;
  const dayCount = weekMetrics?.dayCount || 7;

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;

    const load = async () => {
      try {
        const headers = { ...authHeaders() };
        const tzOffset = new Date().getTimezoneOffset();
        const [convRes, sumRes, postRes, reportRes, streakRes] = await Promise.all([
          fetch(`${API_URL}/conversations`, { credentials: 'include', headers }),
          fetch(`${API_URL}/health-logs/summary?tzOffset=${tzOffset}`, {
            credentials: 'include',
            headers,
          }),
          fetch(`${API_URL}/posts?sort=latest&page=1&limit=1`, {
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
        ]);

        if (cancelled) return;

        if (convRes.ok) {
          const data = await convRes.json();
          setUnreadMsgCount(countUnreadConversations(data, user));
        }

        if (sumRes.ok) {
          const data = await sumRes.json();
          if (data?.status === 'success') setSummary(data.data);
        }

        if (postRes.ok) {
          const data = await postRes.json();
          setLatestPost(data?.posts?.[0] || null);
        }

        if (reportRes.ok) {
          const data = await reportRes.json();
          if (data?.status === 'success') setWeekReport(data.data);
        }

        if (streakRes.ok) {
          const data = await streakRes.json();
          if (data?.status === 'success') setStreak(data.data);
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
    <div
      className="db-dashboard"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        background: t.bg,
        fontFamily: t.fontBody,
        position: 'relative',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 55% 40% at 0% 0%, rgba(125,143,111,0.18), transparent 55%),
            radial-gradient(ellipse 40% 30% at 100% 100%, rgba(94,135,160,0.12), transparent 45%)
          `,
        }}
      />

      <AppSidebar />

      <main style={{ flex: 1, minWidth: 0, padding: '24px 18px 88px', position: 'relative' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <header style={{ marginBottom: 18 }}>
            <p
              style={{
                margin: '0 0 6px',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: t.inkFaint,
              }}
            >
              {today}
            </p>
            <h1
              style={{
                margin: 0,
                fontFamily: t.fontDisplay,
                fontSize: 'clamp(28px, 6vw, 40px)',
                fontWeight: 500,
                color: t.ink,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              {greeting},{' '}
              <em style={{ fontStyle: 'italic', color: t.sageDeep }}>{firstName}</em>
            </h1>
            <p style={{ margin: '10px 0 0', fontSize: 14, color: t.inkSoft, lineHeight: 1.45 }}>
              {loading
                ? 'Checking today’s next steps…'
                : loggedTypes > 0
                  ? `${loggedTypes} log type${loggedTypes === 1 ? '' : 's'} done today.`
                  : 'Start with one log — glucose is a good first step.'}
            </p>
          </header>

          {streak?.atRisk && (
            <button
              type="button"
              className="db-dash-streak-alert"
              onClick={() => navigate('/logs')}
            >
              <AlertTriangle size={18} />
              <span>
                <strong>{streak.currentStreak}-day streak at risk.</strong>{' '}
                Log anything today to keep it going.
              </span>
              <ArrowRight size={16} />
            </button>
          )}

          {/* Weekly progress snapshot */}
          <section className="db-dash-progress">
            <div className="db-dash-progress-top">
              <div>
                <p className="db-dash-progress-eyebrow">This week</p>
                <h2>Progress snapshot</h2>
              </div>
              <button type="button" className="db-dash-progress-link" onClick={() => navigate('/reports')}>
                Full report
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="db-dash-progress-grid">
              <div className="db-dash-progress-cell">
                <span className="db-dash-progress-label">Time in range</span>
                <strong>{tir != null ? `${tir}%` : '—'}</strong>
              </div>
              <div className="db-dash-progress-cell">
                <span className="db-dash-progress-label">Avg glucose</span>
                <strong>{avgG != null ? `${avgG}` : '—'}</strong>
                {avgG != null ? <em>mg/dL</em> : null}
              </div>
              <div className="db-dash-progress-cell">
                <span className="db-dash-progress-label">Days logged</span>
                <strong>
                  {loggingDays != null ? `${loggingDays}/${dayCount}` : '—'}
                </strong>
              </div>
              <div className="db-dash-progress-cell db-dash-progress-cell--streak">
                <span className="db-dash-progress-label">
                  <Flame size={12} /> Streak
                </span>
                <strong>{streak?.currentStreak ?? 0}</strong>
                <em>days</em>
              </div>
            </div>

            {streak?.last7?.length > 0 && (
              <div className="db-dash-streak-dots" aria-label="Last 7 days logging">
                {streak.last7.map((d) => (
                  <span
                    key={d.date}
                    className={`db-dash-dot${d.logged ? ' is-on' : ''}${d.isToday ? ' is-today' : ''}`}
                    title={`${d.date}${d.logged ? ' · logged' : ''}`}
                  />
                ))}
              </div>
            )}

            <p className="db-dash-progress-note">
              {streak?.message ||
                (tir == null
                  ? 'Log a few readings this week to unlock your snapshot.'
                  : 'Based on your real logs from the last 7 days.')}
            </p>
          </section>

          <div className="db-dash-actions">
            <button
              type="button"
              className="db-dash-action db-dash-action--primary"
              onClick={() => navigate('/logs')}
            >
              <span className="db-dash-action-icon" style={{ background: t.claySoft, color: t.clay }}>
                <ClipboardList size={22} strokeWidth={1.75} />
              </span>
              <span className="db-dash-action-body">
                <span className="db-dash-action-title">Log today</span>
                <span className="db-dash-action-desc">
                  {latestGlucose
                    ? `Latest glucose ${latestGlucose}`
                    : 'Glucose, meals, meds, and habits'}
                </span>
              </span>
              <span className="db-dash-action-cta">
                <PlusCircle size={16} />
                Open
              </span>
            </button>

            <button
              type="button"
              className="db-dash-action"
              onClick={() => navigate('/reports')}
            >
              <span className="db-dash-action-icon" style={{ background: t.skySoft, color: t.skyDeep }}>
                <BarChart3 size={22} strokeWidth={1.75} />
              </span>
              <span className="db-dash-action-body">
                <span className="db-dash-action-title">Health reports</span>
                <span className="db-dash-action-desc">7-day, 30-day, 3-month & compare</span>
              </span>
              <ArrowRight size={18} color={t.inkFaint} />
            </button>

            <button
              type="button"
              className="db-dash-action"
              onClick={() => navigate('/messages')}
            >
              <span className="db-dash-action-icon" style={{ background: t.skySoft, color: t.skyDeep }}>
                <MessageSquare size={22} strokeWidth={1.75} />
              </span>
              <span className="db-dash-action-body">
                <span className="db-dash-action-title">Messages</span>
                <span className="db-dash-action-desc">
                  {unreadMsgCount > 0
                    ? `${unreadMsgCount} unread conversation${unreadMsgCount === 1 ? '' : 's'}`
                    : 'No unread chats'}
                </span>
              </span>
              {unreadMsgCount > 0 ? (
                <span className="db-dash-badge">{unreadMsgCount > 99 ? '99+' : unreadMsgCount}</span>
              ) : (
                <ArrowRight size={18} color={t.inkFaint} />
              )}
            </button>

            <button
              type="button"
              className="db-dash-action"
              onClick={() =>
                navigate(latestPost?._id ? `/community/posts/${latestPost._id}` : '/community')
              }
            >
              <span className="db-dash-action-icon" style={{ background: t.sageSoft, color: t.sageDeep }}>
                <Users size={22} strokeWidth={1.75} />
              </span>
              <span className="db-dash-action-body">
                <span className="db-dash-action-title">Community</span>
                <span className="db-dash-action-desc">
                  {latestPost?.title
                    ? latestPost.title
                    : 'Ask a question or see what others shared'}
                </span>
              </span>
              <ArrowRight size={18} color={t.inkFaint} />
            </button>

            <button
              type="button"
              className="db-dash-action db-dash-action--quiet"
              onClick={() => navigate('/logs/glucose')}
            >
              <span className="db-dash-action-icon" style={{ background: t.surfaceSunken, color: t.forest }}>
                <Droplets size={20} strokeWidth={1.75} />
              </span>
              <span className="db-dash-action-body">
                <span className="db-dash-action-title">Quick glucose</span>
                <span className="db-dash-action-desc">Add a reading in one tap</span>
              </span>
              <ArrowRight size={18} color={t.inkFaint} />
            </button>
          </div>
        </div>
      </main>

      <style>{`
        .db-dash-streak-alert {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
          margin-bottom: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid ${t.clay}55;
          background: ${t.clayTint};
          color: ${t.clayDeep};
          font-size: 13px;
          line-height: 1.4;
          cursor: pointer;
          font-family: ${t.fontBody};
        }
        .db-dash-streak-alert strong { font-weight: 700; }
        .db-dash-streak-alert svg:last-child { margin-left: auto; flex-shrink: 0; }
        .db-dash-progress {
          background: #fff;
          border: 1.5px solid ${t.lineStrong};
          border-radius: 16px;
          padding: 14px;
          margin-bottom: 14px;
        }
        .db-dash-progress-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        .db-dash-progress-eyebrow {
          margin: 0 0 4px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${t.inkFaint};
        }
        .db-dash-progress h2 {
          margin: 0;
          font-family: ${t.fontDisplay};
          font-size: 20px;
          font-weight: 500;
          color: ${t.ink};
        }
        .db-dash-progress-link {
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
          flex-shrink: 0;
          padding: 4px 0;
        }
        .db-dash-progress-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }
        .db-dash-progress-cell {
          background: ${t.surfaceSunken};
          border-radius: 12px;
          padding: 10px 10px 12px;
          min-width: 0;
        }
        .db-dash-progress-label {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: ${t.inkFaint};
        }
        .db-dash-progress-cell strong {
          display: block;
          margin-top: 6px;
          font-size: 20px;
          color: ${t.ink};
          line-height: 1.1;
        }
        .db-dash-progress-cell em {
          font-style: normal;
          font-size: 11px;
          font-weight: 600;
          color: ${t.inkSoft};
        }
        .db-dash-progress-cell--streak strong { color: ${t.clay}; }
        .db-dash-streak-dots {
          display: flex;
          gap: 6px;
          margin-top: 12px;
        }
        .db-dash-dot {
          flex: 1;
          height: 8px;
          border-radius: 999px;
          background: ${t.line};
        }
        .db-dash-dot.is-on { background: ${t.sage}; }
        .db-dash-dot.is-today { outline: 2px solid ${t.forest}; outline-offset: 1px; }
        .db-dash-progress-note {
          margin: 10px 0 0;
          font-size: 12px;
          color: ${t.inkSoft};
          line-height: 1.4;
        }
        .db-dash-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .db-dash-action {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          text-align: left;
          padding: 16px 14px;
          border-radius: 16px;
          border: 1.5px solid ${t.lineStrong};
          background: #fff;
          cursor: pointer;
          font-family: ${t.fontBody};
          box-shadow: 0 1px 2px rgba(43, 42, 40, 0.04);
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .db-dash-action--primary {
          border-color: ${t.forest}55;
          background: linear-gradient(165deg, #fff 0%, ${t.sageTint} 100%);
        }
        .db-dash-action--quiet {
          background: transparent;
          box-shadow: none;
        }
        .db-dash-action-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .db-dash-action-body { flex: 1; min-width: 0; }
        .db-dash-action-title {
          display: block;
          font-size: 16px;
          font-weight: 700;
          color: ${t.ink};
          margin-bottom: 2px;
        }
        .db-dash-action-desc {
          display: block;
          font-size: 13px;
          color: ${t.inkSoft};
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .db-dash-action-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          padding: 8px 12px;
          border-radius: 999px;
          background: ${t.forest};
          color: #fff;
          font-size: 12px;
          font-weight: 700;
        }
        .db-dash-badge {
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          border-radius: 999px;
          background: ${t.peach};
          color: ${t.forestDeep};
          font-size: 11px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        @media (hover: hover) and (pointer: fine) {
          .db-dash-action:hover { border-color: ${t.forest}; }
        }
        @media (max-width: 640px) {
          .db-dash-progress-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .db-dash-action {
            padding: 14px 12px;
            gap: 12px;
            border-radius: 14px;
          }
          .db-dash-action-desc {
            white-space: normal;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }
      `}</style>
    </div>
  );
}
