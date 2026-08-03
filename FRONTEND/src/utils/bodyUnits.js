/** Body measurement display units. Canonical storage: kg and cm. */

export const KG_PER_LB = 0.45359237;
export const CM_PER_INCH = 2.54;

export function round1(n) {
  return Math.round(Number(n) * 10) / 10;
}

export function round0(n) {
  return Math.round(Number(n));
}

export function kgToLbs(kg) {
  const n = Number(kg);
  if (!Number.isFinite(n)) return 0;
  return n / KG_PER_LB;
}

export function lbsToKg(lbs) {
  const n = Number(lbs);
  if (!Number.isFinite(n)) return 0;
  return n * KG_PER_LB;
}

export function cmToInches(cm) {
  const n = Number(cm);
  if (!Number.isFinite(n)) return 0;
  return n / CM_PER_INCH;
}

export function inchesToCm(inches) {
  const n = Number(inches);
  if (!Number.isFinite(n)) return 0;
  return n * CM_PER_INCH;
}

export function cmToFtIn(cm) {
  const totalIn = cmToInches(cm);
  let feet = Math.floor(totalIn / 12);
  let inches = round1(totalIn - feet * 12);
  if (inches >= 12) {
    feet += 1;
    inches = round1(inches - 12);
  }
  return { feet, inches };
}

export function ftInToCm(feet, inches) {
  const f = Number(feet) || 0;
  const i = Number(inches) || 0;
  return inchesToCm(f * 12 + i);
}

export function formatWeight(kg, unit = 'kg') {
  const n = Number(kg);
  if (!Number.isFinite(n)) return '—';
  if (unit === 'lbs') return `${round1(kgToLbs(n))} lbs`;
  return `${round1(n)} kg`;
}

export function formatHeight(cm, unit = 'cm') {
  const n = Number(cm);
  if (!Number.isFinite(n)) return '—';
  if (unit === 'ft_in') {
    const { feet, inches } = cmToFtIn(n);
    return `${feet}' ${inches}"`;
  }
  return `${round0(n)} cm`;
}

export function resolveWeightUnit(userOrUnit) {
  if (typeof userOrUnit === 'string') {
    const s = userOrUnit.toLowerCase();
    return s === 'lbs' || s === 'lb' || s === 'pounds' ? 'lbs' : 'kg';
  }
  return resolveWeightUnit(userOrUnit?.weightUnit || 'kg');
}

export function resolveHeightUnit(userOrUnit) {
  if (typeof userOrUnit === 'string') {
    const s = userOrUnit.toLowerCase().replace(/[\s-]+/g, '_');
    if (s === 'ft_in' || s === 'ft/in' || s === 'feet' || s === 'ft' || s === 'feet_inches' || s === 'imperial') {
      return 'ft_in';
    }
    return 'cm';
  }
  return resolveHeightUnit(userOrUnit?.heightUnit || 'cm');
}
