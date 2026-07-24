import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import api from '../../config/axios';
import { getLogType } from './logsConfig';
import { LogEntryForm } from './components/LogEntryForm';

const t = theme;

export default function LogTypePage() {
  const { typeId } = useParams();
  const navigate = useNavigate();
  const config = getLogType(typeId);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editRaw, setEditRaw] = useState(null);
  const [formKey, setFormKey] = useState(0);
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
      const res = await api.get('/health-logs/timeline', {
        params: { moduleType: config.id, sortBy: 'newest' },
      });
      if (res.data?.status === 'success') {
        setEntries(res.data.data || []);
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
      <main style={{ flex: 1, minWidth: 0, padding: '24px 20px 110px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <button type="button" onClick={() => navigate('/logs')} style={backBtn}>
            <ArrowLeft size={16} /> All logs
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, margin: '18px 0 8px' }}>
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
            <div>
              <h1
                style={{
                  margin: 0,
                  fontFamily: t.fontDisplay,
                  fontSize: 'clamp(26px, 5vw, 32px)',
                  fontWeight: 500,
                  color: t.ink,
                }}
              >
                {config.label}
              </h1>
            </div>
          </div>

          <section style={guideBox}>
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
            <div style={formCard}>
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
            <h2 style={{ margin: '0 0 14px', fontFamily: t.fontDisplay, fontSize: 20, fontWeight: 500, color: t.ink }}>
              Recent entries
            </h2>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: t.inkSoft, padding: '20px 0' }}>
                <Loader2 size={18} className="db-spin" /> Loading…
              </div>
            ) : error ? (
              <p style={{ color: t.clayDeep, fontSize: 14 }}>{error}</p>
            ) : entries.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: t.inkFaint, lineHeight: 1.5 }}>
                No entries yet. Save your first record above.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {entries.map((item) => (
                  <div key={item._id} style={entryRow}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 650, fontSize: 14, color: t.ink }}>{item.title}</p>
                      {item.subtitle && (
                        <p style={{ margin: '3px 0 0', fontSize: 13, color: t.inkSoft, wordBreak: 'break-word' }}>
                          {item.subtitle}
                        </p>
                      )}
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: t.inkFaint }}>
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                        {item.valueStr ? ` · ${item.valueStr}` : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
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
                ))}
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
