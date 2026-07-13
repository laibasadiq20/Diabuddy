import { theme as t } from '../../theme';

export const fieldStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: 12,
  border: `1.5px solid ${t.lineStrong}`,
  background: t.surfaceSunken,
  fontSize: 14,
  fontFamily: t.fontBody,
  color: t.ink,
  outline: 'none',
};

export const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: t.inkSoft,
  marginBottom: 6,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

export const resultPanel = {
  padding: 16,
  borderRadius: 16,
  background: t.surfaceSunken,
  border: `1px solid ${t.line}`,
};

export const eyebrow = {
  margin: 0,
  fontSize: 12,
  fontWeight: 700,
  color: t.inkFaint,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

export const disclaimerStyle = {
  margin: 0,
  padding: '12px 14px',
  borderRadius: 12,
  background: t.clayTint,
  border: `1px solid ${t.clay}35`,
  fontSize: 12,
  color: t.clayDeep,
  lineHeight: 1.55,
};

export function ResultBadge({ label, color }) {
  return (
    <span
      style={{
        padding: '6px 12px',
        borderRadius: 999,
        background: '#FFF',
        border: `1.5px solid ${color}55`,
        color,
        fontSize: 13,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}
