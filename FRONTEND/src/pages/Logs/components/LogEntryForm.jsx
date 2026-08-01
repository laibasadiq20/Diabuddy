import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../../theme';
import { useAuth } from '../../../context/AuthContext';
import { Annoyed, Frown, Laugh, Loader2, Meh, Smile } from 'lucide-react';

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
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return toLocalInput(new Date());
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
  if (typeId === 'sleep') {
    return <SleepFields initialRaw={initialRaw} submitting={submitting} isEdit={isEdit} onSubmit={onSubmit} />;
  }
  if (typeId === 'mood') {
    return <MoodFields initialRaw={initialRaw} submitting={submitting} isEdit={isEdit} onSubmit={onSubmit} />;
  }
  return null;
}

function GlucoseFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const { user } = useAuth();
  const preferredUnit = user?.glucoseUnit === 'mmol/L' ? 'mmol/L' : 'mg/dL';
  const [form, setForm] = useState({
    glucoseLevel: '',
    unit: preferredUnit,
    readingType: 'Before Breakfast',
    notes: '',
    timestamp: toLocalInput(),
  });

  useEffect(() => {
    setForm({
      glucoseLevel: initialRaw?.glucoseLevel ?? '',
      // New entries default to the user's saved glucose unit preference (Account page)
      unit: initialRaw?.unit || preferredUnit,
      readingType: initialRaw?.readingType || 'Before Breakfast',
      notes: initialRaw?.notes || '',
      timestamp: toLocalInput(initialRaw?.timestamp),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRaw, preferredUnit]);

  const glucoseHelp =
    form.unit === 'mmol/L'
      ? 'Low: below 3.9 mmol/L · High: above 7.2 mmol/L before meals, or above 10.0 mmol/L after meals'
      : 'Low: below 70 mg/dL · High: above 130 mg/dL before meals, or above 180 mg/dL after meals';

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
        body.timestamp = new Date(form.timestamp).toISOString();
        onSubmit(body);
      }}
    >
      <Field title="Glucose reading" help={glucoseHelp}>
        <input
          required
          type="number"
          step="0.1"
          min={form.unit === 'mmol/L' ? 1 : 20}
          max={form.unit === 'mmol/L' ? 33 : 600}
          value={form.glucoseLevel}
          onChange={(e) => setForm({ ...form, glucoseLevel: e.target.value })}
          style={field}
          placeholder={form.unit === 'mmol/L' ? 'e.g. 7.1' : 'e.g. 128'}
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
      <Field title="Date & time">
        <input required type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={field} />
      </Field>
      <Field title="Notes (optional)">
        <input
          type="text"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={field}
          placeholder="Optional context for this reading"
        />
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
    timestamp: toLocalInput(),
  });
  const [nutritionMode, setNutritionMode] = useState('manual');

  useEffect(() => {
    setForm({
      mealType: initialRaw?.mealType || 'Breakfast',
      foodItems: initialRaw?.foodItems || '',
      carbohydrates: initialRaw?.carbohydrates != null ? String(initialRaw.carbohydrates) : '',
      protein: initialRaw?.protein != null ? String(initialRaw.protein) : '',
      fat: initialRaw?.fat != null ? String(initialRaw.fat) : '',
      calories: initialRaw?.calories != null ? String(initialRaw.calories) : '',
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
        if (nutritionMode !== 'manual') return;
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
        body.timestamp = new Date(form.timestamp).toISOString();
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
        <input required type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} style={field} />
      </Field>

      <Field title="Food description">
        <textarea
          required
          rows={3}
          value={form.foodItems}
          onChange={(e) => setForm({ ...form, foodItems: e.target.value })}
          style={{ ...field, resize: 'vertical' }}
          placeholder="e.g. chicken biryani with raita"
        />
      </Field>

      <div>
        <label style={label}>Nutrition</label>
        <div
          role="tablist"
          aria-label="Nutrition entry method"
          className="db-log-source-grid"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={nutritionMode === 'manual'}
            onClick={() => setNutritionMode('manual')}
            style={{
              padding: '11px 12px',
              borderRadius: 10,
              border: `1.5px solid ${nutritionMode === 'manual' ? t.forest : t.lineStrong}`,
              background: nutritionMode === 'manual' ? t.surfaceSunken : '#FFF',
              color: t.ink,
              fontWeight: 650,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: t.fontBody,
              textAlign: 'left',
            }}
          >
            Manual
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={nutritionMode === 'ai'}
            onClick={() => setNutritionMode('ai')}
            style={{
              padding: '11px 12px',
              borderRadius: 10,
              border: `1.5px solid ${nutritionMode === 'ai' ? t.forest : t.lineStrong}`,
              background: nutritionMode === 'ai' ? t.surfaceSunken : '#FFF',
              color: t.ink,
              fontWeight: 650,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: t.fontBody,
              textAlign: 'left',
            }}
          >
            AI analyzer
          </button>
        </div>

        {nutritionMode === 'manual' && (
          <>
            <p style={{ ...hint, marginTop: 0, marginBottom: 10 }}>
              Carbs matter most for glucose. Protein and fat help complete the picture.
            </p>
            <div
              className="db-log-macro-grid"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
            >
              <Field title="Carbs (g)">
                <input
                  required
                  type="number"
                  min="0"
                  step="0.1"
                  inputMode="decimal"
                  value={form.carbohydrates}
                  onChange={(e) => setForm({ ...form, carbohydrates: e.target.value })}
                  style={field}
                  placeholder="45"
                />
              </Field>
              <Field title="Protein (g)">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  inputMode="decimal"
                  value={form.protein}
                  onChange={(e) => setForm({ ...form, protein: e.target.value })}
                  style={field}
                  placeholder="20"
                />
              </Field>
              <Field title="Fat (g)">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  inputMode="decimal"
                  value={form.fat}
                  onChange={(e) => setForm({ ...form, fat: e.target.value })}
                  style={field}
                  placeholder="12"
                />
              </Field>
              <Field title="Calories (kcal)">
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={form.calories}
                  onChange={(e) => setForm({ ...form, calories: e.target.value })}
                  style={field}
                  placeholder="350"
                />
              </Field>
            </div>
          </>
        )}

        {nutritionMode === 'ai' && (
          <div
            key="nutrition-ai"
            style={{
              padding: '18px 16px',
              borderRadius: 10,
              border: `1px dashed ${t.lineStrong}`,
              background: t.surfaceRaised,
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: 14, fontWeight: 650, color: t.ink }}>AI meal analyzer</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
              Photo estimates are not available yet. Switch to Manual to enter carbs, protein, fat, and calories.
            </p>
          </div>
        )}
      </div>

      <Field title="Water intake (ml)">
        <input type="number" min="0" value={form.waterConsumed} onChange={(e) => setForm({ ...form, waterConsumed: e.target.value })} style={field} />
      </Field>

      <div>
        <label style={label}>Blood sugar after meal (optional)</label>
        <div className="db-log-segment-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
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
        <input
          type="text"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={field}
          placeholder="Optional note about this meal"
        />
      </Field>

      {nutritionMode === 'manual' ? (
        <Submit submitting={submitting} isEdit={isEdit} label="Save entry" editLabel="Update entry" />
      ) : (
        <p style={{ ...hint, marginTop: 4 }}>Saving is available in Manual mode.</p>
      )}
    </form>
  );
}

const INSULIN_TYPES = ['Rapid-Acting', 'Short-Acting', 'Intermediate-Acting', 'Long-Acting'];
const INSULIN_REASONS = [
  'Before Breakfast',
  'After Breakfast',
  'Before Lunch',
  'After Lunch',
  'Before Dinner',
  'After Dinner',
  'Bedtime',
  'Correction',
  'Other',
];
const INSULIN_SITES = ['Abdomen', 'Left Arm', 'Right Arm', 'Left Thigh', 'Right Thigh', 'Buttocks', 'Other'];

function InsulinFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const [form, setForm] = useState({
    units: '',
    insulinType: 'Rapid-Acting',
    injectionSite: '',
    reason: 'Before Breakfast',
    notes: '',
    timestamp: toLocalInput(),
  });

  useEffect(() => {
    const legacyReason = initialRaw?.mealRelation;
    const reason =
      legacyReason && INSULIN_REASONS.includes(legacyReason)
        ? legacyReason
        : legacyReason === 'Before Meal'
          ? 'Before Breakfast'
          : legacyReason === 'After Meal'
            ? 'After Breakfast'
            : 'Before Breakfast';
    const type = INSULIN_TYPES.includes(initialRaw?.insulinType)
      ? initialRaw.insulinType
      : initialRaw?.insulinType || 'Rapid-Acting';
    setForm({
      units: initialRaw?.units ?? '',
      insulinType: type,
      injectionSite: initialRaw?.injectionSite || '',
      reason,
      notes: initialRaw?.notes || '',
      timestamp: toLocalInput(initialRaw?.timestamp),
    });
  }, [initialRaw]);

  return (
    <form
      style={row}
      onSubmit={(e) => {
        e.preventDefault();
        const when = new Date(form.timestamp);
        if (Number.isNaN(when.getTime())) return;
        const unitsNum = Number(form.units);
        if (!Number.isFinite(unitsNum) || unitsNum < 0.1) return;
        onSubmit({
          units: unitsNum,
          insulinType: form.insulinType,
          injectionSite: form.injectionSite || '',
          reason: form.reason,
          mealRelation: form.reason,
          notes: form.notes || '',
          timestamp: when.toISOString(),
        });
      }}
    >
      <Field title="Insulin type">
        <select
          required
          value={form.insulinType}
          onChange={(e) => setForm({ ...form, insulinType: e.target.value })}
          style={field}
        >
          {INSULIN_TYPES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
          {form.insulinType && !INSULIN_TYPES.includes(form.insulinType) && (
            <option value={form.insulinType}>{form.insulinType}</option>
          )}
        </select>
      </Field>

      <Field title="Dose (units)">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            required
            type="number"
            min="0.1"
            step="0.1"
            inputMode="decimal"
            value={form.units}
            onChange={(e) => setForm({ ...form, units: e.target.value })}
            style={{ ...field, flex: 1 }}
            placeholder="8"
          />
          <span style={{ fontSize: 14, fontWeight: 650, color: t.inkSoft, flexShrink: 0 }}>Units</span>
        </div>
      </Field>

      <Field title="Reason">
        <select
          required
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          style={field}
        >
          {INSULIN_REASONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </Field>

      <Field title="Injection time">
        <input
          required
          type="datetime-local"
          value={form.timestamp}
          onChange={(e) => setForm({ ...form, timestamp: e.target.value })}
          style={field}
        />
      </Field>

      <Field title="Injection site (optional)">
        <select
          value={form.injectionSite}
          onChange={(e) => setForm({ ...form, injectionSite: e.target.value })}
          style={field}
        >
          <option value="">Select site</option>
          {INSULIN_SITES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </Field>

      <Field title="Notes (optional)">
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ ...field, resize: 'vertical' }}
          placeholder="Optional note about this dose"
        />
      </Field>

      <Submit submitting={submitting} isEdit={isEdit} label="Save entry" editLabel="Update entry" />
    </form>
  );
}

const MEDICATION_NAMES = [
  'Metformin',
  'Glimepiride',
  'Gliclazide',
  'Sitagliptin',
  'Vildagliptin',
  'Empagliflozin',
  'Dapagliflozin',
  'Pioglitazone',
  'Acarbose',
  'Linagliptin',
  'Canagliflozin',
  'Repaglinide',
];
const DOSE_UNITS = ['mg', 'ml', 'Tablet(s)', 'Capsule(s)'];
const MED_ROUTES = ['Oral', 'Injection', 'Inhaler', 'Other'];

function parseDose(doseStr) {
  if (!doseStr) return { amount: '', unit: 'mg' };
  const matched = String(doseStr).trim().match(/^([\d.]+)\s*(.*)$/);
  if (!matched) return { amount: '', unit: 'mg' };
  const unit = matched[2]?.trim();
  return {
    amount: matched[1] || '',
    unit: DOSE_UNITS.includes(unit) ? unit : unit || 'mg',
  };
}

function MedicationFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const [form, setForm] = useState({
    medicineName: '',
    doseAmount: '',
    doseUnit: 'mg',
    status: 'Taken',
    route: '',
    notes: '',
    timestamp: toLocalInput(),
  });

  useEffect(() => {
    const next = parseDose(initialRaw?.dose);
    setForm({
      medicineName: initialRaw?.medicineName || '',
      doseAmount: next.amount,
      doseUnit: next.unit,
      status: initialRaw?.status || 'Taken',
      route: initialRaw?.route || '',
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
          medicineName: form.medicineName.trim(),
          dose: `${form.doseAmount} ${form.doseUnit}`.trim(),
          status: form.status,
          route: form.route || '',
          notes: form.notes || undefined,
        };
        body.timestamp = new Date(form.timestamp).toISOString();
        onSubmit(body);
      }}
    >
      <Field title="Medication name">
        <input
          required
          list="db-med-names"
          type="text"
          value={form.medicineName}
          onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
          style={field}
          placeholder="Search or type medicine name"
        />
        <datalist id="db-med-names">
          {MEDICATION_NAMES.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </Field>

      <Field title="Dosage">
        <div className="db-log-dose-row" style={{ display: 'flex', gap: 8, alignItems: 'stretch', minWidth: 0 }}>
          <input
            required
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={form.doseAmount}
            onChange={(e) => setForm({ ...form, doseAmount: e.target.value })}
            style={{ ...field, flex: 1, minWidth: 0 }}
            placeholder="500"
          />
          <select
            required
            value={form.doseUnit}
            onChange={(e) => setForm({ ...form, doseUnit: e.target.value })}
            style={{ ...field, width: 110, maxWidth: '42%', flexShrink: 0 }}
          >
            {DOSE_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
            {form.doseUnit && !DOSE_UNITS.includes(form.doseUnit) && (
              <option value={form.doseUnit}>{form.doseUnit}</option>
            )}
          </select>
        </div>
      </Field>

      <div>
        <label style={label}>Status</label>
        <div className="db-log-segment-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {['Taken', 'Missed', 'Skipped'].map((status) => {
            const active = form.status === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setForm({ ...form, status })}
                style={{
                  padding: '11px 8px',
                  borderRadius: 10,
                  border: `1.5px solid ${active ? t.forest : t.lineStrong}`,
                  background: active ? t.surfaceSunken : '#FFF',
                  color: t.ink,
                  fontWeight: 650,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                }}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      <Field title="Date & time">
        <input
          required
          type="datetime-local"
          value={form.timestamp}
          onChange={(e) => setForm({ ...form, timestamp: e.target.value })}
          style={field}
        />
      </Field>

      <Field title="Route (optional)">
        <select value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} style={field}>
          <option value="">Select route</option>
          {MED_ROUTES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>

      <Field title="Notes (optional)">
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ ...field, resize: 'vertical' }}
          placeholder="Optional note about this medication"
        />
      </Field>

      <Submit submitting={submitting} isEdit={isEdit} label="Save entry" editLabel="Update entry" />
    </form>
  );
}

