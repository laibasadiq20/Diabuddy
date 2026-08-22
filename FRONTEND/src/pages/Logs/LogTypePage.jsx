import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { useI18n } from '../../i18n/I18nContext';
import {
  Annoyed,
  ArrowLeft,
  CheckCircle2,
  Frown,
  Laugh,
  Loader2,
  Meh,
  Smile,
  Trash2,
  Bell,
  ChevronDown,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  Lightbulb,
  Edit3,
  Calendar,
  Sparkles,
} from 'lucide-react';
import api from '../../config/axios';
import { getLogType } from './logsConfig';
import { LogEntryForm } from './components/LogEntryForm';
import WaterWaveTracker from './components/WaterWaveTracker';
import { resolveWaterUnit, formatWater } from '../../utils/waterUnits';
import { formatGlucoseReading, resolveGlucoseUnit } from '../../utils/glucoseUnits';
import { useAuth } from '../../context/AuthContext';
import { formatClock12 } from '../../utils/timezone';
import noLogImg from '../../assets/nolog.png';
import logBannerImg from '../../assets/logBanner.png';

const t = theme;

function isSameLocalDay(dateLike, ref = new Date()) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return false;
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

function formatTodayTime(dateLike, tr) {
  const time = formatClock12(dateLike);
  if (!time) return '';
  return tr('logTypePage.todayAtTemplate').replace('{time}', time);
}

function intensityFromApiLabel(intensity) {
  if (intensity === 'Low') return 'Light';
  if (intensity === 'High') return 'Vigorous';
  if (intensity === 'Medium') return 'Moderate';
  return intensity || '';
}

const INTENSITY_LABEL_KEYS = { Light: 'light', Moderate: 'moderate', Vigorous: 'vigorous' };
const STRESS_LABEL_KEYS = { Low: 'low', Moderate: 'moderate', High: 'high' };

const MOOD_CARD = {
  'Very Happy': { Icon: Laugh, key: 'veryHappy' },
  Happy: { Icon: Smile, key: 'happy' },
  Neutral: { Icon: Meh, key: 'neutral' },
  Sad: { Icon: Frown, key: 'sad' },
  Anxious: { Icon: Annoyed, key: 'anxious' },
  Great: { Icon: Laugh, key: 'veryHappy' },
  Good: { Icon: Smile, key: 'happy' },
  Okay: { Icon: Meh, key: 'neutral' },
  Low: { Icon: Frown, key: 'sad' },
  Stressed: { Icon: Annoyed, key: 'anxious' },
};

