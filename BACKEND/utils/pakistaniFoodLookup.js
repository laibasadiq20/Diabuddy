const fs = require('fs');
const path = require('path');

let cachedFoods = null;

function loadPakistaniFoods() {
  if (cachedFoods) return cachedFoods;
  const filePath = path.join(__dirname, '..', 'data', 'food', 'pakistani_foods.json');
  if (!fs.existsSync(filePath)) {
    cachedFoods = [];
    return cachedFoods;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  cachedFoods = JSON.parse(raw);
  return cachedFoods;
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

  // Soft bonus for shared distinctive tokens
  return Math.min(1, jaccard + (overlap >= 2 ? 0.08 : 0));
}

/**
 * Find best Pakistani food matches for a predicted dish name.
 */
function matchPakistaniFood(dishName, { limit = 5 } = {}) {
  const foods = loadPakistaniFoods();
  const scored = foods
    .map((food) => ({
      food,
      score: similarity(dishName, food.name),
    }))
    .filter((x) => x.score >= 0.35)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

module.exports = {
  loadPakistaniFoods,
  matchPakistaniFood,
  normalizeName,
};
