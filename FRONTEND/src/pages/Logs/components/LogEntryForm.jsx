import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../../theme';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../i18n/I18nContext';
import { API_URL } from '../../../config/api';
import { Annoyed, AlertTriangle, Check, Frown, Laugh, Loader2, Meh, Smile, Upload } from 'lucide-react';
import { mlToUsFlOz, usFlOzToMl, OZ_PER_GLASS, round1 } from '../../../utils/waterUnits';
import { convertGlucose, fromMgdl, glucoseInputBounds, glucoseUnitLabel } from '../../../utils/glucoseUnits';
import ThemedSelect from '../../../components/ThemedSelect';
import SearchSelect from '../../../components/SearchSelect';
import { peekMealNutritionPrefill, clearMealNutritionPrefill } from '../../../utils/mealNutritionPrefill';

const t = theme;

const field = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: 10,
  border: `1px solid ${t.lineStrong}`,
  background: t.surface,
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

const row = { display: 'flex', flexDirection: 'column', gap: 12 };

function pad2(n) {
  return String(n).padStart(2, '0');
}

function daysInMonth(year, month) {
  return new Date(Number(year), Number(month), 0).getDate();
}

function buildHourOptions() {
  return Array.from({ length: 12 }, (_, i) => {
    const h = i + 1;
    return { value: String(h), label: String(h) };
  });
}

function buildMinuteOptions() {
  return Array.from({ length: 60 }, (_, i) => ({
    value: pad2(i),
    label: pad2(i),
  }));
}

function buildYearOptions() {
  const y = new Date().getFullYear();
  return Array.from({ length: 8 }, (_, i) => {
    const year = String(y - 5 + i);
    return { value: year, label: year };
  });
}

function buildMonthOptions() {
  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const label = new Date(2000, i, 1).toLocaleString('en-US', { month: 'short' });
    return { value: String(m), label };
  });
}

function buildDayOptions(year, month) {
  const max = daysInMonth(year, month);
  return Array.from({ length: max }, (_, i) => {
    const d = i + 1;
    return { value: String(d), label: String(d) };
  });
}

function splitTime12(time24) {
  if (!time24 || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time24)) {
    return { hour12: '8', minute: '00', period: 'AM' };
  }
  const [h24, m] = time24.split(':').map(Number);
  const period = h24 >= 12 ? 'PM' : 'AM';
  const hour12 = String(h24 % 12 || 12);
  return { hour12, minute: pad2(m), period };
}

function joinTime12(hour12, minute, period) {
  let h = Number(hour12) % 12;
  if (period === 'PM') h += 12;
  return `${pad2(h)}:${pad2(Number(minute) || 0)}`;
}

function splitDateParts(dateStr) {
  const now = new Date();
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return {
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1),
      day: String(now.getDate()),
    };
  }
  const [y, mo, d] = dateStr.split('-');
  return { year: y, month: String(Number(mo)), day: String(Number(d)) };
}