export default function LogTypePage() {
  const { typeId } = useParams();
  const navigate = useNavigate();
  const { t: tr } = useI18n();
  const { user, logout } = useAuth();
  const glucoseUnit = resolveGlucoseUnit(user);
  const waterUnit = resolveWaterUnit(user);
  const config = getLogType(typeId);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editRaw, setEditRaw] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const [error, setError] = useState('');
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

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

  // Fetch unread notifications
  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    const loadNotifs = async () => {
      try {
        const res = await api.get('/notifications?limit=20');
        if (!cancelled && res.data?.unreadCount != null) {
          setUnreadNotifsCount(res.data.unreadCount);
        }
      } catch (err) {
        // silent fail
      }
    };
    loadNotifs();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((p) => ({ ...p, visible: false })), 2800);
  };

  const scrollToForm = () => {
    const formEl = document.getElementById('db-log-form-anchor');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const loadEntries = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    setError('');
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const res = await api.get('/health-logs/timeline', {
        params: {
          moduleType: config.id,
          sortBy: 'newest',
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      });
      if (res.data?.status === 'success') {
        const todayOnly = (res.data.data || []).filter((item) => isSameLocalDay(item.timestamp));
        setEntries(todayOnly);
      }
    } catch (err) {
      setError(err.response?.data?.message || tr('logTypePage.toasts.couldNotLoad'));
    } finally {
      setLoading(false);
    }
  }, [config, tr]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    setShowAllEntries(false);
    setEditRaw(null);
  }, [config?.id]);

  if (!config) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', background: t.bg, fontFamily: t.fontBody }}>
        <AppSidebar />
        <main style={{ flex: 1, padding: 40 }}>
          <p style={{ color: t.inkSoft }}>{tr('logTypePage.unknownType')}</p>
          <button type="button" onClick={() => navigate('/logs')} style={linkBtn}>
            {tr('logTypePage.backToLogs')}
          </button>
        </main>
      </div>
    );
  }

  const typeLabel = tr(`logs.types.${config.id}.label`, config.label);
  const userName = user?.name || user?.fullName || user?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  const Icon = config.icon;
  const waterGoalMl = Number(user?.dailyGoals?.waterMl) > 0 ? Number(user.dailyGoals.waterMl) : 2000;
  const todayWaterMl = config.id === 'water'
    ? entries.reduce((sum, item) => sum + (Number(item.raw?.amount) || 0), 0)
    : 0;
  const waterPct = Math.min(100, Math.round((todayWaterMl / waterGoalMl) * 100));
  const PREVIEW_COUNT = 5;
  const visibleEntries = showAllEntries ? entries : entries.slice(0, PREVIEW_COUNT);
  const hasMoreEntries = entries.length > PREVIEW_COUNT;

  const handleSubmit = async (body) => {
    setSaving(true);
    try {
      if (editRaw?._id) {
        if (config.apiPath === 'water') {
          showToast(tr('logTypePage.toasts.waterCannotEdit'), 'error');
          setSaving(false);
          return;
        }
        await api.put(`/health-logs/${config.apiPath}/${editRaw._id}`, body);
        showToast(tr('logTypePage.toasts.entryUpdated'));
      } else {
        await api.post(`/health-logs/${config.apiPath}`, body);
        showToast(tr('logTypePage.toasts.entrySaved'));
      }
      setEditRaw(null);
      setFormKey((k) => k + 1);
      await loadEntries();
    } catch (err) {
      showToast(err.response?.data?.message || err.response?.data?.error || tr('logTypePage.toasts.couldNotSave'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(tr('logTypePage.deleteConfirm'))) return;
    try {
      await api.delete(`/health-logs/${config.apiPath}/${item._id}`);
      showToast(tr('logTypePage.toasts.entryDeleted'));
      if (editRaw?._id === item._id) setEditRaw(null);
      await loadEntries();
    } catch (err) {
      showToast(err.response?.data?.message || tr('logTypePage.toasts.couldNotDelete'), 'error');
    }
  };

  const handleQuickAddWater = async (amountMl) => {
    setSaving(true);
    try {
      await api.post('/health-logs/water', {
        amount: amountMl,
        timestamp: new Date().toISOString(),
      });
      showToast(`+${formatWater(amountMl, waterUnit)} logged! 💧`);
      await loadEntries();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not log water', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickRemoveWater = async () => {
    if (!entries || entries.length === 0) return;
    const latest = entries[0];
    if (!latest?._id) return;
    setSaving(true);
    try {
      await api.delete(`/health-logs/water/${latest._id}`);
      showToast('Removed last water log', 'success');
      await loadEntries();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not remove entry', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderEntryCard = (item) => {
    const isMeal = config.id === 'meal';
    const isInsulin = config.id === 'insulin';
    const isMedication = config.id === 'medication';
    const isWater = config.id === 'water';
    const isExercise = config.id === 'exercise';
    const isSleep = config.id === 'sleep';
    const isMood = config.id === 'mood';
    const isGlucose = config.id === 'glucose';
    const raw = item.raw || {};
    const glucoseTitle =
      isGlucose && raw.glucoseLevel != null
        ? formatGlucoseReading(raw.glucoseLevel, raw.unit || 'mg/dL', glucoseUnit)
        : item.title;
    const moodMeta = MOOD_CARD[raw.mood];
    const moodLabel = moodMeta ? tr(`logEntryForm.mood.moods.${moodMeta.key}`) : raw.mood || tr('logTypePage.entry.moodFallback');
    const MoodIcon = (moodMeta && moodMeta.Icon) || Smile;
    const impact = raw.bloodSugarImpact;
    const insulinReason =
      raw.mealRelation && raw.mealRelation !== 'None' ? raw.mealRelation : item.valueStr;
    const EntryIcon = config.icon;
    const titleRow = (text) => (
      <div className="db-entry-card-title-row">
        {EntryIcon ? (
          <span className="db-entry-icon-wrap">
            <EntryIcon size={16} strokeWidth={2} />
          </span>
        ) : null}
        <strong className="db-entry-card-title">{text}</strong>
      </div>
    );

    return (
      <div key={item._id} className="db-log-entry-row">
        <div className="db-entry-card-main">
          {isMeal ? (
            <>
              {titleRow(raw.mealType || item.title)}
              {raw.foodItems ? (
                <p className="db-entry-food-desc">{raw.foodItems}</p>
              ) : null}
              <div className="db-entry-tags-row">
                {[
                  raw.carbohydrates != null ? tr('logTypePage.entry.gCarbsTemplate').replace('{n}', raw.carbohydrates) : null,
                  raw.protein ? tr('logTypePage.entry.gProteinTemplate').replace('{n}', raw.protein) : null,
                  raw.fat ? tr('logTypePage.entry.gFatTemplate').replace('{n}', raw.fat) : null,
                  raw.calories ? tr('logTypePage.entry.kcalTemplate').replace('{n}', raw.calories) : null,
                ]
                  .filter(Boolean)
                  .map((tVal, idx) => (
                    <span key={idx} className="db-entry-macro-pill">{tVal}</span>
                  ))}
              </div>
              {impact ? (
                <p className="db-entry-impact-line">
                  {tr('logTypePage.entry.afterMeal')} {impact === 'High' ? '⬆' : impact === 'Low' ? '⬇' : '➖'}{' '}
                  {tr(`logTypePage.entry.impact${impact === 'High' ? 'High' : impact === 'Low' ? 'Low' : 'Normal'}`, impact)}
                </p>
              ) : null}
              {raw.notes ? <p className="db-entry-notes-line">{raw.notes}</p> : null}
              <span className="db-entry-time-badge">{formatTodayTime(item.timestamp, tr)}</span>
            </>
          ) : isInsulin ? (
            <>
              {titleRow(raw.insulinType || item.title)}
              <div className="db-entry-tags-row">
                <span className="db-entry-macro-pill is-highlight">
                  {tr('logTypePage.entry.unitsTemplate').replace('{n}', raw.units ?? 0)}
                </span>
                {insulinReason ? (
                  <span className="db-entry-macro-pill">{insulinReason}</span>
                ) : null}
                {raw.injectionSite ? (
                  <span className="db-entry-macro-pill">{raw.injectionSite}</span>
                ) : null}
              </div>
              {raw.notes ? <p className="db-entry-notes-line">{raw.notes}</p> : null}
              <span className="db-entry-time-badge">{formatTodayTime(item.timestamp, tr)}</span>
            </>
          ) : isMedication ? (
            <>
              {titleRow(raw.medicineName || item.title)}
              <div className="db-entry-tags-row">
                <span className="db-entry-macro-pill is-highlight">{raw.dose || item.subtitle}</span>
                <span className={`db-entry-macro-pill db-status-${(raw.status || item.valueStr || '').toLowerCase()}`}>
                  {raw.status || item.valueStr}
                </span>
                {raw.route ? <span className="db-entry-macro-pill">{raw.route}</span> : null}
              </div>
              {raw.notes ? <p className="db-entry-notes-line">{raw.notes}</p> : null}
              <span className="db-entry-time-badge">{formatTodayTime(item.timestamp, tr)}</span>
            </>
          ) : isWater ? (
            <>
              {titleRow(
                raw.amount != null
                  ? formatWater(raw.amount, waterUnit)
                  : item.title
              )}
              {raw.notes ? <p className="db-entry-notes-line">{raw.notes}</p> : null}
              <span className="db-entry-time-badge">{formatTodayTime(item.timestamp, tr)}</span>
            </>
          ) : isExercise ? (
            <>
              {titleRow(raw.activity || item.title)}
              <div className="db-entry-tags-row">
                {raw.duration > 0 ? (
                  <span className="db-entry-macro-pill is-highlight">
                    {tr('logTypePage.entry.minTemplate').replace('{n}', raw.duration)}
                  </span>
                ) : null}
                {raw.steps ? (
                  <span className="db-entry-macro-pill">
                    {tr('logTypePage.entry.stepsTemplate').replace('{n}', Number(raw.steps).toLocaleString())}
                  </span>
                ) : null}
                {raw.caloriesBurned ? (
                  <span className="db-entry-macro-pill">
                    {tr('logTypePage.entry.kcalTemplate').replace('{n}', raw.caloriesBurned)}
                  </span>
                ) : null}
                {raw.distance ? (
                  <span className="db-entry-macro-pill">
                    {tr('logTypePage.entry.kmTemplate').replace('{n}', raw.distance)}
                  </span>
                ) : null}
                {raw.intensity ? (
                  <span className="db-entry-macro-pill">
                    {tr(`logEntryForm.exercise.intensities.${INTENSITY_LABEL_KEYS[intensityFromApiLabel(raw.intensity)]}`, intensityFromApiLabel(raw.intensity))}
                  </span>
                ) : null}
              </div>
              {raw.notes ? <p className="db-entry-notes-line">{raw.notes}</p> : null}
              <span className="db-entry-time-badge">{formatTodayTime(item.timestamp, tr)}</span>
            </>
          ) : isSleep ? (
            <>
              {titleRow(
                raw.totalHours != null
                  ? tr('logTypePage.entry.hoursTemplate').replace('{n}', Number(raw.totalHours).toFixed(1))
                  : item.title
              )}
              <div className="db-entry-tags-row">
                {raw.quality ? (
                  <span className="db-entry-macro-pill is-highlight">
                    {tr(`logEntryForm.sleep.qualities.${raw.quality === 'Average' ? 'fair' : (raw.quality || '').toLowerCase()}`, raw.quality === 'Average' ? 'Fair' : raw.quality)}
                  </span>
                ) : null}
                {item.valueStr ? (
                  <span className="db-entry-macro-pill">{item.valueStr}</span>
                ) : null}
              </div>
              {raw.notes ? <p className="db-entry-notes-line">{raw.notes}</p> : null}
              <span className="db-entry-time-badge">{formatTodayTime(raw.wakeTime || item.timestamp, tr)}</span>
            </>
          ) : isMood ? (
            <>
              <div className="db-entry-card-title-row">
                <span className="db-entry-icon-wrap">
                  <MoodIcon size={16} strokeWidth={2} />
                </span>
                <strong className="db-entry-card-title">{moodLabel}</strong>
              </div>
              <div className="db-entry-tags-row">
                <span className="db-entry-macro-pill">
                  {tr('logTypePage.entry.stressTemplate').replace(
                    '{level}',
                    tr(`logEntryForm.mood.stress.${STRESS_LABEL_KEYS[raw.stressLevel] || 'low'}`, raw.stressLevel || 'Low')
                  )}
                </span>
              </div>
              {raw.journalEntry ? <p className="db-entry-notes-line">{raw.journalEntry}</p> : null}
              <span className="db-entry-time-badge">{formatTodayTime(item.timestamp, tr)}</span>
            </>
          ) : isGlucose ? (
            <>
              {titleRow(glucoseTitle)}
              <div className="db-entry-tags-row">
                {item.subtitle && <span className="db-entry-macro-pill is-highlight">{item.subtitle}</span>}
                {item.valueStr && <span className="db-entry-macro-pill">{item.valueStr}</span>}
              </div>
              {(raw.notes || item.notes) ? (
                <p className="db-entry-notes-line">{raw.notes || item.notes}</p>
              ) : null}
              <span className="db-entry-time-badge">{formatTodayTime(item.timestamp, tr)}</span>
            </>
          ) : (
            <>
              {titleRow(item.title)}
              <div className="db-entry-tags-row">
                {item.subtitle && <span className="db-entry-macro-pill">{item.subtitle}</span>}
                {item.valueStr && <span className="db-entry-macro-pill">{item.valueStr}</span>}
              </div>
              {(raw.notes || item.notes) ? (
                <p className="db-entry-notes-line">{raw.notes || item.notes}</p>
              ) : null}
              <span className="db-entry-time-badge">{formatTodayTime(item.timestamp, tr)}</span>
            </>
          )}
        </div>

        <div className="db-log-entry-actions">
          {config.apiPath !== 'water' && (
            <button
              type="button"
              className="db-entry-action-btn is-edit"
              onClick={() => {
                setEditRaw(item.raw || item);
                scrollToForm();
              }}
              title="Edit entry"
            >
              <Edit3 size={13} />
              <span>{tr('logTypePage.edit')}</span>
            </button>
          )}
          <button
            type="button"
            className="db-entry-action-btn is-delete"
            aria-label={tr('logTypePage.deleteAria')}
            onClick={() => handleDelete(item)}
            title="Delete entry"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="db-logtype-page">
      <AppSidebar />

      <main className="db-logtype-main">
        <div className="db-logtype-container">
          {/* Unified Top Nav Bar */}
          <div className="db-logs-top-bar">
            <button
              type="button"
              className="db-logs-back-btn"
              onClick={() => navigate('/logs')}
              aria-label={tr('common.back')}
            >
              <ArrowLeft size={15} />
              <span>Back to Logs</span>
            </button>

            {/* Notification Bell & User Profile */}
            <div className="db-logs-header-actions">
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

          {/* Header Banner Card */}
          <header className="db-logtype-header-card">
            <div className="db-logtype-header-left">
              <div className="db-logtype-icon-badge">
                <Icon size={24} strokeWidth={2} />
              </div>
              <div className="db-logtype-title-box">
                <h1 className="db-logtype-title">{typeLabel}</h1>
                <p className="db-logtype-desc">{config.hubLine}</p>
              </div>
            </div>
            <div className="db-logtype-header-stats">
              <div className="db-logtype-stat-pill">
                <span className="db-logtype-stat-label">Today</span>
                <strong className="db-logtype-stat-val">
                  {config.id === 'water'
                    ? `${formatWater(todayWaterMl, waterUnit)} / ${formatWater(waterGoalMl, waterUnit)}`
                    : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
                </strong>
              </div>
            </div>
          </header>

          {/* Water Log Special Layout: Interactive Animated Wave Tracker + Timeline Entries (No redundant manual form) */}
          {config.id === 'water' ? (
            <div className="db-water-full-layout">
              {/* 1. Animated Wave Tracker with 1-Tap Quick Logging */}
              <WaterWaveTracker
                preferredWaterUnit={waterUnit}
                todayWaterMl={todayWaterMl}
                waterGoalMl={waterGoalMl}
                entries={entries}
                onQuickAdd={handleQuickAddWater}
                onQuickRemove={handleQuickRemoveWater}
                submitting={saving}
              />

              {/* 2. Today's Water Timeline History */}
              <section className="db-water-entries-section">
                <div className="db-entries-heading-row">
                  <h2 className="db-entries-heading">{tr('logTypePage.todaysEntries')}</h2>
                  {!loading && entries.length > 0 ? (
                    <span className="db-entries-count-pill">
                      {tr('logTypePage.todayCountTemplate').replace('{n}', entries.length)}
                    </span>
                  ) : null}
                </div>

                <div className="db-log-entries-panel">
                  {loading ? (
                    <div className="db-entries-loading">
                      <Loader2 size={18} className="db-spin" />
                      <span>{tr('common.loading')}</span>
                    </div>
                  ) : error ? (
                    <p className="db-entries-error">{error}</p>
                  ) : entries.length === 0 ? (
                    <div className="db-entries-empty-box">
                      <img
                        src={noLogImg}
                        alt="No logs recorded"
                        className="db-entries-empty-img"
                      />
                      <h3 className="db-entries-empty-title">No water logged yet today</h3>
                      <p className="db-entries-empty-text">
                        Tap +250 mL or any preset button above to log your first glass of water!
                      </p>
                    </div>
                  ) : (
                    <div className="db-entries-list">
                      {visibleEntries.map(renderEntryCard)}
                      {hasMoreEntries ? (
                        <button
                          type="button"
                          onClick={() => setShowAllEntries((v) => !v)}
                          className="db-entries-view-all-btn"
                        >
                          {showAllEntries
                            ? tr('logTypePage.showLess')
                            : tr('logTypePage.viewAllTemplate').replace('{n}', entries.length)}
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              </section>
            </div>
          ) : (
            <>
              {/* Quick Tip Box for other log types */}
              <section className="db-log-guide-box">
                <div className="db-guide-icon-wrap">
                  <Lightbulb size={18} />
                </div>
                <div className="db-guide-content">
                  <p className="db-guide-text">
                    <strong className="db-guide-title">{tr('logTypePage.quickTip', 'Quick tip')}: </strong>
                    {tr(`logs.types.${config.id}.tip`, config.tip)}
                  </p>
                </div>
              </section>

              {/* Split Container: Form on Left, Today's Entries Timeline on Right */}
              <div className="db-log-split">
                {/* Form Section */}
                <section id="db-log-form-anchor" className="db-log-split-form">
                  <div className="db-form-heading-row">
                    <h2 className="db-form-heading">
                      {editRaw ? tr('logTypePage.editEntry') : tr('logTypePage.newEntry')}
                    </h2>
                    {editRaw && (
                      <button
                        type="button"
                        onClick={() => setEditRaw(null)}
                        className="db-cancel-edit-btn"
                      >
                        {tr('logTypePage.cancelEdit')}
                      </button>
                    )}
                  </div>
                  <div className="db-log-form-card">
                    <LogEntryForm
                      key={`${config.id}-${editRaw?._id || 'new'}-${formKey}`}
                      typeId={config.id}
                      initialRaw={editRaw}
                      submitting={saving}
                      onSubmit={handleSubmit}
                    />
                  </div>
                </section>

                {/* Today's Entries Section */}
                <section className="db-log-split-entries">
                  <div className="db-entries-heading-row">
                    <h2 className="db-entries-heading">{tr('logTypePage.todaysEntries')}</h2>
                    {!loading && entries.length > 0 ? (
                      <span className="db-entries-count-pill">
                        {tr('logTypePage.todayCountTemplate').replace('{n}', entries.length)}
                      </span>
                    ) : null}
                  </div>

                  <div className="db-log-entries-panel">
                    {loading ? (
                      <div className="db-entries-loading">
                        <Loader2 size={18} className="db-spin" />
                        <span>{tr('common.loading')}</span>
                      </div>
                    ) : error ? (
                      <p className="db-entries-error">{error}</p>
                    ) : entries.length === 0 ? (
                      <div className="db-entries-empty-box">
                        <img
                          src={noLogImg}
                          alt="No logs recorded"
                          className="db-entries-empty-img"
                        />
                        <h3 className="db-entries-empty-title">No entries logged yet today</h3>
                        <p className="db-entries-empty-text">
                          {tr('logTypePage.noEntriesTemplate').replace('{type}', typeLabel.toLowerCase())}
                        </p>
                        <button type="button" onClick={scrollToForm} className="db-entries-empty-cta">
                          {tr('logTypePage.logNowTemplate').replace('{type}', typeLabel.toLowerCase())}
                        </button>
                      </div>
                    ) : (
                      <div className="db-entries-list">
                        {visibleEntries.map(renderEntryCard)}
                        {hasMoreEntries ? (
                          <button
                            type="button"
                            onClick={() => setShowAllEntries((v) => !v)}
                            className="db-entries-view-all-btn"
                          >
                            {showAllEntries
                              ? tr('logTypePage.showLess')
                              : tr('logTypePage.viewAllTemplate').replace('{n}', entries.length)}
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toast.visible && (
        <div className={`db-logs-toast ${toast.type === 'error' ? 'is-error' : 'is-success'}`}>
          <CheckCircle2 size={16} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Scoped Styles for LogTypePage */}
      <style>{`
        .db-logtype-page {
          min-height: 100vh;
          display: flex;
          background: ${t.bg};
          font-family: ${t.fontBody};
          color: ${t.ink};
        }
        .db-logtype-main {
          flex: 1;
          min-width: 0;
          padding: 28px 24px 120px;
        }
        .db-logtype-container {
          max-width: 1080px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Top Nav Bar */
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

        /* Header Actions */
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

        /* Header Banner Card with Custom logBanner.png Art */
        .db-logtype-header-card {
          position: relative;
          background-color: #172a1e;
          background-image: url(${logBannerImg});
          background-size: cover;
          background-position: center right;
          background-repeat: no-repeat;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 20px;
          padding: 24px 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          box-shadow: 0 10px 30px -4px rgba(18, 30, 22, 0.35), 0 2px 6px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        .db-logtype-header-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(19, 34, 25, 0.76) 0%, rgba(19, 34, 25, 0.46) 45%, rgba(19, 34, 25, 0.08) 100%);
          pointer-events: none;
          border-radius: inherit;
          z-index: 1;
        }
        /* Water Special Full-Width Layout */
        .db-water-full-layout {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
        }
        .db-water-entries-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }
        .db-logtype-header-left {
          display: flex;
          align-items: center;
          gap: 18px;
          min-width: 0;
          position: relative;
          z-index: 2;
        }
        .db-logtype-icon-badge {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.24);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(8px);
        }
        .db-logtype-title-box {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }
        .db-logtype-tag-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .db-logtype-num-tag {
          font-size: 11px;
          font-weight: 800;
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 2px 8px;
          border-radius: 6px;
          font-family: ${t.fontDisplay};
          letter-spacing: 0.04em;
        }
        .db-logtype-sublabel {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.75);
        }
        .db-logtype-title {
          margin: 0;
          font-family: ${t.fontDisplay};
          font-size: clamp(24px, 3.5vw, 30px);
          font-weight: 700;
          color: #FFFFFF;
          line-height: 1.2;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.22);
        }
        .db-logtype-desc {
          margin: 0;
          font-size: 13.5px;
          color: rgba(255, 255, 255, 0.88);
          line-height: 1.4;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
        }
        .db-logtype-header-stats {
          flex-shrink: 0;
          position: relative;
          z-index: 2;
        }
        .db-logtype-stat-pill {
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.24);
          padding: 10px 18px;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
        }
        .db-logtype-stat-label {
          font-size: 10.5px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.72);
        }
        .db-logtype-stat-val {
          font-size: 15px;
          font-weight: 800;
          color: #FFFFFF;
        }

        /* Water Intake Tracker */
        .db-log-water-box {
          background: ${t.surface};
          border: 1px solid ${t.lineStrong};
          border-radius: 14px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: ${t.shadowCard};
        }
        .db-water-box-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .db-water-box-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: ${t.inkFaint};
        }
        .db-water-box-val {
          margin: 2px 0 0;
          font-size: 18px;
          font-weight: 700;
          color: ${t.ink};
          font-family: ${t.fontDisplay};
        }
        .db-water-box-metric {
          font-size: 13px;
          font-weight: 600;
          color: ${t.inkSoft};
          font-family: ${t.fontBody};
        }
        .db-water-pct-tag {
          font-size: 13px;
          font-weight: 800;
          color: #2B70B6;
          background: rgba(74, 144, 226, 0.12);
          padding: 4px 10px;
          border-radius: 999px;
        }
        .db-water-progress-track {
          height: 10px;
          border-radius: 999px;
          background: ${t.surfaceSunken};
          overflow: hidden;
        }
        .db-water-progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #5E87A0 0%, #4A90E2 100%);
          transition: width 0.3s ease;
        }

        /* Quick Tip Guide */
        .db-log-guide-box {
          background: ${t.sageTint};
          border: 1px solid rgba(124, 148, 112, 0.35);
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .db-guide-icon-wrap {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: ${t.sageSoft};
          color: ${t.forest};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .db-guide-content {
          flex: 1;
          min-width: 0;
        }
        .db-guide-text {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: ${t.ink};
        }
        .db-guide-title {
          font-weight: 750;
          color: ${t.forest};
        }

        /* Split Section */
        .db-log-split {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.85fr);
          gap: 24px;
          align-items: start;
        }

        /* Left Column: Form */
        .db-form-heading-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        .db-form-heading {
          margin: 0;
          font-family: ${t.fontDisplay};
          font-size: 18px;
          font-weight: 700;
          color: ${t.ink};
        }
        .db-cancel-edit-btn {
          border: none;
          background: none;
          color: ${t.clay};
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          padding: 0;
        }
        .db-cancel-edit-btn:hover {
          text-decoration: underline;
        }
        .db-log-form-card {
          background: ${t.surface};
          border: 1px solid ${t.lineStrong};
          border-radius: 16px;
          padding: 22px 20px;
          box-shadow: ${t.shadowCard};
        }

        /* Right Column: Today's Entries */
        .db-log-split-entries {
          position: sticky;
          top: 16px;
        }
        .db-entries-heading-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        .db-entries-heading {
          margin: 0;
          font-family: ${t.fontDisplay};
          font-size: 18px;
          font-weight: 700;
          color: ${t.ink};
        }
        .db-entries-count-pill {
          font-size: 11.5px;
          font-weight: 700;
          color: ${t.forest};
          background: ${t.sageTint};
          padding: 2px 8px;
          border-radius: 999px;
        }
        .db-log-entries-panel {
          background: ${t.surface};
          border: 1px solid ${t.lineStrong};
          border-radius: 16px;
          padding: 16px;
          max-height: min(72vh, 750px);
          overflow-y: auto;
          box-shadow: ${t.shadowCard};
        }
        .db-entries-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: ${t.inkSoft};
          padding: 30px 0;
          font-size: 14px;
        }
        .db-entries-error {
          color: ${t.clayDeep};
          font-size: 13.5px;
          margin: 0;
          padding: 12px;
        }
        .db-entries-empty-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 20px 16px 28px;
          gap: 6px;
        }
        .db-entries-empty-img {
          width: 240px;
          max-width: 88%;
          height: auto;
          object-fit: contain;
          margin-bottom: 10px;
          display: block;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.04));
        }
        .db-entries-empty-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: ${t.surfaceSunken};
          color: ${t.forest};
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .db-entries-empty-title {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: ${t.ink};
        }
        .db-entries-empty-text {
          margin: 0;
          font-size: 12.5px;
          color: ${t.inkSoft};
          max-width: 260px;
          line-height: 1.45;
        }
        .db-entries-empty-cta {
          margin-top: 8px;
          padding: 9px 18px;
          border-radius: 10px;
          border: none;
          background: ${t.forest};
          color: #ffffff;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .db-entries-empty-cta:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        /* Entry Cards inside timeline */
        .db-entries-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .db-log-entry-row {
          background: ${t.surface};
          border: 1px solid ${t.line};
          border-radius: 12px;
          padding: 13px 14px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .db-log-entry-row:hover {
          border-color: ${t.lineStrong};
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .db-entry-card-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .db-entry-card-title-row {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .db-entry-icon-wrap {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: ${t.sageSoft};
          color: ${t.forest};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .db-entry-card-title {
          font-size: 14px;
          font-weight: 700;
          color: ${t.ink};
          word-break: break-word;
        }
        .db-entry-food-desc {
          margin: 2px 0 0;
          font-size: 13px;
          color: ${t.inkSoft};
          word-break: break-word;
        }
        .db-entry-tags-row {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
          margin-top: 3px;
        }
        .db-entry-macro-pill {
          font-size: 11px;
          font-weight: 600;
          color: ${t.inkSoft};
          background: ${t.surfaceSunken};
          padding: 2px 7px;
          border-radius: 6px;
        }
        .db-entry-macro-pill.is-highlight {
          color: ${t.forest};
          background: ${t.sageTint};
          font-weight: 700;
        }
        .db-entry-macro-pill.db-status-taken {
          background: ${t.sageTint};
          color: ${t.sageDeep};
        }
        .db-entry-macro-pill.db-status-missed,
        .db-entry-macro-pill.db-status-skipped {
          background: ${t.clayTint};
          color: ${t.clayDeep};
        }
        .db-entry-impact-line {
          margin: 3px 0 0;
          font-size: 11.5px;
          font-weight: 650;
          color: ${t.inkFaint};
        }
        .db-entry-notes-line {
          margin: 3px 0 0;
          font-size: 12px;
          color: ${t.inkSoft};
          line-height: 1.4;
          font-style: italic;
          word-break: break-word;
        }
        .db-entry-time-badge {
          margin-top: 4px;
          font-size: 11px;
          font-weight: 600;
          color: ${t.inkFaint};
        }

        /* Action Buttons on each entry */
        .db-log-entry-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .db-entry-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 8px;
          border-radius: 7px;
          border: 1px solid ${t.line};
          background: ${t.surfaceSunken};
          color: ${t.inkSoft};
          font-size: 11.5px;
          font-weight: 650;
          cursor: pointer;
          transition: all 0.12s ease;
        }
        .db-entry-action-btn:hover {
          background: ${t.surface};
          border-color: ${t.forest};
          color: ${t.forest};
        }
        .db-entry-action-btn.is-delete:hover {
          background: ${t.clayTint};
          border-color: ${t.clay};
          color: ${t.clayDeep};
        }
        .db-entries-view-all-btn {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid ${t.lineStrong};
          background: ${t.surfaceSunken};
          color: ${t.forest};
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s ease;
          margin-top: 4px;
        }
        .db-entries-view-all-btn:hover {
          background: ${t.sageTint};
        }

        /* Toast notification */
        .db-logs-toast {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 300;
          padding: 10px 18px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 650;
          box-shadow: ${t.shadowLifted};
          animation: dbToastUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .db-logs-toast.is-success {
          background: ${t.forest};
          color: #ffffff;
        }
        .db-logs-toast.is-error {
          background: ${t.clayDeep};
          color: #ffffff;
        }
        @keyframes dbToastUp {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .db-log-split {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .db-log-split-entries {
            position: static;
          }
          .db-log-entries-panel {
            max-height: none;
            overflow: visible;
          }
        }
        @media (max-width: 768px) {
          .db-logs-header-actions {
            display: none !important;
          }
          .db-logtype-main {
            padding: 16px 14px 100px;
          }
          .db-logtype-header-card {
            flex-direction: column;
            align-items: flex-start;
            padding: 20px 18px;
            gap: 14px;
            border-radius: 18px;
            background-position: right -10px center;
            background-size: auto 118%;
            min-height: 120px;
          }
          .db-logtype-header-card::before {
            background: linear-gradient(90deg, rgba(19, 34, 25, 0.92) 0%, rgba(19, 34, 25, 0.68) 52%, rgba(19, 34, 25, 0.05) 78%, transparent 100%);
          }
          .db-logtype-header-left {
            gap: 12px;
            max-width: 64%;
          }
          .db-logtype-icon-badge {
            width: 44px;
            height: 44px;
            border-radius: 12px;
          }
          .db-logtype-title {
            font-size: 22px;
          }
          .db-logtype-desc {
            font-size: 12.5px;
            line-height: 1.35;
          }
          .db-logtype-header-stats {
            width: auto;
            align-self: flex-start;
          }
          .db-logtype-stat-pill {
            flex-direction: row;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.12);
          }
          .db-logtype-stat-label {
            font-size: 10px;
          }
          .db-logtype-stat-val {
            font-size: 13px;
          }
        }
        @media (max-width: 640px) {
          .db-log-entry-row {
            flex-direction: column;
            gap: 10px;
          }
          .db-log-entry-actions {
            width: 100%;
            justify-content: flex-end;
            border-top: 1px solid ${t.line};
            padding-top: 8px;
          }
          .db-log-form-card {
            padding: 16px 14px;
          }
        }
      `}</style>
    </div>
  );
}

const linkBtn = {
  marginTop: 12,
  color: t.forest,
  fontWeight: 650,
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: t.fontBody,
};

