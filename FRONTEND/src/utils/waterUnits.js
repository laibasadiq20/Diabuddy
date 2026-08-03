/** US customary & UK imperial water conversions. Storage remains millilitres. */

export const ML_PER_US_FLOZ = 29.5735295625;
export const ML_PER_UK_FLOZ = 28.4130625;
/** Standard drinking glass = 8 US fl oz */
export const OZ_PER_GLASS = 8;
export const ML_PER_GLASS = ML_PER_US_FLOZ * OZ_PER_GLASS; // ~236.6

export function mlToUsFlOz(ml) {
  const n = Number(ml);
  if (!Number.isFinite(n)) return 0;
  return n / ML_PER_US_FLOZ;
}

export function mlToUkFlOz(ml) {
  const n = Number(ml);
  if (!Number.isFinite(n)) return 0;
  return n / ML_PER_UK_FLOZ;
}

export function usFlOzToMl(oz) {
  const n = Number(oz);
  if (!Number.isFinite(n)) return 0;
  return n * ML_PER_US_FLOZ;
}

export function litersToMl(l) {
  const n = Number(l);
  if (!Number.isFinite(n)) return 0;
  return n * 1000;
}

export function mlToLiters(ml) {
  const n = Number(ml);
  if (!Number.isFinite(n)) return 0;
  return n / 1000;
}

export function round1(n) {
  return Math.round(Number(n) * 10) / 10;
}

export function round0(n) {
  return Math.round(Number(n));
}

/** Format ml for UI: "16 oz (2 glasses)" style using US fl oz */
export function formatUsOz(ml, { glasses = false } = {}) {
  const oz = round1(mlToUsFlOz(ml));
  if (!glasses) return `${oz} oz`;
  const g = oz / OZ_PER_GLASS;
  const gLabel = Number.isInteger(g) ? String(g) : round1(g);
  return `${oz} oz (${gLabel} glass${g === 1 ? '' : 'es'})`;
}

/** Short dashboard label preferring L when ≥ 1 L, else oz */
export function formatWaterShort(ml) {
  const n = Number(ml) || 0;
  if (n <= 0) return '—';
  if (n >= 1000) return `${round1(mlToLiters(n))} L`;
  return `${round0(mlToUsFlOz(n))} oz`;
}

/** Goal helper: "2 L · 68 US fl oz · 70 UK fl oz" */
export function formatGoalHint(ml) {
  const n = Number(ml) || 0;
  const L = round1(mlToLiters(n));
  const us = round0(mlToUsFlOz(n));
  const uk = round0(mlToUkFlOz(n));
  return `${L} L · ${us} US fl oz · ${uk} UK fl oz`;
}
