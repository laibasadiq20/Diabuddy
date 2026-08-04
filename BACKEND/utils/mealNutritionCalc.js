/**
 * Scale food-database macros by cooked weight + cooking oil.
 * Storage/DB values: carbs_g etc. as per_100g or per_serving (~200 g bowl).
 */

const { matchPakistaniFood, getFoodById } = require('./pakistaniFoodLookup');

/** Assumed grams for rows marked per_serving (typical bowl / plate). */
const ASSUMED_SERVING_G = 200;
/** Pure oil / ghee: ~9 kcal per gram, essentially all fat. */
const KCAL_PER_G_OIL = 9;

function round1(n) {
  return Math.round(Number(n) * 10) / 10;
}

function round0(n) {
  return Math.round(Number(n));
}

function emptyMacros() {
  return { carbohydrates: 0, protein: 0, fat: 0, calories: 0, fiber_g: 0, sugar_g: 0 };
}

function addMacros(a, b) {
  return {
    carbohydrates: round1((a.carbohydrates || 0) + (b.carbohydrates || 0)),
    protein: round1((a.protein || 0) + (b.protein || 0)),
    fat: round1((a.fat || 0) + (b.fat || 0)),
    calories: round0((a.calories || 0) + (b.calories || 0)),
    fiber_g: round1((a.fiber_g || 0) + (b.fiber_g || 0)),
    sugar_g: round1((a.sugar_g || 0) + (b.sugar_g || 0)),
  };
}

/**
 * Scale one food row by weight in grams.
 * Formula:
 *   per_100g:   macros × (weightG / 100)
 *   per_serving: macros × (weightG / ASSUMED_SERVING_G)
 */
function scaleFoodByWeight(food, weightG) {
  const w = Number(weightG);
  if (!food || !Number.isFinite(w) || w <= 0) return emptyMacros();

  const factor =
    food.serving_basis === 'per_100g' ? w / 100 : w / ASSUMED_SERVING_G;

  return {
    carbohydrates: round1((Number(food.carbs_g) || 0) * factor),
    protein: round1((Number(food.protein_g) || 0) * factor),
    fat: round1((Number(food.fat_g) || 0) * factor),
    calories: round0((Number(food.calories_kcal) || 0) * factor),
    fiber_g: round1((Number(food.fiber_g) || 0) * factor),
    sugar_g: round1((Number(food.sugar_g) || 0) * factor),
  };
}

/** Oil adds fat + calories only (0 carbs). */
function oilMacros(oilG) {
  const o = Number(oilG);
  if (!Number.isFinite(o) || o <= 0) return emptyMacros();
  return {
    carbohydrates: 0,
    protein: 0,
    fat: round1(o),
    calories: round0(o * KCAL_PER_G_OIL),
    fiber_g: 0,
    sugar_g: 0,
  };
}

/**
 * Photo / single-dish: one matched food × dish weight + oil.
 */
function applyPortionToNutrition(baseNutrition, food, { dishWeightG, oilG } = {}) {
  const weight = Number(dishWeightG);
  let macros;
  if (food && Number.isFinite(weight) && weight > 0) {
    macros = scaleFoodByWeight(food, weight);
  } else if (baseNutrition) {
    // Fallback: unscaled serving if weight missing
    macros = {
      carbohydrates: Number(baseNutrition.carbohydrates) || 0,
      protein: Number(baseNutrition.protein) || 0,
      fat: Number(baseNutrition.fat) || 0,
      calories: Number(baseNutrition.calories) || 0,
      fiber_g: Number(baseNutrition.fiber_g) || 0,
      sugar_g: Number(baseNutrition.sugar_g) || 0,
    };
  } else {
    macros = emptyMacros();
  }
  return addMacros(macros, oilMacros(oilG));
}

/**
 * Manual: sum ingredient weights (by foodId or name match) + oil.
 * @param {Array<{ foodId?: string, name?: string, weightG: number }>} ingredients
 * @param {{ oilG?: number }} opts
 */
function calculateFromIngredients(ingredients, { oilG } = {}) {
  const lines = [];
  let total = emptyMacros();
  const unmatched = [];

  for (const row of ingredients || []) {
    const foodId = row?.foodId != null ? String(row.foodId).trim() : '';
    const name = String(row?.name || '').trim();
    const weightG = Number(row?.weightG);
    if (!Number.isFinite(weightG) || weightG <= 0) continue;
    if (!foodId && !name) continue;

    let food = foodId ? getFoodById(foodId) : null;
    let matchScore = food ? 1 : 0;

    if (!food && name) {
      const matches = matchPakistaniFood(name, { limit: 1 });
      if (matches.length) {
        food = matches[0].food;
        matchScore = matches[0].score;
      }
    }

    if (!food) {
      unmatched.push(name || foodId);
      lines.push({ name: name || foodId, weightG, matched: false, nutrition: null });
      continue;
    }

    const nutrition = scaleFoodByWeight(food, weightG);
    total = addMacros(total, nutrition);
    lines.push({
      foodId: food.id,
      name: food.name,
      kind: food.kind || 'dish',
      queriedAs: name || food.name,
      weightG,
      matched: true,
      matchScore: Number(matchScore.toFixed(3)),
      serving_basis: food.serving_basis || 'per_serving',
      nutrition,
    });
  }

  total = addMacros(total, oilMacros(oilG));

  return {
    nutrition: {
      carbohydrates: total.carbohydrates,
      protein: total.protein,
      fat: total.fat,
      calories: total.calories,
      fiber_g: total.fiber_g,
      sugar_g: total.sugar_g,
    },
    lines,
    unmatched,
    oilG: Number(oilG) > 0 ? Number(oilG) : 0,
    formula:
      'Carbs = Σ (food carbs × weight_g / 100 for per-100g foods, or × weight_g / 200 for per-serving) + oil (0 carbs, fat≈oil_g, kcal≈oil_g×9).',
  };
}

module.exports = {
  ASSUMED_SERVING_G,
  scaleFoodByWeight,
  oilMacros,
  applyPortionToNutrition,
  calculateFromIngredients,
  addMacros,
  emptyMacros,
};
