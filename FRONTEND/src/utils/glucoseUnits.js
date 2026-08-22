// Shared glucose unit conversion — keeps mg/dL as the storage/backend unit and
// converts only for display when the user prefers mmol/L.
const MMOL_PER_MGDL = 18.0182;

export function mgdlToMmol(mgdl) {
  const n = Number(mgdl);
  if (!Number.isFinite(n)) return null;
  return Math.round((n / MMOL_PER_MGDL) * 10) / 10;
}

export function mmolToMgdl(mmol) {
  const n = Number(mmol);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * MMOL_PER_MGDL);
}

/** Convert a mg/dL value to the user's preferred unit for display. */
export function fromMgdl(mgdl, unit) {
  if (mgdl == null) return null;
  return unit === 'mmol/L' ? mgdlToMmol(mgdl) : Math.round(Number(mgdl));
}

/** Normalize a reading (in its stored unit) to mg/dL. */
export function readingToMgdl(level, storedUnit) {
  const n = Number(level);
  if (!Number.isFinite(n)) return null;
  return storedUnit === 'mmol/L' ? mmolToMgdl(n) : Math.round(n);
}

/** Convert a reading from one glucose unit to another. */
export function convertGlucose(level, fromUnit, toUnit) {
  if (fromUnit === toUnit) {
    const n = Number(level);
    return Number.isFinite(n) ? (toUnit === 'mmol/L' ? Math.round(n * 10) / 10 : Math.round(n)) : null;
  }
  const mgdl = readingToMgdl(level, fromUnit);
  return fromMgdl(mgdl, toUnit);
}

/** Display string for a log reading in the user's preferred unit. */
export function formatGlucoseReading(level, storedUnit, preferredUnit) {
  const display = convertGlucose(level, storedUnit, preferredUnit);
  if (display == null) return '—';
  return `${display} ${glucoseUnitLabel(preferredUnit)}`;
}

export function glucoseUnitLabel(unit) {
  return unit === 'mmol/L' ? 'mmol/L' : 'mg/dL';
}

export function resolveGlucoseUnit(userOrUnit) {
  if (typeof userOrUnit === 'string') {
    return userOrUnit === 'mmol/L' ? 'mmol/L' : 'mg/dL';
  }
  return userOrUnit?.glucoseUnit === 'mmol/L' ? 'mmol/L' : 'mg/dL';
}

/** Input bounds for a glucose reading in the given unit. */
export function glucoseInputBounds(unit) {
  if (unit === 'mmol/L') {
    return { min: 1.1, max: 33.3, step: 0.1 };
  }
  return { min: 20, max: 600, step: 1 };
}