const WATER_QUICK = [250, 500, 750, 1000];

function WaterFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const [form, setForm] = useState({
    amount: '250',
    notes: '',
    timestamp: toLocalInput(),
  });

  useEffect(() => {
    setForm({
      amount: initialRaw?.amount != null ? String(initialRaw.amount) : '250',
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
          amount: Number(form.amount),
          notes: form.notes || undefined,
        };
        body.timestamp = new Date(form.timestamp).toISOString();
        onSubmit(body);
      }}
    >
      <Field title="Water intake">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            required
            type="number"
            min="1"
            inputMode="numeric"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            style={{ ...field, flex: 1 }}
            placeholder="250"
          />
          <span style={{ fontSize: 14, fontWeight: 650, color: t.inkSoft, flexShrink: 0 }}>ml</span>
        </div>
      </Field>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {WATER_QUICK.map((ml) => {
          const active = Number(form.amount) === ml;
          return (
            <button
              key={ml}
              type="button"
              onClick={() => setForm({ ...form, amount: String(ml) })}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: `1.5px solid ${active ? t.forest : t.lineStrong}`,
                background: active ? t.surfaceSunken : '#FFF',
                color: t.ink,
                fontSize: 13,
                fontWeight: 650,
                cursor: 'pointer',
                fontFamily: t.fontBody,
              }}
            >
              +{ml} ml
            </button>
          );
        })}
      </div>

      <Field title="Date & time">
        <input
          required
          type="datetime-local"
          value={form.timestamp}
          onChange={(e) => setForm({ ...form, timestamp: e.target.value })}
          style={field}
        />
      </Field>

      <Field title="Notes (optional)">
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ ...field, resize: 'vertical' }}
          placeholder="Optional note"
        />
      </Field>

      <Submit submitting={submitting} isEdit={isEdit} label="Save entry" editLabel="Update entry" />
    </form>
  );
}

