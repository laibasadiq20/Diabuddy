import { useAuth } from '../context/AuthContext';
import { glucoseUnitLabel, resolveGlucoseUnit } from '../utils/glucoseUnits';

/**
 * Unit preferences from Settings (persisted on the user profile).
 * Use this instead of hardcoding mg/dL, kg, or cm in feature UI.
 */
export function useUnits() {
  const { user } = useAuth() || {};
  const glucoseUnit = resolveGlucoseUnit(user);
  const weightUnit = user?.weightUnit === 'lbs' ? 'lbs' : 'kg';
  const heightUnit = user?.heightUnit === 'ft_in' ? 'ft_in' : 'cm';

  return {
    glucoseUnit,
    glucoseUnitLabel: glucoseUnitLabel(glucoseUnit),
    weightUnit,
    heightUnit,
  };
}
