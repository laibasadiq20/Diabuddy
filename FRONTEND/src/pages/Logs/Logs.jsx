import React, { useMemo, useState, useEffect } from 'react';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { ClipboardList, Droplets, Utensils, Syringe, Plus, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { Sparkles, Loader2, Info } from 'lucide-react';
import api from '../../config/axios';

// Import child views
import SummaryCards from './components/SummaryCards';
import QuickActions from './components/QuickActions';
import WaterTracker from './components/WaterTracker';
import LogCharts from './components/LogCharts';
import LogTimeline from './components/LogTimeline';
import LogStats from './components/LogStats';

// Import Modals
import {
  GlucoseForm,
  MealForm,
  InsulinForm,
  MedicationForm,
  ExerciseForm,
  WeightForm,
  SleepForm,
  SymptomsForm,
  MoodForm,
} from './components/LogForms';

const t = theme;
const STORAGE_KEY = 'diabuddy_health_logs_v1';

<<<<<<< HEAD
const emptyForm = { type: 'glucose', value: '', note: '', carbs: '', units: '' };

function loadLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setLogs(loadLogs());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const todayCount = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return logs.filter((l) => new Date(l.at) >= start).length;
  }, [logs]);

  const addLog = (e) => {
    e.preventDefault();
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: form.type,
      note: form.note.trim(),
      at: new Date().toISOString(),
    };
    if (form.type === 'glucose') {
      const v = parseFloat(form.value);
      if (!v || v < 20 || v > 600) return;
      entry.value = v;
      entry.unit = 'mg/dL';
    } else if (form.type === 'meal') {
      const c = parseFloat(form.carbs);
      if (!form.note.trim() && !(c >= 0)) return;
      entry.carbs = Number.isFinite(c) ? c : 0;
    } else if (form.type === 'insulin') {
      const u = parseFloat(form.units);
      if (!Number.isFinite(u) || u < 0) return;
      entry.units = u;
    }
    setLogs((prev) => [entry, ...prev].slice(0, 200));
    setForm({ ...emptyForm, type: form.type });
  };

  const remove = (id) => setLogs((prev) => prev.filter((l) => l.id !== id));

  const typeMeta = {
    glucose: { label: 'Glucose', icon: Droplets, color: t.skyDeep, bg: t.skySoft },
    meal: { label: 'Meal', icon: Utensils, color: t.sageDeep, bg: t.sageSoft },
    insulin: { label: 'Insulin', icon: Syringe, color: t.clayDeep, bg: t.claySoft },
=======
export default function Logs() {
  // Data State
  const [summary, setSummary] = useState(null);
  const [timelineLogs, setTimelineLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Form Modal triggers
  const [activeModal, setActiveModal] = useState(null); // 'glucose', 'meal', etc.
  const [editItem, setEditItem] = useState(null); // item to edit (for PUT updates)

  // Timeline Filtering State
  const [search, setSearch] = useState('');
  const [moduleType, setModuleType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Toast Notification State
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const triggerRefetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  // Fetch summary, stats, timeline logs, and insights in parallel
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const tzOffset = new Date().getTimezoneOffset();
        
        // Construct query parameters for timeline logs
        const params = {
          search,
          moduleType,
          startDate,
          endDate,
          sortBy,
          tzOffset,
        };

        const [summaryRes, statsRes, timelineRes, insightsRes] = await Promise.all([
          api.get('/health-logs/summary', { params: { tzOffset } }),
          api.get('/health-logs/stats', { params: { days: 30 } }),
          api.get('/health-logs/timeline', { params }),
          api.get('/health-logs/insights'),
        ]);

        if (summaryRes.data?.status === 'success') setSummary(summaryRes.data.data);
        if (statsRes.data?.status === 'success') setStats(statsRes.data.data);
        if (timelineRes.data?.status === 'success') setTimelineLogs(timelineRes.data.data);
        if (insightsRes.data?.status === 'success') setInsights(insightsRes.data.data);
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to fetch logs data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refetchTrigger, search, moduleType, startDate, endDate, sortBy]);

  // CRUD handlers passed down to children
  const handleOpenModal = (type) => {
    setEditItem(null);
    setActiveModal(type);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setEditItem(null);
  };

  const handleSuccess = (res) => {
    showToast(res.message || 'Log saved successfully', 'success');
    handleCloseModal();
    triggerRefetch();
  };

  const handleError = (errorMsg) => {
    showToast(errorMsg || 'Action failed', 'error');
  };

  // Directly log water via QuickAdd on WaterTracker
  const handleAddWater = async (amount) => {
    try {
      await api.post('/health-logs/water', { amount });
      showToast(`${amount} ml logged`, 'success');
      triggerRefetch();
    } catch (err) {
      showToast('Failed to log water: ' + err.message, 'error');
    }
  };

  const handleDeleteWater = async (id) => {
    try {
      await api.delete(`/health-logs/water/${id}`);
      showToast('Water log deleted', 'success');
      triggerRefetch();
    } catch (err) {
      showToast('Failed to delete water log: ' + err.message, 'error');
    }
  };

  // Edit action
  const handleEditLog = (item) => {
    setEditItem(item);
    const formMap = {
      Glucose: 'glucose',
      Meal: 'meal',
      Insulin: 'insulin',
      Medication: 'medication',
      Exercise: 'exercise',
      Weight: 'weight',
      Sleep: 'sleep',
      Symptoms: 'symptoms',
      Mood: 'mood',
    };
    setActiveModal(formMap[item.type]);
  };

  // Delete action
  const handleDeleteLog = async (type, id) => {
    try {
      const endpointMap = {
        Glucose: 'glucose',
        Insulin: 'insulin',
        Meal: 'meal',
        Medication: 'medication',
        Exercise: 'exercise',
        Weight: 'weight',
        Sleep: 'sleep',
        Symptoms: 'symptoms',
        Mood: 'mood',
      };
      const path = endpointMap[type];
      await api.delete(`/health-logs/${path}/${id}`);
      showToast('Log entry deleted', 'success');
      triggerRefetch();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete operation failed', 'error');
    }
  };

  // Extract water logs specifically for WaterTracker widget
  const getTodayWaterLogs = () => {
    return timelineLogs.filter((log) => log.type === 'Water');
>>>>>>> 4dd24b1 (Add health logs module)
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: `linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 45%)`, fontFamily: t.fontBody }}>
      <AppSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 64px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          
          {/* Header */}
          <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.inkFaint }}>
            DiaBuddy Health Tracking
          </p>