const ACTIVITY_TYPES = ['Walking', 'Running', 'Cycling', 'Gym', 'Yoga', 'Swimming', 'Other'];
const INTENSITY_UI = ['Light', 'Moderate', 'Vigorous'];
const intensityToApi = { Light: 'Low', Moderate: 'Medium', Vigorous: 'High' };
const intensityFromApi = { Low: 'Light', Medium: 'Moderate', High: 'Vigorous' };

function ExerciseFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const navigate = useNavigate();
  const [source, setSource] = useState('manual');
  const [form, setForm] = useState({
    exerciseType: 'Walking',
    customType: '',
    duration: '30',
    distance: '',
    steps: '',
    caloriesBurned: '',
    intensity: 'Moderate',
    notes: '',
    timestamp: toLocalInput(),
  });

  useEffect(() => {
    const activity = initialRaw?.activity || initialRaw?.exerciseType || 'Walking';
    const known = ACTIVITY_TYPES.includes(activity) && activity !== 'Other';
    setSource('manual');
    setForm({
      exerciseType: known ? activity : 'Other',
      customType: known ? '' : activity === 'Walking' ? '' : activity,
      duration: initialRaw?.duration != null ? String(initialRaw.duration) : '30',
      distance: initialRaw?.distance ? String(initialRaw.distance) : '',
      steps: initialRaw?.steps ? String(initialRaw.steps) : '',
      caloriesBurned: initialRaw?.caloriesBurned ? String(initialRaw.caloriesBurned) : '',
      intensity: intensityFromApi[initialRaw?.intensity] || 'Moderate',
      notes: initialRaw?.notes || '',
      timestamp: toLocalInput(initialRaw?.timestamp),
    });
  }, [initialRaw]);

  const selectSource = (next) => {
    if (next === 'google-health') {
      navigate('/google-health');
      return;
    }
    setSource('manual');
  };

  return (
    <form
      style={row}
      onSubmit={(e) => {
        e.preventDefault();
        const activityName =
          form.exerciseType === 'Other' ? form.customType.trim() : form.exerciseType;
        if (!activityName) return;
        const body = {
          exerciseType: activityName,
          duration: Number(form.duration),
          distance: form.distance === '' ? 0 : Number(form.distance),
          steps: form.steps === '' ? 0 : Number(form.steps),
          caloriesBurned: form.caloriesBurned === '' ? 0 : Number(form.caloriesBurned),
          intensity: intensityToApi[form.intensity] || 'Medium',
          source: 'Manual',
          notes: form.notes || undefined,
        };
        body.timestamp = new Date(form.timestamp).toISOString();
        onSubmit(body);
      }}
    >
      <div>
        <label style={label}>Activity source</label>
        <div className="db-log-source-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { id: 'manual', title: 'Manual entry' },
            { id: 'google-health', title: 'Google Health sync' },
          ].map((opt) => {
            const active = source === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => selectSource(opt.id)}
                style={{
                  padding: '11px 12px',
                  borderRadius: 10,
                  border: `1.5px solid ${active ? t.forest : t.lineStrong}`,
                  background: active ? t.surfaceSunken : '#FFF',
                  color: t.ink,
                  fontWeight: 650,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                  textAlign: 'left',
                }}
              >
                {opt.title}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label style={label}>Activity type</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ACTIVITY_TYPES.map((type) => {
            const active = form.exerciseType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setForm({ ...form, exerciseType: type })}
                style={{
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: `1.5px solid ${active ? t.forest : t.lineStrong}`,
                  background: active ? t.surfaceSunken : '#FFF',
                  color: t.ink,
                  fontWeight: 650,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                }}
              >
                {type}
              </button>
            );
          })}
        </div>
        {form.exerciseType === 'Other' && (
          <input
            required
            type="text"
            value={form.customType}
            onChange={(e) => setForm({ ...form, customType: e.target.value })}
            style={{ ...field, marginTop: 10 }}
            placeholder="Describe the activity"
          />
        )}
      </div>

      <Field title="Duration">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            required
            type="number"
            min="1"
            inputMode="numeric"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            style={{ ...field, flex: 1 }}
            placeholder="30"
          />
          <span style={{ fontSize: 14, fontWeight: 650, color: t.inkSoft, flexShrink: 0 }}>minutes</span>
        </div>
      </Field>

      <div>
        <label style={label}>Intensity</label>
        <div className="db-log-intensity-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {INTENSITY_UI.map((level) => {
            const active = form.intensity === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setForm({ ...form, intensity: level })}
                style={{
                  padding: '11px 8px',
                  borderRadius: 10,
                  border: `1.5px solid ${active ? t.forest : t.lineStrong}`,
                  background: active ? t.surfaceSunken : '#FFF',
                  color: t.ink,
                  fontWeight: 650,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                }}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      <Field title="Calories burned (optional)">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={form.caloriesBurned}
            onChange={(e) => setForm({ ...form, caloriesBurned: e.target.value })}
            style={{ ...field, flex: 1 }}
            placeholder="250"
          />
          <span style={{ fontSize: 14, fontWeight: 650, color: t.inkSoft, flexShrink: 0 }}>kcal</span>
        </div>
      </Field>

      <Field title="Distance (optional)">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            value={form.distance}
            onChange={(e) => setForm({ ...form, distance: e.target.value })}
            style={{ ...field, flex: 1 }}
            placeholder="2.5"
          />
          <span style={{ fontSize: 14, fontWeight: 650, color: t.inkSoft, flexShrink: 0 }}>km</span>
        </div>
      </Field>

      <Field title="Steps (optional)" help="Add steps from a walk or pedometer — shown on your dashboard.">
        <input
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={form.steps}
          onChange={(e) => setForm({ ...form, steps: e.target.value })}
          style={field}
          placeholder="e.g. 4500"
        />
      </Field>

      <Field title="Date & time">
        <input
          required
          type="datetime-local"
          value={form.timestamp}
          onChange={(e) => setForm({ ...form, timestamp: e.target.value })}
          style={field}
        />
      </Field>

      <Field title="Notes (optional)">
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ ...field, resize: 'vertical' }}
          placeholder="Optional note about this activity"
        />
      </Field>

      <Submit submitting={submitting} isEdit={isEdit} label="Save entry" editLabel="Update entry" />
    </form>
  );
}

