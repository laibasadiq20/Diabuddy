import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
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

function formatTodayTime(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '';
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `Today • ${time}`;
}

function intensityFromApiLabel(intensity) {
  if (intensity === 'Low') return 'Light';
  if (intensity === 'High') return 'Vigorous';
  if (intensity === 'Medium') return 'Moderate';
  return intensity || '';
}

const MOOD_CARD = {
  'Very Happy': { emoji: '🥰', label: 'Very Happy' },
  Happy: { emoji: '😊', label: 'Happy' },
  Neutral: { emoji: '😌', label: 'Neutral' },
  Sad: { emoji: '🥺', label: 'Sad' },
  Anxious: { emoji: '🫠', label: 'Anxious' },
  Great: { emoji: '🥰', label: 'Very Happy' },
  Good: { emoji: '😊', label: 'Happy' },
  Okay: { emoji: '😌', label: 'Neutral' },
  Low: { emoji: '🥺', label: 'Sad' },
  Stressed: { emoji: '🫠', label: 'Anxious' },
};

export default function LogTypePage() {
  const { typeId } = useParams();
  const navigate = useNavigate();
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
      setError(err.response?.data?.message || 'Could not load entries.');
    } finally {
      setLoading(false);
    }
  }, [config]);

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
          <p style={{ color: t.inkSoft }}>Unknown log type.</p>
          <button type="button" onClick={() => navigate('/logs')} style={linkBtn}>
            Back to logs
          </button>
        </main>
      </div>
    );
  }

  const Icon = config.icon;
  const waterGoal = 2000;
  const todayWaterMl = config.id === 'water'
    ? entries.reduce((sum, item) => sum + (Number(item.raw?.amount) || 0), 0)
    : 0;
  const waterPct = Math.min(100, Math.round((todayWaterMl / waterGoal) * 100));
  const PREVIEW_COUNT = 2;
  const visibleEntries = showAllEntries ? entries : entries.slice(0, PREVIEW_COUNT);
  const hasMoreEntries = entries.length > PREVIEW_COUNT;

  const handleSubmit = async (body) => {
    setSaving(true);
    try {
      if (editRaw?._id) {
        if (config.apiPath === 'water') {
          showToast('Water entries cannot be edited. Delete and add again.', 'error');
          setSaving(false);
          return;
        }
        await api.put(`/health-logs/${config.apiPath}/${editRaw._id}`, body);
        showToast('Entry updated');
      } else {
        await api.post(`/health-logs/${config.apiPath}`, body);
        showToast('Entry saved');
      }
      setEditRaw(null);
      setFormKey((k) => k + 1);
      await loadEntries();
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/health-logs/${config.apiPath}/${item._id}`);
      showToast('Entry deleted');
      if (editRaw?._id === item._id) setEditRaw(null);
      await loadEntries();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 40%)`,
        fontFamily: t.fontBody,
      }}
    >
      <AppSidebar />
      <main className="db-logs-main" style={{ flex: 1, minWidth: 0, padding: '24px 20px 110px' }}>
        <div className="db-logs-wrap" style={{ maxWidth: 640, margin: '0 auto', width: '100%' }}>
          <button type="button" onClick={() => navigate('/logs')} style={backBtn}>
            <ArrowLeft size={16} /> All logs
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
                {config.label}
              </h1>
            </div>
          </div>

          {config.id === 'water' && (
            <section className="db-log-water-box" style={waterProgressBox}>
              <p style={{ ...guideTitle, margin: 0 }}>Today&apos;s water intake</p>
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
                aria-label={`${waterPct}% of daily water goal`}
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
            <h2 style={guideTitle}>Why this log matters</h2>
            <p style={guideText}>{config.why}</p>
            <h2 style={{ ...guideTitle, marginTop: 16 }}>How to use it</h2>
            <p style={guideText}>{config.how}</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 20, fontWeight: 500, color: t.ink }}>
                {editRaw ? 'Edit entry' : 'New entry'}
              </h2>
              {editRaw && (
                <button
                  type="button"
                  onClick={() => setEditRaw(null)}
                  style={{ ...linkBtn, padding: 0, border: 'none', background: 'none' }}
                >
                  Cancel edit
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

          <section style={{ marginTop: 32 }}>
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
                Today&apos;s entries
              </h2>
              {!loading && entries.length > 0 ? (
                <span style={{ fontSize: 12, fontWeight: 650, color: t.inkFaint }}>
                  {entries.length} today
                </span>
              ) : null}
            </div>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: t.inkSoft, padding: '20px 0' }}>
                <Loader2 size={18} className="db-spin" /> Loading…
              </div>
            ) : error ? (
              <p style={{ color: t.clayDeep, fontSize: 14 }}>{error}</p>
            ) : entries.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: t.inkFaint, lineHeight: 1.5 }}>
                No entries for today yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {visibleEntries.map((item) => {
                  const isMeal = config.id === 'meal';
                  const isInsulin = config.id === 'insulin';
                  const isMedication = config.id === 'medication';
                  const isWater = config.id === 'water';
                  const isExercise = config.id === 'exercise';
                  const isSleep = config.id === 'sleep';
                  const isMood = config.id === 'mood';
                  const raw = item.raw || {};
                  const moodMeta = MOOD_CARD[raw.mood] || { emoji: '😊', label: raw.mood || 'Mood' };
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
                            <p style={{ margin: '6px 0 0', fontSize: 14, color: t.inkSoft }}>
                              {raw.calories ?? 0} kcal
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: 14, color: t.inkSoft }}>
                              {raw.carbohydrates ?? 0}g Carbs
                            </p>
                            {impact ? (
                              <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 650, color: t.inkFaint }}>
                                After meal: {impact === 'High' ? '⬆' : impact === 'Low' ? '⬇' : '➖'} {impact}
                              </p>
                            ) : null}
                            <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>
                              {formatTodayTime(item.timestamp)}
                            </p>
                          </>
                        ) : isInsulin ? (
                          <>
                            <p style={{ margin: 0, fontWeight: 650, fontSize: 15, color: t.ink }}>
                              💉 {raw.insulinType || item.title}
                            </p>
                            <p style={{ margin: '6px 0 0', fontSize: 14, color: t.inkSoft }}>
                              {raw.units ?? 0} Units
                            </p>
                            {insulinReason ? (
                              <p style={{ margin: '2px 0 0', fontSize: 14, color: t.inkSoft }}>{insulinReason}</p>
                            ) : null}
                            <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>
                              {formatTodayTime(item.timestamp)}
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
                            <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>
                              {formatTodayTime(item.timestamp)}
                            </p>
                          </>
                        ) : isWater ? (
                          <>
                            <p style={{ margin: 0, fontWeight: 650, fontSize: 15, color: t.ink }}>
                              💧 {raw.amount ?? item.title} ml
                            </p>
                            {raw.notes ? (
                              <p style={{ margin: '4px 0 0', fontSize: 13, color: t.inkSoft }}>{raw.notes}</p>
                            ) : null}
                            <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>
                              {formatTodayTime(item.timestamp)}
                            </p>
                          </>
                        ) : isExercise ? (
                          <>
                            <p style={{ margin: 0, fontWeight: 650, fontSize: 15, color: t.ink }}>
                              🏃 {raw.activity || item.title}
                            </p>
                            <p style={{ margin: '6px 0 0', fontSize: 14, color: t.inkSoft }}>
                              {raw.duration ?? 0} minutes
                              {raw.intensity ? ` · ${intensityFromApiLabel(raw.intensity)}` : ''}
                            </p>
                            {(raw.caloriesBurned || raw.distance) ? (
                              <p style={{ margin: '2px 0 0', fontSize: 13, color: t.inkSoft }}>
                                {[
                                  raw.caloriesBurned ? `${raw.caloriesBurned} kcal` : null,
                                  raw.distance ? `${raw.distance} km` : null,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </p>
                            ) : null}
                            <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>
                              {formatTodayTime(item.timestamp)}
                            </p>
                          </>
                        ) : isSleep ? (
                          <>
                            <p style={{ margin: 0, fontWeight: 650, fontSize: 15, color: t.ink }}>
                              🌙 {raw.totalHours != null ? `${Number(raw.totalHours).toFixed(1)} hours` : item.title}
                            </p>
                            <p style={{ margin: '6px 0 0', fontSize: 14, color: t.inkSoft }}>
                              {(raw.quality === 'Average' ? 'Fair' : raw.quality) || '—'}
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: 13, color: t.inkSoft }}>
                              {item.valueStr || ''}
                            </p>
                            <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>
                              {formatTodayTime(raw.wakeTime || item.timestamp)}
                            </p>
                          </>
                        ) : isMood ? (
                          <>
                            <p style={{ margin: 0, fontWeight: 650, fontSize: 15, color: t.ink }}>
                              {moodMeta.emoji} {moodMeta.label}
                            </p>
                            <p style={{ margin: '6px 0 0', fontSize: 14, color: t.inkSoft }}>
                              Stress: {raw.stressLevel || 'Low'}
                            </p>
                            <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>
                              {formatTodayTime(item.timestamp)}
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
                            <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>
                              {formatTodayTime(item.timestamp)}
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
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            style={smallBtn}
                          >
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          aria-label="Delete"
                          onClick={() => handleDelete(item)}
                          style={{ ...smallBtn, color: t.clayDeep }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {hasMoreEntries ? (
                  <button
                    type="button"
                    onClick={() => setShowAllEntries((v) => !v)}
                    style={viewAllBtn}
                  >
                    {showAllEntries ? 'Show less' : `View all (${entries.length})`}
                  </button>
                ) : null}
              </div>
            )}
          </section>
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
          .db-log-form-grid,
          .db-log-source-grid,
          .db-log-quality-grid {
            grid-template-columns: 1fr !important;
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
  background: '#FFF',
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
  background: '#FFF',
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
  background: '#FFF',
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
