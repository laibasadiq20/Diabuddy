import React, { useMemo, useState } from 'react';
import { theme as t } from '../../../theme';
import { fieldStyle, labelStyle, resultPanel, eyebrow, ResultBadge } from '../toolboxStyles';
import { useI18n } from '../../../i18n/I18nContext';

export default function CarbTool() {
  const { t: tr } = useI18n();
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [carbsPerServing, setCarbsPerServing] = useState('15');
  const [dailyAllowance, setDailyAllowance] = useState('180');
  const [entries, setEntries] = useState([]);

  const totalCarbs = useMemo(
    () => entries.reduce((sum, e) => sum + e.carbs, 0),
    [entries],
  );

  const remaining = useMemo(() => {
    const allow = parseFloat(dailyAllowance);
    if (!allow && allow !== 0) return null;
    return +(allow - totalCarbs).toFixed(1);
  }, [dailyAllowance, totalCarbs]);

  const addEntry = () => {
    const qty = parseFloat(quantity);
    const per = parseFloat(carbsPerServing);
    if (!qty || qty <= 0 || !per || per < 0) return;
    const carbs = +(qty * per).toFixed(1);
    setEntries((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: foodName.trim() || tr('toolboxTools.carb.defaultFoodName'),
        qty,
        carbs,
      },
    ]);
    setFoodName('');
    setQuantity('1');
  };

  const removeEntry = (id) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const remainingTone =
    remaining == null ? t.inkSoft
      : remaining < 0 ? t.clay
        : remaining < 30 ? t.gold
          : t.sageDeep;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ margin: 0, fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
        {tr('toolboxTools.carb.intro')}
      </p>

      <div>
        <label style={labelStyle}>{tr('toolboxTools.carb.dailyAllowance')}</label>
        <input type="number" min="0" value={dailyAllowance} onChange={(e) => setDailyAllowance(e.target.value)} style={fieldStyle} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.7fr 0.9fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>{tr('toolboxTools.carb.food')}</label>
          <input type="text" placeholder={tr('toolboxTools.carb.foodPlaceholder')} value={foodName} onChange={(e) => setFoodName(e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>{tr('toolboxTools.carb.qty')}</label>
          <input type="number" min="0.1" step="0.1" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>{tr('toolboxTools.carb.carbsG')}</label>
          <input type="number" min="0" step="0.1" value={carbsPerServing} onChange={(e) => setCarbsPerServing(e.target.value)} style={fieldStyle} />
        </div>
      </div>

      <button
        type="button"
        onClick={addEntry}
        style={{
          alignSelf: 'flex-start',
          padding: '10px 16px',
          borderRadius: 12,
          border: 'none',
          background: t.forest,
          color: '#FFF',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: t.fontBody,
        }}
      >
        {tr('toolboxTools.carb.addToList')}
      </button>

      {entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map((e) => (
            <div
              key={e.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 12,
                background: t.surface,
                border: `1px solid ${t.line}`,
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: t.ink }}>{e.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: t.inkFaint }}>× {e.qty}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: t.ink }}>{e.carbs} g</span>
                <button
                  type="button"
                  onClick={() => removeEntry(e.id)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: t.inkFaint,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: t.fontBody,
                  }}
                >
                  {tr('toolboxTools.carb.remove')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={resultPanel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={eyebrow}>{tr('toolboxTools.carb.totalCarbs')}</p>
            <p style={{ margin: '4px 0 0', fontFamily: t.fontDisplay, fontSize: 32, color: t.ink, fontWeight: 600 }}>
              {totalCarbs}
              <span style={{ fontSize: 14, fontFamily: t.fontBody, fontWeight: 500, color: t.inkFaint, marginLeft: 6 }}>g</span>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={eyebrow}>{tr('toolboxTools.carb.remaining')}</p>
            <p style={{ margin: '4px 0 0', fontFamily: t.fontDisplay, fontSize: 32, color: remainingTone, fontWeight: 600 }}>
              {remaining == null ? '—' : remaining}
              <span style={{ fontSize: 14, fontFamily: t.fontBody, fontWeight: 500, color: t.inkFaint, marginLeft: 6 }}>g</span>
            </p>
            {remaining != null && remaining < 0 && (
              <div style={{ marginTop: 8 }}>
                <ResultBadge label={tr('toolboxTools.carb.overAllowance')} color={t.clay} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
