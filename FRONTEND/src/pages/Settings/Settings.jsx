import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { useI18n } from '../../i18n/I18nContext';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';
import { fromMgdl, mmolToMgdl, glucoseUnitLabel } from '../../utils/glucoseUnits';
import {
  formatGoalHint,
  litersToMl,
  mlToLiters,
  mlToUsFlOz,
  round0,
  round1,
  usFlOzToMl,
} from '../../utils/waterUnits';
import { resolveHeightUnit, resolveWeightUnit } from '../../utils/bodyUnits';
import AppSidebar from '../../components/AppSidebar';
import ThemedSelect from '../../components/ThemedSelect';
import {
  CheckCircle2,
  Clock,
  Droplet,
  Footprints,
  GlassWater,
  Languages,
  Moon,
  Sun,
  Target,
} from 'lucide-react';
import {
  DEFAULT_TIMEZONE,
  TIMEZONE_OPTIONS,
  resolveTimezone,
} from '../../utils/timezone';

const t = theme;

const DEFAULT_RANGES_MGDL = {
  fastingMin: 70,
  fastingMax: 100,
  postMealMin: 70,
  postMealMax: 140,
};

function rangesToDisplay(rangesMgdl, unit) {
  const src = rangesMgdl || DEFAULT_RANGES_MGDL;
  return {
    fastingMin: fromMgdl(src.fastingMin ?? 70, unit),
    fastingMax: fromMgdl(src.fastingMax ?? 100, unit),
    postMealMin: fromMgdl(src.postMealMin ?? 70, unit),
    postMealMax: fromMgdl(src.postMealMax ?? 140, unit),
  };
}

function rangesToMgdl(display, unit) {
  const toStore = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return unit === 'mmol/L' ? mmolToMgdl(n) : Math.round(n);
  };
  return {
    fastingMin: toStore(display.fastingMin),
    fastingMax: toStore(display.fastingMax),
    postMealMin: toStore(display.postMealMin),
    postMealMax: toStore(display.postMealMax),
  };
}

