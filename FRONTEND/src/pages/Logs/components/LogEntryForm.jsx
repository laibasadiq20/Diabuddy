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

function Submit({ submitting, isEdit }) {
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
      {isEdit ? 'Update entry' : 'Save entry'}
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
    source: 'Fingerstick',
    notes: '',
    timestamp: '',
  });

  useEffect(() => {
    setForm({
      glucoseLevel: initialRaw?.glucoseLevel ?? '',
      unit: initialRaw?.unit || 'mg/dL',
      readingType: initialRaw?.readingType || 'Before Breakfast',
      source: initialRaw?.source || 'Fingerstick',
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
          source: form.source,
          notes: form.notes || undefined,
        };
        if (form.timestamp) body.timestamp = new Date(form.timestamp).toISOString();
        onSubmit(body);
      }}
    >
      <Field title="Glucose reading" help="Use the number shown on your glucometer.">
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field title="Unit" help="Most clinics in Pakistan use mg/dL.">
          <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} style={field}>
            <option value="mg/dL">mg/dL</option>
            <option value="mmol/L">mmol/L</option>
          </select>
        </Field>
        <Field title="Source">
          <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} style={field}>
            <option>Fingerstick</option>
            <option>CGM</option>
            <option>Manual Entry</option>
          </select>
        </Field>
      </div>
      <Field title="Timing" help="Relate the reading to meals—useful after roti/rice or mithai.">
        <select value={form.readingType} onChange={(e) => setForm({ ...form, readingType: e.target.value })} style={field}>
          {[
            'Before Breakfast',
            'After Breakfast',
            'Before Lunch',
            'After Lunch',
            'Before Dinner',
            'After Dinner',
            'Bedtime',
            'Random',
          ].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field title="Date & time (optional)">
        <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={field} />
      </Field>
      <Field title="Notes (optional)" help="e.g. late dinner, illness, exercise, Ramadan fast.">
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
    notes: '',
    timestamp: '',
  });

  useEffect(() => {
    setForm({
      mealType: initialRaw?.mealType || 'Breakfast',
      foodItems: initialRaw?.foodItems || '',
      carbohydrates: initialRaw?.carbohydrates ?? '',
      protein: initialRaw?.protein ?? '',
      fat: initialRaw?.fat ?? '',
      calories: initialRaw?.calories ?? '',
      waterConsumed: initialRaw?.waterConsumed ?? '',
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
        onSubmit(body);
      }}
    >
      <Field title="Meal">
        <select value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })} style={field}>
          {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field title="What did you eat?" help="Example: 2 roti, chicken salan, raita — or chai with sugar.">
        <textarea
          required
          rows={3}
          value={form.foodItems}
          onChange={(e) => setForm({ ...form, foodItems: e.target.value })}
          style={{ ...field, resize: 'vertical' }}
          placeholder="Describe the plate in your own words"
        />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field title="Carbs (g)" help="Estimate is fine.">
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
      <Field title="Water with meal (ml)">
        <input type="number" min="0" value={form.waterConsumed} onChange={(e) => setForm({ ...form, waterConsumed: e.target.value })} style={field} />
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
      <Field title="Units taken" help="Enter exactly what you injected—do not change your prescription here.">
        <input required type="number" min="0.1" step="0.1" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} style={field} />
      </Field>
      <Field title="Insulin name / type" help="As written on the pen or vial (e.g. NovoRapid, Lantus).">
        <input required type="text" value={form.insulinType} onChange={(e) => setForm({ ...form, insulinType: e.target.value })} style={field} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
      <Field title="Medicine name" help="As printed on the strip (e.g. Metformin, Glimepiride).">
        <input required type="text" value={form.medicineName} onChange={(e) => setForm({ ...form, medicineName: e.target.value })} style={field} />
      </Field>
      <Field title="Dose" help="e.g. 500 mg, 1 tablet.">
        <input required type="text" value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} style={field} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field title="Status">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={field}>
            {['Taken', 'Missed', 'Skipped'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field title="Usual time (optional)">
          <input type="text" placeholder="After dinner" value={form.reminderTime} onChange={(e) => setForm({ ...form, reminderTime: e.target.value })} style={field} />
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
      <Field title="Amount (ml)" help="A common glass is about 200–250 ml. In hot weather, sip regularly unless your doctor limits fluids.">
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
      <Field title="Activity" help="e.g. evening walk, stairs at home, light cycling.">
        <input required type="text" value={form.exerciseType} onChange={(e) => setForm({ ...form, exerciseType: e.target.value })} style={field} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
      <Field title="Weight (kg)" help="Weigh at a similar time of day when you can.">
        <input required type="number" min="1" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} style={field} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
      <Field title="Notes (optional)" help="Late dinner, night prayer, noise, shift work…">
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
      <Field title="Symptoms" help="Separate with commas. e.g. thirst, blurred vision, trembling.">
        <input required type="text" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} style={field} />
      </Field>
      <Field title="Severity (1–10)" help="1 = mild, 10 = severe. Seek urgent care for sudden or severe symptoms.">
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
      <Field title="How do you feel?" help="Stress and low mood can raise sugar even when meals look controlled.">
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
          placeholder="A few words for your own awareness—not a diagnosis."
        />
      </Field>
      <Field title="Date & time (optional)">
        <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={field} />
      </Field>
      <Submit submitting={submitting} isEdit={isEdit} />
    </form>
  );
}
