import { useAuth } from '../context/AuthContext';
import { glucoseUnitLabel, resolveGlucoseUnit } from '../utils/glucoseUnits';
import { resolveHeightUnit, resolveWeightUnit } from '../utils/bodyUnits';

/**
 * Unit preferences from Settings (persisted on the user profile).
 * Use this instead of hardcoding mg/dL, kg, or cm in feature UI.
 */
export function useUnits() {
  const { user } = useAuth() || {};
  const glucoseUnit = resolveGlucoseUnit(user);
  const weightUnit = resolveWeightUnit(user);
  const heightUnit = resolveHeightUnit(user);

  return {
    glucoseUnit,
    glucoseUnitLabel: glucoseUnitLabel(glucoseUnit),
    weightUnit,
    heightUnit,
  };
}
