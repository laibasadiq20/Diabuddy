import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';
import AppSidebar from '../../components/AppSidebar';
import {
  ChevronRight,
  ClipboardList,
  Check,
  Flame,
  AlertTriangle,
  ArrowLeft,
  Search,
  Calendar as CalendarIcon,
  TrendingUp,
  Award,
  Sparkles,
  ArrowUpRight,
  Lightbulb,
  CheckCircle2,
  Clock,
  Bell,
  ChevronDown,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  ArrowUpDown,
} from 'lucide-react';
import { LOG_TYPES } from './logsConfig';
import { mlToUsFlOz, round0 } from '../../utils/waterUnits';
import { fromMgdl, glucoseUnitLabel, resolveGlucoseUnit } from '../../utils/glucoseUnits';
import { getCachedData, setCachedData } from '../../utils/appCache';
import { formatClock12 } from '../../utils/timezone';
import secureBg from '../../assets/secure.png';

const t = theme;

function formatLogTime(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const timeStr = formatClock12(d) || d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return isToday ? `Today, ${timeStr}` : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
}

export default function Logs() {
  const navigate = useNavigate();
  const { user, logout, authHeaders } = useAuth();
  const { t: tr } = useI18n();
  const glucoseUnit = resolveGlucoseUnit(user);

  const [summary, setSummary] = useState(() => getCachedData('logs_summary') || null);
  const [streak, setStreak] = useState(() => getCachedData('logs_streak') || null);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const [loading, setLoading] = useState(() => !getCachedData('logs_summary'));
  const [searchQuery, setSearchQuery] = useState('');

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;

    const loadData = async () => {
      try {
        const tzOffset = new Date().getTimezoneOffset();
        const headers = { ...authHeaders() };

        // Fast parallel fetch: only summary, streak (45 days), and notifications
        const [sumRes, streakRes, notifRes] = await Promise.allSettled([
          fetch(`${API_URL}/health-logs/summary?tzOffset=${tzOffset}`, {
            credentials: 'include',
            headers,
          }),
          fetch(`${API_URL}/health-logs/streak?tzOffset=${tzOffset}&days=45`, {
            credentials: 'include',
            headers,
          }),
          fetch(`${API_URL}/notifications?limit=20`, {
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

        if (notifRes.status === 'fulfilled' && notifRes.value.ok) {
          const data = await notifRes.value.json();
          if (data?.unreadCount != null) {
            setUnreadNotifsCount(data.unreadCount);
          }
        }
      } catch (err) {
        console.error('Failed to load logs hub data', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [user, authHeaders]);

  // Derived metrics for Top KPI Row (Today's Logs count)
  const totalWeeklyLogs = useMemo(() => {
    if (!summary) return 0;
    let count = 0;
    count += summary.glucose?.count || 0;
    count += summary.meals?.value || 0;
    count += summary.insulin?.value ? 1 : 0;
    count += summary.medications?.value || 0;
    count += summary.water?.value ? 1 : 0;
    count += summary.exercise?.value ? 1 : 0;
    count += summary.sleep?.value ? 1 : 0;
    count += summary.mood?.value ? 1 : 0;
    return count;
  }, [summary]);

  // Instant 7-day display list (prevents layout popping)
  const displayLast7 = useMemo(() => {
    if (streak?.last7 && Array.isArray(streak.last7) && streak.last7.length > 0) {
      return streak.last7;
    }
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      days.push({
        date: iso,
        logged: false,
        isToday: i === 0,
      });
    }
    return days;
  }, [streak?.last7]);

  // Completion percentage of daily core goals
  const completionPercentage = useMemo(() => {
    if (!summary) return 0;
    let completedCount = 0;
    const totalGoals = 5; // glucose, meal, water, meds, exercise
    if ((summary.glucose?.count || 0) > 0) completedCount += 1;
    if ((summary.meals?.value || 0) > 0) completedCount += 1;
    if ((summary.water?.value || 0) > 0) completedCount += 1;
    if ((summary.medications?.value || 0) > 0) completedCount += 1;
    if ((summary.exercise?.value || 0) > 0) completedCount += 1;
    return Math.round((completedCount / totalGoals) * 100);
  }, [summary]);

  // Filtered log types by search query
  const filteredTypes = useMemo(() => {
    if (!searchQuery.trim()) return LOG_TYPES;
    const q = searchQuery.toLowerCase().trim();
    return LOG_TYPES.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.subLabel.toLowerCase().includes(q) ||
        item.hubLine.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Helper to extract live card detail values
  const getCardStatus = (typeId) => {
    if (!summary) return { hasData: false, title: 'No logs yet', subtitle: 'Tap Add New to log' };

    switch (typeId) {
      case 'glucose': {
        const hasLogs = (summary.glucose?.count || 0) > 0;
        const val =
          summary.glucose?.valueMgDl != null
            ? `${fromMgdl(summary.glucose.valueMgDl, glucoseUnit)} ${glucoseUnitLabel(glucoseUnit)}`
            : summary.glucose?.value;
        const isNormal = summary.glucose?.valueMgDl >= 70 && summary.glucose?.valueMgDl <= 140;
        return {
          hasData: hasLogs,
          badge: hasLogs ? (isNormal ? 'Normal' : 'Check Range') : null,
          badgeType: isNormal ? 'success' : 'warning',
          title: hasLogs ? val : 'No reading today',
          subtitle: hasLogs
            ? `${summary.glucose.count} reading${summary.glucose.count > 1 ? 's' : ''} logged today`
            : 'Track your blood sugar',
        };
      }
      case 'insulin': {
        const units = summary.insulin?.value || 0;
        return {
          hasData: units > 0,
          title: units > 0 ? `${units} Units` : 'No dose recorded',
          subtitle: units > 0 ? 'Total injected today' : 'Log dose & timing',
        };
      }
      case 'meal': {
        const count = summary.meals?.value || 0;
        return {
          hasData: count > 0,
          title: count > 0 ? `${count} Meal${count > 1 ? 's' : ''} Logged` : 'No meals recorded',
          subtitle: count > 0 ? 'Carbs tracked' : 'Breakfast, lunch, dinner',
        };
      }
      case 'water': {
        const ml = summary.water?.value || 0;
        const goalMl = summary.water?.goal || 2000;
        const pct = Math.min(Math.round((ml / goalMl) * 100), 100);
        return {
          hasData: ml > 0,
          title: `${(ml / 1000).toFixed(1)} L / ${(goalMl / 1000).toFixed(1)} L`,
          subtitle: `${pct}% of daily hydration goal`,
          progress: pct,
        };
      }
      case 'exercise': {
        const mins = summary.exercise?.value || 0;
        const goalMins = summary.exercise?.goal || 30;
        return {
          hasData: mins > 0,
          title: mins > 0 ? `${mins} Active Mins` : 'No activity yet',
          subtitle: mins > 0 ? `Target: ${goalMins} mins` : 'Walks, workouts, steps',
        };
      }
      case 'medication': {
        const taken = summary.medications?.value || 0;
        return {
          hasData: taken > 0,
          title: taken > 0 ? `${taken} Dose${taken > 1 ? 's' : ''} Taken` : 'No doses recorded',
          subtitle: taken > 0 ? 'Adherence on track' : 'Prescription routine',
        };
      }
      case 'mood': {
        const moodVal = summary.mood?.value;
        return {
          hasData: !!moodVal,
          title: moodVal || 'Not recorded',
          subtitle: moodVal ? 'Today’s mood check-in' : 'Track mood & stress',
        };
      }
      case 'sleep': {
        const hours = summary.sleep?.value || 0;
        return {
          hasData: hours > 0,
          title: hours > 0 ? `${hours}h Rest` : 'Not recorded',
          subtitle: hours > 0 ? 'Target: 7–9 hours' : 'Log duration & quality',
        };
      }
      default:
        return { hasData: false, title: 'No logs yet', subtitle: '' };
    }
  };

  const userName = user?.name || user?.fullName || user?.email?.split('@')[0] || 'Laiba Sadiq';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="db-logs-page">
      <AppSidebar />

      <main className="db-logs-main">
        <div className="db-logs-container">
          {/* Top Bar: Back Button on Left, Notifications & Profile on Right (like a top nav bar) */}
          <div className="db-logs-top-bar">
            <button
              type="button"
              className="db-logs-back-btn"
              onClick={() => navigate('/dashboard')}
              aria-label={tr('common.back')}
            >
              <ArrowLeft size={15} />
              <span>{tr('common.back')}</span>
            </button>

            {/* Notification Bell & Profile - Visible on Desktop, Hidden on Mobile */}
            <div className="db-logs-header-actions">
              {/* Notification Bell */}
              <button
                type="button"
                className="db-header-notif-btn"
                onClick={() => navigate('/notifications')}
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadNotifsCount > 0 && (
                  <span className="db-header-notif-badge">
                    {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* User Profile Pill & Dropdown */}
              <div className="db-profile-dropdown-wrapper" ref={profileDropdownRef}>
                <button
                  type="button"
                  className="db-header-profile-btn"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  aria-expanded={profileDropdownOpen}
                >
                  <span className="db-header-avatar">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt={userName} className="db-avatar-img" />
                    ) : (
                      userInitial
                    )}
                  </span>
                  <span className="db-header-username">{userName}</span>
                  <ChevronDown
                    size={14}
                    className={`db-header-chevron ${profileDropdownOpen ? 'is-open' : ''}`}
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="db-profile-menu">
                    <div className="db-profile-menu-header">
                      <strong>{userName}</strong>
                      <span className="db-profile-menu-email">{user?.email}</span>
                    </div>
                    <div className="db-profile-menu-divider" />
                    <button
                      type="button"
                      className="db-profile-menu-item"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/account');
                      }}
                    >
                      <UserIcon size={15} />
                      <span>Account Profile</span>
                    </button>
                    <button
                      type="button"
                      className="db-profile-menu-item"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/settings');
                      }}
                    >
                      <SettingsIcon size={15} />
                      <span>Settings</span>
                    </button>
                    <div className="db-profile-menu-divider" />
                    <button
                      type="button"
                      className="db-profile-menu-item is-logout"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                    >
                      <LogOut size={15} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page Header: Title & Subtitle */}
          <header className="db-logs-header">
            <h1 className="db-logs-title">{tr('logs.title')}</h1>
            <p className="db-logs-subtitle">
              Track your daily health details. Consistent logging, better insights.
            </p>
          </header>

          {/* Top KPI Stats & Streak Section with Enhanced Visual Color Palettes */}
          <section className="db-logs-kpi-grid" aria-label="Logging overview">
            {/* Card 1: Today's Logs (Sage Green) */}
            <div className="db-kpi-card db-kpi-sage">
              <div className="db-kpi-header">
                <span className="db-kpi-icon db-icon-sage">
                  <ClipboardList size={18} />
                </span>
                <span className="db-kpi-tag db-tag-sage">
                  <TrendingUp size={12} />
                  <span>Today</span>
                </span>
              </div>
              <div className="db-kpi-body">
                <span className="db-kpi-label">
                  <span className="is-desktop">Today's Logs</span>
                  <span className="is-mobile">Today</span>
                </span>
                <div className="db-kpi-val-row">
                  <span className="db-kpi-value">{totalWeeklyLogs}</span>
                  <span className="db-kpi-unit">Logs</span>
                </div>
                <p className="db-kpi-hint">Today's health entries</p>
              </div>
            </div>

            {/* Card 2: Logs Completed (Sky Blue) */}
            <div className="db-kpi-card db-kpi-sky">
              <div className="db-kpi-header">
                <span className="db-kpi-icon db-icon-sky">
                  <CheckCircle2 size={18} />
                </span>
                <span className="db-kpi-tag db-tag-sky">
                  <span>Goal: 100%</span>
                </span>
              </div>
              <div className="db-kpi-body">
                <span className="db-kpi-label">
                  <span className="is-desktop">Daily Goal Progress</span>
                  <span className="is-mobile">Goal</span>
                </span>
                <div className="db-kpi-val-row">
                  <span className="db-kpi-value">{completionPercentage}%</span>
                </div>
                <p className="db-kpi-hint">
                  {completionPercentage >= 80 ? 'Fantastic consistency! 🎯' : 'Keep checking off goals'}
                </p>
              </div>
            </div>

            {/* Card 3: Longest Streak (Sunflower Amber) */}
            <div className="db-kpi-card db-kpi-amber">
              <div className="db-kpi-header">
                <span className="db-kpi-icon db-icon-amber">
                  <Award size={18} />
                </span>
                <span className="db-kpi-tag db-tag-amber">
                  <Sparkles size={12} />
                  <span>Personal Best</span>
                </span>
              </div>
              <div className="db-kpi-body">
                <span className="db-kpi-label">
                  <span className="is-desktop">Longest Streak</span>
                  <span className="is-mobile">Best</span>
                </span>
                <div className="db-kpi-val-row">
                  <span className="db-kpi-value">{streak?.longestStreak || 0}</span>
                  <span className="db-kpi-unit">d</span>
                </div>
                <p className="db-kpi-hint">Keep it up! 🌟</p>
              </div>
            </div>

            {/* Card 4: Current Streak (Warm Coral) */}
            <div className={`db-kpi-card db-kpi-coral${streak?.atRisk ? ' is-streak-risk' : ''}`}>
              <div className="db-kpi-header">
                <span className="db-kpi-icon db-icon-coral">
                  {streak?.atRisk ? <AlertTriangle size={18} /> : <Flame size={18} />}
                </span>
                <span className="db-kpi-tag db-tag-coral">
                  {streak?.atRisk ? 'Needs Log' : 'On fire'}
                </span>
              </div>
              <div className="db-kpi-body">
                <span className="db-kpi-label">
                  <span className="is-desktop">Current Streak</span>
                  <span className="is-mobile">Streak</span>
                </span>
                <div className="db-kpi-val-row">
                  <span className="db-kpi-value">{streak?.currentStreak || 0}</span>
                  <span className="db-kpi-unit">d</span>
                </div>
                <p className="db-kpi-hint">
                  {streak?.atRisk
                    ? 'Log before midnight'
                    : 'Doing great! 💪'}
                </p>
              </div>
            </div>
          </section>

          {/* 7-Day Streak Tracker Ribbon - Instant Render */}
          <div className={`db-streak-ribbon${streak?.atRisk ? ' is-at-risk' : ''}`}>
            <div className="db-streak-ribbon-info">
              <div className="db-streak-ribbon-title">
                <Flame size={16} className="db-streak-flame" />
                <strong>
                  {streak?.currentStreak > 0
                    ? `${streak.currentStreak}-Day Logging Streak`
                    : 'Start your streak today!'}
                </strong>
              </div>
              <span className="db-streak-ribbon-desc">
                {streak?.atRisk
                  ? 'Log your blood sugar or meal today to save your streak.'
                  : 'Daily logging builds accurate health trends for your doctor.'}
              </span>
            </div>

            <div className="db-streak-days-track">
              {displayLast7.map((d) => {
                const weekday = new Date(`${d.date}T12:00:00`).toLocaleDateString(undefined, {
                  weekday: 'short',
                });
                return (
                  <div
                    key={d.date}
                    className={`db-streak-day-item${d.logged ? ' is-done' : ''}${d.isToday ? ' is-today' : ''}`}
                    title={d.logged ? 'Logged' : d.isToday ? 'Today (Not yet)' : 'Missed'}
                  >
                    <span className="db-streak-dot">{d.logged ? '✓' : d.isToday ? '·' : ''}</span>
                    <span className="db-streak-day-name">{weekday}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search Toolbar */}
          <div className="db-logs-search-wrapper">
            <Search size={16} className="db-search-icon" />
            <input
              type="text"
              placeholder="Search categories (e.g. glucose, meals, water, insulin, sleep)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="db-logs-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="db-clear-search-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Section: 8 Category Cards (01 to 08) - Equal Height & Positioned Add New */}
          <section className="db-logs-categories-section">
            <div className="db-section-header-row">
              <h2 className="db-section-title">All Log Types</h2>
              <span className="db-section-counter">{filteredTypes.length} Categories</span>
            </div>

            <div className="db-category-grid">
              {filteredTypes.map((item) => {
                const Icon = item.icon;
                const status = getCardStatus(item.id);

                return (
                  <div key={item.id} className="db-cat-card">
                    {/* Top Row: Number & Green Icon */}
                    <div className="db-cat-top">
                      <span className="db-cat-number">{item.num}</span>
                      <div className="db-cat-icon-wrap">
                        <Icon size={19} strokeWidth={2} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="db-cat-info">
                      <div className="db-cat-title-row">
                        <h3 className="db-cat-name">{item.label}</h3>
                        {status.badge && (
                          <span className={`db-cat-badge db-badge-${status.badgeType}`}>
                            {status.badge}
                          </span>
                        )}
                      </div>
                      <p className="db-cat-desc">{item.hubLine}</p>
                    </div>

                    {/* Live Preview Box / Uniform Height Widget */}
                    <div className="db-cat-widget">
                      <div className="db-cat-widget-header">
                        <span className="db-cat-widget-label">Status</span>
                        {status.hasData && (
                          <span className="db-cat-logged-tag">
                            <Check size={10} strokeWidth={3} /> Logged
                          </span>
                        )}
                      </div>

                      <div className="db-cat-widget-main">
                        <strong className="db-cat-widget-val">{status.title}</strong>
                        <span className="db-cat-widget-sub">{status.subtitle}</span>
                      </div>
                    </div>

                    {/* Bottom CTA Action Button (Pinned to exact same bottom line) */}
                    <button
                      type="button"
                      className="db-cat-action-btn"
                      onClick={() => navigate(`/logs/${item.path}`)}
                    >
                      <span>Add New</span>
                      <ArrowUpRight size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section: Bottom Health Tip & Secure Guidance Banner */}
          <div className="db-logs-tip-banner">
            <div className="db-tip-overlay" aria-hidden="true" />
            <div className="db-tip-inner">
              <div className="db-tip-icon-wrap">
                <Lightbulb size={20} />
              </div>
              <div className="db-tip-content">
                <strong className="db-tip-heading">Tip for Consistent Health Insights</strong>
                <p className="db-tip-text">
                  The more consistent your daily logs, the better insights and trends DiaBuddy can
                  provide for you and your care team. Small daily steps lead to lasting health, and
                  your health data always stays private and protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Scoped Styling */}
      <style>{`
        .db-logs-page {
          min-height: 100vh;
          display: flex;
          background: ${t.bg};
          font-family: ${t.fontBody};
          color: ${t.ink};
        }
        .db-logs-main {
          flex: 1;
          min-width: 0;
          padding: 28px 24px 120px;
        }
        .db-logs-container {
          max-width: 1140px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Top Bar: Nav row with Back Button on Left, Notifications & Profile on Right */
        .db-logs-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 16px;
        }
        .db-logs-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 9px;
          border: 1px solid transparent;
          background: none;
          color: ${t.inkFaint};
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .db-logs-back-btn:hover {
          color: ${t.forest};
          background: ${t.surfaceSunken};
          border-color: ${t.lineStrong};
        }

        /* Page Header */
        .db-logs-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .db-logs-title {
          margin: 0;
          font-family: ${t.fontDisplay};
          font-size: clamp(26px, 3.5vw, 32px);
          font-weight: 600;
          color: ${t.ink};
          letter-spacing: -0.02em;
        }
        .db-logs-subtitle {
          margin: 0;
          font-size: 13px;
          color: ${t.inkSoft};
          max-width: 540px;
          line-height: 1.45;
        }

        /* Header Actions: Notification Bell & Profile */
        .db-logs-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .db-header-notif-btn {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid ${t.lineStrong};
          background: ${t.surface};
          color: ${t.ink};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .db-header-notif-btn:hover {
          background: ${t.surfaceSunken};
          border-color: ${t.forest};
          transform: translateY(-1px);
        }
        .db-header-notif-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: ${t.clay};
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          min-width: 17px;
          height: 17px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid ${t.surface};
        }

        /* Profile Dropdown Wrapper */
        .db-profile-dropdown-wrapper {
          position: relative;
        }
        .db-header-profile-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 12px 4px 5px;
          border-radius: 999px;
          border: 1px solid ${t.lineStrong};
          background: ${t.surface};
          color: ${t.ink};
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .db-header-profile-btn:hover {
          background: ${t.surfaceSunken};
          border-color: ${t.forest};
        }
        .db-header-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${t.forest};
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .db-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .db-header-username {
          font-size: 13px;
          font-weight: 600;
          color: ${t.ink};
        }
        .db-header-chevron {
          color: ${t.inkFaint};
          transition: transform 0.2s ease;
        }
        .db-header-chevron.is-open {
          transform: rotate(180deg);
        }
        .db-profile-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 210px;
          background: ${t.surface};
          border: 1px solid ${t.lineStrong};
          border-radius: 14px;
          box-shadow: ${t.shadowLifted};
          padding: 6px;
          z-index: 100;
          display: flex;
          flex-direction: column;
          animation: dbFadeIn 0.15s ease;
        }
        @keyframes dbFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .db-profile-menu-header {
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
        }
        .db-profile-menu-header strong {
          font-size: 13px;
          color: ${t.ink};
        }
        .db-profile-menu-email {
          font-size: 11px;
          color: ${t.inkFaint};
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .db-profile-menu-divider {
          height: 1px;
          background: ${t.line};
          margin: 4px 0;
        }
        .db-profile-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          border: none;
          background: none;
          color: ${t.ink};
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: background 0.12s ease;
        }
        .db-profile-menu-item:hover {
          background: ${t.surfaceSunken};
        }
        .db-profile-menu-item.is-logout {
          color: ${t.clay};
        }
        .db-profile-menu-item.is-logout:hover {
          background: ${t.clayTint};
        }

        /* Top KPI Stats Grid */
        .db-logs-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .db-kpi-card {
          background: ${t.surface};
          border: 1px solid ${t.lineStrong};
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: ${t.shadowCard};
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .db-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: ${t.shadowLifted};
        }
        /* 4 Distinct Color Themes for Top KPI Cards */
        .db-kpi-card.db-kpi-sage {
          background: rgba(90, 140, 110, 0.08);
          border-color: rgba(90, 140, 110, 0.22);
        }
        .db-kpi-card.db-kpi-sky {
          background: rgba(74, 144, 226, 0.08);
          border-color: rgba(74, 144, 226, 0.24);
        }
        .db-kpi-card.db-kpi-amber {
          background: rgba(235, 175, 50, 0.09);
          border-color: rgba(235, 175, 50, 0.26);
        }
        .db-kpi-card.db-kpi-coral {
          background: rgba(235, 94, 85, 0.08);
          border-color: rgba(235, 94, 85, 0.24);
        }
        .db-kpi-card.db-kpi-coral.is-streak-risk {
          background: rgba(235, 94, 85, 0.13);
          border-color: rgba(235, 94, 85, 0.36);
        }

        .db-kpi-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .db-kpi-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .db-icon-sage { background: ${t.sageSoft}; color: ${t.forest}; }
        .db-icon-sky { background: rgba(74, 144, 226, 0.16); color: #2B70B6; }
        .db-icon-amber { background: rgba(235, 175, 50, 0.18); color: #B87A08; }
        .db-icon-coral { background: rgba(235, 94, 85, 0.16); color: #C84B42; }

        .db-kpi-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 999px;
        }
        .db-tag-sage { background: rgba(90, 140, 110, 0.14); color: ${t.forest}; }
        .db-tag-sky { background: rgba(74, 144, 226, 0.14); color: #2B70B6; }
        .db-tag-amber { background: rgba(235, 175, 50, 0.16); color: #B87A08; }
        .db-tag-coral { background: rgba(235, 94, 85, 0.14); color: #C84B42; }

        .db-kpi-label {
          font-size: 11px;
          font-weight: 600;
          color: ${t.inkFaint};
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .db-kpi-val-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-top: 1px;
        }
        .db-kpi-value {
          font-size: 26px;
          font-weight: 700;
          color: ${t.ink};
          line-height: 1.1;
          font-family: ${t.fontDisplay};
        }
        .db-kpi-unit {
          font-size: 12px;
          color: ${t.inkSoft};
          font-weight: 600;
        }
        .db-kpi-hint {
          margin: 3px 0 0;
          font-size: 11px;
          color: ${t.inkSoft};
        }

        /* 7-Day Streak Ribbon */
        .db-streak-ribbon {
          background: ${t.surface};
          border: 1px solid ${t.lineStrong};
          border-radius: 14px;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .db-streak-ribbon.is-at-risk {
          border-color: ${t.clay};
          background: ${t.clayTint};
        }
        .db-streak-ribbon-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .db-streak-ribbon-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: ${t.ink};
        }
        .db-streak-flame {
          color: ${t.clay};
        }
        .db-streak-ribbon-desc {
          font-size: 11px;
          color: ${t.inkSoft};
        }
        .db-streak-days-track {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .db-streak-day-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          min-width: 34px;
        }
        .db-streak-dot {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          background: ${t.surfaceSunken};
          color: transparent;
          border: 1px solid transparent;
        }
        .db-streak-day-item.is-done .db-streak-dot {
          background: ${t.sageSoft};
          color: ${t.sageDeep};
          border-color: ${t.sageDeep}33;
        }
        .db-streak-day-item.is-today:not(.is-done) .db-streak-dot {
          background: ${t.surface};
          border-color: ${t.forest};
          color: ${t.forest};
          box-shadow: 0 0 0 2px ${t.forest}15;
        }
        .db-streak-day-name {
          font-size: 10px;
          font-weight: 750;
          color: ${t.ink};
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .db-streak-day-item.is-today .db-streak-day-name {
          color: ${t.forest};
          font-weight: 800;
        }

        /* Search & Filter Toolbar */
        .db-logs-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .db-logs-search-wrapper {
          flex: 1;
          min-width: 240px;
          position: relative;
          display: flex;
          align-items: center;
        }
        .db-search-icon {
          position: absolute;
          left: 12px;
          color: ${t.inkFaint};
          pointer-events: none;
        }
        .db-logs-search-input {
          width: 100%;
          padding: 9px 34px 9px 36px;
          border-radius: 11px;
          border: 1px solid ${t.lineStrong};
          background: ${t.surface};
          color: ${t.ink};
          font-size: 13px;
          font-family: ${t.fontBody};
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .db-logs-search-input:focus {
          border-color: ${t.forest};
          box-shadow: 0 0 0 3px rgba(39, 57, 46, 0.06);
        }
        /* Search Bar */
        .db-logs-search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .db-search-icon {
          position: absolute;
          left: 14px;
          color: ${t.forest};
          pointer-events: none;
        }
        .db-logs-search-input {
          width: 100%;
          padding: 11px 36px 11px 40px;
          border-radius: 12px;
          border: 1px solid ${t.lineStrong};
          background: ${t.surface};
          color: ${t.ink};
          font-size: 13px;
          font-family: ${t.fontBody};
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .db-logs-search-input:focus {
          border-color: ${t.forest};
          box-shadow: 0 0 0 3px rgba(39, 57, 46, 0.08);
        }
        .db-clear-search-btn {
          position: absolute;
          right: 12px;
          border: none;
          background: none;
          color: ${t.inkFaint};
          cursor: pointer;
          font-size: 13px;
          padding: 4px;
        }
        .db-clear-search-btn:hover {
          color: ${t.forest};
        }

        /* Section Headings */
        .db-section-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .db-section-title {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
          color: ${t.ink};
          font-family: ${t.fontDisplay};
        }
        .db-section-counter {
          font-size: 11px;
          color: ${t.inkFaint};
          font-weight: 600;
        }

        /* 8 Category Grid - Lightest Pastel & Unified Green Icons */
        .db-category-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          align-items: stretch;
        }
        .db-cat-card {
          background: ${t.surface};
          border: 1px solid ${t.lineStrong};
          border-radius: 16px;
          padding: 20px 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: ${t.shadowCard};
          position: relative;
          height: 100%;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .db-cat-card:hover {
          transform: translateY(-2px);
          box-shadow: ${t.shadowLifted};
          border-color: ${t.forest};
        }
        .db-cat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .db-cat-number {
          font-size: 11px;
          font-weight: 800;
          color: ${t.forest};
          font-family: ${t.fontDisplay};
          background: ${t.sageTint};
          padding: 2px 7px;
          border-radius: 6px;
        }
        .db-cat-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${t.sageSoft};
          color: ${t.forest};
        }
        .db-cat-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-height: 60px;
        }
        .db-cat-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        .db-cat-name {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: ${t.ink};
        }
        .db-cat-badge {
          font-size: 10px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 999px;
          text-transform: uppercase;
        }
        .db-badge-success { background: ${t.sageTint}; color: ${t.sageDeep}; }
        .db-badge-warning { background: ${t.clayTint}; color: ${t.clayDeep}; }
        .db-cat-desc {
          margin: 0;
          font-size: 12px;
          color: ${t.inkSoft};
          line-height: 1.45;
        }

        /* Widget preview area */
        .db-cat-widget {
          background: ${t.surfaceSunken};
          border-radius: 11px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
          min-height: 68px;
        }
        .db-cat-widget-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .db-cat-widget-label {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: ${t.inkFaint};
        }
        .db-cat-logged-tag {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 9px;
          font-weight: 700;
          color: ${t.sageDeep};
          background: ${t.sageSoft};
          padding: 1px 5px;
          border-radius: 4px;
        }
        .db-cat-widget-main {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .db-cat-widget-val {
          font-size: 13px;
          font-weight: 700;
          color: ${t.ink};
        }
        .db-cat-widget-sub {
          font-size: 11px;
          color: ${t.inkFaint};
        }

        /* Card Action Button (Pinned to bottom of each card) */
        .db-cat-action-btn {
          width: 100%;
          margin-top: auto;
          padding: 9px 12px;
          border-radius: 11px;
          border: 1px solid ${t.lineStrong};
          background: ${t.sageSoft};
          color: ${t.forest};
          font-size: 12px;
          font-weight: 700;
          font-family: ${t.fontBody};
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .db-cat-action-btn:hover {
          background: ${t.forest};
          color: #ffffff;
          border-color: ${t.forest};
        }



        /* Bottom Tip & Botanical Secure Banner - Crystal Clear Visibility */
        .db-logs-tip-banner {
          position: relative;
          overflow: hidden;
          background-color: #EDEAD9;
          background-image: url(${secureBg});
          background-position: right 0 center;
          background-size: auto 100%;
          background-repeat: no-repeat;
          border: 1px solid ${t.lineStrong};
          border-radius: 18px;
          box-shadow: ${t.shadowCard};
          min-height: 84px;
          display: flex;
          align-items: center;
          margin-top: 12px;
        }
        .db-tip-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, #EDEAD9 0%, #EDEAD9 50%, rgba(237, 234, 217, 0.95) 75%, rgba(237, 234, 217, 0.25) 100%);
          pointer-events: none;
          z-index: 1;
        }
        .db-tip-inner {
          position: relative;
          z-index: 2;
          padding: 16px 90px 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          max-width: 800px;
        }
        .db-tip-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: ${t.sageSoft};
          color: ${t.forest};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(39, 57, 46, 0.08);
        }
        .db-tip-content {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .db-tip-heading {
          font-size: 13px;
          font-weight: 700;
          color: #1E2A24;
          letter-spacing: -0.01em;
        }
        .db-tip-text {
          margin: 0;
          font-size: 12px;
          color: #2D3D32;
          font-weight: 500;
          line-height: 1.45;
        }

        .is-desktop {
          display: inline;
        }
        .is-mobile {
          display: none;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .db-logs-kpi-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          .db-category-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .is-desktop {
            display: none !important;
          }
          .is-mobile {
            display: inline !important;
          }
          .db-logs-main {
            padding: 16px 12px 100px;
          }
          .db-logs-container {
            gap: 16px;
          }
          .db-logs-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .db-logs-header-actions {
            display: none !important;
          }
          .db-logs-top-bar {
            justify-content: flex-start;
          }
          .db-logs-title {
            font-size: 22px;
          }
          .db-logs-subtitle {
            font-size: 12px;
            line-height: 1.4;
          }

          /* All 4 KPI Cards in a single horizontal row on mobile */
          .db-logs-kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 6px;
          }
          .db-kpi-card {
            padding: 8px 6px;
            border-radius: 12px;
            gap: 4px;
            min-width: 0;
          }
          .db-kpi-header {
            justify-content: flex-start;
            margin-bottom: 2px;
          }
          .db-kpi-tag {
            display: none;
          }
          .db-kpi-icon {
            width: 26px;
            height: 26px;
            border-radius: 7px;
          }
          .db-kpi-icon svg {
            width: 14px;
            height: 14px;
          }
          .db-kpi-body {
            display: flex;
            flex-direction: column;
            gap: 1px;
            min-width: 0;
          }
          .db-kpi-label {
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.02em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .db-kpi-val-row {
            gap: 2px;
          }
          .db-kpi-value {
            font-size: 17px;
            font-weight: 800;
          }
          .db-kpi-unit {
            font-size: 9px;
          }
          .db-kpi-hint {
            display: none;
          }

          /* 7-Day Streak Ribbon */
          .db-streak-ribbon {
            padding: 10px 12px;
            gap: 8px;
            border-radius: 12px;
            flex-direction: column;
            align-items: stretch;
          }
          .db-streak-ribbon-title {
            font-size: 12px;
          }
          .db-streak-ribbon-desc {
            font-size: 10px;
          }
          .db-streak-days-track {
            gap: 4px;
            width: 100%;
            justify-content: space-between;
          }
          .db-streak-day-item {
            min-width: 26px;
            gap: 2px;
          }
          .db-streak-dot {
            width: 26px;
            height: 26px;
            font-size: 10px;
            border-radius: 7px;
          }
          .db-streak-day-name {
            font-size: 9.5px;
            font-weight: 750;
            color: ${t.ink};
          }

          /* Search Bar on Mobile */
          .db-logs-search-input {
            padding: 9px 32px 9px 36px;
            font-size: 12px;
            border-radius: 11px;
          }

          /* 8 Category Cards: 2 Columns on mobile - Spacious & Breathable */
          .db-category-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .db-cat-card {
            padding: 15px 12px;
            border-radius: 16px;
            gap: 12px;
          }
          .db-cat-number {
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 6px;
          }
          .db-cat-icon-wrap {
            width: 36px;
            height: 36px;
            border-radius: 10px;
          }
          .db-cat-icon-wrap svg {
            width: 17px;
            height: 17px;
          }
          .db-cat-info {
            min-height: auto;
            gap: 4px;
          }
          .db-cat-name {
            font-size: 14px;
            font-weight: 700;
          }
          .db-cat-desc {
            font-size: 11px;
            line-height: 1.38;
            min-height: 30px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .db-cat-widget {
            padding: 8px 10px;
            min-height: 52px;
            border-radius: 10px;
            gap: 3px;
          }
          .db-cat-widget-label {
            font-size: 9px;
            font-weight: 700;
          }
          .db-cat-widget-val {
            font-size: 12px;
            font-weight: 700;
          }
          .db-cat-widget-sub {
            font-size: 10px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .db-cat-action-btn {
            padding: 8px 10px;
            font-size: 12px;
            font-weight: 700;
            border-radius: 10px;
            gap: 6px;
          }

          /* Bottom Botanical Banner - Mobile Visibility */
          .db-logs-tip-banner {
            border-radius: 14px;
            min-height: auto;
            background-position: right -15px center;
            background-size: auto 100%;
            margin-top: 14px;
          }
          .db-tip-overlay {
            background: linear-gradient(to right, #EDEAD9 0%, #EDEAD9 58%, rgba(237, 234, 217, 0.95) 78%, rgba(237, 234, 217, 0.3) 100%);
          }
          .db-tip-inner {
            padding: 12px 60px 12px 12px;
            gap: 10px;
          }
          .db-tip-icon-wrap {
            width: 30px;
            height: 30px;
            border-radius: 8px;
          }
          .db-tip-icon-wrap svg {
            width: 15px;
            height: 15px;
          }
          .db-tip-heading {
            font-size: 12px;
            color: #1E2A24;
          }
          .db-tip-text {
            font-size: 11px;
            color: #2D3D32;
            font-weight: 500;
            line-height: 1.38;
          }
        }
      `}</style>
    </div>
  );
}
