import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { theme as t } from '../../../theme';
import { fieldStyle } from '../toolboxStyles';
import { GI_FOODS } from '../data/pakistaniGiFoods';

const ZONE = {
  low: {
    label: 'Low',
    range: '≤ 55',
    color: t.sageDeep,
    bg: t.sageTint,
    meaning: 'Raises blood sugar more slowly. Prefer these when you can.',
  },
  medium: {
    label: 'Medium',
    range: '56–69',
    color: t.gold,
    bg: t.goldTint,
    meaning: 'Moderate effect. Smaller portions help.',
  },
  high: {
    label: 'High',
    range: '≥ 70',
    color: t.clay,
    bg: t.clayTint,
    meaning: 'Raises blood sugar faster. Consider a lower-GI option.',
  },
};

export default function GiLookupTool() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedName, setSelectedName] = useState(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GI_FOODS.filter((f) => {
      const matchQ = !q || f.name.toLowerCase().includes(q);
      const matchF = filter === 'all' || f.category === filter;
      return matchQ && matchF;
    });
  }, [query, filter]);

  const selected = useMemo(
    () => results.find((f) => f.name === selectedName) || results[0] || null,
    [results, selectedName],
  );

  useEffect(() => {
    if (!results.length) {
      setSelectedName(null);
      return;
    }
    if (!results.some((f) => f.name === selectedName)) {
      setSelectedName(results[0].name);
    }
  }, [results, selectedName]);

  const findFood = (label) => GI_FOODS.find((f) => f.name.toLowerCase() === label.toLowerCase()
    || f.name.toLowerCase().includes(label.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ margin: 0, fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
        Search a food to see its glycemic index (GI). Lower GI = slower rise in blood sugar.
      </p>

      {/* Legend — one place only */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}
      >
        {Object.entries(ZONE).map(([key, z]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter((prev) => (prev === key ? 'all' : key))}
            style={{
              padding: '10px 8px',
              borderRadius: 12,
              border: `1.5px solid ${filter === key ? z.color : t.line}`,
              background: filter === key ? z.bg : t.surfaceSunken,
              cursor: 'pointer',
              textAlign: 'center',
              fontFamily: t.fontBody,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: z.color }}>{z.label}</div>
            <div style={{ fontSize: 11, color: t.inkFaint, marginTop: 2 }}>{z.range}</div>
          </button>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        <Search size={16} color={t.inkFaint} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="search"
          placeholder="Type a food name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ ...fieldStyle, paddingLeft: 40 }}
        />
      </div>

      {!results.length ? (
        <p style={{ margin: 0, fontSize: 13, color: t.inkFaint }}>No foods found.</p>
      ) : (
        <>
          {/* Compact list */}
          <div
            style={{
              borderRadius: 14,
              border: `1px solid ${t.line}`,
              overflow: 'hidden',
              maxHeight: 220,
              overflowY: 'auto',
              background: '#FFF',
            }}
          >
            {results.map((food, i) => {
              const z = ZONE[food.category];
              const active = selected?.name === food.name;
              return (
                <button
                  key={food.name}
                  type="button"
                  onClick={() => setSelectedName(food.name)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    border: 'none',
                    borderBottom: i < results.length - 1 ? `1px solid ${t.line}` : 'none',
                    background: active ? z.bg : '#FFF',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: t.fontBody,
                  }}
                >
                  <span style={{ flex: 1, fontSize: 14, fontWeight: active ? 700 : 500, color: t.ink }}>
                    {food.name}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: t.ink, fontVariantNumeric: 'tabular-nums', minWidth: 28, textAlign: 'right' }}>
                    {food.gi}
                  </span>
                  <span
                    style={{
                      minWidth: 58,
                      textAlign: 'center',
                      padding: '3px 8px',
                      borderRadius: 8,
                      background: active ? '#FFF' : z.bg,
                      color: z.color,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {z.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Single detail panel */}
          {selected && (
            <div
              style={{
                padding: 16,
                borderRadius: 14,
                background: ZONE[selected.category].bg,
                border: `1px solid ${ZONE[selected.category].color}35`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.inkFaint }}>
                    Selected
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 700, color: t.ink }}>
                    {selected.name}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 32, fontWeight: 600, color: t.ink, lineHeight: 1 }}>
                    {selected.gi}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 700, color: ZONE[selected.category].color }}>
                    {ZONE[selected.category].label} GI
                  </p>
                </div>
              </div>

              <p style={{ margin: '12px 0 0', fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
                {ZONE[selected.category].meaning}
              </p>

              {selected.category === 'low' && (
                <p style={{ margin: '10px 0 0', fontSize: 13, fontWeight: 600, color: t.sageDeep }}>
                  No swap needed — this is already a lower-GI choice.
                </p>
              )}

              {selected.swap?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.inkFaint }}>
                    Try instead
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selected.swap.map((label) => {
                      const match = findFood(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          disabled={!match}
                          onClick={() => {
                            if (!match) return;
                            setQuery('');
                            setFilter('all');
                            setSelectedName(match.name);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: `1px solid ${t.lineStrong}`,
                            background: '#FFF',
                            cursor: match ? 'pointer' : 'default',
                            fontFamily: t.fontBody,
                            textAlign: 'left',
                            opacity: match ? 1 : 0.85,
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 600, color: t.ink }}>{label}</span>
                          {match ? (
                            <span style={{ fontSize: 12, fontWeight: 700, color: ZONE[match.category].color }}>
                              GI {match.gi} · {ZONE[match.category].label}
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: t.inkFaint }}>suggestion</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
