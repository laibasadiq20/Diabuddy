import React, { useState, useEffect } from 'react';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { Sparkles, Loader2 } from 'lucide-react';
import api from '../../config/axios';

import SummaryCards from './components/SummaryCards';
import QuickActions from './components/QuickActions';
import WaterTracker from './components/WaterTracker';
import LogCharts from './components/LogCharts';
import LogTimeline from './components/LogTimeline';
import LogStats from './components/LogStats';

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

export default function Logs() {
  const [summary, setSummary] = useState(null);
  const [timelineLogs, setTimelineLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const [activeModal, setActiveModal] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const [search, setSearch] = useState('');
  const [moduleType, setModuleType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const tzOffset = new Date().getTimezoneOffset();
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

  const handleAddWater = async (amount) => {
    try {
      await api.post('/health-logs/water', { amount });
      showToast(`${amount} ml logged`, 'success');
      triggerRefetch();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to log water', 'error');
    }
  };

  const handleDeleteWater = async (id) => {
    try {
      await api.delete(`/health-logs/water/${id}`);
      showToast('Water log deleted', 'success');
      triggerRefetch();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete water log', 'error');
    }
  };

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
        Water: 'water',
      };
      const path = endpointMap[type];
      if (!path) return;
      await api.delete(`/health-logs/${path}/${id}`);
      showToast('Log entry deleted', 'success');
      triggerRefetch();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete operation failed', 'error');
    }
  };

  const getTodayWaterLogs = () => timelineLogs.filter((log) => log.type === 'Water');

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 45%)`,
        fontFamily: t.fontBody,
      }}
    >
      <AppSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 96px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
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
            DiaBuddy Health Tracking
          </p>
          <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(26px, 6vw, 32px)', fontWeight: 500, color: t.ink }}>
            Health Logs
          </h1>
          <p style={{ margin: '8px 0 24px', fontSize: 14, color: t.inkSoft, maxWidth: 640, lineHeight: 1.5 }}>
            Track blood glucose, insulin, meals, medications, exercise, water, sleep, symptoms, and mood in one place.
          </p>

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
              <span style={{ color: t.sageDeep, display: 'flex', alignItems: 'center' }}>
                <Sparkles size={20} fill={t.sage} />
              </span>
              <div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: t.sageDeep,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Recommendations
                </span>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: t.inkSoft, lineHeight: 1.4 }}>{insights[0]}</p>
              </div>
            </div>
          )}

          {loading && timelineLogs.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '40vh',
                gap: 12,
              }}
            >
              <Loader2 size={32} className="db-spin" style={{ color: t.sageDeep }} />
              <p style={{ color: t.inkSoft, fontSize: 14 }}>Loading health logs...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
              <SummaryCards summary={summary} />

              <QuickActions onOpenModal={handleOpenModal} />

              <WaterTracker
                todayIntake={summary?.water?.value || 0}
                goal={summary?.water?.goal || 2000}
                waterLogs={getTodayWaterLogs()}
                onAddWater={handleAddWater}
                onDeleteWater={handleDeleteWater}
              />

              {stats && <LogCharts chartsData={stats.charts} />}

              <div className="db-logs-split-container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
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

                <div>
                  <h3 style={{ margin: '0 0 14px', fontFamily: t.fontDisplay, fontSize: 20, color: t.ink, fontWeight: 500 }}>
                    Analytics Overview
                  </h3>
                  <LogStats stats={stats} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

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
