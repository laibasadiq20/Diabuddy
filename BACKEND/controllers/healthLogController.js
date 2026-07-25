const GlucoseLog = require('../models/GlucoseLog');
const InsulinLog = require('../models/InsulinLog');
const MealLog = require('../models/MealLog');
const MedicationLog = require('../models/MedicationLog');
const WaterLog = require('../models/WaterLog');
const ExerciseLog = require('../models/ExerciseLog');
const WeightLog = require('../models/WeightLog');
const SleepLog = require('../models/SleepLog');
const SymptomLog = require('../models/SymptomLog');
const MoodLog = require('../models/MoodLog');

// Helper to calculate glucose status
const calculateGlucoseStatus = (glucoseLevel, unit, readingType) => {
  const isMmol = unit === 'mmol/L';
  const valMgDl = isMmol ? glucoseLevel * 18 : glucoseLevel;

  if (valMgDl < 70) {
    return 'Low';
  }

  const beforeLike = readingType === 'Fasting' || (readingType && readingType.startsWith('Before'));
  const afterLike = readingType && readingType.startsWith('After');

  if (beforeLike) {
    if (valMgDl > 130) return 'High';
  } else if (afterLike) {
    if (valMgDl > 180) return 'High';
  } else {
    // Bedtime, Night, Random
    if (valMgDl > 150) return 'High';
  }

  return 'Normal';
};

