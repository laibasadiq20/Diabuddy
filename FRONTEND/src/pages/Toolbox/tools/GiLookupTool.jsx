import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { theme as t } from '../../../theme';
import { fieldStyle } from '../toolboxStyles';
import { GI_FOODS } from '../data/pakistaniGiFoods';

const ZONE = {
  low: { label: 'Low', color: t.sageDeep, bg: t.sageTint, hint: 'Raises blood sugar more slowly' },
  medium: { label: 'Medium', color: t.gold, bg: t.goldTint, hint: 'Moderate rise — watch portion size' },
  high: { label: 'High', color: t.clay, bg: t.clayTint, hint: 'Faster rise — prefer a lower-GI swap' },
};

function GiScale({ gi, color }) {
  const pct = Math.min(100, Math.max(0, (gi / 100) * 100));
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ height: 6, borderRadius: 999, background: t.surfaceSunken, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: color }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, fontWeight: 600, color: t.inkFaint }}>
        <span>0 Low</span>
        <span>55</span>
        <span>70</span>
        <span>100 High</span>
      </div>
    </div>
  );
}

export default function GiLookupTool() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GI_FOODS.filter((f) => {
      const matchQ = !q || f.name.toLowerCase().includes(q);
      const matchF = filter === 'all' || f.category === filter;
      return matchQ && matchF;
    });
  }, [query, filter]);

  const chip = (id, label) => {
    const active = filter === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => setFilter(id)}
        style={{
          padding: '7px 12px',
          borderRadius: 999,
          border: `1.5px solid ${active ? t.forest : t.lineStrong}`,
          background: active ? t.forest : '#FFF',
          color: active ? '#FFF' : t.inkSoft,
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: t.fontBody,
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ margin: 0, fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
        Glycemic index (GI) ranks how quickly a food raises blood sugar. Lower is gentler.
      </p>

      <div style={{ position: 'relative' }}>
        <Search size={16} color={t.inkFaint} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="search"
          placeholder="Search foods — roti, daal, mango…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ ...fieldStyle, paddingLeft: 40 }}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {chip('all', 'All')}
        {chip('low', 'Low ≤55')}
        {chip('medium', 'Medium')}
        {chip('high', 'High ≥70')}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 440, overflowY: 'auto' }}>
        {results.length === 0 && (
          <p style={{ margin: 0, fontSize: 13, color: t.inkFaint }}>No foods match that search.</p>
        )}
        {results.map((food) => {
          const zone = ZONE[food.category];
          const showSwap = food.category !== 'low' && food.alternatives?.length > 0;

          return (
            <div
              key={food.name}
              style={{
                padding: 16,
                borderRadius: 16,
                background: '#FFF',
                border: `1px solid ${t.line}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.ink, lineHeight: 1.35 }}>
                    {food.name}
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: t.inkFaint }}>{zone.hint}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 28, fontWeight: 600, color: t.ink, lineHeight: 1 }}>
                    {food.gi}
                  </p>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: 6,
                      padding: '3px 9px',
                      borderRadius: 999,
                      background: zone.bg,
                      color: zone.color,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {zone.label} GI
                  </span>
                </div>
              </div>

              <GiScale gi={food.gi} color={zone.color} />

              {food.category === 'low' && (
                <p style={{ margin: '12px 0 0', fontSize: 12, color: t.sageDeep, fontWeight: 600 }}>
                  Good choice for steadier glucose
                </p>
              )}

              {showSwap && (
                <div
                  style={{
                    marginTop: 12,
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: t.surfaceSunken,
                  }}
                >
                  <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.inkFaint }}>
                    Lower-GI swap
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {food.alternatives.map((alt) => (
                      <button
                        key={alt}
                        type="button"
                        onClick={() => {
                          setQuery(alt);
                          setFilter('all');
                        }}
                        style={{
                          padding: '5px 10px',
                          borderRadius: 999,
                          border: `1px solid ${t.lineStrong}`,
                          background: '#FFF',
                          color: t.inkSoft,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: t.fontBody,
                        }}
                      >
                        {alt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
