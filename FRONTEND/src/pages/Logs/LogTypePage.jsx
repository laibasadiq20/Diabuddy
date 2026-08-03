import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { useI18n } from '../../i18n/I18nContext';
import { Annoyed, ArrowLeft, Frown, Laugh, Loader2, Meh, Smile, Trash2 } from 'lucide-react';
import api from '../../config/axios';
import { getLogType } from './logsConfig';
import { LogEntryForm } from './components/LogEntryForm';

const t = theme;

const MEAL_EMOJI = {
  Breakfast: '🍳',
  Lunch: '🍲',
  Dinner: '🍽',
  Snack: '🥪',
};

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
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '';
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
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
  const config = getLogType(typeId);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editRaw, setEditRaw] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const [error, setError] = useState('');

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

  const Icon = config.icon;
  const waterGoal = 2000;
  const todayWaterMl = config.id === 'water'
    ? entries.reduce((sum, item) => sum + (Number(item.raw?.amount) || 0), 0)
    : 0;
  const waterPct = Math.min(100, Math.round((todayWaterMl / waterGoal) * 100));
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

  const renderEntryCard = (item) => {
    const isMeal = config.id === 'meal';
    const isInsulin = config.id === 'insulin';
    const isMedication = config.id === 'medication';
    const isWater = config.id === 'water';
    const isExercise = config.id === 'exercise';
    const isSleep = config.id === 'sleep';
    const isMood = config.id === 'mood';
    const raw = item.raw || {};
    const moodMeta = MOOD_CARD[raw.mood];
    const moodLabel = moodMeta ? tr(`logEntryForm.mood.moods.${moodMeta.key}`) : raw.mood || tr('logTypePage.entry.moodFallback');
    const MoodIcon = (moodMeta && moodMeta.Icon) || Smile;
    const mealEmoji = MEAL_EMOJI[raw.mealType || item.title] || '🍽';
    const impact = raw.bloodSugarImpact;
    const insulinReason =
      raw.mealRelation && raw.mealRelation !== 'None' ? raw.mealRelation : item.valueStr;

    return (
      <div key={item._id} className="db-log-entry-row" style={entryRow}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {isMeal ? (
            <>
              <p style={{ margin: 0, fontWeight: 650, fontSize: 15, color: t.ink }}>
                {mealEmoji} {raw.mealType || item.title}
              </p>
              {raw.foodItems ? (
                <p style={{ margin: '6px 0 0', fontSize: 14, color: t.inkSoft, wordBreak: 'break-word' }}>
                  {raw.foodItems}
                </p>
              ) : null}
              <p style={{ margin: '4px 0 0', fontSize: 14, color: t.inkSoft }}>
                {[
                  tr('logTypePage.entry.gCarbsTemplate').replace('{n}', raw.carbohydrates ?? 0),
                  raw.protein ? tr('logTypePage.entry.gProteinTemplate').replace('{n}', raw.protein) : null,
                  raw.fat ? tr('logTypePage.entry.gFatTemplate').replace('{n}', raw.fat) : null,
                  raw.calories ? tr('logTypePage.entry.kcalTemplate').replace('{n}', raw.calories) : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {impact ? (
                <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 650, color: t.inkFaint }}>
                  {tr('logTypePage.entry.afterMeal')} {impact === 'High' ? '⬆' : impact === 'Low' ? '⬇' : '➖'}{' '}
                  {tr(`logTypePage.entry.impact${impact === 'High' ? 'High' : impact === 'Low' ? 'Low' : 'Normal'}`, impact)}
                </p>
              ) : null}
              {raw.notes ? <p style={{ ...noteLine }}>{raw.notes}</p> : null}
              <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>
                {formatTodayTime(item.timestamp, tr)}
              </p>
            </>
          ) : isInsulin ? (
            <>
              <p style={{ margin: 0, fontWeight: 650, fontSize: 15, color: t.ink }}>
                💉 {raw.insulinType || item.title}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: t.inkSoft }}>
                {tr('logTypePage.entry.unitsTemplate').replace('{n}', raw.units ?? 0)}
              </p>
              {insulinReason ? (
                <p style={{ margin: '2px 0 0', fontSize: 14, color: t.inkSoft }}>{insulinReason}</p>
              ) : null}
              {raw.notes ? <p style={{ ...noteLine }}>{raw.notes}</p> : null}
              <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>
                {formatTodayTime(item.timestamp, tr)}
              </p>
            </>
          ) : isMedication ? (
            <>
              <p style={{ margin: 0, fontWeight: 650, fontSize: 15, color: t.ink }}>
                💊 {raw.medicineName || item.title}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: t.inkSoft }}>
                {raw.dose || item.subtitle}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 14, color: t.inkSoft }}>
                {raw.status || item.valueStr}
              </p>
              {raw.route ? (
                <p style={{ margin: '2px 0 0', fontSize: 12, color: t.inkFaint }}>{raw.route}</p>
              ) : null}
              {raw.notes ? <p style={{ ...noteLine }}>{raw.notes}</p> : null}
              <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>
                {formatTodayTime(item.timestamp, tr)}
              </p>
            </>
          ) : isWater ? (
            <>
              <p style={{ margin: 0, fontWeight: 650, fontSize: 15, color: t.ink }}>
                💧 {raw.amount ?? item.title} ml
              </p>
              {raw.notes ? <p style={{ ...noteLine }}>{raw.notes}</p> : null}
              <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>
                {formatTodayTime(item.timestamp, tr)}
              </p>
            </>
          ) : isExercise ? (
            <>
              <p style={{ margin: 0, fontWeight: 650, fontSize: 15, color: t.ink }}>
                🏃 {raw.activity || item.title}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: t.inkSoft }}>
                {[
                  raw.duration > 0 ? tr('logTypePage.entry.minTemplate').replace('{n}', raw.duration) : null,
                  raw.steps ? tr('logTypePage.entry.stepsTemplate').replace('{n}', Number(raw.steps).toLocaleString()) : null,
                  raw.caloriesBurned ? tr('logTypePage.entry.kcalTemplate').replace('{n}', raw.caloriesBurned) : null,
                  raw.distance ? tr('logTypePage.entry.kmTemplate').replace('{n}', raw.distance) : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {(raw.intensity || (raw.source && raw.source !== 'Manual')) ? (
                <p style={{ margin: '2px 0 0', fontSize: 13, color: t.inkSoft }}>
                  {[
                    raw.intensity ? tr(`logEntryForm.exercise.intensities.${INTENSITY_LABEL_KEYS[intensityFromApiLabel(raw.intensity)]}`, intensityFromApiLabel(raw.intensity)) : null,
                    raw.source && raw.source !== 'Manual' ? raw.source : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              ) : null}
              {raw.notes ? <p style={{ ...noteLine }}>{raw.notes}</p> : null}
              <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>
                {formatTodayTime(item.timestamp, tr)}
              </p>
            </>
          ) : isSleep ? (
            <>
              <p style={{ margin: 0, fontWeight: 650, fontSize: 15, color: t.ink }}>
                🌙 {raw.totalHours != null ? tr('logTypePage.entry.hoursTemplate').replace('{n}', Number(raw.totalHours).toFixed(1)) : item.title}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: t.inkSoft }}>
                {raw.quality
                  ? tr(`logEntryForm.sleep.qualities.${raw.quality === 'Average' ? 'fair' : (raw.quality || '').toLowerCase()}`, raw.quality === 'Average' ? 'Fair' : raw.quality)
                  : '—'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: t.inkSoft }}>
                {item.valueStr || ''}
              </p>
              {raw.notes ? <p style={{ ...noteLine }}>{raw.notes}</p> : null}
              <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>
                {formatTodayTime(raw.wakeTime || item.timestamp, tr)}
              </p>
            </>
          ) : isMood ? (
            <>
              <p
                style={{
                  margin: 0,
                  fontWeight: 650,
                  fontSize: 15,
                  color: t.ink,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <MoodIcon size={18} strokeWidth={1.75} color={t.forest} aria-hidden />
                {moodLabel}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: t.inkSoft }}>
                {tr('logTypePage.entry.stressTemplate').replace(
                  '{level}',
                  tr(`logEntryForm.mood.stress.${STRESS_LABEL_KEYS[raw.stressLevel] || 'low'}`, raw.stressLevel || 'Low')
                )}
              </p>
              {raw.journalEntry ? <p style={{ ...noteLine }}>{raw.journalEntry}</p> : null}
              <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>
                {formatTodayTime(item.timestamp, tr)}
              </p>
            </>
          ) : (
            <>
              <p style={{ margin: 0, fontWeight: 650, fontSize: 14, color: t.ink }}>{item.title}</p>
              {item.subtitle && (
                <p style={{ margin: '3px 0 0', fontSize: 13, color: t.inkSoft, wordBreak: 'break-word' }}>
                  {item.subtitle}
                </p>
              )}
              {item.valueStr && (
                <p style={{ margin: '4px 0 0', fontSize: 13, color: t.inkSoft }}>{item.valueStr}</p>
              )}
              {(raw.notes || item.notes) ? (
                <p style={{ ...noteLine }}>{raw.notes || item.notes}</p>
              ) : null}
              <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>
                {formatTodayTime(item.timestamp, tr)}
              </p>
            </>
          )}
        </div>
        <div className="db-log-entry-actions" style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {config.apiPath !== 'water' && (
            <button
              type="button"
              onClick={() => {
                setEditRaw(item.raw || item);
                scrollToForm();
              }}
              style={smallBtn}
            >
              {tr('logTypePage.edit')}
            </button>
          )}
          <button
            type="button"
            aria-label={tr('logTypePage.deleteAria')}
            onClick={() => handleDelete(item)}
            style={{ ...smallBtn, color: t.clayDeep }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(180deg, ${t.pageFadeTop} 0%, ${t.bg} 40%)`,
        fontFamily: t.fontBody,
      }}
    >
      <AppSidebar />
      <main className="db-logs-main" style={{ flex: 1, minWidth: 0, padding: '24px 20px 110px' }}>
        <div className="db-logs-wrap" style={{ maxWidth: 1040, margin: '0 auto', width: '100%' }}>
          <button type="button" onClick={() => navigate('/logs')} style={backBtn}>
            <ArrowLeft size={16} /> {tr('logTypePage.allLogs')}
          </button>

          <div className="db-logs-title-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, margin: '18px 0 8px' }}>
            <span
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: t.surfaceSunken,
                color: t.forest,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={22} strokeWidth={1.75} />
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1
                style={{
                  margin: 0,
                  fontFamily: t.fontDisplay,
                  fontSize: 'clamp(24px, 6vw, 32px)',
                  fontWeight: 500,
                  color: t.ink,
                  lineHeight: 1.2,
                }}
              >
                {typeLabel}
              </h1>
            </div>
          </div>

          {config.id === 'water' && (
            <section className="db-log-water-box" style={waterProgressBox}>
              <p style={{ ...guideTitle, margin: 0 }}>{tr('logTypePage.todaysWaterIntake')}</p>
              <p
                style={{
                  margin: '10px 0 0',
                  fontFamily: t.fontDisplay,
                  fontSize: 24,
                  fontWeight: 500,
                  color: t.ink,
                }}
              >
                {todayWaterMl} / {waterGoal} ml
              </p>
              <div
                style={{
                  marginTop: 12,
                  height: 12,
                  borderRadius: 999,
                  background: t.surfaceSunken,
                  overflow: 'hidden',
                }}
                aria-label={tr('logTypePage.waterGoalAriaTemplate').replace('{pct}', waterPct)}
              >
                <div
                  style={{
                    width: `${waterPct}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: t.sky,
                    transition: 'width 0.25s ease',
                  }}
                />
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 13, fontWeight: 650, color: t.inkSoft }}>{waterPct}%</p>
            </section>
          )}

          <section className="db-log-guide-box" style={guideBox}>
            <h2 style={guideTitle}>{tr('logTypePage.whyMatters')}</h2>
            <p style={guideText}>{tr(`logs.types.${config.id}.why`, config.why)}</p>
            <h2 style={{ ...guideTitle, marginTop: 16 }}>{tr('logTypePage.howToUse')}</h2>
            <p style={guideText}>{tr(`logs.types.${config.id}.how`, config.how)}</p>
          </section>

          <div className="db-log-split">
            <section id="db-log-form-anchor" className="db-log-split-form">
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 20, fontWeight: 500, color: t.ink }}>
                  {editRaw ? tr('logTypePage.editEntry') : tr('logTypePage.newEntry')}
                </h2>
                {editRaw && (
                  <button
                    type="button"
                    onClick={() => setEditRaw(null)}
                    style={{ ...linkBtn, padding: 0, border: 'none', background: 'none', marginTop: 0 }}
                  >
                    {tr('logTypePage.cancelEdit')}
                  </button>
                )}
              </div>
              <div className="db-log-form-card" style={formCard}>
                <LogEntryForm
                  key={`${config.id}-${editRaw?._id || 'new'}-${formKey}`}
                  typeId={config.id}
                  initialRaw={editRaw}
                  submitting={saving}
                  onSubmit={handleSubmit}
                />
              </div>
            </section>

            <section className="db-log-split-entries">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 14,
                  flexWrap: 'wrap',
                }}
              >
                <h2 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 20, fontWeight: 500, color: t.ink }}>
                  {tr('logTypePage.todaysEntries')}
                </h2>
                {!loading && entries.length > 0 ? (
                  <span style={{ fontSize: 12, fontWeight: 650, color: t.inkFaint }}>
                    {tr('logTypePage.todayCountTemplate').replace('{n}', entries.length)}
                  </span>
                ) : null}
              </div>
              <div className="db-log-entries-panel">
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: t.inkSoft, padding: '12px 0' }}>
                    <Loader2 size={18} className="db-spin" /> {tr('common.loading')}
                  </div>
                ) : error ? (
                  <p style={{ color: t.clayDeep, fontSize: 14, margin: 0 }}>{error}</p>
                ) : entries.length === 0 ? (
                  <div style={emptyStateBox}>
                    <span style={emptyStateIcon}>
                      <Icon size={20} strokeWidth={1.75} />
                    </span>
                    <p style={emptyStateText}>
                      {tr('logTypePage.noEntriesTemplate').replace('{type}', typeLabel.toLowerCase())}
                    </p>
                    <button type="button" onClick={scrollToForm} style={emptyStateCta}>
                      {tr('logTypePage.logNowTemplate').replace('{type}', typeLabel.toLowerCase())}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {visibleEntries.map(renderEntryCard)}
                    {hasMoreEntries ? (
                      <button
                        type="button"
                        onClick={() => setShowAllEntries((v) => !v)}
                        style={viewAllBtn}
                      >
                        {showAllEntries ? tr('logTypePage.showLess') : tr('logTypePage.viewAllTemplate').replace('{n}', entries.length)}
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {toast.visible && (
        <div
          style={{
            position: 'fixed',
            bottom: 96,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            padding: '12px 18px',
            borderRadius: 10,
            background: toast.type === 'error' ? t.claySoft : t.forest,
            color: toast.type === 'error' ? t.clayDeep : '#F7F3EC',
            fontSize: 13,
            fontWeight: 650,
            boxShadow: t.shadowLifted,
            maxWidth: '90vw',
          }}
        >
          {toast.message}
        </div>
      )}

      <style>{`
        .db-logs-wrap,
        .db-logs-main {
          box-sizing: border-box;
        }
        .db-logs-wrap input,
        .db-logs-wrap select,
        .db-logs-wrap textarea,
        .db-logs-wrap button {
          max-width: 100%;
        }
        .db-logs-wrap input[type='datetime-local'],
        .db-logs-wrap input[type='number'],
        .db-logs-wrap input[type='text'],
        .db-logs-wrap textarea,
        .db-logs-wrap select {
          font-size: 16px;
        }
        .db-log-split {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
          gap: 20px;
          align-items: start;
          margin-top: 24px;
        }
        .db-log-split-entries {
          position: sticky;
          top: 16px;
        }
        .db-log-entries-panel {
          background: ${t.surface};
          border: 1px solid ${t.lineStrong};
          border-radius: 14px;
          padding: 14px;
          max-height: min(70vh, 720px);
          overflow-y: auto;
          box-shadow: 0 1px 2px rgba(43,42,40,0.04);
        }
        @media (max-width: 900px) {
          .db-log-split {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .db-log-split-entries {
            position: static;
          }
          .db-log-entries-panel {
            max-height: none;
            overflow: visible;
            background: transparent;
            border: none;
            padding: 0;
            box-shadow: none;
          }
        }
        @media (max-width: 640px) {
          .db-logs-main {
            padding: 14px 12px 120px !important;
          }
          .db-logs-wrap {
            max-width: 100% !important;
          }
          .db-log-form-card {
            padding: 14px 12px !important;
            border-radius: 12px !important;
          }
          .db-log-guide-box,
          .db-log-water-box {
            padding: 14px 12px !important;
          }
          .db-log-entry-row {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 12px !important;
            gap: 10px !important;
          }
          .db-log-entry-actions {
            width: 100%;
            justify-content: flex-end;
            padding-top: 2px;
          }
          .db-log-source-grid,
          .db-log-quality-grid {
            grid-template-columns: 1fr !important;
          }
          .db-log-macro-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .db-log-segment-grid {
            grid-template-columns: 1fr !important;
          }
          .db-log-mood-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .db-log-intensity-grid,
          .db-log-stress-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
          .db-log-dose-row {
            flex-wrap: wrap !important;
          }
          .db-log-dose-row select {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
        @media (max-width: 380px) {
          .db-log-mood-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .db-log-intensity-grid,
          .db-log-stress-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

const backBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: 0,
  border: 'none',
  background: 'none',
  color: t.inkSoft,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: t.fontBody,
};

const linkBtn = {
  marginTop: 12,
  color: t.forest,
  fontWeight: 650,
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: t.fontBody,
};

const guideBox = {
  marginTop: 20,
  padding: '18px 18px',
  borderRadius: 12,
  border: `1px solid ${t.line}`,
  background: t.surfaceRaised,
};

const waterProgressBox = {
  marginTop: 20,
  padding: '18px 18px',
  borderRadius: 12,
  border: `1px solid ${t.lineStrong}`,
  background: t.surface,
  boxShadow: '0 1px 2px rgba(43,42,40,0.04)',
};

const guideTitle = {
  margin: 0,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: t.inkFaint,
};

const guideText = {
  margin: '8px 0 0',
  fontSize: 14,
  color: t.inkSoft,
  lineHeight: 1.65,
};

const formCard = {
  background: t.surface,
  border: `1px solid ${t.lineStrong}`,
  borderRadius: 14,
  padding: '20px 18px',
  boxShadow: '0 1px 2px rgba(43,42,40,0.04)',
};

const entryRow = {
  display: 'flex',
  gap: 12,
  alignItems: 'flex-start',
  padding: '14px 14px',
  borderRadius: 12,
  border: `1px solid ${t.line}`,
  background: t.surface,
};

const noteLine = {
  margin: '4px 0 0',
  fontSize: 13,
  color: t.inkSoft,
  lineHeight: 1.45,
  wordBreak: 'break-word',
};

const smallBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 10px',
  borderRadius: 8,
  border: `1px solid ${t.line}`,
  background: t.surfaceSunken,
  color: t.inkSoft,
  fontSize: 12,
  fontWeight: 650,
  cursor: 'pointer',
  fontFamily: t.fontBody,
};

const viewAllBtn = {
  marginTop: 4,
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: `1px solid ${t.lineStrong}`,
  background: t.surfaceSunken,
  color: t.forest,
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: t.fontBody,
};

const emptyStateBox = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 10,
  padding: '18px 4px 4px',
};

const emptyStateIcon = {
  width: 38,
  height: 38,
  borderRadius: 10,
  background: t.surfaceSunken,
  color: t.forest,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const emptyStateText = {
  margin: 0,
  fontSize: 14,
  color: t.inkSoft,
  lineHeight: 1.55,
  maxWidth: '32ch',
};

const emptyStateCta = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 16px',
  borderRadius: 10,
  border: 'none',
  background: t.forest,
  color: '#fff',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: t.fontBody,
};