function joinDateParts(year, month, day) {
  const y = Number(year);
  const m = Number(month);
  let d = Number(day);
  const max = daysInMonth(y, m);
  if (d > max) d = max;
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function toLocalInput(value) {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return toLocalInput(new Date());
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function splitLocal(ts) {
  const raw = ts || toLocalInput();
  const [datePart, timePart = '00:00'] = raw.split('T');
  return { date: datePart || '', time: timePart.slice(0, 5) };
}

function joinLocal(date, time) {
  return `${date}T${time || '00:00'}`;
}

function Field({ title, help, children }) {
  return (
    <div>
      {title ? <label style={label}>{title}</label> : null}
      {children}
      {help ? <p style={hint}>{help}</p> : null}
    </div>
  );
}

const PERIOD_OPTIONS = [
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' },
];

/** Themed DiaBuddy date + 12h time — same pattern as Reminders (one row each). */
function DateTimeFields({ value, onChange, tr }) {
  const { date, time } = splitLocal(value);
  const dateParts = splitDateParts(date);
  const timeParts = splitTime12(time);

  const setDate = (year, month, day) => {
    onChange(joinLocal(joinDateParts(year, month, day), time));
  };
  const setTime = (hour12, minute, period) => {
    onChange(
      joinLocal(
        date || joinDateParts(dateParts.year, dateParts.month, dateParts.day),
        joinTime12(hour12, minute, period)
      )
    );
  };

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 8,
    width: '100%',
  };

  return (
    <div className="db-log-datetime" style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
      <div>
        <label style={label}>{tr('logEntryForm.common.date')}</label>
        <div className="db-log-datetime-row" style={rowStyle}>
          <ThemedSelect
            aria-label="Day"
            value={dateParts.day}
            onChange={(day) => setDate(dateParts.year, dateParts.month, day)}
            options={buildDayOptions(dateParts.year, dateParts.month)}
          />
          <ThemedSelect
            aria-label="Month"
            value={dateParts.month}
            onChange={(month) => setDate(dateParts.year, month, dateParts.day)}
            options={buildMonthOptions()}
          />
          <ThemedSelect
            aria-label="Year"
            value={dateParts.year}
            onChange={(year) => setDate(year, dateParts.month, dateParts.day)}
            options={buildYearOptions()}
          />
        </div>
      </div>
      <div>
        <label style={label}>{tr('logEntryForm.common.time')}</label>
        <div className="db-log-datetime-row" style={rowStyle}>
          <ThemedSelect
            aria-label="Hour"
            value={timeParts.hour12}
            onChange={(hour12) => setTime(hour12, timeParts.minute, timeParts.period)}
            options={buildHourOptions()}
          />
          <ThemedSelect
            aria-label="Minute"
            value={timeParts.minute}
            onChange={(minute) => setTime(timeParts.hour12, minute, timeParts.period)}
            options={buildMinuteOptions()}
          />
          <ThemedSelect
            aria-label="AM/PM"
            value={timeParts.period}
            onChange={(period) => setTime(timeParts.hour12, timeParts.minute, period)}
            options={PERIOD_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}

function Submit({ submitting, isEdit, label, editLabel, tr }) {
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
      {isEdit ? editLabel || tr('logEntryForm.common.updateEntry') : label || tr('logEntryForm.common.saveEntry')}
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

const GLUCOSE_CONTEXT_KEYS = {
  Fasting: 'fasting',
  'Before Breakfast': 'beforeBreakfast',
  'After Breakfast': 'afterBreakfast',
  'Before Lunch': 'beforeLunch',
  'After Lunch': 'afterLunch',
  'Before Dinner': 'beforeDinner',
  'After Dinner': 'afterDinner',
  Bedtime: 'bedtime',
  Random: 'random',
  'Before Exercise': 'beforeExercise',
  'After Exercise': 'afterExercise',
  Night: 'night',
};

function GlucoseFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t: tr } = useI18n();
  // Always use Settings preference — change units in Settings, not per log.
  const preferredUnit = user?.glucoseUnit === 'mmol/L' ? 'mmol/L' : 'mg/dL';
  const unitLabel = glucoseUnitLabel(preferredUnit);
  const bounds = glucoseInputBounds(preferredUnit);
  const rangesMgdl = {
    fastingMin: Number(user?.targetRanges?.fastingMin) || 70,
    fastingMax: Number(user?.targetRanges?.fastingMax) || 100,
    postMealMin: Number(user?.targetRanges?.postMealMin) || 70,
    postMealMax: Number(user?.targetRanges?.postMealMax) || 140,
  };
  const ranges = {
    fastingMin: fromMgdl(rangesMgdl.fastingMin, preferredUnit),
    fastingMax: fromMgdl(rangesMgdl.fastingMax, preferredUnit),
    postMealMin: fromMgdl(rangesMgdl.postMealMin, preferredUnit),
    postMealMax: fromMgdl(rangesMgdl.postMealMax, preferredUnit),
  };
  const [form, setForm] = useState({
    glucoseLevel: '',
    readingType: 'Before Breakfast',
    notes: '',
    timestamp: toLocalInput(),
  });

  useEffect(() => {
    let level = initialRaw?.glucoseLevel ?? '';
    if (level !== '' && initialRaw?.unit && initialRaw.unit !== preferredUnit) {
      const converted = convertGlucose(level, initialRaw.unit, preferredUnit);
      level = converted != null ? converted : level;
    }
    setForm({
      glucoseLevel: level,
      readingType: initialRaw?.readingType || 'Before Breakfast',
      notes: initialRaw?.notes || '',
      timestamp: toLocalInput(initialRaw?.timestamp),
    });
  }, [initialRaw, preferredUnit]);

  const afterMealContext = /after/i.test(form.readingType);
  const lowCut = afterMealContext ? ranges.postMealMin : ranges.fastingMin;
  const highCut = afterMealContext ? ranges.postMealMax : ranges.fastingMax;
  const levelNum = form.glucoseLevel === '' ? null : Number(form.glucoseLevel);
  const glucoseAlert =
    levelNum != null && !Number.isNaN(levelNum)
      ? levelNum < lowCut
        ? 'low'
        : levelNum > highCut
          ? 'high'
          : null
      : null;

  const formatRangeNum = (n) =>
    preferredUnit === 'mmol/L' ? (Math.round(Number(n) * 10) / 10).toFixed(1).replace(/\.0$/, '') : String(Math.round(Number(n)));

  const activeMin = afterMealContext ? ranges.postMealMin : ranges.fastingMin;
  const activeMax = afterMealContext ? ranges.postMealMax : ranges.fastingMax;
  const targetRangeText = tr('logEntryForm.glucose.targetRangeValue', '{min}–{max} {unit}')
    .replace('{min}', formatRangeNum(activeMin))
    .replace('{max}', formatRangeNum(activeMax))
    .replace('{unit}', unitLabel);

  return (
    <form
      style={row}
      onSubmit={(e) => {
        e.preventDefault();
        const body = {
          glucoseLevel: Number(form.glucoseLevel),
          unit: preferredUnit,
          readingType: form.readingType,
          notes: form.notes || undefined,
        };
        body.timestamp = new Date(form.timestamp).toISOString();
        onSubmit(body);
      }}
    >
      <Field title={tr('logEntryForm.glucose.contextLabel', 'Context')}>
        <ThemedSelect
          value={form.readingType}
          onChange={(v) => setForm({ ...form, readingType: v })}
          options={[
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
          ].map((o) => ({
            value: o,
            label: tr(`logEntryForm.glucose.context.${GLUCOSE_CONTEXT_KEYS[o]}`, o),
          }))}
        />
      </Field>

      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          padding: '10px 12px',
          borderRadius: 10,
          border: `1px solid ${t.sage}55`,
          background: t.sageTint,
          color: t.inkSoft,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: t.sageDeep }}>
            {tr('logEntryForm.glucose.targetTitle', 'Target range')}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 650, color: t.ink, lineHeight: 1.35 }}>
            {targetRangeText}
          </p>
        </div>
        <Check size={18} strokeWidth={2.5} style={{ flexShrink: 0, color: t.sageDeep }} aria-hidden />
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
          <label style={{ ...label, marginBottom: 0 }}>{tr('logEntryForm.glucose.value', 'Reading')}</label>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            style={{
              border: 'none',
              background: 'none',
              padding: 0,
              fontSize: 12,
              fontWeight: 650,
              color: t.forest,
              cursor: 'pointer',
              fontFamily: t.fontBody,
              textDecoration: 'none',
            }}
          >
            {tr('logEntryForm.glucose.changeUnitInSettings', 'Change unit in Settings')}
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <input
            required
            type="number"
            step={bounds.step}
            min={bounds.min}
            max={bounds.max}
            value={form.glucoseLevel}
            onChange={(e) => setForm({ ...form, glucoseLevel: e.target.value })}
            style={{ ...field, paddingRight: 72 }}
            placeholder={
              preferredUnit === 'mmol/L'
                ? tr('logEntryForm.glucose.placeholderMmol', 'e.g. 7.1')
                : tr('logEntryForm.glucose.placeholderMgdl', 'e.g. 128')
            }
          />
          <span
            style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 13,
              fontWeight: 700,
              color: t.inkSoft,
              pointerEvents: 'none',
            }}
          >
            {unitLabel}
          </span>
        </div>
      </div>

      {glucoseAlert === 'low' ? (
        <div
          role="status"
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            padding: '12px 14px',
            borderRadius: 12,
            border: `1px solid ${t.clay}55`,
            background: t.claySoft,
            color: t.clayDeep,
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{tr('logEntryForm.glucose.alertLowTitle', 'Low glucose')}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, lineHeight: 1.45 }}>
              {tr(
                'logEntryForm.glucose.alertLowBody',
                "This reading is below the recommended range. Consider following your clinician's advice."
              )}
            </p>
          </div>
        </div>
      ) : null}

      {glucoseAlert === 'high' ? (
        <div
          role="status"
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            padding: '12px 14px',
            borderRadius: 12,
            border: `1px solid ${t.clay}55`,
            background: t.claySoft,
            color: t.clayDeep,
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{tr('logEntryForm.glucose.alertHighTitle', 'High glucose')}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, lineHeight: 1.45 }}>
              {tr('logEntryForm.glucose.alertHighBody', 'Consider rechecking or following your treatment plan.')}
            </p>
          </div>
        </div>
      ) : null}

      <DateTimeFields value={form.timestamp} onChange={(timestamp) => setForm({ ...form, timestamp })} tr={tr} />
      <Field title={tr('logEntryForm.common.notesOptional', 'Notes (optional)')}>
        <input
          type="text"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={field}
          placeholder={tr('logEntryForm.glucose.notesPlaceholder', 'Optional context for this reading')}
        />
      </Field>
      <Submit
        submitting={submitting}
        isEdit={isEdit}
        tr={tr}
        label={tr('logEntryForm.common.saveGlucose', 'Save glucose reading')}
        editLabel={tr('logEntryForm.common.updateGlucose', 'Update glucose reading')}
      />
    </form>
  );
}

