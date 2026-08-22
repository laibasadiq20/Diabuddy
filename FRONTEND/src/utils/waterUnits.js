/** Water conversions and unit formatting. Storage remains millilitres (ml). */

export const ML_PER_US_FLOZ = 29.5735295625;
export const ML_PER_UK_FLOZ = 28.4130625;
/** Standard drinking glass = 250 ml (~8.5 oz) */
export const OZ_PER_GLASS = 8;
export const ML_PER_GLASS = 250;

export const DEFAULT_WATER_UNIT = 'ml';
export const WATER_UNITS = ['ml', 'oz', 'L', 'glasses'];

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

/** Resolve user's preferred water unit ('ml', 'oz', 'L', or 'glasses'). */
export function resolveWaterUnit(userOrUnit) {
  if (typeof userOrUnit === 'string') {
    const s = userOrUnit.toLowerCase().trim();
    if (s === 'oz' || s === 'floz' || s === 'fl_oz') return 'oz';
    if (s === 'l' || s === 'liter' || s === 'liters' || s === 'litre' || s === 'litres') return 'L';
    if (s === 'glass' || s === 'glasses' || s === 'cup' || s === 'cups') return 'glasses';
    return 'ml';
  }
  return resolveWaterUnit(userOrUnit?.waterUnit || DEFAULT_WATER_UNIT);
}

/** Returns the display label for a water unit */
export function waterUnitLabel(unit, count = 1) {
  const u = resolveWaterUnit(unit);
  if (u === 'oz') return 'oz';
  if (u === 'L') return 'L';
  if (u === 'glasses') return Number(count) === 1 ? 'glass' : 'glasses';
  return 'mL';
}

/** Convert ml to display number for form inputs */
export function mlToDisplayValue(ml, unit) {
  const n = Number(ml);
  if (!Number.isFinite(n) || n <= 0) return '';
  const u = resolveWaterUnit(unit);
  if (u === 'oz') return String(round1(mlToUsFlOz(n)));
  if (u === 'L') return String(round1(mlToLiters(n)));
  if (u === 'glasses') return String(round1(n / ML_PER_GLASS));
  return String(Math.round(n));
}

/** Convert a display value in user's unit back to ml for storage */
export function displayValueToMl(val, unit) {
  const n = Number(val);
  if (!Number.isFinite(n) || n <= 0) return 0;
  const u = resolveWaterUnit(unit);
  if (u === 'oz') return Math.round(usFlOzToMl(n));
  if (u === 'L') return Math.round(litersToMl(n));
  if (u === 'glasses') return Math.round(n * ML_PER_GLASS);
  return Math.round(n);
}

/** Format water ml amount cleanly in ONLY the user's selected unit */
export function formatWater(ml, unit, { showUnit = true } = {}) {
  const n = Number(ml) || 0;
  const u = resolveWaterUnit(unit);
  let numStr = '0';
  let unitStr = '';

  if (u === 'oz') {
    numStr = String(round1(mlToUsFlOz(n)));
    unitStr = 'oz';
  } else if (u === 'L') {
    numStr = String(round1(mlToLiters(n)));
    unitStr = 'L';
  } else if (u === 'glasses') {
    const g = round1(n / ML_PER_GLASS);
    numStr = String(g);
    unitStr = g === 1 ? 'glass' : 'glasses';
  } else {
    numStr = String(Math.round(n));
    unitStr = 'mL';
  }

  if (!showUnit) return numStr;
  return `${numStr} ${unitStr}`;
}

/** Short dashboard label in user's selected unit */
export function formatWaterShort(ml, unit) {
  const n = Number(ml) || 0;
  if (n <= 0) return '—';
  return formatWater(n, unit);
}

/** Quick presets for logging forms and trackers based on selected unit */
export function getWaterQuickPresets(unit) {
  const u = resolveWaterUnit(unit);
  if (u === 'oz') {
    return [
      { amountDisplay: 8, amountMl: Math.round(usFlOzToMl(8)), label: '+8 oz', sub: '1 Glass' },
      { amountDisplay: 16, amountMl: Math.round(usFlOzToMl(16)), label: '+16 oz', sub: 'Bottle' },
      { amountDisplay: 24, amountMl: Math.round(usFlOzToMl(24)), label: '+24 oz', sub: 'Large' },
    ];
  }
  if (u === 'L') {
    return [
      { amountDisplay: 0.25, amountMl: 250, label: '+0.25 L', sub: '1 Glass' },
      { amountDisplay: 0.5, amountMl: 500, label: '+0.5 L', sub: 'Bottle' },
      { amountDisplay: 0.75, amountMl: 750, label: '+0.75 L', sub: 'Large' },
    ];
  }
  if (u === 'glasses') {
    return [
      { amountDisplay: 1, amountMl: 250, label: '+1 glass', sub: '250 mL' },
      { amountDisplay: 2, amountMl: 500, label: '+2 glasses', sub: '500 mL' },
      { amountDisplay: 3, amountMl: 750, label: '+3 glasses', sub: '750 mL' },
    ];
  }
  return [
    { amountDisplay: 250, amountMl: 250, label: '+250 mL', sub: '1 Glass' },
    { amountDisplay: 500, amountMl: 500, label: '+500 mL', sub: 'Bottle' },
    { amountDisplay: 750, amountMl: 750, label: '+750 mL', sub: 'Large' },
  ];
}

/** Input configuration for logging forms */
export function getWaterInputConfig(unit) {
  const u = resolveWaterUnit(unit);
  if (u === 'oz') {
    return { min: 0.5, max: 340, step: 0.5, placeholder: '8', defaultVal: '8', unitLabel: 'oz' };
  }
  if (u === 'L') {
    return { min: 0.05, max: 10, step: 0.05, placeholder: '0.25', defaultVal: '0.25', unitLabel: 'L' };
  }
  if (u === 'glasses') {
    return { min: 0.5, max: 40, step: 0.5, placeholder: '1', defaultVal: '1', unitLabel: 'glasses' };
  }
  return { min: 10, max: 10000, step: 10, placeholder: '250', defaultVal: '250', unitLabel: 'mL' };
}

/** Step amount in ml for single +/- buttons */
export function getWaterStepMl(unit) {
  const u = resolveWaterUnit(unit);
  if (u === 'oz') return Math.round(usFlOzToMl(8)); // ~237ml / 8oz
  return 250; // 250ml for ml, L, and glasses
}

/** Step display label for buttons */
export function getWaterStepLabel(unit) {
  const u = resolveWaterUnit(unit);
  if (u === 'oz') return '8 oz';
  if (u === 'L') return '0.25 L';
  if (u === 'glasses') return '1 glass';
  return '250 mL';
}

/** Goal helper */
export function formatGoalHint(ml) {
  const n = Number(ml) || 0;
  const L = round1(mlToLiters(n));
  const us = round0(mlToUsFlOz(n));
  return `${L} L · ${us} US fl oz`;
}

