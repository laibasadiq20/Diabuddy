/**
 * Build DiaBuddy meal food lookup JSON from multiple sources:
 * 1) Indian Nutrient Databank (INDB.xlsx) — research macros for ~1014 recipes
 * 2) pakistani_extras.json — curated Pakistani staples + aliases
 *
 * Usage:
 *   node scripts/buildMealFoods.js
 *
 * Optional: place INDB.xlsx at data/food/raw/INDB.xlsx
 * (script downloads it from GitHub if missing)
 *
 * Writes: data/food/meal_foods.json
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const XLSX = require('xlsx');

const ROOT = path.join(__dirname, '..');
const RAW_DIR = path.join(ROOT, 'data', 'food', 'raw');
const INDB_PATH = path.join(RAW_DIR, 'INDB.xlsx');
const EXTRAS_PATH = path.join(ROOT, 'data', 'food', 'pakistani_extras.json');
const OUT_PATH = path.join(ROOT, 'data', 'food', 'meal_foods.json');
const INDB_URL =
  'https://github.com/lindsayjaacks/Indian-Nutrient-Databank-INDB-/raw/main/INDB.xlsx';

function round1(n) {
  if (n == null || Number.isNaN(Number(n))) return null;
  return Math.round(Number(n) * 10) / 10;
}

function round0(n) {
  if (n == null || Number.isNaN(Number(n))) return null;
  return Math.round(Number(n));
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlinkSync(dest);
          return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          return reject(new Error(`Download failed: HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve()));
      })
      .on('error', (err) => {
        try {
          fs.unlinkSync(dest);
        } catch (_) {
          /* ignore */
        }
        reject(err);
      });
  });
}

function extractAliases(foodName) {
  const aliases = new Set();
  const paren = String(foodName).match(/\(([^)]+)\)/g) || [];
  for (const p of paren) {
    const inner = p.slice(1, -1);
    inner.split(/\/|,/).forEach((part) => {
      const t = part.trim();
      if (t && t.length > 2) aliases.add(t);
    });
  }
  // also slash alternatives in main title
  const main = String(foodName).replace(/\([^)]*\)/g, '').trim();
  main.split('/').forEach((part) => {
    const t = part.trim();
    if (t && t.length > 2) aliases.add(t);
  });
  aliases.delete(main);
  return [...aliases];
}

function fromIndbRow(row) {
  const name = String(row.food_name || '').trim();
  if (!name) return null;

  const useServing =
    row.unit_serving_carb_g != null ||
    row.unit_serving_protein_g != null ||
    row.unit_serving_energy_kcal != null;

  const carbs = useServing ? row.unit_serving_carb_g : row.carb_g;
  const protein = useServing ? row.unit_serving_protein_g : row.protein_g;
  const fat = useServing ? row.unit_serving_fat_g : row.fat_g;
  const calories = useServing ? row.unit_serving_energy_kcal : row.energy_kcal;
  const fiber = useServing ? row.unit_serving_fibre_g : row.fibre_g;
  const sugar = useServing ? row.unit_serving_freesugar_g : row.freesugar_g;

  return {
    id: String(row.food_code || name),
    name,
    aliases: extractAliases(name),
    cuisine: 'South Asian',
    source: 'indb',
    serving_basis: useServing ? 'per_serving' : 'per_100g',
    serving_unit: row.servings_unit || null,
    carbs_g: round1(carbs) ?? 0,
    protein_g: round1(protein) ?? 0,
    fat_g: round1(fat) ?? 0,
    calories_kcal: round0(calories) ?? 0,
    fiber_g: round1(fiber) ?? 0,
    sugar_g: round1(sugar) ?? 0,
  };
}

async function main() {
  if (!fs.existsSync(INDB_PATH)) {
    console.log('INDB.xlsx missing — downloading…');
    await downloadFile(INDB_URL, INDB_PATH);
  }

  const wb = XLSX.readFile(INDB_PATH);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
  const indbFoods = rows.map(fromIndbRow).filter(Boolean);

  let extras = [];
  if (fs.existsSync(EXTRAS_PATH)) {
    extras = JSON.parse(fs.readFileSync(EXTRAS_PATH, 'utf8'));
  }

  // Prefer curated PK entries first for matching priority (same names later still kept)
  const foods = [...extras, ...indbFoods];

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(foods, null, 2));

  console.log(`INDB recipes: ${indbFoods.length}`);
  console.log(`Pakistani extras: ${extras.length}`);
  console.log(`Wrote ${foods.length} foods → ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