const MEAL_TYPE_KEYS = { Breakfast: 'breakfast', Lunch: 'lunch', Dinner: 'dinner', Snack: 'snack' };

function MealFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const navigate = useNavigate();
  const { t: tr } = useI18n();
  const { authHeaders } = useAuth();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    mealType: 'Breakfast',
    foodItems: '',
    carbohydrates: '',
    protein: '',
    fat: '',
    calories: '',
    waterOz: '',
    bloodSugarImpact: '',
    notes: '',
    timestamp: toLocalInput(),
  });
  const [nutritionMode, setNutritionMode] = useState('manual');
  const [dishWeightG, setDishWeightG] = useState('');
  const [oilG, setOilG] = useState('');
  const [aiFile, setAiFile] = useState(null);
  const [aiPreview, setAiPreview] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [aiResultMeta, setAiResultMeta] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const prefill = !isEdit && !initialRaw ? peekMealNutritionPrefill() : null;
    setForm({
      mealType: initialRaw?.mealType || 'Breakfast',
      foodItems: prefill?.foodItems
        ? String(prefill.foodItems)
        : initialRaw?.foodItems || '',
      carbohydrates:
        prefill?.carbohydrates != null && prefill.carbohydrates !== ''
          ? String(prefill.carbohydrates)
          : initialRaw?.carbohydrates != null
            ? String(initialRaw.carbohydrates)
            : '',
      protein:
        prefill?.protein != null && prefill.protein !== ''
          ? String(prefill.protein)
          : initialRaw?.protein != null
            ? String(initialRaw.protein)
            : '',
      fat:
        prefill?.fat != null && prefill.fat !== ''
          ? String(prefill.fat)
          : initialRaw?.fat != null
            ? String(initialRaw.fat)
            : '',
      calories:
        prefill?.calories != null && prefill.calories !== ''
          ? String(prefill.calories)
          : initialRaw?.calories != null
            ? String(initialRaw.calories)
            : '',
      waterOz:
        initialRaw?.waterConsumed != null && Number(initialRaw.waterConsumed) > 0
          ? String(round1(mlToUsFlOz(initialRaw.waterConsumed)))
          : '',
      bloodSugarImpact: initialRaw?.bloodSugarImpact || '',
      notes: initialRaw?.notes || '',
      timestamp: toLocalInput(initialRaw?.timestamp),
    });
    setNutritionMode('manual');
    setDishWeightG('');
    setOilG('');
    setAiFile(null);
    setAiPreview('');
    setAnalyzeError('');
    setAiResultMeta(null);
    if (prefill) {
      const clearTimer = setTimeout(() => clearMealNutritionPrefill(), 5000);
      return () => clearTimeout(clearTimer);
    }
    return undefined;
  }, [initialRaw, isEdit]);

  useEffect(() => {
    return () => {
      if (aiPreview) URL.revokeObjectURL(aiPreview);
    };
  }, [aiPreview]);

  const impactOptions = [
    { value: 'High', label: tr('logEntryForm.meal.impact.high') },
    { value: 'Normal', label: tr('logEntryForm.meal.impact.normal') },
    { value: 'Low', label: tr('logEntryForm.meal.impact.low') },
  ];

  const canSave = form.foodItems.trim() && form.carbohydrates !== '';

  const clearAiPhoto = () => {
    if (aiPreview) URL.revokeObjectURL(aiPreview);
    setAiFile(null);
    setAiPreview('');
    setAnalyzeError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const acceptAiFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAnalyzeError(tr('logEntryForm.meal.aiInvalidImage'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAnalyzeError(tr('logEntryForm.meal.aiImageTooLarge'));
      return;
    }
    if (aiPreview) URL.revokeObjectURL(aiPreview);
    setAiFile(file);
    setAiPreview(URL.createObjectURL(file));
    setAnalyzeError('');
    setAiResultMeta(null);
  };

  const onPickAiPhoto = (e) => {
    acceptAiFile(e.target.files?.[0]);
  };

  const applyNutrition = (n, foodName) => {
    setForm((prev) => ({
      ...prev,
      foodItems: foodName || prev.foodItems,
      carbohydrates: n.carbohydrates != null ? String(n.carbohydrates) : prev.carbohydrates,
      protein: n.protein != null ? String(n.protein) : prev.protein,
      fat: n.fat != null ? String(n.fat) : prev.fat,
      calories: n.calories != null ? String(n.calories) : prev.calories,
    }));
  };

  const analyzeMealPhoto = async () => {
    if (!aiFile || analyzing) return;
    if (!dishWeightG || Number(dishWeightG) <= 0) {
      setAnalyzeError(tr('logEntryForm.meal.dishWeightRequired'));
      return;
    }
    setAnalyzing(true);
    setAnalyzeError('');
    try {
      const body = new FormData();
      body.append('image', aiFile);
      body.append('dishWeightG', String(dishWeightG));
      body.append('oilG', String(oilG || 0));
      const res = await fetch(`${API_URL}/meals/analyze`, {
        method: 'POST',
        credentials: 'include',
        headers: { ...authHeaders() },
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || tr('logEntryForm.meal.aiAnalyzeFailed'));
      }
      const result = data.data;
      const n = result?.nutrition || {};
      const dishName = result?.foodName || result?.identification?.dishName || '';
      applyNutrition(n, dishName);
      setAiResultMeta({
        matchScore: result?.matchScore,
        identifiedAs: result?.identification?.dishName,
        disclaimer: result?.disclaimer,
        portion: result?.portion,
        source: 'ai',
      });
    } catch (err) {
      setAnalyzeError(err.message || tr('logEntryForm.meal.aiAnalyzeFailed'));
      setAiResultMeta(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const macroInputs = (
    <div className="db-log-macro-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <Field title={tr('logEntryForm.meal.carbsG')}>
        <input
          required={canSave}
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
      <Field title={tr('logEntryForm.meal.proteinG')}>
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
      <Field title={tr('logEntryForm.meal.fatG')}>
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
      <Field title={tr('logEntryForm.meal.caloriesKcal')}>
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
  );

  const portionDetails = (
    <div
      style={{
        padding: 14,
        borderRadius: 12,
        border: `1px solid ${t.lineStrong}`,
        background: t.surfaceSunken,
        marginBottom: 12,
      }}
    >
      <p
        style={{
          margin: '0 0 12px',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: t.inkSoft,
        }}
      >
        {tr('logEntryForm.meal.portionDetails')}
      </p>
      <div className="db-log-macro-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={label}>{tr('logEntryForm.meal.portionEaten')}</label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              min="1"
              step="1"
              inputMode="decimal"
              value={dishWeightG}
              onChange={(e) => setDishWeightG(e.target.value)}
              style={{ ...field, paddingRight: 40 }}
              placeholder="350"
            />
            <span
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 13,
                fontWeight: 700,
                color: t.inkSoft,
              }}
            >
              g
            </span>
          </div>
          <p style={hint}>{tr('logEntryForm.meal.portionHint')}</p>
        </div>
        <div>
          <label style={label}>{tr('logEntryForm.meal.addedOil')}</label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              min="0"
              step="0.5"
              inputMode="decimal"
              value={oilG}
              onChange={(e) => setOilG(e.target.value)}
              style={{ ...field, paddingRight: 40 }}
              placeholder="10"
            />
            <span
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 13,
                fontWeight: 700,
                color: t.inkSoft,
              }}
            >
              g
            </span>
          </div>
          <p style={hint}>{tr('logEntryForm.meal.oilHint')}</p>
        </div>
      </div>
    </div>
  );

  return (
    <form
      style={row}
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSave) return;
        const body = {
          mealType: form.mealType,
          foodItems: form.foodItems,
          carbohydrates: Number(form.carbohydrates) || 0,
          protein: Number(form.protein) || 0,
          fat: Number(form.fat) || 0,
          calories: Number(form.calories) || 0,
          waterConsumed: form.waterOz ? Math.round(usFlOzToMl(form.waterOz)) : 0,
          bloodSugarImpact: form.bloodSugarImpact || '',
          notes: form.notes || undefined,
        };
        body.timestamp = new Date(form.timestamp).toISOString();
        onSubmit(body);
      }}
    >
      <Field title={tr('logEntryForm.meal.mealType')}>
        <ThemedSelect
          value={form.mealType}
          onChange={(v) => setForm({ ...form, mealType: v })}
          options={['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((o) => ({
            value: o,
            label: tr(`logEntryForm.meal.types.${MEAL_TYPE_KEYS[o]}`, o),
          }))}
        />
      </Field>

      <DateTimeFields value={form.timestamp} onChange={(timestamp) => setForm({ ...form, timestamp })} tr={tr} />

      <Field title={tr('logEntryForm.meal.foodDescription')}>
        <textarea
          required={canSave}
          rows={6}
          maxLength={1800}
          value={form.foodItems}
          onChange={(e) => setForm({ ...form, foodItems: e.target.value })}
          style={{
            ...field,
            resize: 'none',
            minHeight: 132,
            maxHeight: 132,
            overflowY: 'auto',
            lineHeight: 1.45,
          }}
          placeholder={tr('logEntryForm.meal.foodPlaceholder')}
        />
      </Field>

      <div>
        <label style={label}>{tr('logEntryForm.meal.nutrition')}</label>
        <div
          role="tablist"
          aria-label={tr('logEntryForm.meal.nutritionMethod')}
          className="db-log-source-grid"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={nutritionMode === 'manual'}
            onClick={() => {
              setNutritionMode('manual');
              setAnalyzeError('');
            }}
            style={{
              padding: '11px 12px',
              borderRadius: 10,
              border: `1.5px solid ${nutritionMode === 'manual' ? t.forest : t.lineStrong}`,
              background: nutritionMode === 'manual' ? t.surfaceSunken : t.surface,
              color: t.ink,
              fontWeight: 650,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: t.fontBody,
              textAlign: 'left',
            }}
          >
            {tr('logEntryForm.meal.manual')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={nutritionMode === 'ai'}
            onClick={() => {
              setNutritionMode('ai');
              setAnalyzeError('');
            }}
            style={{
              padding: '11px 12px',
              borderRadius: 10,
              border: `1.5px solid ${nutritionMode === 'ai' ? t.forest : t.lineStrong}`,
              background: nutritionMode === 'ai' ? t.surfaceSunken : t.surface,
              color: t.ink,
              fontWeight: 650,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: t.fontBody,
              textAlign: 'left',
            }}
          >
            {tr('logEntryForm.meal.aiAnalyzer')}
          </button>
        </div>

        {nutritionMode === 'manual' && (
          <>
            <p style={{ ...hint, marginTop: 0, marginBottom: 10 }}>{tr('logEntryForm.meal.manualCalcHint')}</p>
            {macroInputs}
            <button
              type="button"
              onClick={() => navigate('/toolbox?tool=carb')}
              style={{
                marginTop: 12,
                width: '100%',
                padding: '11px 14px',
                borderRadius: 10,
                border: `1px solid ${t.lineStrong}`,
                background: t.surface,
                color: t.forest,
                fontWeight: 650,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: t.fontBody,
                textAlign: 'left',
                lineHeight: 1.4,
              }}
            >
              {tr('logEntryForm.meal.openCarbToolbox')}
            </button>
          </>
        )}

        {nutritionMode === 'ai' && (
          <div
            key="nutrition-ai"
            style={{
              padding: '16px',
              borderRadius: 12,
              border: `1px solid ${t.lineStrong}`,
              background: t.surface,
              boxShadow: '0 1px 2px rgba(43,42,40,0.04)',
            }}
          >
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.ink }}>{tr('logEntryForm.meal.aiTitle')}</p>
            <p style={{ margin: '6px 0 14px', fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
              {tr('logEntryForm.meal.aiBody')}
            </p>

            {portionDetails}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/heic,image/heif,image/webp"
              capture="environment"
              onChange={onPickAiPhoto}
              style={{ display: 'none' }}
            />

            {aiPreview ? (
              <div style={{ marginBottom: 12 }}>
                <img
                  src={aiPreview}
                  alt=""
                  style={{
                    width: '100%',
                    maxHeight: 220,
                    objectFit: 'cover',
                    borderRadius: 10,
                    border: `1px solid ${t.lineStrong}`,
                    display: 'block',
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={analyzing}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: `1px solid ${t.lineStrong}`,
                      background: t.surface,
                      color: t.ink,
                      fontWeight: 650,
                      fontSize: 13,
                      cursor: analyzing ? 'not-allowed' : 'pointer',
                      fontFamily: t.fontBody,
                    }}
                  >
                    {tr('logEntryForm.meal.aiChangePhoto')}
                  </button>
                  <button
                    type="button"
                    onClick={clearAiPhoto}
                    disabled={analyzing}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: `1px solid ${t.lineStrong}`,
                      background: t.surface,
                      color: t.inkSoft,
                      fontWeight: 650,
                      fontSize: 13,
                      cursor: analyzing ? 'not-allowed' : 'pointer',
                      fontFamily: t.fontBody,
                    }}
                  >
                    {tr('logEntryForm.meal.aiRemovePhoto')}
                  </button>
                  <button
                    type="button"
                    onClick={analyzeMealPhoto}
                    disabled={analyzing || !aiFile}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: `1.5px solid ${t.forest}`,
                      background: t.forest,
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: analyzing || !aiFile ? 'not-allowed' : 'pointer',
                      fontFamily: t.fontBody,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      opacity: analyzing || !aiFile ? 0.7 : 1,
                    }}
                  >
                    {analyzing ? <Loader2 size={16} className="db-spin" /> : null}
                    {analyzing ? tr('logEntryForm.meal.aiAnalyzing') : tr('logEntryForm.meal.aiAnalyze')}
                  </button>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  acceptAiFile(e.dataTransfer.files?.[0]);
                }}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '28px 18px',
                  borderRadius: 12,
                  border: `1.5px solid ${dragOver ? t.forest : t.lineStrong}`,
                  background: dragOver ? t.sageTint : t.surfaceSunken,
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontFamily: t.fontBody,
                  transition: 'border-color 0.15s ease, background 0.15s ease',
                }}
              >
                <Upload size={22} style={{ color: t.forest, marginBottom: 10 }} />
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: t.ink }}>
                  {tr('logEntryForm.meal.aiDropTitle')}
                </p>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: t.inkSoft }}>
                  {tr('logEntryForm.meal.aiDropOr')}{' '}
                  <span style={{ color: t.forest, fontWeight: 650, textDecoration: 'underline', textUnderlineOffset: 2 }}>
                    {tr('logEntryForm.meal.aiBrowse')}
                  </span>
                </p>
                <p
                  style={{
                    margin: '12px 0 0',
                    fontSize: 11,
                    fontWeight: 650,
                    letterSpacing: '0.08em',
                    color: t.inkFaint,
                  }}
                >
                  {tr('logEntryForm.meal.aiFormats')}
                </p>
              </div>
            )}

            {analyzeError && nutritionMode === 'ai' ? (
              <p style={{ margin: '10px 0 0', fontSize: 13, color: '#b42318', lineHeight: 1.45 }}>{analyzeError}</p>
            ) : null}

            {aiResultMeta?.source === 'ai' ? (
              <div style={{ marginTop: 14 }}>
                <p style={{ ...hint, marginTop: 0, marginBottom: 10 }}>
                  {tr('logEntryForm.meal.aiMatchHint')}
                  {form.foodItems ? ` (${form.foodItems})` : ''}
                </p>
                {macroInputs}
                <p style={{ ...hint, marginTop: 10 }}>{tr('logEntryForm.meal.aiDisclaimer')}</p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <Field title={tr('logEntryForm.meal.waterIntakeOz')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="number"
            min="0"
            step="0.5"
            inputMode="decimal"
            value={form.waterOz}
            onChange={(e) => setForm({ ...form, waterOz: e.target.value })}
            style={{ ...field, flex: 1 }}
            placeholder="8"
          />
          <span style={{ fontSize: 14, fontWeight: 650, color: t.inkSoft, flexShrink: 0 }}>
            {tr('logEntryForm.water.unitOz')}
          </span>
        </div>
        <p style={hint}>{tr('logEntryForm.water.glassHint')}</p>
      </Field>

      <div>
        <label style={label}>{tr('logEntryForm.meal.bloodSugarAfter')}</label>
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
                  background: active ? t.surfaceSunken : t.surface,
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

      <Field title={tr('logEntryForm.common.notesOptional')}>
        <input
          type="text"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={field}
          placeholder={tr('logEntryForm.meal.notesPlaceholder')}
        />
      </Field>

      {canSave ? (
        <Submit
          submitting={submitting}
          isEdit={isEdit}
          tr={tr}
          label={tr('logEntryForm.common.saveMeal')}
          editLabel={tr('logEntryForm.common.updateMeal')}
        />
      ) : (
        <>
          <p style={{ ...hint, marginTop: 4 }}>
            {nutritionMode === 'ai' ? tr('logEntryForm.meal.savingAiHint') : tr('logEntryForm.meal.calcFirstHint')}
          </p>
          <button
            type="submit"
            disabled
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
              cursor: 'not-allowed',
              fontFamily: t.fontBody,
              opacity: 0.45,
            }}
          >
            {isEdit ? tr('logEntryForm.common.updateMeal') : tr('logEntryForm.common.saveMeal')}
          </button>
        </>
      )}
    </form>
  );
}

