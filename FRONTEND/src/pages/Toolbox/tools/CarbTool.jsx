import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Utensils, X } from 'lucide-react';
import { theme as t } from '../../../theme';
import { fieldStyle, labelStyle, eyebrow } from '../toolboxStyles';
import { useI18n } from '../../../i18n/I18nContext';
import api from '../../../config/axios';
import { saveMealNutritionPrefill } from '../../../utils/mealNutritionPrefill';

function rowId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function macroHint(food, tr) {
  if (!food) return '';
  const carbs = Number(food.carbs_g) || 0;
  const basis =
    food.serving_basis === 'per_100g'
      ? tr('toolboxTools.carb.per100g')
      : tr('toolboxTools.carb.perServing');
  return `~${carbs} g ${tr('toolboxTools.carb.carbs')} / ${basis}`;
}

export default function CarbTool() {
  const { t: tr } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [plate, setPlate] = useState([]); // { id, food, weightG }
  const [oilG, setOilG] = useState('');
  const [result, setResult] = useState(null);
  const [calcError, setCalcError] = useState('');
  const [calculating, setCalculating] = useState(false);
  const searchTimer = useRef(null);
  const weightRefs = useRef({});

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const runSearch = (value) => {
    setQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);

    const q = value.trim();
    if (!q) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/meals/foods', { params: { q, limit: 20 } });
        setResults(data?.data?.foods || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 260);
  };

  const addToPlate = (food) => {
    const id = rowId();
    setPlate((list) => [...list, { id, food, weightG: '' }]);
    setQuery('');
    setResults([]);
    requestAnimationFrame(() => {
      weightRefs.current[id]?.focus();
    });
  };

  const updateWeight = (id, weightG) => {
    setPlate((list) => list.map((row) => (row.id === id ? { ...row, weightG } : row)));
  };

  const removeFromPlate = (id) => {
    setPlate((list) => list.filter((row) => row.id !== id));
  };

  const ready = plate.filter(
    (row) => row.food?.id && Number.isFinite(Number(row.weightG)) && Number(row.weightG) > 0
  );

  useEffect(() => {
    if (!ready.length) {
      setResult(null);
      setCalcError('');
      return undefined;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setCalculating(true);
      setCalcError('');
      try {
        const oil = Number(oilG);
        const { data } = await api.post(
          '/meals/calculate',
          {
            oilG: Number.isFinite(oil) && oil > 0 ? oil : 0,
            ingredients: ready.map((row) => ({
              foodId: row.food.id,
              name: row.food.name,
              weightG: Number(row.weightG),
            })),
          },
          { signal: controller.signal }
        );
        setResult(data?.data?.nutrition || null);
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        setResult(null);
        setCalcError(err?.response?.data?.message || tr('toolboxTools.carb.calcFailed'));
      } finally {
        setCalculating(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oilG, plate.map((r) => `${r.food?.id}:${r.weightG}`).join('|')]);

  const showResults = query.trim().length > 0;

  const fillMealLog = () => {
    if (!result || !ready.length) return;
    const foodItems = ready.map((row) => row.food.name).join(', ');
    saveMealNutritionPrefill({
      foodItems,
      carbohydrates: result.carbohydrates,
      protein: result.protein,
      fat: result.fat,
      calories: result.calories,
    });
    navigate('/logs/meal');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Concept steps */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}
      >
        {[
          { n: '1', label: tr('toolboxTools.carb.stepSearch') },
          { n: '2', label: tr('toolboxTools.carb.stepWeigh') },
          { n: '3', label: tr('toolboxTools.carb.stepTotals') },
        ].map((step) => (
          <div
            key={step.n}
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              background: t.sageTint,
              border: `1px solid ${t.sageSoft}`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: t.sageDeep,
              }}
            >
              {step.n}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: t.inkSoft, lineHeight: 1.35 }}>
              {step.label}
            </p>
          </div>
        ))}
      </div>

      {/* 1. Search */}
      <div>
        <label style={labelStyle}>{tr('toolboxTools.carb.searchFood')}</label>
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            color={t.inkFaint}
            style={{ position: 'absolute', left: 14, top: 14, zIndex: 1 }}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => runSearch(e.target.value)}
            style={{ ...fieldStyle, paddingLeft: 40 }}
            placeholder={tr('toolboxTools.carb.searchPlaceholder')}
            aria-label={tr('toolboxTools.carb.searchFood')}
            autoComplete="off"
          />
        </div>

        {showResults && (
          <div
            style={{
              marginTop: 8,
              borderRadius: 14,
              border: `1px solid ${t.line}`,
              overflow: 'hidden',
              maxHeight: 260,
              overflowY: 'auto',
              background: t.surface,
              boxShadow: t.shadowCard,
            }}
          >
            {searching && (
              <p style={{ margin: 0, padding: '14px 16px', fontSize: 13, color: t.inkFaint }}>
                {tr('toolboxTools.carb.searching')}
              </p>
            )}
            {!searching && !results.length && (
              <p style={{ margin: 0, padding: '14px 16px', fontSize: 13, color: t.inkFaint }}>
                {tr('toolboxTools.carb.noFoodsFound')}
              </p>
            )}
            {!searching &&
              results.map((food, i) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => addToPlate(food)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 14px',
                    border: 'none',
                    borderBottom: i < results.length - 1 ? `1px solid ${t.line}` : 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontFamily: t.fontBody,
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      display: 'grid',
                      placeItems: 'center',
                      background: t.sageTint,
                      color: t.sageDeep,
                    }}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        display: 'block',
                        fontWeight: 650,
                        fontSize: 14,
                        color: t.ink,
                      }}
                    >
                      {food.name}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 12,
                        color: t.inkFaint,
                        marginTop: 2,
                      }}
                    >
                      {macroHint(food, tr)}
                    </span>
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* 2. Plate */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 10,
          }}
        >
          <Utensils size={16} color={t.sageDeep} />
          <p style={{ ...eyebrow, margin: 0 }}>{tr('toolboxTools.carb.yourPlate')}</p>
        </div>

        {!plate.length ? (
          <div
            style={{
              padding: '22px 16px',
              borderRadius: 14,
              border: `1.5px dashed ${t.lineStrong}`,
              background: t.surfaceSunken,
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: 14, color: t.inkSoft, lineHeight: 1.45 }}>
              {tr('toolboxTools.carb.plateEmpty')}
            </p>
          </div>
        ) : (
          <div
            style={{
              borderRadius: 16,
              border: `1px solid ${t.line}`,
              background: t.surface,
              overflow: 'hidden',
            }}
          >
            {plate.map((row) => (
              <div
                key={row.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  borderBottom: `1px solid ${t.line}`,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 650,
                    color: t.ink,
                    lineHeight: 1.35,
                    minWidth: 0,
                  }}
                >
                  {row.food.name}
                </p>

                <div style={{ position: 'relative', width: 88 }}>
                  <input
                    ref={(el) => {
                      weightRefs.current[row.id] = el;
                    }}
                    type="number"
                    min="1"
                    step="1"
                    inputMode="decimal"
                    value={row.weightG}
                    onChange={(e) => updateWeight(row.id, e.target.value)}
                    style={{
                      ...fieldStyle,
                      padding: '10px 28px 10px 10px',
                      textAlign: 'right',
                      fontWeight: 650,
                    }}
                    placeholder="0"
                    aria-label={`${row.food.name} ${tr('toolboxTools.carb.portion')}`}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 12,
                      fontWeight: 700,
                      color: t.inkFaint,
                    }}
                  >
                    g
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromPlate(row.id)}
                  aria-label={tr('toolboxTools.carb.removeFood')}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: 'none',
                    background: 'transparent',
                    color: t.inkFaint,
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {/* Oil row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                background: t.surfaceSunken,
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 650, color: t.inkSoft }}>
                  {tr('toolboxTools.carb.oilShort')}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: t.inkFaint }}>
                  {tr('toolboxTools.carb.oilHint')}
                </p>
              </div>
              <div style={{ position: 'relative', width: 88 }}>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  inputMode="decimal"
                  value={oilG}
                  onChange={(e) => setOilG(e.target.value)}
                  style={{
                    ...fieldStyle,
                    padding: '10px 28px 10px 10px',
                    textAlign: 'right',
                    fontWeight: 650,
                    background: t.surface,
                  }}
                  placeholder="0"
                  aria-label={tr('toolboxTools.carb.addedOil')}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 12,
                    fontWeight: 700,
                    color: t.inkFaint,
                  }}
                >
                  g
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Totals */}
      <div>
        <p style={{ ...eyebrow, marginBottom: 10 }}>{tr('toolboxTools.carb.resultTitle')}</p>

        {calcError && (
          <p style={{ margin: '0 0 10px', fontSize: 13, color: t.clay, lineHeight: 1.45 }}>
            {calcError}
          </p>
        )}

        {result ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
            }}
          >
            {[
              { key: 'carbohydrates', label: tr('toolboxTools.carb.carbs'), unit: 'g' },
              { key: 'protein', label: tr('toolboxTools.carb.protein'), unit: 'g' },
              { key: 'fat', label: tr('toolboxTools.carb.fat'), unit: 'g' },
              { key: 'calories', label: tr('toolboxTools.carb.calories'), unit: '' },
            ].map((item) => (
              <div
                key={item.key}
                style={{
                  padding: '14px 10px',
                  borderRadius: 14,
                  background: t.surfaceSunken,
                  border: `1px solid ${t.line}`,
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: t.inkFaint,
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    margin: '6px 0 0',
                    fontFamily: t.fontDisplay,
                    fontSize: 22,
                    fontWeight: 600,
                    color: t.ink,
                    lineHeight: 1.1,
                  }}
                >
                  {result[item.key]}
                  {item.unit ? (
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: t.fontBody,
                        fontWeight: 500,
                        color: t.inkFaint,
                        marginLeft: 2,
                      }}
                    >
                      {item.unit}
                    </span>
                  ) : null}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 13, color: t.inkFaint, lineHeight: 1.45 }}>
            {calculating
              ? tr('toolboxTools.carb.calculating')
              : tr('toolboxTools.carb.emptyHint')}
          </p>
        )}

        {result && (
          <button
            type="button"
            onClick={fillMealLog}
            style={{
              marginTop: 14,
              width: '100%',
              padding: '14px 16px',
              borderRadius: 12,
              border: 'none',
              background: t.forest,
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: t.fontBody,
            }}
          >
            {tr('toolboxTools.carb.fillMealLog')}
          </button>
        )}
      </div>
    </div>
  );
}
