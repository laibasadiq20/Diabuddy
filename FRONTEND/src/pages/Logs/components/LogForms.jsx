import React, { useEffect, useState } from 'react';
import { theme } from '../../../theme';
import { X, Loader2 } from 'lucide-react';
import api from '../../../config/axios';

const t = theme;

const fieldStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 12px',
  borderRadius: 12,
  border: `1.5px solid ${t.line}`,
  background: t.surfaceSunken,
  fontSize: 14,
  color: t.ink,
  fontFamily: t.fontBody,
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  marginBottom: 6,
  fontSize: 12,
  fontWeight: 700,
  color: t.inkSoft,
};

function getRaw(initialData) {
  return initialData?.raw || initialData || null;
}

function toLocalInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Modal({ isOpen, onClose, title, children, submitting }) {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(31,30,28,0.45)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflow: 'auto',
          background: '#FFF',
          borderRadius: 20,
          border: `1.5px solid ${t.lineStrong}`,
          boxShadow: t.shadowLifted,
          padding: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 22, fontWeight: 500, color: t.ink }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.inkFaint, padding: 4 }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SubmitButton({ submitting, label = 'Save' }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      style={{
        marginTop: 8,
        width: '100%',
        padding: '12px 16px',
        borderRadius: 12,
        border: 'none',
        background: t.forest,
        color: '#FFF',
        fontWeight: 700,
        fontSize: 14,
        cursor: submitting ? 'wait' : 'pointer',
        fontFamily: t.fontBody,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: submitting ? 0.75 : 1,
      }}
    >
      {submitting && <Loader2 size={16} className="db-spin" />}
      {label}
    </button>
  );
}