const INSULIN_TYPES = ['Rapid-Acting', 'Short-Acting', 'Intermediate-Acting', 'Long-Acting'];
const INSULIN_TYPE_KEYS = {
  'Rapid-Acting': 'rapidActing',
  'Short-Acting': 'shortActing',
  'Intermediate-Acting': 'intermediateActing',
  'Long-Acting': 'longActing',
};
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
const INSULIN_REASON_KEYS = {
  'Before Breakfast': 'beforeBreakfast',
  'After Breakfast': 'afterBreakfast',
  'Before Lunch': 'beforeLunch',
  'After Lunch': 'afterLunch',
  'Before Dinner': 'beforeDinner',
  'After Dinner': 'afterDinner',
  Bedtime: 'bedtime',
  Correction: 'correction',
  Other: 'other',
};
const INSULIN_SITES = ['Abdomen', 'Left Arm', 'Right Arm', 'Left Thigh', 'Right Thigh', 'Buttocks', 'Other'];
const INSULIN_SITE_KEYS = {
  Abdomen: 'abdomen',
  'Left Arm': 'leftArm',
  'Right Arm': 'rightArm',
  'Left Thigh': 'leftThigh',
  'Right Thigh': 'rightThigh',
  Buttocks: 'buttocks',
  Other: 'other',
};

function InsulinFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const { t: tr } = useI18n();
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
      <Field title={tr('logEntryForm.insulin.insulinType')}>
        <ThemedSelect
          required
          value={form.insulinType}
          onChange={(v) => setForm({ ...form, insulinType: v })}
          options={[
            ...INSULIN_TYPES.map((o) => ({
              value: o,
              label: tr(`logEntryForm.insulin.types.${INSULIN_TYPE_KEYS[o]}`, o),
            })),
            ...(form.insulinType && !INSULIN_TYPES.includes(form.insulinType)
              ? [{ value: form.insulinType, label: form.insulinType }]
              : []),
          ]}
        />
      </Field>

      <Field title={tr('logEntryForm.insulin.dose')}>
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
          <span style={{ fontSize: 14, fontWeight: 650, color: t.inkSoft, flexShrink: 0 }}>{tr('logEntryForm.insulin.units')}</span>
        </div>
      </Field>

      <Field title={tr('logEntryForm.insulin.reason')}>
        <ThemedSelect
          required
          value={form.reason}
          onChange={(v) => setForm({ ...form, reason: v })}
          options={INSULIN_REASONS.map((o) => ({
            value: o,
            label: tr(`logEntryForm.insulin.reasons.${INSULIN_REASON_KEYS[o]}`, o),
          }))}
        />
      </Field>

      <DateTimeFields value={form.timestamp} onChange={(timestamp) => setForm({ ...form, timestamp })} tr={tr} />

      <Field title={tr('logEntryForm.insulin.injectionSite')}>
        <ThemedSelect
          value={form.injectionSite}
          onChange={(v) => setForm({ ...form, injectionSite: v })}
          placeholder={tr('logEntryForm.insulin.selectSite')}
          options={[
            { value: '', label: tr('logEntryForm.insulin.selectSite') },
            ...INSULIN_SITES.map((o) => ({
              value: o,
              label: tr(`logEntryForm.insulin.sites.${INSULIN_SITE_KEYS[o]}`, o),
            })),
          ]}
        />
      </Field>

      <Field title={tr('logEntryForm.common.notesOptional')}>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ ...field, resize: 'vertical' }}
          placeholder={tr('logEntryForm.insulin.notesPlaceholder')}
        />
      </Field>

      <Submit
        submitting={submitting}
        isEdit={isEdit}
        tr={tr}
        label={tr('logEntryForm.common.saveInsulin')}
        editLabel={tr('logEntryForm.common.updateInsulin')}
      />
    </form>
  );
}

