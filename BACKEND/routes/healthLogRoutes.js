const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const healthLogController = require('../controllers/healthLogController');
const healthReportController = require('../controllers/healthReportController');

// All health log endpoints require authentication
router.use(protect);

// Dashboards, timelines, and statistics
router.get('/timeline', healthLogController.getTimeline);
router.get('/summary', healthLogController.getTodaySummary);
router.get('/stats', healthLogController.getStats);
router.get('/insights', healthLogController.getInsights);
router.get('/report', healthReportController.getHealthReport);
router.get('/streak', healthReportController.getLoggingStreak);

// Glucose Log CRUD
router.post('/glucose', healthLogController.createGlucose);
router.put('/glucose/:id', healthLogController.updateGlucose);
router.delete('/glucose/:id', healthLogController.deleteGlucose);

// Insulin Log CRUD
router.post('/insulin', healthLogController.createInsulin);
router.put('/insulin/:id', healthLogController.updateInsulin);
router.delete('/insulin/:id', healthLogController.deleteInsulin);

// Meal Log CRUD
router.post('/meal', healthLogController.createMeal);
router.put('/meal/:id', healthLogController.updateMeal);
router.delete('/meal/:id', healthLogController.deleteMeal);

// Medication Log CRUD
router.post('/medication', healthLogController.createMedication);
router.put('/medication/:id', healthLogController.updateMedication);
router.delete('/medication/:id', healthLogController.deleteMedication);

// Water Log CRUD
router.post('/water', healthLogController.createWater);
router.delete('/water/:id', healthLogController.deleteWater);

// Exercise Log CRUD
router.post('/exercise', healthLogController.createExercise);
router.put('/exercise/:id', healthLogController.updateExercise);
router.delete('/exercise/:id', healthLogController.deleteExercise);

// Sleep Log CRUD
router.post('/sleep', healthLogController.createSleep);
router.put('/sleep/:id', healthLogController.updateSleep);
router.delete('/sleep/:id', healthLogController.deleteSleep);

// Mood Log CRUD
router.post('/mood', healthLogController.createMood);
router.put('/mood/:id', healthLogController.updateMood);
router.delete('/mood/:id', healthLogController.deleteMood);

module.exports = router;
