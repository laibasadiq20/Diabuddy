const MEAL_NUTRITION_PREFILL_KEY = 'diabuddy_meal_nutrition_prefill';

/** Store calculator totals so the meal log form can auto-fill. */
export function saveMealNutritionPrefill(payload) {
  try {
    sessionStorage.setItem(MEAL_NUTRITION_PREFILL_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}

/** Read a pending meal nutrition prefill (does not clear). */
export function peekMealNutritionPrefill() {
  try {
    const raw = sessionStorage.getItem(MEAL_NUTRITION_PREFILL_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Clear a one-time meal nutrition prefill. */
export function clearMealNutritionPrefill() {
  try {
    sessionStorage.removeItem(MEAL_NUTRITION_PREFILL_KEY);
  } catch {
    // ignore
  }
}

/**
 * Read prefill for the meal form. Clears after a short delay so React
 * Strict Mode remounts still receive the same values.
 */
export function consumeMealNutritionPrefill() {
  const prefill = peekMealNutritionPrefill();
  if (!prefill) return null;
  setTimeout(() => clearMealNutritionPrefill(), 5000);
  return prefill;
}
