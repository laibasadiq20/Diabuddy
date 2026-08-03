const multer = require('multer');
const { analyzeMealImage } = require('../utils/geminiMealAnalyze');
const { loadPakistaniFoods } = require('../utils/pakistaniFoodLookup');
const { calculateFromIngredients } = require('../utils/mealNutritionCalc');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'));
    }
    return cb(null, true);
  },
});

exports.uploadMealImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        status: 'error',
        message: err.message || 'Invalid image upload',
      });
    }
    return next();
  });
};

function parsePositiveNumber(raw) {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * POST /api/meals/analyze
 * multipart: image, dishWeightG, oilG
 */
exports.analyzeMeal = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload a meal photo (field name: image)',
      });
    }

    const dishWeightG = parsePositiveNumber(req.body?.dishWeightG);
    if (!dishWeightG) {
      return res.status(400).json({
        status: 'error',
        message: 'Please enter the weight of the dish in grams (dishWeightG)',
      });
    }

    const oilG = parsePositiveNumber(req.body?.oilG) || 0;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        status: 'error',
        message: 'AI meal analyzer is not configured (missing GEMINI_API_KEY)',
      });
    }

    const foods = loadPakistaniFoods();
    if (!foods.length) {
      return res.status(503).json({
        status: 'error',
        message: 'Meal nutrition dataset is missing on the server',
      });
    }

    const result = await analyzeMealImage({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      dishWeightG,
      oilG,
    });

    if (!result.matched || !result.nutrition) {
      return res.status(422).json({
        status: 'error',
        message: `Recognized "${result.identification?.dishName || 'unknown'}", but no close food match was found. Try another angle or enter nutrition manually.`,
        data: result,
      });
    }

    return res.json({
      status: 'success',
      message: 'Meal analyzed',
      data: result,
    });
  } catch (err) {
    console.error('analyzeMeal error:', err);
    return res.status(err.status || 500).json({
      status: 'error',
      message: err.message || 'Failed to analyze meal photo',
    });
  }
};

/**
 * POST /api/meals/calculate
 * JSON: { dishWeightG?, oilG?, ingredients: [{ name, weightG }] }
 * Manual path: weight per ingredient + oil → carbs/macros.
 */
exports.calculateMealNutrition = async (req, res) => {
  try {
    const foods = loadPakistaniFoods();
    if (!foods.length) {
      return res.status(503).json({
        status: 'error',
        message: 'Meal nutrition dataset is missing on the server',
      });
    }

    let ingredients = Array.isArray(req.body?.ingredients) ? req.body.ingredients : [];
    const dishWeightG = parsePositiveNumber(req.body?.dishWeightG);
    const oilG = parsePositiveNumber(req.body?.oilG) || 0;
    const dishName = String(req.body?.dishName || req.body?.foodItems || '').trim();

    // If no ingredient rows, treat whole dish as one ingredient using dish weight.
    if (!ingredients.length && dishName && dishWeightG) {
      ingredients = [{ name: dishName, weightG: dishWeightG }];
    }

    ingredients = ingredients
      .map((row) => ({
        name: String(row?.name || '').trim(),
        weightG: Number(row?.weightG),
      }))
      .filter((row) => row.name && Number.isFinite(row.weightG) && row.weightG > 0);

    if (!ingredients.length) {
      return res.status(400).json({
        status: 'error',
        message:
          'Add at least one ingredient with a weight in grams, or enter a dish name plus total dish weight.',
      });
    }

    const result = calculateFromIngredients(ingredients, { oilG });

    if (!result.lines.some((l) => l.matched)) {
      return res.status(422).json({
        status: 'error',
        message: `No foods matched (${(result.unmatched || []).join(', ') || 'unknown'}). Check spelling or try a simpler name (e.g. White Chana, Biryani).`,
        data: result,
      });
    }

    return res.json({
      status: 'success',
      message: 'Nutrition calculated',
      data: {
        ...result,
        dishWeightG: dishWeightG || null,
        disclaimer:
          'Calculated from your ingredient weights and oil using our food list. Estimates only — not medical advice.',
      },
    });
  } catch (err) {
    console.error('calculateMealNutrition error:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Failed to calculate meal nutrition',
    });
  }
};