const SLEEP_QUALITY = ['Excellent', 'Good', 'Fair', 'Poor'];

/** Last night at 10:00 PM → this morning at 6:00 AM (8 hours). */
function defaultSleepPair() {
  const wake = new Date();
  wake.setHours(6, 0, 0, 0);
  const sleep = new Date(wake);
  sleep.setDate(sleep.getDate() - 1);
  sleep.setHours(22, 0, 0, 0);
  return {
    sleepTime: toLocalInput(sleep),
    wakeTime: toLocalInput(wake),
  };
}

/** If wake is not after sleep (overnight), move wake to the following day. */
function ensureOvernightWake(sleepLocal, wakeLocal) {
  const sleep = new Date(sleepLocal);
  let wake = new Date(wakeLocal);
  if (Number.isNaN(sleep.getTime()) || Number.isNaN(wake.getTime())) {
    return { sleepTime: sleepLocal, wakeTime: wakeLocal };
  }
  if (wake <= sleep) {
    wake = new Date(wake);
    wake.setDate(wake.getDate() + 1);
  }
  return {
    sleepTime: toLocalInput(sleep),
    wakeTime: toLocalInput(wake),
  };
}

function normalizeSleepQuality(quality) {
  if (quality === 'Average') return 'Fair';
  return SLEEP_QUALITY.includes(quality) ? quality : 'Good';
}

