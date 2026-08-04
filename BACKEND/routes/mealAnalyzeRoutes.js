const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const mealAnalyzeController = require('../controllers/mealAnalyzeController');

router.use(protect);

router.get('/foods', mealAnalyzeController.searchMealFoods);

router.post(
  '/analyze',
  mealAnalyzeController.uploadMealImage,
  mealAnalyzeController.analyzeMeal
);

router.post('/calculate', mealAnalyzeController.calculateMealNutrition);

module.exports = router;