export default function Settings() {
  const { user, setUser, authHeaders } = useAuth();
  const { mode, setMode } = useThemeMode();
  const { lang, setLang, t: tr } = useI18n();
  const [glucoseUnit, setGlucoseUnit] = useState('mg/dL');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [ranges, setRanges] = useState(rangesToDisplay(DEFAULT_RANGES_MGDL, 'mg/dL'));
  const [waterLiters, setWaterLiters] = useState('2');
  const [waterOz, setWaterOz] = useState('68');
  const [steps, setSteps] = useState(8000);
  const [savingKey, setSavingKey] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const unit = user.glucoseUnit || 'mg/dL';
    setGlucoseUnit(unit);
    setWeightUnit(resolveWeightUnit(user));
    setHeightUnit(resolveHeightUnit(user));
    setTimezone(resolveTimezone(user));
    setRanges(rangesToDisplay(user.targetRanges, unit));
    const ml = user.dailyGoals?.waterMl ?? 2000;
    setWaterLiters(String(round1(mlToLiters(ml))));
    setWaterOz(String(round0(mlToUsFlOz(ml))));
    setSteps(user.dailyGoals?.steps ?? 8000);
  }, [user]);

  const saveProfile = async (payload, key, successMessage) => {
    setMessage('');
    setError('');
    setSavingKey(key);
    // Apply immediately so toolbox / other pages switch units without waiting.
    if (user) setUser({ ...user, ...payload });
    try {
      const body = { ...payload };
      if (payload.timezone !== undefined) {
        body.tzOffset = new Date().getTimezoneOffset();
      }
      const res = await fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.data) {
        setError(data.message || tr('settings.saveError'));
        return false;
      }
      // Merge server user with the fields we just saved (never lose unit prefs).
      setUser({ ...user, ...data.data, ...payload });
      setMessage(successMessage || tr('settings.saved'));
      return true;
    } catch (_) {
      setError(tr('settings.saveError'));
      return false;
    } finally {
      setSavingKey('');
    }
  };

  const handleGlucoseUnitChange = async (next) => {
    const prev = glucoseUnit;
    setGlucoseUnit(next);
    const asMgdl = rangesToMgdl(ranges, prev);
    setRanges(rangesToDisplay(asMgdl, next));
    const ok = await saveProfile({ glucoseUnit: next }, 'unit');
    if (!ok) {
      setGlucoseUnit(prev);
      setRanges(rangesToDisplay(rangesToMgdl(ranges, next), prev));
      if (user) setUser({ ...user, glucoseUnit: prev });
    }
  };

  const handleWeightUnitChange = async (next) => {
    const prev = weightUnit;
    setWeightUnit(next);
    const ok = await saveProfile({ weightUnit: next }, 'weightUnit');
    if (!ok) {
      setWeightUnit(prev);
      if (user) setUser({ ...user, weightUnit: prev });
    }
  };

  const handleHeightUnitChange = async (next) => {
    const prev = heightUnit;
    setHeightUnit(next);
    const ok = await saveProfile({ heightUnit: next }, 'heightUnit');
    if (!ok) {
      setHeightUnit(prev);
      if (user) setUser({ ...user, heightUnit: prev });
    }
  };

  const handleTimezoneChange = async (next) => {
    const prev = timezone;
    setTimezone(next);
    const ok = await saveProfile({ timezone: next }, 'timezone', tr('settings.timezoneUpdated'));
    if (!ok) {
      setTimezone(prev);
      if (user) setUser({ ...user, timezone: prev });
    }
  };

  const handleSaveRanges = async (e) => {
    e.preventDefault();
    const asMgdl = rangesToMgdl(ranges, glucoseUnit);
    if (Object.values(asMgdl).some((n) => n == null)) {
      setError(tr('settings.rangesInvalid'));
      return;
    }
    await saveProfile({ targetRanges: asMgdl }, 'ranges');
  };

  const handleSaveGoals = async (e) => {
    e.preventDefault();
    // Prefer liters if set; otherwise US oz. Persist as ml.
    const fromL = litersToMl(waterLiters);
    const fromOz = usFlOzToMl(waterOz);
    const waterMl = Math.round(fromL > 0 ? fromL : fromOz);
    await saveProfile(
      {
        dailyGoals: {
          waterMl,
          steps: Number(steps),
        },
      },
      'goals'
    );
  };

  const syncGoalFromLiters = (litersStr) => {
    setWaterLiters(litersStr);
    const ml = litersToMl(litersStr);
    if (Number.isFinite(ml) && ml > 0) setWaterOz(String(round0(mlToUsFlOz(ml))));
  };

  const syncGoalFromOz = (ozStr) => {
    setWaterOz(ozStr);
    const ml = usFlOzToMl(ozStr);
    if (Number.isFinite(ml) && ml > 0) setWaterLiters(String(round1(mlToLiters(ml))));
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: t.inkSoft,
    marginBottom: 6,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px',
    borderRadius: 12,
    border: `1.5px solid ${t.lineStrong}`,
    background: t.surface,
    color: t.ink,
    fontSize: 14,
    fontFamily: t.fontBody,
    outline: 'none',
  };

  const segmentBtnStyle = (active) => ({
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '11px 14px',
    borderRadius: 10,
    border: active ? `1.5px solid ${t.forest}` : `1.5px solid ${t.lineStrong}`,
    background: active ? t.forest : t.surface,
    color: active ? '#FFF' : t.inkSoft,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: t.fontBody,
    transition: 'background 0.15s, color 0.15s, border-color 0.15s',
  });

  const cardStyle = {
    background: t.surface,
    border: `1.5px solid ${t.lineStrong}`,
    borderRadius: 20,
    padding: '28px',
    boxShadow: t.shadowCard,
    marginBottom: 20,
  };

  const cardTitleStyle = {
    margin: '0 0 18px',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: t.forest,
  };

  const saveBtnStyle = {
    marginTop: 16,
    border: 'none',
    background: t.forest,
    color: '#FFF',
    borderRadius: 12,
    padding: '12px 22px',
    fontSize: 13.5,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: t.fontBody,
    transition: 'opacity 0.15s ease, transform 0.1s ease',
  };

  const unitLabel = glucoseUnitLabel(glucoseUnit);
  const rangeStep = glucoseUnit === 'mmol/L' ? 0.1 : 1;

  const rangeField = (key, label) => (
    <div style={{ minWidth: 0 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type="number"
        step={rangeStep}
        min={glucoseUnit === 'mmol/L' ? 2 : 40}
        max={glucoseUnit === 'mmol/L' ? 22 : 400}
        value={ranges[key] ?? ''}
        onChange={(e) => setRanges((prev) => ({ ...prev, [key]: e.target.value }))}
        style={fieldStyle}
      />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: t.bg, fontFamily: t.fontBody }}>
      <AppSidebar />

      <main className="db-settings-main">
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(24px, 5vw, 30px)', color: t.ink, fontWeight: 500 }}>
              {tr('settings.heading')}
            </h1>
            <p style={{ margin: '4px 0 0', color: t.inkSoft, fontSize: 14 }}>
              {tr('settings.subheading')}
            </p>
          </div>

          {(message || error) && (
            <p
              style={{
                margin: '0 0 16px',
                color: error ? t.clayDeep : t.sageDeep,
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <CheckCircle2 size={15} /> {error || message}
            </p>
          )}

          <div className="db-account-card" style={cardStyle}>
            <p style={cardTitleStyle}>{tr('settings.appearance')}</p>
            <label style={labelStyle}>
              {mode === 'dark' ? <Moon size={12} style={{ marginRight: 5 }} /> : <Sun size={12} style={{ marginRight: 5 }} />}
              {tr('settings.appearance')}
            </label>
            <p style={{ margin: '0 0 10px', fontSize: 12, color: t.inkFaint }}>{tr('settings.appearanceHint')}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" style={segmentBtnStyle(mode === 'light')} onClick={() => setMode('light')}>
                <Sun size={15} /> {tr('settings.light')}
              </button>
              <button type="button" style={segmentBtnStyle(mode === 'dark')} onClick={() => setMode('dark')}>
                <Moon size={15} /> {tr('settings.dark')}
              </button>
            </div>
          </div>

          <div className="db-account-card" style={cardStyle}>
            <p style={cardTitleStyle}>{tr('settings.language')}</p>
            <label style={labelStyle}>
              <Languages size={12} style={{ marginRight: 5 }} />
              {tr('settings.language')}
            </label>
            <p style={{ margin: '0 0 10px', fontSize: 12, color: t.inkFaint }}>{tr('settings.languageHint')}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" style={segmentBtnStyle(lang === 'en')} onClick={() => setLang('en')}>
                {tr('settings.english')}
              </button>
              <button
                type="button"
                style={{ ...segmentBtnStyle(lang === 'ur'), fontFamily: "'Noto Nastaliq Urdu', 'Noto Sans Arabic', sans-serif" }}
                onClick={() => setLang('ur')}
              >
                {tr('settings.urdu')}
              </button>
            </div>
          </div>

          <div className="db-account-card" style={cardStyle}>
            <p style={cardTitleStyle}>{tr('settings.timezone')}</p>
            <label style={labelStyle}>
              <Clock size={12} style={{ marginRight: 5 }} />
              {tr('settings.timezone')}
            </label>
            <p style={{ margin: '0 0 10px', fontSize: 12, color: t.inkFaint }}>{tr('settings.timezoneHint')}</p>
            <ThemedSelect
              className="db-settings-select"
              style={{ maxWidth: 420 }}
              value={timezone}
              onChange={handleTimezoneChange}
              disabled={savingKey === 'timezone'}
              options={TIMEZONE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
            />
          </div>

          <div className="db-account-card" style={cardStyle}>
            <p style={cardTitleStyle}>{tr('settings.units')}</p>

            <label style={labelStyle}>
              <Droplet size={12} style={{ marginRight: 5 }} />
              {tr('settings.glucoseUnit')}
            </label>
            <p style={{ margin: '0 0 10px', fontSize: 12, color: t.inkFaint }}>{tr('settings.glucoseUnitHint')}</p>
            <ThemedSelect
              className="db-settings-select"
              style={{ maxWidth: 240, marginBottom: 18 }}
              value={glucoseUnit}
              onChange={handleGlucoseUnitChange}
              disabled={savingKey === 'unit'}
              options={[
                { value: 'mg/dL', label: 'mg/dL' },
                { value: 'mmol/L', label: 'mmol/L' },
              ]}
            />

            <label style={labelStyle}>{tr('settings.weightUnit')}</label>
            <p style={{ margin: '0 0 10px', fontSize: 12, color: t.inkFaint }}>{tr('settings.weightUnitHint')}</p>
            <ThemedSelect
              className="db-settings-select"
              style={{ maxWidth: 240, marginBottom: 18 }}
              value={weightUnit}
              onChange={handleWeightUnitChange}
              disabled={savingKey === 'weightUnit'}
              options={[
                { value: 'kg', label: tr('settings.unitKg') },
                { value: 'lbs', label: tr('settings.unitLbs') },
              ]}
            />

            <label style={labelStyle}>{tr('settings.heightUnit')}</label>
            <p style={{ margin: '0 0 10px', fontSize: 12, color: t.inkFaint }}>{tr('settings.heightUnitHint')}</p>
            <ThemedSelect
              className="db-settings-select"
              style={{ maxWidth: 240 }}
              value={heightUnit}
              onChange={handleHeightUnitChange}
              disabled={savingKey === 'heightUnit'}
              options={[
                { value: 'cm', label: tr('settings.unitCm') },
                { value: 'ft_in', label: tr('settings.unitFtIn') },
              ]}
            />
          </div>

          <form className="db-account-card" style={cardStyle} onSubmit={handleSaveRanges}>
            <p style={cardTitleStyle}>{tr('settings.targetRanges')}</p>
            <label style={labelStyle}>
              <Target size={12} style={{ marginRight: 5 }} />
              {tr('settings.targetRanges')}
            </label>
            <p style={{ margin: '0 0 14px', fontSize: 12, color: t.inkFaint }}>
              {tr('settings.targetRangesHint').replace('{unit}', unitLabel)}
            </p>

            <p style={{ ...labelStyle, marginBottom: 10 }}>{tr('settings.fastingRange')}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {rangeField('fastingMin', tr('settings.min'))}
              {rangeField('fastingMax', tr('settings.max'))}
            </div>

            <p style={{ ...labelStyle, marginBottom: 10 }}>{tr('settings.postMealRange')}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {rangeField('postMealMin', tr('settings.min'))}
              {rangeField('postMealMax', tr('settings.max'))}
            </div>

            <button type="submit" className="db-settings-save-btn" style={saveBtnStyle} disabled={savingKey === 'ranges'}>
              {savingKey === 'ranges' ? tr('settings.saving') : tr('settings.saveRanges')}
            </button>
          </form>

          <form className="db-account-card" style={cardStyle} onSubmit={handleSaveGoals}>
            <p style={cardTitleStyle}>{tr('settings.dailyGoals')}</p>
            <p style={{ margin: '0 0 14px', fontSize: 12, color: t.inkFaint }}>{tr('settings.dailyGoalsHint')}</p>

            <label style={labelStyle}>
              <GlassWater size={12} style={{ marginRight: 5 }} />
              {tr('settings.waterGoalLiters')} / {tr('settings.waterGoalOz')}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <input
                  type="number"
                  min={0.25}
                  max={10}
                  step={0.1}
                  placeholder="Liters (L)"
                  value={waterLiters}
                  onChange={(e) => syncGoalFromLiters(e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <input
                  type="number"
                  min={8}
                  max={340}
                  step={1}
                  placeholder="fl oz"
                  value={waterOz}
                  onChange={(e) => syncGoalFromOz(e.target.value)}
                  style={fieldStyle}
                />
              </div>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 11.5, color: t.inkFaint }}>
              {formatGoalHint(litersToMl(waterLiters) || usFlOzToMl(waterOz))}
            </p>
            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>
                <Footprints size={12} style={{ marginRight: 5 }} />
                {tr('settings.stepsGoal')}
              </label>
              <input
                type="number"
                min={500}
                max={50000}
                step={500}
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                style={fieldStyle}
              />
              <p style={{ margin: '6px 0 0', fontSize: 11, color: t.inkFaint }}>{tr('settings.stepsGoalUnit')}</p>
            </div>

            <button type="submit" className="db-settings-save-btn" style={saveBtnStyle} disabled={savingKey === 'goals'}>
              {savingKey === 'goals' ? tr('settings.saving') : tr('settings.saveGoals')}
            </button>
          </form>
        </div>
      </main>

      <style>{`
        .db-settings-main {
          flex: 1;
          min-width: 0;
          padding: 32px 28px 64px;
        }
        .db-settings-select {
          width: 100%;
        }
        .db-settings-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .db-settings-save-btn:hover {
          opacity: 0.92;
        }
        .db-settings-save-btn:active {
          transform: scale(0.98);
        }

        @media (max-width: 640px) {
          .db-settings-main {
            padding: 20px 14px 80px !important;
          }
          .db-account-card {
            padding: 20px 16px !important;
            border-radius: 16px !important;
            margin-bottom: 14px !important;
          }
          .db-settings-grid-2 {
            grid-template-columns: 1fr !important;
          }
          .db-settings-save-btn {
            width: 100% !important;
          }
          .db-settings-select {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