function sleepDurationParts(sleepTime, wakeTime) {
  const start = new Date(sleepTime);
  const end = new Date(wakeTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return null;
  }
  const totalMinutes = Math.round((end - start) / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  return { hours, minutes, totalHours };
}

function formatSleepDuration(duration) {
  if (!duration) return '';
  const hourLabel = duration.hours === 1 ? 'hour' : 'hours';
  const minuteLabel = duration.minutes === 1 ? 'minute' : 'minutes';
  if (duration.minutes === 0) return `${duration.hours} ${hourLabel}`;
  if (duration.hours === 0) return `${duration.minutes} ${minuteLabel}`;
  return `${duration.hours} ${hourLabel} ${duration.minutes} ${minuteLabel}`;
}

function SleepFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const defaults = defaultSleepPair();
  const [form, setForm] = useState({
    sleepTime: defaults.sleepTime,
    wakeTime: defaults.wakeTime,
    quality: 'Good',
    notes: '',
  });

  useEffect(() => {
    if (initialRaw?.sleepTime && initialRaw?.wakeTime) {
      const pair = ensureOvernightWake(
        toLocalInput(initialRaw.sleepTime),
        toLocalInput(initialRaw.wakeTime)
      );
      setForm({
        sleepTime: pair.sleepTime,
        wakeTime: pair.wakeTime,
        quality: normalizeSleepQuality(initialRaw?.quality),
        notes: initialRaw?.notes || '',
      });
      return;
    }
    const pair = defaultSleepPair();
    setForm({
      sleepTime: pair.sleepTime,
      wakeTime: pair.wakeTime,
      quality: 'Good',
      notes: '',
    });
  }, [initialRaw]);

  const setSleepTime = (value) => {
    const pair = ensureOvernightWake(value, form.wakeTime);
    setForm({ ...form, sleepTime: pair.sleepTime, wakeTime: pair.wakeTime });
  };

  const setWakeTime = (value) => {
    const pair = ensureOvernightWake(form.sleepTime, value);
    setForm({ ...form, sleepTime: pair.sleepTime, wakeTime: pair.wakeTime });
  };

  const duration = sleepDurationParts(form.sleepTime, form.wakeTime);

  return (
    <form
      style={row}
      onSubmit={(e) => {
        e.preventDefault();
        if (!duration) return;
        onSubmit({
          sleepTime: new Date(form.sleepTime).toISOString(),
          wakeTime: new Date(form.wakeTime).toISOString(),
          quality: form.quality,
          notes: form.notes || undefined,
          timestamp: new Date(form.wakeTime).toISOString(),
        });
      }}
    >
      <Field title="Bedtime" help="Defaults to last night at 10:00 PM.">
        <input
          required
          type="datetime-local"
          value={form.sleepTime}
          onChange={(e) => setSleepTime(e.target.value)}
          style={field}
        />
      </Field>

      <Field title="Wake time" help="Defaults to this morning at 6:00 AM.">
        <input
          required
          type="datetime-local"
          value={form.wakeTime}
          onChange={(e) => setWakeTime(e.target.value)}
          style={field}
        />
      </Field>

      <div>
        <label style={label}>Sleep duration</label>
        <div
          style={{
            ...field,
            background: t.surfaceSunken,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            cursor: 'default',
          }}
        >
          <span style={{ fontWeight: 650, color: duration ? t.ink : t.inkFaint }}>
            {duration ? formatSleepDuration(duration) : 'Set bedtime and wake time'}
          </span>
          {duration ? (
            <span style={{ fontSize: 13, fontWeight: 650, color: t.inkSoft, flexShrink: 0 }}>
              {duration.totalHours} h
            </span>
          ) : null}
        </div>
        <p style={hint}>Calculated automatically from bedtime and wake time.</p>
      </div>

      <div>
        <label style={label}>Sleep quality</label>
        <div className="db-log-quality-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {SLEEP_QUALITY.map((level) => {
            const active = form.quality === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setForm({ ...form, quality: level })}
                style={{
                  padding: '11px 12px',
                  borderRadius: 10,
                  border: `1.5px solid ${active ? t.forest : t.lineStrong}`,
                  background: active ? t.surfaceSunken : '#FFF',
                  color: t.ink,
                  fontWeight: 650,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                }}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      <Field title="Notes (optional)">
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ ...field, resize: 'vertical' }}
          placeholder="Optional note about sleep quality"
        />
      </Field>

      <Submit
        submitting={submitting}
        isEdit={isEdit}
        label="Save sleep log"
        editLabel="Update sleep log"
      />
    </form>
  );
}

