import React from 'react';
import { theme } from '../../../theme';
import { Pencil, Trash2 } from 'lucide-react';

const t = theme;

const MODULES = [
  { value: '', label: 'All types' },
  { value: 'glucose', label: 'Glucose' },
  { value: 'insulin', label: 'Insulin' },
  { value: 'meal', label: 'Meal' },
  { value: 'medication', label: 'Medication' },
  { value: 'water', label: 'Water' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'weight', label: 'Weight' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'symptoms', label: 'Symptoms' },
  { value: 'mood', label: 'Mood' },
];

const colorMap = {
  red: t.clay,
  green: t.sage,
  blue: t.sky,
  orange: t.clay,
  yellow: t.gold,
  teal: t.sage,
  emerald: t.sageDeep,
  purple: t.skyDeep,
  indigo: t.skyDeep,
  gray: t.inkFaint,
};

const filterStyle = {
  padding: '10px 12px',
  borderRadius: 12,
  border: `1.5px solid ${t.line}`,
  background: t.surfaceSunken,
  fontSize: 13,
  color: t.ink,
  fontFamily: t.fontBody,
  outline: 'none',
};

export default function LogTimeline({
  logs = [],
  search,
  setSearch,
  moduleType,
  setModuleType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  sortBy,
  setSortBy,
  onEditLog,
  onDeleteLog,
}) {
  return (
    <div
      style={{
        background: '#FFF',
        border: `1.5px solid ${t.lineStrong}`,
        borderRadius: 18,
        padding: 16,
        boxShadow: t.shadowCard,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 8,
          marginBottom: 14,
        }}
      >
        <input
          type="search"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={filterStyle}
        />
        <select value={moduleType} onChange={(e) => setModuleType(e.target.value)} style={filterStyle}>
          {MODULES.map((m) => (
            <option key={m.value || 'all'} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={filterStyle} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={filterStyle} />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={filterStyle}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest_glucose">Highest glucose</option>
          <option value="lowest_glucose">Lowest glucose</option>
        </select>
      </div>

      {logs.length === 0 ? (
        <p style={{ margin: '24px 0', textAlign: 'center', color: t.inkFaint, fontSize: 14 }}>
          No log entries match these filters.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {logs.map((item) => {
            const accent = colorMap[item.color] || t.inkFaint;
            return (
              <div
                key={`${item.type}-${item._id}`}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  padding: '12px 12px',
                  borderRadius: 14,
                  border: `1.5px solid ${t.line}`,
                  background: t.surfaceRaised,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: accent,
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: t.ink }}>
                      {item.type}: {item.title}
                    </p>
                    <span style={{ fontSize: 12, color: t.inkFaint }}>
                      {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                    </span>
                  </div>
                  {item.subtitle && (
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: t.inkSoft, wordBreak: 'break-word' }}>
                      {item.subtitle}
                    </p>
                  )}
                  {item.valueStr && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 600, color: accent }}>{item.valueStr}</p>
                  )}
                  {item.notes && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: t.inkFaint }}>{item.notes}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {item.type !== 'Water' && (
                    <button
                      type="button"
                      aria-label="Edit"
                      onClick={() => onEditLog(item)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.inkFaint, padding: 4 }}
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Delete"
                    onClick={() => onDeleteLog(item.type, item._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.inkFaint, padding: 4 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