const MEDICATION_NAMES = [
  // Popular among Pakistani diabetes patients (shown first)
  'Metformin',
  'Glimepiride',
  'Gliclazide',
  'Sitagliptin',
  'Insulin',
  // Also commonly prescribed — searchable
  'Vildagliptin',
  'Empagliflozin',
  'Dapagliflozin',
  'Pioglitazone',
  'Linagliptin',
  'Acarbose',
  'Repaglinide',
  'Canagliflozin',
  'Insulin Glargine',
  'Insulin Aspart',
  'Mixtard',
  'Janumet',
  'Galvus Met',
];
const DOSE_UNITS = ['mg', 'ml', 'Tablet(s)', 'Capsule(s)'];
const DOSE_UNIT_KEYS = { mg: 'mg', ml: 'ml', 'Tablet(s)': 'tablets', 'Capsule(s)': 'capsules' };
const MED_ROUTES = ['Oral', 'Injection', 'Inhaler', 'Other'];
const MED_ROUTE_KEYS = { Oral: 'oral', Injection: 'injection', Inhaler: 'inhaler', Other: 'other' };
const MED_STATUS_KEYS = { Taken: 'taken', Missed: 'missed', Skipped: 'skipped' };

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
  const { t: tr } = useI18n();
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
      <Field title={tr('logEntryForm.medication.name')}>
        <SearchSelect
          required
          value={form.medicineName}
          onChange={(v) => setForm({ ...form, medicineName: v })}
          options={MEDICATION_NAMES}
          topCount={5}
          allowCustom
          placeholder={tr('logEntryForm.medication.namePlaceholder')}
          searchPlaceholder={tr('logEntryForm.medication.searchPlaceholder')}
          popularLabel={tr('logEntryForm.medication.popular')}
          searchMoreLabel={tr('logEntryForm.medication.searchMore')}
          emptyLabel={tr('logEntryForm.medication.noMatches')}
        />
      </Field>

      <Field title={tr('logEntryForm.medication.dosage')}>
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
          <ThemedSelect
            required
            value={form.doseUnit}
            onChange={(v) => setForm({ ...form, doseUnit: v })}
            style={{ width: 120, maxWidth: '46%', flexShrink: 0 }}
            options={[
              ...DOSE_UNITS.map((u) => ({
                value: u,
                label: tr(`logEntryForm.medication.doseUnits.${DOSE_UNIT_KEYS[u]}`, u),
              })),
              ...(form.doseUnit && !DOSE_UNITS.includes(form.doseUnit)
                ? [{ value: form.doseUnit, label: form.doseUnit }]
                : []),
            ]}
          />
        </div>
      </Field>

      <div>
        <label style={label}>{tr('logEntryForm.medication.status')}</label>
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
                  background: active ? t.surfaceSunken : t.surface,
                  color: t.ink,
                  fontWeight: 650,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                }}
              >
                {tr(`logEntryForm.medication.statuses.${MED_STATUS_KEYS[status]}`, status)}
              </button>
            );
          })}
        </div>
      </div>

      <DateTimeFields value={form.timestamp} onChange={(timestamp) => setForm({ ...form, timestamp })} tr={tr} />

      <Field title={tr('logEntryForm.medication.route')}>
        <ThemedSelect
          value={form.route}
          onChange={(v) => setForm({ ...form, route: v })}
          placeholder={tr('logEntryForm.medication.selectRoute')}
          options={[
            { value: '', label: tr('logEntryForm.medication.selectRoute') },
            ...MED_ROUTES.map((r) => ({
              value: r,
              label: tr(`logEntryForm.medication.routes.${MED_ROUTE_KEYS[r]}`, r),
            })),
          ]}
        />
      </Field>

      <Field title={tr('logEntryForm.common.notesOptional')}>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ ...field, resize: 'vertical' }}
          placeholder={tr('logEntryForm.medication.notesPlaceholder')}
        />
      </Field>

      <Submit submitting={submitting} isEdit={isEdit} tr={tr} label={tr('logEntryForm.common.saveMedication')} editLabel={tr('logEntryForm.common.updateMedication')} />
    </form>
  );
}

const WATER_QUICK_OZ = [OZ_PER_GLASS, OZ_PER_GLASS * 2, OZ_PER_GLASS * 3];

function WaterFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const { t: tr } = useI18n();
  const [form, setForm] = useState({
    amountOz: String(OZ_PER_GLASS),
    notes: '',
    timestamp: toLocalInput(),
  });

  useEffect(() => {
    setForm({
      amountOz:
        initialRaw?.amount != null ? String(round1(mlToUsFlOz(initialRaw.amount))) : String(OZ_PER_GLASS),
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
          amount: Math.round(usFlOzToMl(form.amountOz)),
          notes: form.notes || undefined,
        };
        body.timestamp = new Date(form.timestamp).toISOString();
        onSubmit(body);
      }}
    >
      <Field title={tr('logEntryForm.water.intake')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            required
            type="number"
            min="0.5"
            step="0.5"
            inputMode="decimal"
            value={form.amountOz}
            onChange={(e) => setForm({ ...form, amountOz: e.target.value })}
            style={{ ...field, flex: 1 }}
            placeholder={String(OZ_PER_GLASS)}
          />
          <span style={{ fontSize: 14, fontWeight: 650, color: t.inkSoft, flexShrink: 0 }}>
            {tr('logEntryForm.water.unitOz')}
          </span>
        </div>
        <p style={hint}>{tr('logEntryForm.water.glassHint')}</p>
      </Field>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 8,
        }}
      >
        {WATER_QUICK_OZ.map((oz) => {
          const active = Number(form.amountOz) === oz;
          const glasses = oz / OZ_PER_GLASS;
          return (
            <button
              key={oz}
              type="button"
              onClick={() => setForm({ ...form, amountOz: String(oz) })}
              style={{
                padding: '10px 8px',
                borderRadius: 10,
                border: `1.5px solid ${active ? t.forest : t.lineStrong}`,
                background: active ? t.surfaceSunken : t.surface,
                color: t.ink,
                fontSize: 12.5,
                fontWeight: 650,
                cursor: 'pointer',
                fontFamily: t.fontBody,
                textAlign: 'center',
                lineHeight: 1.35,
                whiteSpace: 'normal',
              }}
            >
              +{oz} oz
              <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: t.inkFaint, marginTop: 2 }}>
                {glasses}{' '}
                {glasses === 1 ? tr('logEntryForm.water.glass') : tr('logEntryForm.water.glasses')}
              </span>
            </button>
          );
        })}
      </div>

      <DateTimeFields value={form.timestamp} onChange={(timestamp) => setForm({ ...form, timestamp })} tr={tr} />

      <Field title={tr('logEntryForm.common.notesOptional')}>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ ...field, resize: 'vertical' }}
          placeholder={tr('logEntryForm.water.notesPlaceholder')}
        />
      </Field>

      <Submit submitting={submitting} isEdit={isEdit} tr={tr} label={tr('logEntryForm.common.saveWater')} editLabel={tr('logEntryForm.common.updateWater')} />
    </form>
  );
}

const ACTIVITY_TYPES = ['Walking', 'Running', 'Cycling', 'Gym', 'Yoga', 'Swimming', 'Other'];
const ACTIVITY_TYPE_KEYS = {
  Walking: 'walking',
  Running: 'running',
  Cycling: 'cycling',
  Gym: 'gym',
  Yoga: 'yoga',
  Swimming: 'swimming',
  Other: 'other',
};
const INTENSITY_UI = ['Light', 'Moderate', 'Vigorous'];
const INTENSITY_KEYS = { Light: 'light', Moderate: 'moderate', Vigorous: 'vigorous' };
const intensityToApi = { Light: 'Low', Moderate: 'Medium', Vigorous: 'High' };
const intensityFromApi = { Low: 'Light', Medium: 'Moderate', High: 'Vigorous' };

function ExerciseFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const { t: tr } = useI18n();
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
      className="db-log-exercise-form"
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
        <label style={label}>{tr('logEntryForm.exercise.source')}</label>
        <div className="db-log-source-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { id: 'manual', title: tr('logEntryForm.exercise.manualEntry') },
            { id: 'google-health', title: tr('logEntryForm.exercise.googleHealthSync') },
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
                  background: active ? t.surfaceSunken : t.surface,
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
        <label style={label}>{tr('logEntryForm.exercise.type')}</label>
        <ThemedSelect
          value={form.exerciseType}
          onChange={(v) => setForm({ ...form, exerciseType: v })}
          options={ACTIVITY_TYPES.map((type) => ({
            value: type,
            label: tr(`logEntryForm.exercise.types.${ACTIVITY_TYPE_KEYS[type]}`, type),
          }))}
          placeholder={tr('logEntryForm.exercise.selectType')}
          aria-label={tr('logEntryForm.exercise.type')}
          required
        />
        {form.exerciseType === 'Other' && (
          <input
            required
            type="text"
            value={form.customType}
            onChange={(e) => setForm({ ...form, customType: e.target.value })}
            style={{ ...field, marginTop: 10 }}
            placeholder={tr('logEntryForm.exercise.describeActivity')}
          />
        )}
      </div>

      <Field title={tr('logEntryForm.exercise.duration')}>
        <div className="db-log-unit-row">
          <input
            required
            type="number"
            min="1"
            inputMode="numeric"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            style={field}
            placeholder="30"
          />
          <span className="db-log-unit-suffix">{tr('logEntryForm.exercise.minutes')}</span>
        </div>
      </Field>

      <div>
        <label style={label}>{tr('logEntryForm.exercise.intensity')}</label>
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
                  background: active ? t.surfaceSunken : t.surface,
                  color: t.ink,
                  fontWeight: 650,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                }}
              >
                {tr(`logEntryForm.exercise.intensities.${INTENSITY_KEYS[level]}`, level)}
              </button>
            );
          })}
        </div>
      </div>

      <Field title={tr('logEntryForm.exercise.caloriesBurned')}>
        <div className="db-log-unit-row">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={form.caloriesBurned}
            onChange={(e) => setForm({ ...form, caloriesBurned: e.target.value })}
            style={field}
            placeholder="250"
          />
          <span className="db-log-unit-suffix">{tr('logEntryForm.exercise.kcal')}</span>
        </div>
      </Field>

      <Field title={tr('logEntryForm.exercise.distance')}>
        <div className="db-log-unit-row">
          <input
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            value={form.distance}
            onChange={(e) => setForm({ ...form, distance: e.target.value })}
            style={field}
            placeholder="2.5"
          />
          <span className="db-log-unit-suffix">{tr('logEntryForm.exercise.km')}</span>
        </div>
      </Field>

      <Field title={tr('logEntryForm.exercise.steps')} help={tr('logEntryForm.exercise.stepsHint')}>
        <input
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={form.steps}
          onChange={(e) => setForm({ ...form, steps: e.target.value })}
          style={field}
          placeholder={tr('logEntryForm.exercise.stepsPlaceholder')}
        />
      </Field>

      <DateTimeFields value={form.timestamp} onChange={(timestamp) => setForm({ ...form, timestamp })} tr={tr} />

      <Field title={tr('logEntryForm.common.notesOptional')}>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ ...field, resize: 'vertical' }}
          placeholder={tr('logEntryForm.exercise.notesPlaceholder')}
        />
      </Field>

      <Submit submitting={submitting} isEdit={isEdit} tr={tr} label={tr('logEntryForm.common.saveExercise')} editLabel={tr('logEntryForm.common.updateExercise')} />
    </form>
  );
}

