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

export function glucoseUnitLabel(unit) {
  return unit === 'mmol/L' ? 'mmol/L' : 'mg/dL';
}