function useSubmit(path, initialData, onSuccess, onError, onClose) {
  const [submitting, setSubmitting] = useState(false);
  const raw = getRaw(initialData);
  const isEdit = Boolean(raw?._id);

  const submit = async (body) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/health-logs/${path}/${raw._id}`, body);
        onSuccess?.({ message: 'Log updated' });
      } else {
        await api.post(`/health-logs/${path}`, body);
        onSuccess?.({ message: 'Log saved' });
      }
      onClose?.();
    } catch (err) {
      onError?.(err.response?.data?.message || err.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, submit, raw, isEdit };
}

export function GlucoseForm({ isOpen, onClose, initialData, onSuccess, onError }) {
  const { submitting, submit, raw } = useSubmit('glucose', initialData, onSuccess, onError, onClose);
  const [form, setForm] = useState({
    glucoseLevel: '',
    unit: 'mg/dL',
    readingType: 'Before Breakfast',
    source: 'Manual Entry',
    notes: '',
    timestamp: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      glucoseLevel: raw?.glucoseLevel ?? '',
      unit: raw?.unit || 'mg/dL',
      readingType: raw?.readingType || 'Before Breakfast',
      source: raw?.source || 'Manual Entry',
      notes: raw?.notes || '',
      timestamp: toLocalInput(raw?.timestamp),
    });
  }, [isOpen, raw]);

  const onSubmit = (e) => {
    e.preventDefault();
    const body = {
      glucoseLevel: Number(form.glucoseLevel),
      unit: form.unit,
      readingType: form.readingType,
      source: form.source,
      notes: form.notes || undefined,
    };
    if (form.timestamp) body.timestamp = new Date(form.timestamp).toISOString();
    submit(body);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Glucose log" submitting={submitting}>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={labelStyle}>Reading</label>
          <input required type="number" step="0.1" value={form.glucoseLevel} onChange={(e) => setForm({ ...form, glucoseLevel: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Unit</label>
          <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} style={fieldStyle}>
            <option>mg/dL</option>
            <option>mmol/L</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Reading type</label>
          <select value={form.readingType} onChange={(e) => setForm({ ...form, readingType: e.target.value })} style={fieldStyle}>
            {['Before Breakfast', 'After Breakfast', 'Before Lunch', 'After Lunch', 'Before Dinner', 'After Dinner', 'Bedtime', 'Random'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Source</label>
          <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} style={fieldStyle}>
            {['Fingerstick', 'CGM', 'Manual Entry'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>When (optional)</label>
          <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={fieldStyle} />
        </div>
        <SubmitButton submitting={submitting} />
      </form>
    </Modal>
  );
}

export function MealForm({ isOpen, onClose, initialData, onSuccess, onError }) {
  const { submitting, submit, raw } = useSubmit('meal', initialData, onSuccess, onError, onClose);
  const [form, setForm] = useState({
    mealType: 'Breakfast',
    foodItems: '',
    carbohydrates: '',
    protein: '',
    fat: '',
    calories: '',
    waterConsumed: '',
    notes: '',
    timestamp: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      mealType: raw?.mealType || 'Breakfast',
      foodItems: raw?.foodItems || '',
      carbohydrates: raw?.carbohydrates ?? '',
      protein: raw?.protein ?? '',
      fat: raw?.fat ?? '',
      calories: raw?.calories ?? '',
      waterConsumed: raw?.waterConsumed ?? '',
      notes: raw?.notes || '',
      timestamp: toLocalInput(raw?.timestamp),
    });
  }, [isOpen, raw]);

  const onSubmit = (e) => {
    e.preventDefault();
    const body = {
      mealType: form.mealType,
      foodItems: form.foodItems,
      carbohydrates: Number(form.carbohydrates) || 0,
      protein: Number(form.protein) || 0,
      fat: Number(form.fat) || 0,
      calories: Number(form.calories) || 0,
      waterConsumed: Number(form.waterConsumed) || 0,
      notes: form.notes || undefined,
    };
    if (form.timestamp) body.timestamp = new Date(form.timestamp).toISOString();
    submit(body);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Meal log" submitting={submitting}>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={labelStyle}>Meal type</label>
          <select value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })} style={fieldStyle}>
            {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Food items</label>
          <input required type="text" value={form.foodItems} onChange={(e) => setForm({ ...form, foodItems: e.target.value })} style={fieldStyle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label style={labelStyle}>Carbs (g)</label>
            <input type="number" min="0" value={form.carbohydrates} onChange={(e) => setForm({ ...form, carbohydrates: e.target.value })} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Calories</label>
            <input type="number" min="0" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Protein (g)</label>
            <input type="number" min="0" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Fat (g)</label>
            <input type="number" min="0" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} style={fieldStyle} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Water with meal (ml)</label>
          <input type="number" min="0" value={form.waterConsumed} onChange={(e) => setForm({ ...form, waterConsumed: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>When (optional)</label>
          <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={fieldStyle} />
        </div>
        <SubmitButton submitting={submitting} />
      </form>
    </Modal>
  );
}

export function InsulinForm({ isOpen, onClose, initialData, onSuccess, onError }) {
  const { submitting, submit, raw } = useSubmit('insulin', initialData, onSuccess, onError, onClose);
  const [form, setForm] = useState({
    units: '',
    insulinType: '',
    injectionSite: 'Abdomen',
    mealRelation: 'None',
    notes: '',
    timestamp: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      units: raw?.units ?? '',
      insulinType: raw?.insulinType || '',
      injectionSite: raw?.injectionSite || 'Abdomen',
      mealRelation: raw?.mealRelation || 'None',
      notes: raw?.notes || '',
      timestamp: toLocalInput(raw?.timestamp),
    });
  }, [isOpen, raw]);

  const onSubmit = (e) => {
    e.preventDefault();
    const body = {
      units: Number(form.units),
      insulinType: form.insulinType,
      injectionSite: form.injectionSite,
      mealRelation: form.mealRelation,
      notes: form.notes || undefined,
    };
    if (form.timestamp) body.timestamp = new Date(form.timestamp).toISOString();
    submit(body);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Insulin log" submitting={submitting}>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={labelStyle}>Units</label>
          <input required type="number" min="0.1" step="0.1" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Insulin type</label>
          <input required type="text" placeholder="e.g. NovoRapid" value={form.insulinType} onChange={(e) => setForm({ ...form, insulinType: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Injection site</label>
          <select value={form.injectionSite} onChange={(e) => setForm({ ...form, injectionSite: e.target.value })} style={fieldStyle}>
            {['Abdomen', 'Arm', 'Thigh', 'Buttocks'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Meal relation</label>
          <select value={form.mealRelation} onChange={(e) => setForm({ ...form, mealRelation: e.target.value })} style={fieldStyle}>
            {['Before Meal', 'After Meal', 'None'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>When (optional)</label>
          <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={fieldStyle} />
        </div>
        <SubmitButton submitting={submitting} />
      </form>
    </Modal>
  );
}

export function MedicationForm({ isOpen, onClose, initialData, onSuccess, onError }) {
  const { submitting, submit, raw } = useSubmit('medication', initialData, onSuccess, onError, onClose);
  const [form, setForm] = useState({
    medicineName: '',
    dose: '',
    status: 'Taken',
    reminderTime: '',
    notes: '',
    timestamp: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      medicineName: raw?.medicineName || '',
      dose: raw?.dose || '',
      status: raw?.status || 'Taken',
      reminderTime: raw?.reminderTime || '',
      notes: raw?.notes || '',
      timestamp: toLocalInput(raw?.timestamp),
    });
  }, [isOpen, raw]);

  const onSubmit = (e) => {
    e.preventDefault();
    const body = {
      medicineName: form.medicineName,
      dose: form.dose,
      status: form.status,
      reminderTime: form.reminderTime || undefined,
      notes: form.notes || undefined,
    };
    if (form.timestamp) body.timestamp = new Date(form.timestamp).toISOString();
    submit(body);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Medication log" submitting={submitting}>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={labelStyle}>Medicine</label>
          <input required type="text" value={form.medicineName} onChange={(e) => setForm({ ...form, medicineName: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Dose</label>
          <input required type="text" value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={fieldStyle}>
            {['Taken', 'Missed', 'Skipped'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Reminder time</label>
          <input type="text" placeholder="08:00 AM" value={form.reminderTime} onChange={(e) => setForm({ ...form, reminderTime: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>When (optional)</label>
          <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={fieldStyle} />
        </div>
        <SubmitButton submitting={submitting} />
      </form>
    </Modal>
  );
}

export function ExerciseForm({ isOpen, onClose, initialData, onSuccess, onError }) {
  const { submitting, submit, raw } = useSubmit('exercise', initialData, onSuccess, onError, onClose);
  const [form, setForm] = useState({
    exerciseType: '',
    duration: '',
    distance: '',
    caloriesBurned: '',
    intensity: 'Medium',
    notes: '',
    timestamp: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      exerciseType: raw?.activity || raw?.exerciseType || '',
      duration: raw?.duration ?? '',
      distance: raw?.distance ?? '',
      caloriesBurned: raw?.caloriesBurned ?? '',
      intensity: raw?.intensity || 'Medium',
      notes: raw?.notes || '',
      timestamp: toLocalInput(raw?.timestamp),
    });
  }, [isOpen, raw]);

  const onSubmit = (e) => {
    e.preventDefault();
    const body = {
      exerciseType: form.exerciseType,
      duration: Number(form.duration),
      distance: Number(form.distance) || 0,
      caloriesBurned: Number(form.caloriesBurned) || 0,
      intensity: form.intensity,
      notes: form.notes || undefined,
    };
    if (form.timestamp) body.timestamp = new Date(form.timestamp).toISOString();
    submit(body);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Exercise log" submitting={submitting}>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={labelStyle}>Activity</label>
          <input required type="text" value={form.exerciseType} onChange={(e) => setForm({ ...form, exerciseType: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Duration (min)</label>
          <input required type="number" min="1" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} style={fieldStyle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label style={labelStyle}>Distance</label>
            <input type="number" min="0" step="0.1" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Calories</label>
            <input type="number" min="0" value={form.caloriesBurned} onChange={(e) => setForm({ ...form, caloriesBurned: e.target.value })} style={fieldStyle} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Intensity</label>
          <select value={form.intensity} onChange={(e) => setForm({ ...form, intensity: e.target.value })} style={fieldStyle}>
            {['Low', 'Medium', 'High'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>When (optional)</label>
          <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={fieldStyle} />
        </div>
        <SubmitButton submitting={submitting} />
      </form>
    </Modal>
  );
}

export function WeightForm({ isOpen, onClose, initialData, onSuccess, onError }) {
  const { submitting, submit, raw } = useSubmit('weight', initialData, onSuccess, onError, onClose);
  const [form, setForm] = useState({ weight: '', bmi: '', bodyFat: '', notes: '', timestamp: '' });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      weight: raw?.weight ?? '',
      bmi: raw?.bmi ?? '',
      bodyFat: raw?.bodyFat ?? '',
      notes: raw?.notes || '',
      timestamp: toLocalInput(raw?.timestamp),
    });
  }, [isOpen, raw]);

  const onSubmit = (e) => {
    e.preventDefault();
    const body = {
      weight: Number(form.weight),
      bmi: form.bmi === '' ? undefined : Number(form.bmi),
      bodyFat: form.bodyFat === '' ? undefined : Number(form.bodyFat),
      notes: form.notes || undefined,
    };
    if (form.timestamp) body.timestamp = new Date(form.timestamp).toISOString();
    submit(body);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Weight log" submitting={submitting}>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={labelStyle}>Weight (kg)</label>
          <input required type="number" min="1" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} style={fieldStyle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label style={labelStyle}>BMI</label>
            <input type="number" min="0" step="0.1" value={form.bmi} onChange={(e) => setForm({ ...form, bmi: e.target.value })} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Body fat %</label>
            <input type="number" min="0" max="100" step="0.1" value={form.bodyFat} onChange={(e) => setForm({ ...form, bodyFat: e.target.value })} style={fieldStyle} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>When (optional)</label>
          <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={fieldStyle} />
        </div>
        <SubmitButton submitting={submitting} />
      </form>
    </Modal>
  );
}

export function SleepForm({ isOpen, onClose, initialData, onSuccess, onError }) {
  const { submitting, submit, raw } = useSubmit('sleep', initialData, onSuccess, onError, onClose);
  const [form, setForm] = useState({ sleepTime: '', wakeTime: '', quality: 'Good', notes: '' });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      sleepTime: toLocalInput(raw?.sleepTime),
      wakeTime: toLocalInput(raw?.wakeTime),
      quality: raw?.quality || 'Good',
      notes: raw?.notes || '',
    });
  }, [isOpen, raw]);

  const onSubmit = (e) => {
    e.preventDefault();
    submit({
      sleepTime: new Date(form.sleepTime).toISOString(),
      wakeTime: new Date(form.wakeTime).toISOString(),
      quality: form.quality,
      notes: form.notes || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sleep log" submitting={submitting}>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={labelStyle}>Sleep time</label>
          <input required type="datetime-local" value={form.sleepTime} onChange={(e) => setForm({ ...form, sleepTime: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Wake time</label>
          <input required type="datetime-local" value={form.wakeTime} onChange={(e) => setForm({ ...form, wakeTime: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Quality</label>
          <select value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value })} style={fieldStyle}>
            {['Poor', 'Average', 'Good', 'Excellent'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={fieldStyle} />
        </div>
        <SubmitButton submitting={submitting} />
      </form>
    </Modal>
  );
}

export function SymptomsForm({ isOpen, onClose, initialData, onSuccess, onError }) {
  const { submitting, submit, raw } = useSubmit('symptoms', initialData, onSuccess, onError, onClose);
  const [form, setForm] = useState({ symptoms: '', severity: 5, notes: '', timestamp: '' });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      symptoms: Array.isArray(raw?.symptoms) ? raw.symptoms.join(', ') : '',
      severity: raw?.severity ?? 5,
      notes: raw?.notes || '',
      timestamp: toLocalInput(raw?.timestamp),
    });
  }, [isOpen, raw]);

  const onSubmit = (e) => {
    e.preventDefault();
    const list = form.symptoms
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const body = {
      symptoms: list,
      severity: Number(form.severity),
      notes: form.notes || undefined,
    };
    if (form.timestamp) body.timestamp = new Date(form.timestamp).toISOString();
    submit(body);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Symptoms log" submitting={submitting}>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={labelStyle}>Symptoms (comma-separated)</label>
          <input required type="text" placeholder="Headache, Fatigue" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Severity (1–10)</label>
          <input required type="number" min="1" max="10" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>When (optional)</label>
          <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={fieldStyle} />
        </div>
        <SubmitButton submitting={submitting} />
      </form>
    </Modal>
  );
}

export function MoodForm({ isOpen, onClose, initialData, onSuccess, onError }) {
  const { submitting, submit, raw } = useSubmit('mood', initialData, onSuccess, onError, onClose);
  const [form, setForm] = useState({ mood: 'Good', journalEntry: '', timestamp: '' });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      mood: raw?.mood || 'Good',
      journalEntry: raw?.journalEntry || '',
      timestamp: toLocalInput(raw?.timestamp),
    });
  }, [isOpen, raw]);

  const onSubmit = (e) => {
    e.preventDefault();
    const body = {
      mood: form.mood,
      journalEntry: form.journalEntry || undefined,
    };
    if (form.timestamp) body.timestamp = new Date(form.timestamp).toISOString();
    submit(body);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mood log" submitting={submitting}>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={labelStyle}>Mood</label>
          <select value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })} style={fieldStyle}>
            {['Great', 'Good', 'Okay', 'Low', 'Stressed'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Journal</label>
          <textarea
            rows={3}
            maxLength={1000}
            value={form.journalEntry}
            onChange={(e) => setForm({ ...form, journalEntry: e.target.value })}
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
        </div>
        <div>
          <label style={labelStyle}>When (optional)</label>
          <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={fieldStyle} />
        </div>
        <SubmitButton submitting={submitting} />
      </form>
    </Modal>
  );
}
