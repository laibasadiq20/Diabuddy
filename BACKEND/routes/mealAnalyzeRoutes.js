const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const mealAnalyzeController = require('../controllers/mealAnalyzeController');

router.use(protect);

router.post(
  '/analyze',
  mealAnalyzeController.uploadMealImage,
  mealAnalyzeController.analyzeMeal
);

module.exports = router;
