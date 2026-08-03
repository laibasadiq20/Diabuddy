const multer = require('multer');
const { analyzeMealImage } = require('../utils/geminiMealAnalyze');
const { loadPakistaniFoods } = require('../utils/pakistaniFoodLookup');

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

/**
 * POST /api/meals/analyze
 * multipart form-field: image
 */
exports.analyzeMeal = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload a meal photo (field name: image)',
      });
    }

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
        message: 'Pakistani food nutrition dataset is missing on the server',
      });
    }

    const result = await analyzeMealImage({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
    });

    if (!result.matched || !result.nutrition) {
      return res.status(422).json({
        status: 'error',
        message: `Recognized "${result.identification?.dishName || 'unknown'}", but no close Pakistani food match was found. Try another angle or enter nutrition manually.`,
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
