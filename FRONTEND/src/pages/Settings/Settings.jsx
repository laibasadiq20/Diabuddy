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
import AppSidebar from '../../components/AppSidebar';
import {
  CheckCircle2,
  Droplet,
  Footprints,
  GlassWater,
  Languages,
  Moon,
  Sun,
  Target,
} from 'lucide-react';

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
    setWeightUnit(user.weightUnit === 'lbs' ? 'lbs' : 'kg');
    setHeightUnit(user.heightUnit === 'ft_in' ? 'ft_in' : 'cm');
    setRanges(rangesToDisplay(user.targetRanges, unit));
    const ml = user.dailyGoals?.waterMl ?? 2000;
    setWaterLiters(String(round1(mlToLiters(ml))));
    setWaterOz(String(round0(mlToUsFlOz(ml))));
    setSteps(user.dailyGoals?.steps ?? 8000);
  }, [user]);

  const saveProfile = async (payload, key) => {
    setMessage('');
    setError('');
    setSavingKey(key);
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.data) {
        setError(data.message || tr('settings.saveError'));
        return false;
      }
      setUser(data.data);
      setMessage(tr('settings.saved'));
      return true;
    } catch (_) {
      setError(tr('settings.saveError'));
      return false;
    } finally {
      setSavingKey('');
    }
  };

  const handleGlucoseUnitChange = async (e) => {
    const next = e.target.value;
    const prev = glucoseUnit;
    setGlucoseUnit(next);
    // Re-express current fields in the new unit from stored mg/dL after save,
    // but optimistically convert what's on screen first.
    const asMgdl = rangesToMgdl(ranges, prev);
    setRanges(rangesToDisplay(asMgdl, next));
    await saveProfile({ glucoseUnit: next }, 'unit');
  };

  const handleWeightUnitChange = async (e) => {
    const next = e.target.value;
    setWeightUnit(next);
    await saveProfile({ weightUnit: next }, 'weightUnit');
  };

  const handleHeightUnitChange = async (e) => {
    const next = e.target.value;
    setHeightUnit(next);
    await saveProfile({ heightUnit: next }, 'heightUnit');
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
    padding: '11px 18px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: t.fontBody,
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

      <main style={{ flex: 1, minWidth: 0, padding: '32px 28px 64px' }}>
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
            <p style={cardTitleStyle}>{tr('settings.units')}</p>

            <label style={labelStyle}>
              <Droplet size={12} style={{ marginRight: 5 }} />
              {tr('settings.glucoseUnit')}
            </label>
            <p style={{ margin: '0 0 10px', fontSize: 12, color: t.inkFaint }}>{tr('settings.glucoseUnitHint')}</p>
            <select
              style={{ ...fieldStyle, maxWidth: 240, marginBottom: 18 }}
              value={glucoseUnit}
              onChange={handleGlucoseUnitChange}
              disabled={savingKey === 'unit'}
            >
              <option value="mg/dL">mg/dL</option>
              <option value="mmol/L">mmol/L</option>
            </select>

            <label style={labelStyle}>{tr('settings.weightUnit')}</label>
            <p style={{ margin: '0 0 10px', fontSize: 12, color: t.inkFaint }}>{tr('settings.weightUnitHint')}</p>
            <select
              style={{ ...fieldStyle, maxWidth: 240, marginBottom: 18 }}
              value={weightUnit}
              onChange={handleWeightUnitChange}
              disabled={savingKey === 'weightUnit'}
            >
              <option value="kg">{tr('settings.unitKg')}</option>
              <option value="lbs">{tr('settings.unitLbs')}</option>
            </select>

            <label style={labelStyle}>{tr('settings.heightUnit')}</label>
            <p style={{ margin: '0 0 10px', fontSize: 12, color: t.inkFaint }}>{tr('settings.heightUnitHint')}</p>
            <select
              style={{ ...fieldStyle, maxWidth: 240 }}
              value={heightUnit}
              onChange={handleHeightUnitChange}
              disabled={savingKey === 'heightUnit'}
            >
              <option value="cm">{tr('settings.unitCm')}</option>
              <option value="ft_in">{tr('settings.unitFtIn')}</option>
            </select>
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

            <button type="submit" style={saveBtnStyle} disabled={savingKey === 'ranges'}>
              {savingKey === 'ranges' ? tr('settings.saving') : tr('settings.saveRanges')}
            </button>
          </form>

          <form className="db-account-card" style={cardStyle} onSubmit={handleSaveGoals}>
            <p style={cardTitleStyle}>{tr('settings.dailyGoals')}</p>
            <p style={{ margin: '0 0 14px', fontSize: 12, color: t.inkFaint }}>{tr('settings.dailyGoalsHint')}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>
                  <GlassWater size={12} style={{ marginRight: 5 }} />
                  {tr('settings.waterGoalLiters')}
                </label>
                <input
                  type="number"
                  min={0.25}
                  max={10}
                  step={0.1}
                  value={waterLiters}
                  onChange={(e) => syncGoalFromLiters(e.target.value)}
                  style={fieldStyle}
                />
                <p style={{ margin: '6px 0 0', fontSize: 11, color: t.inkFaint }}>{tr('settings.waterGoalLitersHint')}</p>
              </div>
              <div>
                <label style={labelStyle}>
                  <GlassWater size={12} style={{ marginRight: 5 }} />
                  {tr('settings.waterGoalOz')}
                </label>
                <input
                  type="number"
                  min={8}
                  max={340}
                  step={1}
                  value={waterOz}
                  onChange={(e) => syncGoalFromOz(e.target.value)}
                  style={fieldStyle}
                />
                <p style={{ margin: '6px 0 0', fontSize: 11, color: t.inkFaint }}>{tr('settings.waterGoalOzHint')}</p>
              </div>
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 12, color: t.inkSoft }}>
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

            <button type="submit" style={saveBtnStyle} disabled={savingKey === 'goals'}>
              {savingKey === 'goals' ? tr('settings.saving') : tr('settings.saveGoals')}
            </button>
          </form>
        </div>
      </main>

      <style>{`
        @media (max-width: 640px) {
          .db-account-card { padding: 18px !important; border-radius: 18px !important; }
        }
      `}</style>
    </div>
  );
}