<<<<<<< HEAD
          <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(26px, 6vw, 32px)', fontWeight: 500, color: t.ink, display: 'flex', alignItems: 'center', gap: 10 }}>
            <ClipboardList size={28} color={t.clay} /> Health log
          </h1>
          <p style={{ margin: '8px 0 8px', fontSize: 14, color: t.inkSoft, lineHeight: 1.5 }}>
            Track glucose, meals, and insulin on this device. Sync to the cloud is coming later.
          </p>
          <p style={{ margin: '0 0 20px', fontSize: 12, color: t.inkFaint }}>
            {todayCount} entr{todayCount === 1 ? 'y' : 'ies'} today · stored locally only
          </p>

          <form
            onSubmit={addLog}
            style={{
              background: '#FFF',
              borderRadius: 20,
              border: `1.5px solid ${t.lineStrong}`,
              boxShadow: t.shadowCard,
              padding: 20,
              marginBottom: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['glucose', 'meal', 'insulin'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type }))}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    border: `1.5px solid ${form.type === type ? t.forest : t.line}`,
                    background: form.type === type ? t.forest : '#FFF',
                    color: form.type === type ? '#FFF' : t.inkSoft,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: t.fontBody,
                  }}
                >
                  {typeMeta[type].label}
                </button>
              ))}
            </div>

            {form.type === 'glucose' && (
              <input
                type="number"
                min="20"
                max="600"
                placeholder="Reading (mg/dL)"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                required
                style={field}
              />
            )}
            {form.type === 'meal' && (
              <input
                type="number"
                min="0"
                placeholder="Carbs (g)"
                value={form.carbs}
                onChange={(e) => setForm({ ...form, carbs: e.target.value })}
                style={field}
              />
            )}
            {form.type === 'insulin' && (
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Units taken (as prescribed)"
                value={form.units}
                onChange={(e) => setForm({ ...form, units: e.target.value })}
                required
                style={field}
              />
            )}
            <input
              type="text"
              placeholder={form.type === 'meal' ? 'What did you eat?' : 'Optional note'}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              style={field}
            />
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 18px',
                borderRadius: 12,
                border: 'none',
                background: t.forest,
                color: '#FFF',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: t.fontBody,
              }}
            >
              <Plus size={16} /> Add entry
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {logs.length === 0 && (
              <p style={{ textAlign: 'center', color: t.inkFaint, fontSize: 14, padding: 24 }}>
                No entries yet. Log your first reading above.
              </p>
            )}
            {logs.map((l) => {
              const meta = typeMeta[l.type] || typeMeta.glucose;
              const Icon = meta.icon;
              return (
                <div
                  key={l.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 16px',
                    borderRadius: 16,
                    border: `1.5px solid ${t.lineStrong}`,
                    background: '#FFF',
                    boxShadow: t.shadowCard,
                  }}
                >
                  <span style={{ width: 40, height: 40, borderRadius: 12, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, color: t.ink, fontSize: 14 }}>
                      {meta.label}
                      {l.type === 'glucose' && ` · ${l.value} ${l.unit}`}
                      {l.type === 'meal' && ` · ${l.carbs ?? 0}g carbs`}
                      {l.type === 'insulin' && ` · ${l.units} u`}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: t.inkSoft }}>
                      {new Date(l.at).toLocaleString()}
                      {l.note ? ` · ${l.note}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(l.id)}
                    aria-label="Delete entry"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.inkFaint, padding: 6 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
=======
          <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 32, fontWeight: 500, color: t.ink }}>
            Health Logs
          </h1>
          <p style={{ margin: '8px 0 24px', fontSize: 14, color: t.inkSoft, maxWidth: 640, lineHeight: 1.5 }}>
            Track your blood glucose, insulin, meals, medications, exercise, water intake, sleep, symptoms, and overall health in one place.
          </p>

          {/* AI Insights Bar */}
          {insights.length > 0 && (
            <div
              style={{
                marginBottom: 24,
                padding: 16,
                borderRadius: 16,
                border: `1.5px solid ${t.sage}`,
                backgroundColor: t.sageTint,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: t.shadowCard,
              }}
            >
              <span style={{ color: t.sageDeep, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} fill={t.sage} />
              </span>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: t.sageDeep, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  AI Recommendations
                </span>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: t.inkSoft, lineHeight: 1.4 }}>
                  {insights[0]}
                </p>
              </div>
            </div>
          )}

          {loading && timelineLogs.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', gap: 12 }}>
              <Loader2 size={32} className="db-spin" style={{ color: t.sageDeep, animation: 'db-spin 1s linear infinite' }} />
              <p style={{ color: t.inkSoft, fontSize: 14 }}>Loading health logs...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
              
              {/* Top Row: Daily Summary Cards */}
              <SummaryCards summary={summary} />

              {/* Middle Section: Flex grid splitting quick actions/trackers from logs list */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
                
                {/* Dashboard Operations Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
                    {/* Quick Buttons */}
                    <QuickActions onOpenModal={handleOpenModal} />
                    
                    {/* Water Widget */}
                    <WaterTracker
                      todayIntake={summary?.water?.value || 0}
                      goal={summary?.water?.goal || 2000}
                      waterLogs={getTodayWaterLogs()}
                      onAddWater={handleAddWater}
                      onDeleteWater={handleDeleteWater}
                    />

                    {/* Interactive Recharts */}
                    {stats && <LogCharts chartsData={stats.charts} />}
                  </div>
                </div>

                {/* Bottom Row: Split Timeline (left) and Stats (right) on large screens */}
                <div className="db-logs-split-container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
                  {/* Left: Chronological History Timeline */}
                  <div>
                    <h3 style={{ margin: '0 0 14px', fontFamily: t.fontDisplay, fontSize: 20, color: t.ink, fontWeight: 500 }}>
                      History Timeline
                    </h3>
                    <LogTimeline
                      logs={timelineLogs}
                      search={search}
                      setSearch={setSearch}
                      moduleType={moduleType}
                      setModuleType={setModuleType}
                      startDate={startDate}
                      setStartDate={setStartDate}
                      endDate={endDate}
                      setEndDate={setEndDate}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      onEditLog={handleEditLog}
                      onDeleteLog={handleDeleteLog}
                    />
                  </div>

                  {/* Right: Aggregated Stats Overview */}
                  <div>
                    <h3 style={{ margin: '0 0 14px', fontFamily: t.fontDisplay, fontSize: 20, color: t.ink, fontWeight: 500 }}>
                      Analytics Overview
                    </h3>
                    <LogStats stats={stats} />
                  </div>
                </div>

              </div>

            </div>
          )}

>>>>>>> 4dd24b1 (Add health logs module)
        </div>
      </main>

      {/* Slide Toast Alerts */}
      {toast.visible && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 200,
            padding: '12px 20px',
            borderRadius: 12,
            backgroundColor: toast.type === 'error' ? t.claySoft : t.sageSoft,
            color: toast.type === 'error' ? t.clayDeep : t.sageDeep,
            border: `1.5px solid ${toast.type === 'error' ? t.clay : t.sage}`,
            boxShadow: t.shadowLifted,
            fontSize: 14,
            fontWeight: 700,
            animation: 'db-fade-up 0.3s ease both',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Form Dialog Modals */}
      <GlucoseForm
        isOpen={activeModal === 'glucose'}
        onClose={handleCloseModal}
        initialData={editItem}
        onSuccess={handleSuccess}
        onError={handleError}
      />
      <MealForm
        isOpen={activeModal === 'meal'}
        onClose={handleCloseModal}
        initialData={editItem}
        onSuccess={handleSuccess}
        onError={handleError}
      />
      <InsulinForm
        isOpen={activeModal === 'insulin'}
        onClose={handleCloseModal}
        initialData={editItem}
        onSuccess={handleSuccess}
        onError={handleError}
      />
      <MedicationForm
        isOpen={activeModal === 'medication'}
        onClose={handleCloseModal}
        initialData={editItem}
        onSuccess={handleSuccess}
        onError={handleError}
      />
      <ExerciseForm
        isOpen={activeModal === 'exercise'}
        onClose={handleCloseModal}
        initialData={editItem}
        onSuccess={handleSuccess}
        onError={handleError}
      />
      <WeightForm
        isOpen={activeModal === 'weight'}
        onClose={handleCloseModal}
        initialData={editItem}
        onSuccess={handleSuccess}
        onError={handleError}
      />
      <SleepForm
        isOpen={activeModal === 'sleep'}
        onClose={handleCloseModal}
        initialData={editItem}
        onSuccess={handleSuccess}
        onError={handleError}
      />
      <SymptomsForm
        isOpen={activeModal === 'symptoms'}
        onClose={handleCloseModal}
        initialData={editItem}
        onSuccess={handleSuccess}
        onError={handleError}
      />
      <MoodForm
        isOpen={activeModal === 'mood'}
        onClose={handleCloseModal}
        initialData={editItem}
        onSuccess={handleSuccess}
        onError={handleError}
      />

      <style>{`
        @media (min-width: 900px) {
          .db-logs-split-container {
            grid-template-columns: 1.3fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

const field = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: 12,
  border: `1.5px solid ${t.line}`,
  background: t.surfaceSunken,
  fontSize: 14,
  color: t.ink,
  fontFamily: t.fontBody,
  outline: 'none',
};
