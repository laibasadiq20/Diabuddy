import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { theme as t } from '../../../theme';
import { fieldStyle, resultPanel, eyebrow, ResultBadge } from '../toolboxStyles';
import { GI_FOODS, giLabel } from '../data/pakistaniGiFoods';

const CATEGORY_COLORS = {
  sage: t.sageDeep,
  gold: t.gold,
  clay: t.clay,
};

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
        Search common Pakistani foods for glycemic index (GI). Lower GI foods raise blood sugar more slowly.
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
        {chip('low', 'Low GI')}
        {chip('medium', 'Medium')}
        {chip('high', 'High')}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 420, overflowY: 'auto' }}>
        {results.length === 0 && (
          <p style={{ margin: 0, fontSize: 13, color: t.inkFaint }}>No foods match that search.</p>
        )}
        {results.map((food) => {
          const meta = giLabel(food.category);
          const color = CATEGORY_COLORS[meta.colorKey];
          return (
            <div key={food.name} style={{ ...resultPanel, background: '#FFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.ink }}>{food.name}</p>
                  <p style={{ margin: '4px 0 0', fontFamily: t.fontDisplay, fontSize: 22, color: t.ink, fontWeight: 600 }}>
                    GI {food.gi}
                  </p>
                </div>
                <ResultBadge label={meta.label} color={color} />
              </div>
              {food.alternatives?.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.line}` }}>
                  <p style={{ ...eyebrow, marginBottom: 4 }}>Better alternatives</p>
                  <p style={{ margin: 0, fontSize: 13, color: t.inkSoft, lineHeight: 1.45 }}>
                    {food.alternatives.join(' · ')}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ margin: 0, fontSize: 12, color: t.inkFaint, lineHeight: 1.45 }}>
        Low ≤55 · Medium 56–69 · High ≥70. Portion size and cooking method still matter.
      </p>
    </div>
  );
}
