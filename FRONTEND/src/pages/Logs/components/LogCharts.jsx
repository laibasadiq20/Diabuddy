import React from 'react';
import { theme } from '../../../theme';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const t = theme;

function ChartCard({ title, children, empty }) {
  return (
    <div
      style={{
        background: '#FFF',
        border: `1.5px solid ${t.lineStrong}`,
        borderRadius: 16,
        padding: 14,
        boxShadow: t.shadowCard,
        minHeight: 260,
      }}
    >
      <h4 style={{ margin: '0 0 10px', fontFamily: t.fontDisplay, fontSize: 16, fontWeight: 500, color: t.ink }}>
        {title}
      </h4>
      {empty ? (
        <p style={{ margin: '48px 0', textAlign: 'center', color: t.inkFaint, fontSize: 13 }}>No data yet</p>
      ) : (
        children
      )}
    </div>
  );
}

export default function LogCharts({ chartsData }) {
  const glucose = chartsData?.glucose || [];
  const water = chartsData?.water || [];
  const meals = chartsData?.meals || [];
  const exercise = chartsData?.exercise || [];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 14,
      }}
    >
      <ChartCard title="Glucose" empty={!glucose.length}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={glucose}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.line} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: t.inkFaint }} />
            <YAxis tick={{ fontSize: 11, fill: t.inkFaint }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke={t.skyDeep} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Water (ml)" empty={!water.length}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={water}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.line} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: t.inkFaint }} />
            <YAxis tick={{ fontSize: 11, fill: t.inkFaint }} />
            <Tooltip />
            <Bar dataKey="amount" fill={t.sky} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Meal carbs" empty={!meals.length}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={meals}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.line} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: t.inkFaint }} />
            <YAxis tick={{ fontSize: 11, fill: t.inkFaint }} />
            <Tooltip />
            <Bar dataKey="carbs" fill={t.sage} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Exercise (min)" empty={!exercise.length}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={exercise}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.line} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: t.inkFaint }} />
            <YAxis tick={{ fontSize: 11, fill: t.inkFaint }} />
            <Tooltip />
            <Bar dataKey="duration" fill={t.forest} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
