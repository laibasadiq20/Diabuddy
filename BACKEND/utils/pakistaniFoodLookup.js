const fs = require('fs');
const path = require('path');

let cachedFoods = null;
let foodById = null;

function readJson(fileName) {
  const filePath = path.join(__dirname, '..', 'data', 'food', fileName);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadMealFoods() {
  if (cachedFoods) return cachedFoods;

  const ingredients = readJson('pakistani_ingredients.json').map((f) => ({
    ...f,
    kind: f.kind || 'ingredient',
  }));
  const dishes = readJson('meal_foods.json').map((f) => ({
    ...f,
    kind: f.kind || 'dish',
  }));

  const ingredientIds = new Set(ingredients.map((f) => f.id));
  // Prefer curated Mint Raita (ING091) over INDB duplicate ASC275
  const supersededDishIds = new Set(['ASC275']);
  const merged = [
    ...ingredients,
    ...dishes.filter((f) => !ingredientIds.has(f.id) && !supersededDishIds.has(f.id)),
  ];

  // Expand common White Chana aliases on curated dish if present
  const whiteChana = merged.find((f) => f.id === 'PK001' || /^white chana$/i.test(f.name));
  if (whiteChana) {
    const extra = [
      'white channa',
      'white channy',
      'safed chana',
      'safed channa',
      'kabuli chana cooked',
      'chana masala',
      'choley',
      'chole',
    ];
    const set = new Set([...(whiteChana.aliases || []).map((a) => a.toLowerCase())]);
    whiteChana.aliases = [
      ...(whiteChana.aliases || []),
      ...extra.filter((a) => !set.has(a.toLowerCase())),
    ];
  }

  cachedFoods = merged;
  foodById = new Map(merged.map((f) => [f.id, f]));
  return cachedFoods;
}

/** @deprecated use loadMealFoods */
function loadPakistaniFoods() {
  return loadMealFoods();
}

function getFoodById(id) {
  loadMealFoods();
  if (!id) return null;
  return foodById.get(String(id)) || null;
}

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenSet(name) {
  return new Set(normalizeName(name).split(' ').filter(Boolean));
}

function similarity(a, b) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.92;

  const ta = tokenSet(na);
  const tb = tokenSet(nb);
  if (!ta.size || !tb.size) return 0;

  let overlap = 0;
  for (const t of ta) {
    if (tb.has(t)) overlap += 1;
  }
  const union = new Set([...ta, ...tb]).size;
  const jaccard = overlap / union;

  return Math.min(1, jaccard + (overlap >= 2 ? 0.08 : 0));
}

function foodMatchNames(food) {
  const names = [food.name, ...(food.aliases || [])];
  return names.filter(Boolean);
}

function scoreFoodQuery(query, food) {
  const q = normalizeName(query);
  if (!q) return 0;

  let best = 0;
  for (const n of foodMatchNames(food)) {
    const nn = normalizeName(n);
    if (!nn) continue;
    const tokens = nn.split(' ').filter(Boolean);

    if (nn === q) best = Math.max(best, 1);
    else if (tokens.includes(q)) best = Math.max(best, 0.97);
    else if (nn.startsWith(q) || tokens.some((tok) => tok.startsWith(q))) best = Math.max(best, 0.94);
    else if (nn.includes(q)) best = Math.max(best, 0.88);
    else if (q.includes(nn) && nn.length >= 3) best = Math.max(best, 0.85);
    else best = Math.max(best, similarity(q, nn));
  }

  // Prefer pantry ingredients slightly when scores are close
  if (food.kind === 'ingredient') best = Math.min(1, best + 0.015);
  return best;
}

/**
 * Find best food matches for a predicted dish name (INDB + Pakistani extras).
 */
function matchPakistaniFood(dishName, { limit = 5 } = {}) {
  const foods = loadMealFoods();
  const scored = foods
    .map((food) => ({ food, score: scoreFoodQuery(dishName, food) }))
    .filter((x) => x.score >= 0.35)
    .sort((a, b) => b.score - a.score || (a.food.kind === 'ingredient' ? -1 : 1));

  return scored.slice(0, limit);
}

/**
 * Search foods for typeahead (ingredients + dishes).
 */
function searchFoods(query, { limit = 20 } = {}) {
  const q = String(query || '').trim();
  if (!q) return [];

  const foods = loadMealFoods();
  const scored = foods
    .map((food) => ({ food, score: scoreFoodQuery(q, food) }))
    .filter((x) => x.score >= 0.35)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.food.kind === 'ingredient' && b.food.kind !== 'ingredient') return -1;
      if (b.food.kind === 'ingredient' && a.food.kind !== 'ingredient') return 1;
      return String(a.food.name).localeCompare(String(b.food.name));
    });

  return scored.slice(0, limit).map(({ food, score }) => ({
    id: food.id,
    name: food.name,
    kind: food.kind || 'dish',
    aliases: food.aliases || [],
    serving_basis: food.serving_basis || 'per_serving',
    carbs_g: food.carbs_g,
    protein_g: food.protein_g,
    fat_g: food.fat_g,
    calories_kcal: food.calories_kcal,
    score: Number(score.toFixed(3)),
  }));
}

module.exports = {
  loadMealFoods,
  loadPakistaniFoods,
  getFoodById,
  matchPakistaniFood,
  searchFoods,
  normalizeName,
};
