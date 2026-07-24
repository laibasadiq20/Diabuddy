import React, { useMemo, useState, useEffect } from 'react';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { ClipboardList, Droplets, Utensils, Syringe, Plus, Trash2 } from 'lucide-react';

const t = theme;
const STORAGE_KEY = 'diabuddy_health_logs_v1';

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
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: `linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 45%)`, fontFamily: t.fontBody }}>
      <AppSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 64px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.inkFaint }}>
            Logs
          </p>
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
        </div>
      </main>
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
