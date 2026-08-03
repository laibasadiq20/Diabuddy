/**
 * Filter the Kaggle South Asian recipes dataset down to Pakistani foods
 * with usable nutrition fields for DiaBuddy AI meal analyzer lookup.
 *
 * Usage:
 *   node scripts/filterPakistaniFoods.js "C:/path/to/dataset/folder"
 *
 * Expects in that folder (or a nested versions/... folder):
 *   - recipes_master.csv
 *   - recipe_nutrition.csv
 *
 * Writes:
 *   BACKEND/data/food/pakistani_foods.json
 */
const fs = require('fs');
const path = require('path');

const inputRoot = process.argv[2];
if (!inputRoot) {
  console.error('Usage: node scripts/filterPakistaniFoods.js "<path-to-kaggle-dataset-folder>"');
  process.exit(1);
}

function findFile(root, fileName) {
  const direct = path.join(root, fileName);
  if (fs.existsSync(direct)) return direct;

  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (_) {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isFile() && entry.name === fileName) return full;
      if (entry.isDirectory()) stack.push(full);
    }
  }
  return null;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch !== '\r') {
      field += ch;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  if (!rows.length) return [];
  const headers = rows[0].map((h) => String(h || '').trim());
  return rows.slice(1).filter((r) => r.some((c) => String(c || '').trim() !== '')).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = r[idx] != null ? String(r[idx]).trim() : '';
    });
    return obj;
  });
}

function toNumber(value) {
  const n = Number(String(value || '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function isPakistani(row) {
  const hay = [
    row.cuisine,
    row.Cuisine,
    row.country,
    row.Country,
    row.region,
    row.Region,
    row.recipe_name,
    row.Recipe_Name,
    row.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    hay.includes('pakistan') ||
    hay.includes('pakistani') ||
    hay.includes('lahore') ||
    hay.includes('karachi') ||
    hay.includes('punjabi') ||
    hay.includes('sindhi') ||
    hay.includes('balochi') ||
    hay.includes('pashtun')
  );
}

const recipesPath = findFile(inputRoot, 'recipes_master.csv');
const nutritionPath = findFile(inputRoot, 'recipe_nutrition.csv');

if (!recipesPath || !nutritionPath) {
  console.error('Could not find recipes_master.csv and/or recipe_nutrition.csv under:', inputRoot);
  process.exit(1);
}

console.log('Using recipes:', recipesPath);
console.log('Using nutrition:', nutritionPath);

const recipes = parseCsv(fs.readFileSync(recipesPath, 'utf8'));
const nutritionRows = parseCsv(fs.readFileSync(nutritionPath, 'utf8'));

const nutritionById = new Map();
for (const n of nutritionRows) {
  const id = n.recipe_id || n.Recipe_ID || n.id;
  if (!id) continue;
  nutritionById.set(String(id), n);
}

const pakistani = [];
for (const r of recipes) {
  if (!isPakistani(r)) continue;
  const id = String(r.recipe_id || r.Recipe_ID || r.id || '');
  const n = nutritionById.get(id) || {};
  const name = r.recipe_name || r.Recipe_Name || r.name || '';
  if (!name) continue;

  const carbs = toNumber(n.carbohydrates_g || n.carbs_g || n.carbs || r.carbohydrates_g);
  const protein = toNumber(n.protein_g || n.protein || r.protein_g);
  const fat = toNumber(n.fat_g || n.fat || r.fat_g);
  const calories = toNumber(n.calories || n.calories_per_serving || r.calories_per_serving);

  if (carbs == null && protein == null && fat == null && calories == null) continue;

  pakistani.push({
    id,
    name,
    cuisine: r.cuisine || r.Cuisine || 'Pakistani',
    carbs_g: carbs,
    protein_g: protein,
    fat_g: fat,
    calories_kcal: calories,
    fiber_g: toNumber(n.fiber_g),
    sugar_g: toNumber(n.sugar_g),
  });
}

// Prefer unique names (keep first)
const seen = new Set();
const unique = [];
for (const item of pakistani) {
  const key = item.name.toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);
  unique.push(item);
}

unique.sort((a, b) => a.name.localeCompare(b.name));

const outDir = path.join(__dirname, '..', 'data', 'food');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'pakistani_foods.json');
fs.writeFileSync(outFile, JSON.stringify(unique, null, 2), 'utf8');

console.log(`Filtered Pakistani foods: ${unique.length}`);
console.log(`Wrote: ${outFile}`);
if (unique.length) {
  console.log('Sample:', unique.slice(0, 5).map((x) => x.name).join(', '));
}