const SLEEP_QUALITY = ['Excellent', 'Good', 'Fair', 'Poor'];
const SLEEP_QUALITY_KEYS = { Excellent: 'excellent', Good: 'good', Fair: 'fair', Poor: 'poor' };

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

function formatSleepDuration(duration, tr) {
  if (!duration) return '';
  const hourLabel = tr(duration.hours === 1 ? 'logEntryForm.sleep.hour' : 'logEntryForm.sleep.hours');
  const minuteLabel = tr(duration.minutes === 1 ? 'logEntryForm.sleep.minute' : 'logEntryForm.sleep.minutes');
  if (duration.minutes === 0) return `${duration.hours} ${hourLabel}`;
  if (duration.hours === 0) return `${duration.minutes} ${minuteLabel}`;
  return `${duration.hours} ${hourLabel} ${duration.minutes} ${minuteLabel}`;
}

function SleepFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const { t: tr } = useI18n();
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
      <div>
      <p style={{ ...label, marginBottom: 8 }}>{tr('logEntryForm.sleep.bedtime')}</p>
      <DateTimeFields value={form.sleepTime} onChange={setSleepTime} tr={tr} />
      <p style={hint}>{tr('logEntryForm.sleep.bedtimeHint')}</p>
    </div>

      <div>
      <p style={{ ...label, marginBottom: 8 }}>{tr('logEntryForm.sleep.wakeTime')}</p>
      <DateTimeFields value={form.wakeTime} onChange={setWakeTime} tr={tr} />
      <p style={hint}>{tr('logEntryForm.sleep.wakeTimeHint')}</p>
    </div>

      <div>
        <label style={label}>{tr('logEntryForm.sleep.duration')}</label>
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
            {duration ? formatSleepDuration(duration, tr) : tr('logEntryForm.sleep.setBedtimeWakeTime')}
          </span>
          {duration ? (
            <span style={{ fontSize: 13, fontWeight: 650, color: t.inkSoft, flexShrink: 0 }}>
              {duration.totalHours} h
            </span>
          ) : null}
        </div>
        <p style={hint}>{tr('logEntryForm.sleep.durationCalcHint')}</p>
      </div>

      <div>
        <label style={label}>{tr('logEntryForm.sleep.quality')}</label>
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
                  background: active ? t.surfaceSunken : t.surface,
                  color: t.ink,
                  fontWeight: 650,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                }}
              >
                {tr(`logEntryForm.sleep.qualities.${SLEEP_QUALITY_KEYS[level]}`, level)}
              </button>
            );
          })}
        </div>
      </div>

      <Field title={tr('logEntryForm.common.notesOptional')}>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ ...field, resize: 'vertical' }}
          placeholder={tr('logEntryForm.sleep.notesPlaceholder')}
        />
      </Field>

      <Submit
        submitting={submitting}
        isEdit={isEdit}
        label={tr('logEntryForm.sleep.saveSleepLog')}
        editLabel={tr('logEntryForm.sleep.updateSleepLog')}
        tr={tr}
      />
    </form>
  );
}

const MOOD_OPTIONS = [
  { id: 'Very Happy', key: 'veryHappy', Icon: Laugh },
  { id: 'Happy', key: 'happy', Icon: Smile },
  { id: 'Neutral', key: 'neutral', Icon: Meh },
  { id: 'Sad', key: 'sad', Icon: Frown },
  { id: 'Anxious', key: 'anxious', Icon: Annoyed },
];

const LEGACY_MOOD_MAP = {
  Great: 'Very Happy',
  Good: 'Happy',
  Okay: 'Neutral',
  Low: 'Sad',
  Stressed: 'Anxious',
};

const STRESS_LEVELS = ['Low', 'Moderate', 'High'];
const STRESS_LEVEL_KEYS = { Low: 'low', Moderate: 'moderate', High: 'high' };

function normalizeMood(mood) {
  if (!mood) return 'Happy';
  if (LEGACY_MOOD_MAP[mood]) return LEGACY_MOOD_MAP[mood];
  return MOOD_OPTIONS.some((o) => o.id === mood) ? mood : 'Happy';
}

function MoodFields({ initialRaw, submitting, isEdit, onSubmit }) {
  const { t: tr } = useI18n();
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
        <label style={label}>{tr('logEntryForm.mood.mood')}</label>
        <div
          className="db-log-mood-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 8 }}
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
                  padding: '10px 6px',
                  borderRadius: 12,
                  border: `1.5px solid ${active ? t.forest : t.lineStrong}`,
                  background: active ? t.surfaceSunken : t.surface,
                  color: active ? t.forest : t.inkSoft,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  minHeight: 72,
                  minWidth: 0,
                }}
              >
                <Icon size={22} strokeWidth={1.75} aria-hidden />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 650,
                    color: t.ink,
                    textAlign: 'center',
                    lineHeight: 1.25,
                    wordBreak: 'break-word',
                  }}
                >
                  {tr(`logEntryForm.mood.moods.${opt.key}`, opt.id)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label style={label}>{tr('logEntryForm.mood.stressLevel')}</label>
        <div className="db-log-stress-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          {STRESS_LEVELS.map((level) => {
            const active = form.stressLevel === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setForm({ ...form, stressLevel: level })}
                style={{
                  padding: '12px 8px',
                  borderRadius: 10,
                  border: `1.5px solid ${active ? t.forest : t.lineStrong}`,
                  background: active ? t.surfaceSunken : t.surface,
                  color: t.ink,
                  fontWeight: 650,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: t.fontBody,
                  minHeight: 44,
                }}
              >
                {tr(`logEntryForm.mood.stress.${STRESS_LEVEL_KEYS[level]}`, level)}
              </button>
            );
          })}
        </div>
      </div>

      <DateTimeFields value={form.timestamp} onChange={(timestamp) => setForm({ ...form, timestamp })} tr={tr} />

      <Field title={tr('logEntryForm.common.notesOptional')}>
        <textarea
          rows={3}
          maxLength={1000}
          value={form.journalEntry}
          onChange={(e) => setForm({ ...form, journalEntry: e.target.value })}
          style={{ ...field, resize: 'vertical' }}
          placeholder={tr('logEntryForm.mood.notesPlaceholder')}
        />
      </Field>

      <Submit submitting={submitting} isEdit={isEdit} tr={tr} label={tr('logEntryForm.common.saveMood')} editLabel={tr('logEntryForm.common.updateMood')} />
    </form>
  );
}