const MOOD_OPTIONS = [
  { id: 'Very Happy', label: 'Very Happy', Icon: Laugh },
  { id: 'Happy', label: 'Happy', Icon: Smile },
  { id: 'Neutral', label: 'Neutral', Icon: Meh },
  { id: 'Sad', label: 'Sad', Icon: Frown },
  { id: 'Anxious', label: 'Anxious', Icon: Annoyed },
];

const LEGACY_MOOD_MAP = {
  Great: 'Very Happy',
  Good: 'Happy',
  Okay: 'Neutral',
  Low: 'Sad',
  Stressed: 'Anxious',
};

const STRESS_LEVELS = ['Low', 'Moderate', 'High'];

function normalizeMood(mood) {
  if (!mood) return 'Happy';
  if (LEGACY_MOOD_MAP[mood]) return LEGACY_MOOD_MAP[mood];
  return MOOD_OPTIONS.some((o) => o.id === mood) ? mood : 'Happy';
}

function MoodFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const [form, setForm] = useState({
    mood: 'Happy',
    stressLevel: 'Low',
    journalEntry: '',
    timestamp: toLocalInput(),
  });

  useEffect(() => {
    setForm({
      mood: normalizeMood(initialRaw?.mood),
      stressLevel: STRESS_LEVELS.includes(initialRaw?.stressLevel) ? initialRaw.stressLevel : 'Low',
      journalEntry: initialRaw?.journalEntry || '',
      timestamp: toLocalInput(initialRaw?.timestamp),
    });
  }, [initialRaw]);

  return (
    <form
      style={row}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          mood: form.mood,
          stressLevel: form.stressLevel,
          journalEntry: form.journalEntry || undefined,
          timestamp: new Date(form.timestamp).toISOString(),
        });
      }}
    >
      <div>
        <label style={label}>Mood</label>
        <div
          className="db-log-mood-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))', gap: 8 }}
        >
          {MOOD_OPTIONS.map((opt) => {
            const active = form.mood === opt.id;
            const Icon = opt.Icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setForm({ ...form, mood: opt.id })}
                style={{
                  padding: '12px 10px',
                  borderRadius: 12,
                  border: `1.5px solid ${active ? t.forest : t.lineStrong}`,
                  background: active ? t.surfaceSunken : '#FFF',
                  color: active ? t.forest : t.inkSoft,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Icon size={22} strokeWidth={1.75} aria-hidden />
                <span style={{ fontSize: 12, fontWeight: 650, color: t.ink }}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label style={label}>Stress level</label>
        <div className="db-log-stress-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {STRESS_LEVELS.map((level) => {
            const active = form.stressLevel === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setForm({ ...form, stressLevel: level })}
                style={{
                  padding: '11px 8px',
                  borderRadius: 10,
                  border: `1.5px solid ${active ? t.forest : t.lineStrong}`,
                  background: active ? t.surfaceSunken : '#FFF',
                  color: t.ink,
                  fontWeight: 650,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                }}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      <Field title="Date & time">
        <input
          required
          type="datetime-local"
          value={form.timestamp}
          onChange={(e) => setForm({ ...form, timestamp: e.target.value })}
          style={field}
        />
      </Field>

      <Field title="Notes (optional)">
        <textarea
          rows={3}
          maxLength={1000}
          value={form.journalEntry}
          onChange={(e) => setForm({ ...form, journalEntry: e.target.value })}
          style={{ ...field, resize: 'vertical' }}
          placeholder="Optional note about mood or stress"
        />
      </Field>

      <Submit submitting={submitting} isEdit={isEdit} label="Save entry" editLabel="Update entry" />
    </form>
  );
}