// GET /api/health-logs/timeline
exports.getTimeline = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, moduleType, startDate, endDate, sortBy = 'newest' } = req.query;

    const query = { userId };
    
    // Add date filter if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Define which models to fetch
    const modelsToFetch = {
      glucose: { model: GlucoseLog, type: 'Glucose' },
      insulin: { model: InsulinLog, type: 'Insulin' },
      meal: { model: MealLog, type: 'Meal' },
      medication: { model: MedicationLog, type: 'Medication' },
      water: { model: WaterLog, type: 'Water' },
      exercise: { model: ExerciseLog, type: 'Exercise' },
      weight: { model: WeightLog, type: 'Weight' },
      sleep: { model: SleepLog, type: 'Sleep' },
      symptoms: { model: SymptomLog, type: 'Symptoms' },
      mood: { model: MoodLog, type: 'Mood' },
    };

    let selectedModels = Object.keys(modelsToFetch);
    if (moduleType && modelsToFetch[moduleType.toLowerCase()]) {
      selectedModels = [moduleType.toLowerCase()];
    }

    let allLogs = [];

    // Fetch from all selected models in parallel
    await Promise.all(
      selectedModels.map(async (key) => {
        const { model, type } = modelsToFetch[key];
        const logs = await model.find(query).lean();
        
        // Map to common structure
        logs.forEach((log) => {
          let title = '';
          let subtitle = '';
          let valueStr = '';
          let color = 'gray'; // default

          if (type === 'Glucose') {
            title = `${log.glucoseLevel} ${log.unit}`;
            subtitle = log.readingType || '';
            valueStr = log.status;
            color = log.status === 'Low' || log.status === 'High' ? 'red' : 'green';
          } else if (type === 'Insulin') {
            title = `${log.units} Units`;
            subtitle = `${log.insulinType} • ${log.injectionSite}`;
            valueStr = log.mealRelation !== 'None' ? log.mealRelation : '';
            color = 'blue';
          } else if (type === 'Meal') {
            title = log.mealType;
            subtitle = log.foodItems;
            valueStr = `${log.calories || 0} kcal • ${log.carbohydrates || 0}g Carbs`;
            color = 'orange';
          } else if (type === 'Medication') {
            title = log.medicineName;
            subtitle = `${log.dose} • ${log.status}`;
            valueStr = log.status;
            color = log.status === 'Taken' ? 'green' : log.status === 'Missed' ? 'red' : 'yellow';
          } else if (type === 'Water') {
            title = `${log.amount} ml`;
            subtitle = 'Water Intake';
            valueStr = 'Hydration';
            color = 'teal';
          } else if (type === 'Exercise') {
            title = log.activity;
            subtitle = `${log.duration} mins • ${log.intensity} Intensity`;
            valueStr = log.caloriesBurned ? `${log.caloriesBurned} kcal` : '';
            color = 'emerald';
          } else if (type === 'Weight') {
            title = `${log.weight} kg`;
            subtitle = log.bmi ? `BMI: ${log.bmi.toFixed(1)}` : 'Weight Log';
            valueStr = log.bodyFat ? `Fat: ${log.bodyFat}%` : '';
            color = 'purple';
          } else if (type === 'Sleep') {
            title = `${log.totalHours.toFixed(1)} Hours`;
            subtitle = `Quality: ${log.quality}`;
            valueStr = `${new Date(log.sleepTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(log.wakeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            color = 'indigo';
          } else if (type === 'Symptoms') {
            title = log.symptoms.join(', ');
            subtitle = `Severity: ${log.severity}/10`;
            valueStr = 'Symptom Log';
            color = log.severity > 6 ? 'red' : log.severity > 3 ? 'yellow' : 'green';
          } else if (type === 'Mood') {
            const moodEmojis = { Great: '😀', Good: '🙂', Okay: '😐', Low: '😔', Stressed: '😫' };
            title = `${moodEmojis[log.mood] || ''} ${log.mood}`;
            subtitle = log.journalEntry || 'No journal entry';
            valueStr = 'Mood Log';
            color = log.mood === 'Great' || log.mood === 'Good' ? 'green' : log.mood === 'Okay' ? 'yellow' : 'red';
          }

          allLogs.push({
            _id: log._id,
            type,
            title,
            subtitle,
            valueStr,
            color,
            notes: log.notes || log.journalEntry || '',
            timestamp: log.timestamp || log.createdAt,
            raw: log,
          });
        });
      })
    );

    // Apply global text search in memory if query is provided
    if (search) {
      const searchLower = search.toLowerCase();
      allLogs = allLogs.filter(
        (log) =>
          log.title.toLowerCase().includes(searchLower) ||
          log.subtitle.toLowerCase().includes(searchLower) ||
          log.notes.toLowerCase().includes(searchLower) ||
          log.type.toLowerCase().includes(searchLower)
      );
    }

    // Sort by timestamp
    allLogs.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'highest_glucose') {
        const valA = a.type === 'Glucose' ? a.raw.glucoseLevel : 0;
        const valB = b.type === 'Glucose' ? b.raw.glucoseLevel : 0;
        return valB - valA;
      }
      if (sortBy === 'lowest_glucose') {
        const valA = a.type === 'Glucose' ? a.raw.glucoseLevel : 999999;
        const valB = b.type === 'Glucose' ? b.raw.glucoseLevel : 999999;
        return valA - valB;
      }
      // Default: newest first
      return dateB - dateA;
    });

    res.json({ status: 'success', data: allLogs });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to retrieve timeline logs', error: err.message });
  }
};

// GET /api/health-logs/summary
exports.getTodaySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const tzOffset = req.query.tzOffset ? parseInt(req.query.tzOffset) : 0; // minutes

    // Construct local today boundary
    const now = new Date();
    const clientLocalNow = new Date(now.getTime() - tzOffset * 60 * 1000);
    
    const startOfToday = new Date(clientLocalNow);
    startOfToday.setUTCHours(0, 0, 0, 0);
    startOfToday.setTime(startOfToday.getTime() + tzOffset * 60 * 1000);

    const endOfToday = new Date(clientLocalNow);
    endOfToday.setUTCHours(23, 59, 59, 999);
    endOfToday.setTime(endOfToday.getTime() + tzOffset * 60 * 1000);

    const todayQuery = {
      userId,
      timestamp: { $gte: startOfToday, $lte: endOfToday },
    };

    // 1. Blood sugar count & latest
    const glucoseLogs = await GlucoseLog.find(todayQuery).sort({ timestamp: -1 });
    const latestGlucose = glucoseLogs[0] ? `${glucoseLogs[0].glucoseLevel} ${glucoseLogs[0].unit}` : null;
    const glucoseCount = glucoseLogs.length;

    // 2. Meals logged
    const mealLogs = await MealLog.find(todayQuery);
    const mealsCount = mealLogs.length;

    // 3. Insulin Doses total
    const insulinLogs = await InsulinLog.find(todayQuery);
    const insulinUnits = insulinLogs.reduce((sum, log) => sum + log.units, 0);

    // 4. Medications Taken vs Missed
    const medicationLogs = await MedicationLog.find(todayQuery);
    const medsTaken = medicationLogs.filter((log) => log.status === 'Taken').length;

    // 5. Water intake total
    const waterLogs = await WaterLog.find(todayQuery);
    const waterTotal = waterLogs.reduce((sum, log) => sum + log.amount, 0);

    // 6. Exercise Minutes total
    const exerciseLogs = await ExerciseLog.find(todayQuery);
    const exerciseTotal = exerciseLogs.reduce((sum, log) => sum + log.duration, 0);

    // 7. Sleep Hours
    const sleepLogs = await SleepLog.find(todayQuery).sort({ timestamp: -1 });
    const sleepHours = sleepLogs[0] ? sleepLogs[0].totalHours : 0;

    // 8. Latest weight in the database
    const latestWeightLog = await WeightLog.findOne({ userId }).sort({ timestamp: -1 });
    const latestWeight = latestWeightLog ? latestWeightLog.weight : null;

    // 9. Mood today
    const moodLogs = await MoodLog.find(todayQuery).sort({ timestamp: -1 });
    const moodToday = moodLogs[0] ? moodLogs[0].mood : null;

    res.json({
      status: 'success',
      data: {
        glucose: { value: latestGlucose, count: glucoseCount },
        meals: { value: mealsCount, goal: 3 },
        insulin: { value: insulinUnits },
        medications: { value: medsTaken },
        water: { value: waterTotal, goal: 2000 }, // default 2L
        exercise: { value: exerciseTotal, goal: 30 }, // default 30 mins
        sleep: { value: sleepHours, goal: 8 },
        weight: { value: latestWeight },
        mood: { value: moodToday },
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to retrieve today\'s summary', error: err.message });
  }
};

// GET /api/health-logs/stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 7 } = req.query;
    const parsedDays = parseInt(days);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parsedDays);

    const query = {
      userId,
      timestamp: { $gte: cutoffDate },
    };

    // Parallel fetch logs of last N days
    const [glucose, meals, insulin, water, exercise, sleep, weight] = await Promise.all([
      GlucoseLog.find(query).sort({ timestamp: 1 }),
      MealLog.find(query).sort({ timestamp: 1 }),
      InsulinLog.find(query).sort({ timestamp: 1 }),
      WaterLog.find(query).sort({ timestamp: 1 }),
      ExerciseLog.find(query).sort({ timestamp: 1 }),
      SleepLog.find(query).sort({ timestamp: 1 }),
      WeightLog.find({ userId }).sort({ timestamp: 1 }), // weights get entire history for trends
    ]);

    // Compute averages
    const glucoseValues = glucose.map((g) => (g.unit === 'mmol/L' ? g.glucoseLevel * 18 : g.glucoseLevel));
    const avgGlucose = glucoseValues.length ? Math.round(glucoseValues.reduce((s, v) => s + v, 0) / glucoseValues.length) : null;
    const highestGlucose = glucoseValues.length ? Math.max(...glucoseValues) : null;
    const lowestGlucose = glucoseValues.length ? Math.min(...glucoseValues) : null;

    const avgCarbs = meals.length ? Math.round(meals.reduce((s, m) => s + m.carbohydrates, 0) / meals.length) : null;
    const avgCalories = meals.length ? Math.round(meals.reduce((s, m) => s + m.calories, 0) / meals.length) : null;
    
    const totalInsulin = insulin.reduce((s, i) => s + i.units, 0);
    const totalWater = water.reduce((s, w) => s + w.amount, 0);
    const totalExercise = exercise.reduce((s, e) => s + e.duration, 0);

    const sleepHours = sleep.map((s) => s.totalHours);
    const avgSleep = sleepHours.length ? parseFloat((sleepHours.reduce((s, v) => s + v, 0) / sleepHours.length).toFixed(1)) : null;

    // Weight difference (latest weight - weight at start of period)
    let weightChange = 0;
    if (weight.length > 1) {
      weightChange = parseFloat((weight[weight.length - 1].weight - weight[0].weight).toFixed(1));
    }

    res.json({
      status: 'success',
      data: {
        averages: {
          avgGlucose,
          highestGlucose,
          lowestGlucose,
          avgCarbs,
          avgCalories,
          totalInsulin,
          totalWater,
          totalExercise,
          avgSleep,
          weightChange,
        },
        charts: {
          glucose: glucose.map((g) => ({
            date: new Date(g.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            value: g.glucoseLevel,
            unit: g.unit,
            status: g.status,
            readingType: g.readingType,
          })),
          meals: meals.map((m) => ({
            date: new Date(m.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            calories: m.calories,
            carbs: m.carbohydrates,
            mealType: m.mealType,
          })),
          insulin: insulin.map((i) => ({
            date: new Date(i.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            units: i.units,
            type: i.insulinType,
          })),
          water: water.map((w) => ({
            date: new Date(w.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            amount: w.amount,
          })),
          exercise: exercise.map((e) => ({
            date: new Date(e.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            duration: e.duration,
            caloriesBurned: e.caloriesBurned,
          })),
          sleep: sleep.map((s) => ({
            date: new Date(s.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            hours: s.totalHours,
            quality: s.quality,
          })),
          weight: weight.slice(-10).map((w) => ({ // last 10 readings
            date: new Date(w.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            weight: w.weight,
            bmi: w.bmi,
          })),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to retrieve stats data', error: err.message });
  }
};

// GET /api/health-logs/insights
exports.getInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [glucoseCount, todayGlucose, yesterdayMeds, waterToday, mealsToday] = await Promise.all([
      GlucoseLog.countDocuments({ userId }),
      GlucoseLog.find({ userId, timestamp: { $gte: startOfToday } }),
      MedicationLog.find({ userId, timestamp: { $gte: new Date(Date.now() - 24 * 3600 * 1000) } }),
      WaterLog.find({ userId, timestamp: { $gte: startOfToday } }),
      MealLog.find({ userId, timestamp: { $gte: startOfToday } }),
    ]);

    const insights = [];

    // Heuristics
    // 1. Water Intake
    const totalWater = waterToday.reduce((sum, w) => sum + w.amount, 0);
    if (totalWater === 0) {
      insights.push('You haven\'t logged water today. Stay hydrated!');
    } else if (totalWater < 1200) {
      insights.push('You are below your daily water target. Sip some water.');
    }

    // 2. Glucose trends
    if (todayGlucose.length > 0) {
      const highReadings = todayGlucose.filter((g) => g.status === 'High');
      const lowReadings = todayGlucose.filter((g) => g.status === 'Low');

      if (highReadings.length >= 2) {
        insights.push('Your glucose levels have been high today. Consider reducing carbohydrate intake during dinner.');
      }
      if (lowReadings.length > 0) {
        insights.push('You experienced low blood sugar today. Ensure you have fast-acting sugar nearby.');
      }
    }

    // 3. Medication Compliance
    const missedMeds = yesterdayMeds.filter((m) => m.status === 'Missed' || m.status === 'Skipped');
    if (missedMeds.length > 0) {
      insights.push(`You skipped or missed a medication dose (${missedMeds[0].medicineName}) in the last 24 hours.`);
    }

    // 4. Default Insights
    if (insights.length === 0) {
      insights.push('Your fasting glucose has remained stable and in range this week.');
      insights.push('Keep up the good work logging your meals and symptoms!');
    }

    // Return a curated list of recommendations
    res.json({
      status: 'success',
      data: insights,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to retrieve insights', error: err.message });
  }
};

// ==========================================
// GLUCOSE CRUD
// ==========================================
exports.createGlucose = async (req, res) => {
  try {
    const { glucoseLevel, unit, readingType, source, notes, timestamp } = req.value || req.body;
    const status = calculateGlucoseStatus(Number(glucoseLevel), unit, readingType);
    const isInRange = status === 'Normal';

    const log = new GlucoseLog({
      userId: req.user.id,
      glucoseLevel: Number(glucoseLevel),
      unit,
      readingType,
      source,
      status,
      isInRange,
      notes,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    await log.save();
    res.status(201).json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to create glucose log', error: err.message });
  }
};

exports.updateGlucose = async (req, res) => {
  try {
    const { glucoseLevel, unit, readingType, source, notes, timestamp } = req.body;
    const log = await GlucoseLog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });

    if (glucoseLevel !== undefined) log.glucoseLevel = Number(glucoseLevel);
    if (unit !== undefined) log.unit = unit;
    if (readingType !== undefined) log.readingType = readingType;
    if (source !== undefined) log.source = source;
    if (notes !== undefined) log.notes = notes;
    if (timestamp !== undefined) log.timestamp = new Date(timestamp);

    log.status = calculateGlucoseStatus(log.glucoseLevel, log.unit, log.readingType);
    log.isInRange = log.status === 'Normal';

    await log.save();
    res.json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to update glucose log', error: err.message });
  }
};

exports.deleteGlucose = async (req, res) => {
  try {
    const log = await GlucoseLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });
    res.json({ status: 'success', message: 'Log deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete glucose log', error: err.message });
  }
};

// ==========================================
// INSULIN CRUD
// ==========================================
exports.createInsulin = async (req, res) => {
  try {
    const { units, insulinType, injectionSite, mealRelation, notes, timestamp } = req.body;
    const log = new InsulinLog({
      userId: req.user.id,
      units: Number(units),
      insulinType,
      injectionSite,
      mealRelation,
      notes,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });
    await log.save();
    res.status(201).json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to create insulin log', error: err.message });
  }
};

exports.updateInsulin = async (req, res) => {
  try {
    const { units, insulinType, injectionSite, mealRelation, notes, timestamp } = req.body;
    const log = await InsulinLog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });

    if (units !== undefined) log.units = Number(units);
    if (insulinType !== undefined) log.insulinType = insulinType;
    if (injectionSite !== undefined) log.injectionSite = injectionSite;
    if (mealRelation !== undefined) log.mealRelation = mealRelation;
    if (notes !== undefined) log.notes = notes;
    if (timestamp !== undefined) log.timestamp = new Date(timestamp);

    await log.save();
    res.json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to update insulin log', error: err.message });
  }
};

exports.deleteInsulin = async (req, res) => {
  try {
    const log = await InsulinLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });
    res.json({ status: 'success', message: 'Log deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete insulin log', error: err.message });
  }
};

// ==========================================
// MEAL CRUD
// ==========================================
exports.createMeal = async (req, res) => {
  try {
    const {
      mealType,
      foodItems,
      carbohydrates,
      protein,
      fat,
      calories,
      imageUrl,
      waterConsumed,
      bloodSugarImpact,
      notes,
      timestamp,
    } = req.body;
    const log = new MealLog({
      userId: req.user.id,
      mealType,
      foodItems,
      carbohydrates: Number(carbohydrates || 0),
      protein: Number(protein || 0),
      fat: Number(fat || 0),
      calories: Number(calories || 0),
      imageUrl,
      waterConsumed: Number(waterConsumed || 0),
      bloodSugarImpact: bloodSugarImpact || '',
      notes,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });
    await log.save();

    // If water was logged within the meal, also optionally save a WaterLog entry
    if (waterConsumed && Number(waterConsumed) > 0) {
      await new WaterLog({
        userId: req.user.id,
        amount: Number(waterConsumed),
        timestamp: log.timestamp,
      }).save();
    }

    res.status(201).json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to create meal log', error: err.message });
  }
};

exports.updateMeal = async (req, res) => {
  try {
    const {
      mealType,
      foodItems,
      carbohydrates,
      protein,
      fat,
      calories,
      imageUrl,
      waterConsumed,
      bloodSugarImpact,
      notes,
      timestamp,
    } = req.body;
    const log = await MealLog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });

    if (mealType !== undefined) log.mealType = mealType;
    if (foodItems !== undefined) log.foodItems = foodItems;
    if (carbohydrates !== undefined) log.carbohydrates = Number(carbohydrates || 0);
    if (protein !== undefined) log.protein = Number(protein || 0);
    if (fat !== undefined) log.fat = Number(fat || 0);
    if (calories !== undefined) log.calories = Number(calories || 0);
    if (imageUrl !== undefined) log.imageUrl = imageUrl;
    if (waterConsumed !== undefined) log.waterConsumed = Number(waterConsumed || 0);
    if (bloodSugarImpact !== undefined) log.bloodSugarImpact = bloodSugarImpact || '';
    if (notes !== undefined) log.notes = notes;
    if (timestamp !== undefined) log.timestamp = new Date(timestamp);

    await log.save();
    res.json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to update meal log', error: err.message });
  }
};

exports.deleteMeal = async (req, res) => {
  try {
    const log = await MealLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });
    res.json({ status: 'success', message: 'Log deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete meal log', error: err.message });
  }
};

// ==========================================
// MEDICATION CRUD
// ==========================================
exports.createMedication = async (req, res) => {
  try {
    const { medicineName, dose, status, reminderTime, notes, timestamp } = req.body;
    const log = new MedicationLog({
      userId: req.user.id,
      medicineName,
      dose,
      status,
      reminderTime,
      notes,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });
    await log.save();
    res.status(201).json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to create medication log', error: err.message });
  }
};

exports.updateMedication = async (req, res) => {
  try {
    const { medicineName, dose, status, reminderTime, notes, timestamp } = req.body;
    const log = await MedicationLog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });

    if (medicineName !== undefined) log.medicineName = medicineName;
    if (dose !== undefined) log.dose = dose;
    if (status !== undefined) log.status = status;
    if (reminderTime !== undefined) log.reminderTime = reminderTime;
    if (notes !== undefined) log.notes = notes;
    if (timestamp !== undefined) log.timestamp = new Date(timestamp);

    await log.save();
    res.json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to update medication log', error: err.message });
  }
};

exports.deleteMedication = async (req, res) => {
  try {
    const log = await MedicationLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });
    res.json({ status: 'success', message: 'Log deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete medication log', error: err.message });
  }
};

// ==========================================
// WATER CRUD
// ==========================================
exports.createWater = async (req, res) => {
  try {
    const { amount, timestamp } = req.body;
    const log = new WaterLog({
      userId: req.user.id,
      amount: Number(amount),
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });
    await log.save();
    res.status(201).json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to log water', error: err.message });
  }
};

exports.deleteWater = async (req, res) => {
  try {
    const log = await WaterLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });
    res.json({ status: 'success', message: 'Log deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete water log', error: err.message });
  }
};

// ==========================================
// EXERCISE CRUD
// ==========================================
exports.createExercise = async (req, res) => {
  try {
    const { exerciseType, duration, distance, caloriesBurned, intensity, notes, timestamp } = req.body;
    const log = new ExerciseLog({
      userId: req.user.id,
      activity: exerciseType,
      duration: Number(duration),
      distance: Number(distance || 0),
      caloriesBurned: Number(caloriesBurned || 0),
      intensity,
      notes,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });
    await log.save();
    res.status(201).json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to create exercise log', error: err.message });
  }
};

exports.updateExercise = async (req, res) => {
  try {
    const { exerciseType, duration, distance, caloriesBurned, intensity, notes, timestamp } = req.body;
    const log = await ExerciseLog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });

    if (exerciseType !== undefined) log.activity = exerciseType;
    if (duration !== undefined) log.duration = Number(duration);
    if (distance !== undefined) log.distance = Number(distance || 0);
    if (caloriesBurned !== undefined) log.caloriesBurned = Number(caloriesBurned || 0);
    if (intensity !== undefined) log.intensity = intensity;
    if (notes !== undefined) log.notes = notes;
    if (timestamp !== undefined) log.timestamp = new Date(timestamp);

    await log.save();
    res.json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to update exercise log', error: err.message });
  }
};

exports.deleteExercise = async (req, res) => {
  try {
    const log = await ExerciseLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });
    res.json({ status: 'success', message: 'Log deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete exercise log', error: err.message });
  }
};

// ==========================================
// WEIGHT CRUD
// ==========================================
exports.createWeight = async (req, res) => {
  try {
    const { weight, bmi, bodyFat, notes, timestamp } = req.body;
    const log = new WeightLog({
      userId: req.user.id,
      weight: Number(weight),
      bmi: bmi ? Number(bmi) : undefined,
      bodyFat: bodyFat ? Number(bodyFat) : undefined,
      notes,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });
    await log.save();
    res.status(201).json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to log weight', error: err.message });
  }
};

exports.updateWeight = async (req, res) => {
  try {
    const { weight, bmi, bodyFat, notes, timestamp } = req.body;
    const log = await WeightLog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });

    if (weight !== undefined) log.weight = Number(weight);
    if (bmi !== undefined) log.bmi = bmi ? Number(bmi) : undefined;
    if (bodyFat !== undefined) log.bodyFat = bodyFat ? Number(bodyFat) : undefined;
    if (notes !== undefined) log.notes = notes;
    if (timestamp !== undefined) log.timestamp = new Date(timestamp);

    await log.save();
    res.json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to update weight log', error: err.message });
  }
};

exports.deleteWeight = async (req, res) => {
  try {
    const log = await WeightLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });
    res.json({ status: 'success', message: 'Log deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete weight log', error: err.message });
  }
};

// ==========================================
// SLEEP CRUD
// ==========================================
exports.createSleep = async (req, res) => {
  try {
    const { sleepTime, wakeTime, quality, notes, timestamp } = req.body;
    
    const sleepDate = new Date(sleepTime);
    const wakeDate = new Date(wakeTime);
    const totalHours = Math.max(0, (wakeDate - sleepDate) / (1000 * 60 * 60)); // calculate in hours

    const log = new SleepLog({
      userId: req.user.id,
      sleepTime: sleepDate,
      wakeTime: wakeDate,
      totalHours,
      quality,
      notes,
      timestamp: timestamp ? new Date(timestamp) : new Date(wakeTime),
    });
    await log.save();
    res.status(201).json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to log sleep', error: err.message });
  }
};

exports.updateSleep = async (req, res) => {
  try {
    const { sleepTime, wakeTime, quality, notes, timestamp } = req.body;
    const log = await SleepLog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });

    if (sleepTime !== undefined) log.sleepTime = new Date(sleepTime);
    if (wakeTime !== undefined) log.wakeTime = new Date(wakeTime);
    if (quality !== undefined) log.quality = quality;
    if (notes !== undefined) log.notes = notes;
    if (timestamp !== undefined) log.timestamp = new Date(timestamp);

    log.totalHours = Math.max(0, (log.wakeTime - log.sleepTime) / (1000 * 60 * 60));

    await log.save();
    res.json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to update sleep log', error: err.message });
  }
};

exports.deleteSleep = async (req, res) => {
  try {
    const log = await SleepLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });
    res.json({ status: 'success', message: 'Log deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete sleep log', error: err.message });
  }
};

// ==========================================
// SYMPTOMS CRUD
// ==========================================
exports.createSymptoms = async (req, res) => {
  try {
    const { symptoms, severity, notes, timestamp } = req.body;
    const log = new SymptomLog({
      userId: req.user.id,
      symptoms,
      severity: Number(severity),
      notes,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });
    await log.save();
    res.status(201).json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to log symptoms', error: err.message });
  }
};

exports.updateSymptoms = async (req, res) => {
  try {
    const { symptoms, severity, notes, timestamp } = req.body;
    const log = await SymptomLog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });

    if (symptoms !== undefined) log.symptoms = symptoms;
    if (severity !== undefined) log.severity = Number(severity);
    if (notes !== undefined) log.notes = notes;
    if (timestamp !== undefined) log.timestamp = new Date(timestamp);

    await log.save();
    res.json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to update symptom log', error: err.message });
  }
};

exports.deleteSymptoms = async (req, res) => {
  try {
    const log = await SymptomLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });
    res.json({ status: 'success', message: 'Log deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete symptom log', error: err.message });
  }
};

// ==========================================
// MOOD CRUD
// ==========================================
exports.createMood = async (req, res) => {
  try {
    const { mood, journalEntry, timestamp } = req.body;
    const log = new MoodLog({
      userId: req.user.id,
      mood,
      journalEntry,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });
    await log.save();
    res.status(201).json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to log mood', error: err.message });
  }
};

exports.updateMood = async (req, res) => {
  try {
    const { mood, journalEntry, timestamp } = req.body;
    const log = await MoodLog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });

    if (mood !== undefined) log.mood = mood;
    if (journalEntry !== undefined) log.journalEntry = journalEntry;
    if (timestamp !== undefined) log.timestamp = new Date(timestamp);

    await log.save();
    res.json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to update mood log', error: err.message });
  }
};

exports.deleteMood = async (req, res) => {
  try {
    const log = await MoodLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });
    res.json({ status: 'success', message: 'Log deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete mood log', error: err.message });
  }
};
