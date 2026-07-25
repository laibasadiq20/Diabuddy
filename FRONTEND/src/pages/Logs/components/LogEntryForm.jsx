import React, { useEffect, useState } from 'react';
import { theme } from '../../../theme';
import { Loader2 } from 'lucide-react';

const t = theme;

const field = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: 10,
  border: `1px solid ${t.lineStrong}`,
  background: '#FFF',
  fontSize: 14,
  color: t.ink,
  fontFamily: t.fontBody,
  outline: 'none',
};

const label = {
  display: 'block',
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 650,
  color: t.ink,
};

const hint = {
  margin: '6px 0 0',
  fontSize: 12,
  color: t.inkFaint,
  lineHeight: 1.45,
};

const row = { display: 'flex', flexDirection: 'column', gap: 14 };

function toLocalInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Field({ title, help, children }) {
  return (
    <div>
      <label style={label}>{title}</label>
      {children}
      {help ? <p style={hint}>{help}</p> : null}
    </div>
  );
}

function Submit({ submitting, isEdit, label, editLabel }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      style={{
        marginTop: 6,
        width: '100%',
        padding: '13px 16px',
        borderRadius: 10,
        border: 'none',
        background: t.forest,
        color: '#F7F3EC',
        fontWeight: 700,
        fontSize: 14,
        cursor: submitting ? 'wait' : 'pointer',
        fontFamily: t.fontBody,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: submitting ? 0.8 : 1,
      }}
    >
      {submitting && <Loader2 size={16} className="db-spin" />}
      {isEdit ? editLabel || 'Update entry' : label || 'Save entry'}
    </button>
  );
}

export function LogEntryForm({ typeId, initialRaw, submitting, onSubmit }) {
  const isEdit = Boolean(initialRaw?._id);

  if (typeId === 'glucose') {
    return <GlucoseFields initialRaw={initialRaw} submitting={submitting} isEdit={isEdit} onSubmit={onSubmit} />;
  }
  if (typeId === 'meal') {
    return <MealFields initialRaw={initialRaw} submitting={submitting} isEdit={isEdit} onSubmit={onSubmit} />;
  }
  if (typeId === 'insulin') {
    return <InsulinFields initialRaw={initialRaw} submitting={submitting} isEdit={isEdit} onSubmit={onSubmit} />;
  }
  if (typeId === 'medication') {
    return <MedicationFields initialRaw={initialRaw} submitting={submitting} isEdit={isEdit} onSubmit={onSubmit} />;
  }
  if (typeId === 'water') {
    return <WaterFields initialRaw={initialRaw} submitting={submitting} isEdit={isEdit} onSubmit={onSubmit} />;
  }
  if (typeId === 'exercise') {
    return <ExerciseFields initialRaw={initialRaw} submitting={submitting} isEdit={isEdit} onSubmit={onSubmit} />;
  }
  if (typeId === 'weight') {
    return <WeightFields initialRaw={initialRaw} submitting={submitting} isEdit={isEdit} onSubmit={onSubmit} />;
  }
  if (typeId === 'sleep') {
    return <SleepFields initialRaw={initialRaw} submitting={submitting} isEdit={isEdit} onSubmit={onSubmit} />;
  }
  if (typeId === 'symptoms') {
    return <SymptomsFields initialRaw={initialRaw} submitting={submitting} isEdit={isEdit} onSubmit={onSubmit} />;
  }
  if (typeId === 'mood') {
    return <MoodFields initialRaw={initialRaw} submitting={submitting} isEdit={isEdit} onSubmit={onSubmit} />;
  }
  return null;
}

function GlucoseFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const [form, setForm] = useState({
    glucoseLevel: '',
    unit: 'mg/dL',
    readingType: 'Before Breakfast',
    notes: '',
    timestamp: '',
  });

  useEffect(() => {
    setForm({
      glucoseLevel: initialRaw?.glucoseLevel ?? '',
      unit: initialRaw?.unit || 'mg/dL',
      readingType: initialRaw?.readingType || 'Before Breakfast',
      notes: initialRaw?.notes || '',
      timestamp: toLocalInput(initialRaw?.timestamp),
    });
  }, [initialRaw]);

  return (
    <form
      style={row}
      onSubmit={(e) => {
        e.preventDefault();
        const body = {
          glucoseLevel: Number(form.glucoseLevel),
          unit: form.unit,
          readingType: form.readingType,
          notes: form.notes || undefined,
        };
        if (form.timestamp) body.timestamp = new Date(form.timestamp).toISOString();
        onSubmit(body);
      }}
    >
      <Field title="Glucose reading">
        <input
          required
          type="number"
          step="0.1"
          min="20"
          max="600"
          value={form.glucoseLevel}
          onChange={(e) => setForm({ ...form, glucoseLevel: e.target.value })}
          style={field}
          placeholder="e.g. 128"
        />
      </Field>
      <Field title="Unit">
        <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} style={field}>
          <option value="mg/dL">mg/dL</option>
          <option value="mmol/L">mmol/L</option>
        </select>
      </Field>
      <Field title="Reading context">
        <select value={form.readingType} onChange={(e) => setForm({ ...form, readingType: e.target.value })} style={field}>
          {[
            'Fasting',
            'Before Breakfast',
            'After Breakfast',
            'Before Lunch',
            'After Lunch',
            'Before Dinner',
            'After Dinner',
            'Bedtime',
            'Random',
            'Before Exercise',
            'After Exercise',
            'Night',
          ].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field title="Date & time (optional)">
        <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={field} />
      </Field>
      <Field title="Notes (optional)">
        <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={field} />
      </Field>
      <Submit submitting={submitting} isEdit={isEdit} />
    </form>
  );
}

function MealFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const [form, setForm] = useState({
    mealType: 'Breakfast',
    foodItems: '',
    carbohydrates: '',
    protein: '',
    fat: '',
    calories: '',
    waterConsumed: '',
    bloodSugarImpact: '',
    notes: '',
    timestamp: '',
  });
  const [nutritionMode, setNutritionMode] = useState('manual');

  useEffect(() => {
    setForm({
      mealType: initialRaw?.mealType || 'Breakfast',
      foodItems: initialRaw?.foodItems || '',
      carbohydrates: initialRaw?.carbohydrates ?? '',
      protein: initialRaw?.protein ?? '',
      fat: initialRaw?.fat ?? '',
      calories: initialRaw?.calories ?? '',
      waterConsumed: initialRaw?.waterConsumed ?? '',
      bloodSugarImpact: initialRaw?.bloodSugarImpact || '',
      notes: initialRaw?.notes || '',
      timestamp: toLocalInput(initialRaw?.timestamp),
    });
    setNutritionMode('manual');
  }, [initialRaw]);

  const impactOptions = [
    { value: 'High', label: '⬆ High' },
    { value: 'Normal', label: '➖ Normal' },
    { value: 'Low', label: '⬇ Low' },
  ];

  return (
    <form
      style={row}
      onSubmit={(e) => {
        e.preventDefault();
        const body = {
          mealType: form.mealType,
          foodItems: form.foodItems,
          carbohydrates: Number(form.carbohydrates) || 0,
          protein: Number(form.protein) || 0,
          fat: Number(form.fat) || 0,
          calories: Number(form.calories) || 0,
          waterConsumed: Number(form.waterConsumed) || 0,
          bloodSugarImpact: form.bloodSugarImpact || '',
          notes: form.notes || undefined,
        };
        if (form.timestamp) body.timestamp = new Date(form.timestamp).toISOString();
        onSubmit(body);
      }}
    >
      <Field title="Meal type">
        <select value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })} style={field}>
          {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>

      <Field title="Date & time">
        <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={field} />
      </Field>

      <Field title="Food description">
        <textarea
          required
          rows={3}
          value={form.foodItems}
          onChange={(e) => setForm({ ...form, foodItems: e.target.value })}
          style={{ ...field, resize: 'vertical' }}
          placeholder="Describe the meal"
        />
      </Field>

      <div>
        <label style={label}>Nutrition</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => setNutritionMode('manual')}
            style={{
              padding: '11px 12px',
              borderRadius: 10,
              border: `1px solid ${nutritionMode === 'manual' ? t.forest : t.lineStrong}`,
              background: nutritionMode === 'manual' ? t.surfaceSunken : '#FFF',
              color: t.ink,
              fontWeight: 650,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: t.fontBody,
              textAlign: 'left',
            }}
          >
            Manual entry
          </button>
          <button
            type="button"
            onClick={() => setNutritionMode('ai')}
            style={{
              padding: '11px 12px',
              borderRadius: 10,
              border: `1px solid ${nutritionMode === 'ai' ? t.forest : t.lineStrong}`,
              background: nutritionMode === 'ai' ? t.surfaceSunken : '#FFF',
              color: t.ink,
              fontWeight: 650,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: t.fontBody,
              textAlign: 'left',
            }}
          >
            AI meal analyzer
          </button>
        </div>

        {nutritionMode === 'manual' ? (
          <div className="db-log-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field title="Carbs (g)">
              <input type="number" min="0" value={form.carbohydrates} onChange={(e) => setForm({ ...form, carbohydrates: e.target.value })} style={field} />
            </Field>
            <Field title="Calories">
              <input type="number" min="0" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} style={field} />
            </Field>
            <Field title="Protein (g)">
              <input type="number" min="0" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} style={field} />
            </Field>
            <Field title="Fat (g)">
              <input type="number" min="0" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} style={field} />
            </Field>
          </div>
        ) : (
          <div
            style={{
              padding: '18px 16px',
              borderRadius: 10,
              border: `1px dashed ${t.lineStrong}`,
              background: t.surfaceRaised,
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: 14, fontWeight: 650, color: t.ink }}>Photo analysis</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
              Upload a meal photo to estimate nutrition. Coming soon.
            </p>
            <button
              type="button"
              disabled
              style={{
                marginTop: 12,
                padding: '10px 14px',
                borderRadius: 8,
                border: `1px solid ${t.line}`,
                background: t.surfaceSunken,
                color: t.inkFaint,
                fontWeight: 650,
                fontSize: 13,
                cursor: 'not-allowed',
                fontFamily: t.fontBody,
              }}
            >
              Take photo — Coming soon
            </button>
          </div>
        )}
      </div>

      <Field title="Water intake (ml)">
        <input type="number" min="0" value={form.waterConsumed} onChange={(e) => setForm({ ...form, waterConsumed: e.target.value })} style={field} />
      </Field>

      <div>
        <label style={label}>Blood sugar after meal (optional)</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {impactOptions.map((opt) => {
            const active = form.bloodSugarImpact === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    bloodSugarImpact: active ? '' : opt.value,
                  })
                }
                style={{
                  padding: '11px 8px',
                  borderRadius: 10,
                  border: `1px solid ${active ? t.forest : t.lineStrong}`,
                  background: active ? t.surfaceSunken : '#FFF',
                  color: t.ink,
                  fontWeight: 650,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <Field title="Notes (optional)">
        <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={field} />
      </Field>

      <Submit submitting={submitting} isEdit={isEdit} label="🍽 Save meal" editLabel="🍽 Update meal" />
    </form>
  );
}

function InsulinFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const [form, setForm] = useState({
    units: '',
    insulinType: '',
    injectionSite: 'Abdomen',
    mealRelation: 'None',
    notes: '',
    timestamp: '',
  });

  useEffect(() => {
    setForm({
      units: initialRaw?.units ?? '',
      insulinType: initialRaw?.insulinType || '',
      injectionSite: initialRaw?.injectionSite || 'Abdomen',
      mealRelation: initialRaw?.mealRelation || 'None',
      notes: initialRaw?.notes || '',
      timestamp: toLocalInput(initialRaw?.timestamp),
    });
  }, [initialRaw]);

  return (
    <form
      style={row}
      onSubmit={(e) => {
        e.preventDefault();
        const body = {
          units: Number(form.units),
          insulinType: form.insulinType,
          injectionSite: form.injectionSite,
          mealRelation: form.mealRelation,
          notes: form.notes || undefined,
        };
        if (form.timestamp) body.timestamp = new Date(form.timestamp).toISOString();
        onSubmit(body);
      }}
    >
      <Field title="Units taken">
        <input required type="number" min="0.1" step="0.1" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} style={field} />
      </Field>
      <Field title="Insulin name / type">
        <input required type="text" value={form.insulinType} onChange={(e) => setForm({ ...form, insulinType: e.target.value })} style={field} />
      </Field>
      <div className="db-log-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field title="Injection site">
          <select value={form.injectionSite} onChange={(e) => setForm({ ...form, injectionSite: e.target.value })} style={field}>
            {['Abdomen', 'Arm', 'Thigh', 'Buttocks'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field title="Meal relation">
          <select value={form.mealRelation} onChange={(e) => setForm({ ...form, mealRelation: e.target.value })} style={field}>
            {['Before Meal', 'After Meal', 'None'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field title="Date & time (optional)">
        <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={field} />
      </Field>
      <Field title="Notes (optional)">
        <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={field} />
      </Field>
      <Submit submitting={submitting} isEdit={isEdit} />
    </form>
  );
}

function MedicationFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const [form, setForm] = useState({
    medicineName: '',
    dose: '',
    status: 'Taken',
    reminderTime: '',
    notes: '',
    timestamp: '',
  });

  useEffect(() => {
    setForm({
      medicineName: initialRaw?.medicineName || '',
      dose: initialRaw?.dose || '',
      status: initialRaw?.status || 'Taken',
      reminderTime: initialRaw?.reminderTime || '',
      notes: initialRaw?.notes || '',
      timestamp: toLocalInput(initialRaw?.timestamp),
    });
  }, [initialRaw]);

  return (
    <form
      style={row}
      onSubmit={(e) => {
        e.preventDefault();
        const body = {
          medicineName: form.medicineName,
          dose: form.dose,
          status: form.status,
          reminderTime: form.reminderTime || undefined,
          notes: form.notes || undefined,
        };
        if (form.timestamp) body.timestamp = new Date(form.timestamp).toISOString();
        onSubmit(body);
      }}
    >
      <Field title="Medicine name">
        <input required type="text" value={form.medicineName} onChange={(e) => setForm({ ...form, medicineName: e.target.value })} style={field} />
      </Field>
      <Field title="Dose">
        <input required type="text" value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} style={field} />
      </Field>
      <div className="db-log-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field title="Status">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={field}>
            {['Taken', 'Missed', 'Skipped'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field title="Usual time (optional)">
          <input type="text" placeholder="e.g. 08:00" value={form.reminderTime} onChange={(e) => setForm({ ...form, reminderTime: e.target.value })} style={field} />
        </Field>
      </div>
      <Field title="Date & time (optional)">
        <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={field} />
      </Field>
      <Field title="Notes (optional)">
        <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={field} />
      </Field>
      <Submit submitting={submitting} isEdit={isEdit} />
    </form>
  );
}

function WaterFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const [form, setForm] = useState({ amount: '250', timestamp: '' });

  useEffect(() => {
    setForm({
      amount: initialRaw?.amount ?? '250',
      timestamp: toLocalInput(initialRaw?.timestamp),
    });
  }, [initialRaw]);

  return (
    <form
      style={row}
      onSubmit={(e) => {
        e.preventDefault();
        const body = { amount: Number(form.amount) };
        if (form.timestamp) body.timestamp = new Date(form.timestamp).toISOString();
        onSubmit(body);
      }}
    >
      <Field title="Amount (ml)">
        <input required type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={field} />
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[200, 250, 500].map((ml) => (
          <button
            key={ml}
            type="button"
            onClick={() => setForm({ ...form, amount: String(ml) })}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${Number(form.amount) === ml ? t.forest : t.line}`,
              background: Number(form.amount) === ml ? t.surfaceSunken : '#FFF',
              color: t.ink,
              fontSize: 13,
              fontWeight: 650,
              cursor: 'pointer',
              fontFamily: t.fontBody,
            }}
          >
            {ml} ml
          </button>
        ))}
      </div>
      <Field title="Date & time (optional)">
        <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={field} />
      </Field>
      <Submit submitting={submitting} isEdit={isEdit} />
    </form>
  );
}

function ExerciseFields({ initialRaw, submitting, isEdit, onSubmit }) {
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
    setForm({
      exerciseType: initialRaw?.activity || initialRaw?.exerciseType || '',
      duration: initialRaw?.duration ?? '',
      distance: initialRaw?.distance ?? '',
      caloriesBurned: initialRaw?.caloriesBurned ?? '',
      intensity: initialRaw?.intensity || 'Medium',
      notes: initialRaw?.notes || '',
      timestamp: toLocalInput(initialRaw?.timestamp),
    });
  }, [initialRaw]);

  return (
    <form
      style={row}
      onSubmit={(e) => {
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
        onSubmit(body);
      }}
    >
      <Field title="Activity">
        <input required type="text" value={form.exerciseType} onChange={(e) => setForm({ ...form, exerciseType: e.target.value })} style={field} />
      </Field>
      <div className="db-log-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field title="Duration (minutes)">
          <input required type="number" min="1" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} style={field} />
        </Field>
        <Field title="Intensity">
          <select value={form.intensity} onChange={(e) => setForm({ ...form, intensity: e.target.value })} style={field}>
            {['Low', 'Medium', 'High'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="db-log-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field title="Distance (optional)">
          <input type="number" min="0" step="0.1" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} style={field} />
        </Field>
        <Field title="Calories (optional)">
          <input type="number" min="0" value={form.caloriesBurned} onChange={(e) => setForm({ ...form, caloriesBurned: e.target.value })} style={field} />
        </Field>
      </div>
      <Field title="Date & time (optional)">
        <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={field} />
      </Field>
      <Field title="Notes (optional)">
        <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={field} />
      </Field>
      <Submit submitting={submitting} isEdit={isEdit} />
    </form>
  );
}

function WeightFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const [form, setForm] = useState({ weight: '', bmi: '', bodyFat: '', notes: '', timestamp: '' });

  useEffect(() => {
    setForm({
      weight: initialRaw?.weight ?? '',
      bmi: initialRaw?.bmi ?? '',
      bodyFat: initialRaw?.bodyFat ?? '',
      notes: initialRaw?.notes || '',
      timestamp: toLocalInput(initialRaw?.timestamp),
    });
  }, [initialRaw]);

  return (
    <form
      style={row}
      onSubmit={(e) => {
        e.preventDefault();
        const body = {
          weight: Number(form.weight),
          bmi: form.bmi === '' ? undefined : Number(form.bmi),
          bodyFat: form.bodyFat === '' ? undefined : Number(form.bodyFat),
          notes: form.notes || undefined,
        };
        if (form.timestamp) body.timestamp = new Date(form.timestamp).toISOString();
        onSubmit(body);
      }}
    >
      <Field title="Weight (kg)">
        <input required type="number" min="1" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} style={field} />
      </Field>
      <div className="db-log-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field title="BMI (optional)">
          <input type="number" min="0" step="0.1" value={form.bmi} onChange={(e) => setForm({ ...form, bmi: e.target.value })} style={field} />
        </Field>
        <Field title="Body fat % (optional)">
          <input type="number" min="0" max="100" step="0.1" value={form.bodyFat} onChange={(e) => setForm({ ...form, bodyFat: e.target.value })} style={field} />
        </Field>
      </div>
      <Field title="Date & time (optional)">
        <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={field} />
      </Field>
      <Field title="Notes (optional)">
        <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={field} />
      </Field>
      <Submit submitting={submitting} isEdit={isEdit} />
    </form>
  );
}

function SleepFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const [form, setForm] = useState({ sleepTime: '', wakeTime: '', quality: 'Good', notes: '' });

  useEffect(() => {
    setForm({
      sleepTime: toLocalInput(initialRaw?.sleepTime),
      wakeTime: toLocalInput(initialRaw?.wakeTime),
      quality: initialRaw?.quality || 'Good',
      notes: initialRaw?.notes || '',
    });
  }, [initialRaw]);

  return (
    <form
      style={row}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          sleepTime: new Date(form.sleepTime).toISOString(),
          wakeTime: new Date(form.wakeTime).toISOString(),
          quality: form.quality,
          notes: form.notes || undefined,
        });
      }}
    >
      <Field title="Slept at">
        <input required type="datetime-local" value={form.sleepTime} onChange={(e) => setForm({ ...form, sleepTime: e.target.value })} style={field} />
      </Field>
      <Field title="Woke at">
        <input required type="datetime-local" value={form.wakeTime} onChange={(e) => setForm({ ...form, wakeTime: e.target.value })} style={field} />
      </Field>
      <Field title="Quality">
        <select value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value })} style={field}>
          {['Poor', 'Average', 'Good', 'Excellent'].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field title="Notes (optional)">
        <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={field} />
      </Field>
      <Submit submitting={submitting} isEdit={isEdit} />
    </form>
  );
}

function SymptomsFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const [form, setForm] = useState({ symptoms: '', severity: 5, notes: '', timestamp: '' });

  useEffect(() => {
    setForm({
      symptoms: Array.isArray(initialRaw?.symptoms) ? initialRaw.symptoms.join(', ') : '',
      severity: initialRaw?.severity ?? 5,
      notes: initialRaw?.notes || '',
      timestamp: toLocalInput(initialRaw?.timestamp),
    });
  }, [initialRaw]);

  return (
    <form
      style={row}
      onSubmit={(e) => {
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
        onSubmit(body);
      }}
    >
      <Field title="Symptoms">
        <input required type="text" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} style={field} placeholder="Comma-separated" />
      </Field>
      <Field title="Severity (1–10)">
        <input required type="number" min="1" max="10" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} style={field} />
      </Field>
      <Field title="Date & time (optional)">
        <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={field} />
      </Field>
      <Field title="Notes (optional)">
        <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={field} />
      </Field>
      <Submit submitting={submitting} isEdit={isEdit} />
    </form>
  );
}

function MoodFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const [form, setForm] = useState({ mood: 'Good', journalEntry: '', timestamp: '' });

  useEffect(() => {
    setForm({
      mood: initialRaw?.mood || 'Good',
      journalEntry: initialRaw?.journalEntry || '',
      timestamp: toLocalInput(initialRaw?.timestamp),
    });
  }, [initialRaw]);

  return (
    <form
      style={row}
      onSubmit={(e) => {
        e.preventDefault();
        const body = {
          mood: form.mood,
          journalEntry: form.journalEntry || undefined,
        };
        if (form.timestamp) body.timestamp = new Date(form.timestamp).toISOString();
        onSubmit(body);
      }}
    >
      <Field title="How do you feel?">
        <select value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })} style={field}>
          {['Great', 'Good', 'Okay', 'Low', 'Stressed'].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field title="Journal (optional)">
        <textarea
          rows={4}
          maxLength={1000}
          value={form.journalEntry}
          onChange={(e) => setForm({ ...form, journalEntry: e.target.value })}
          style={{ ...field, resize: 'vertical' }}
        />
      </Field>
      <Field title="Date & time (optional)">
        <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={field} />
      </Field>
      <Submit submitting={submitting} isEdit={isEdit} />
    </form>
  );
}
