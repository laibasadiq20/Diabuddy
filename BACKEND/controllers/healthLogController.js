const GlucoseLog = require('../models/GlucoseLog');
const InsulinLog = require('../models/InsulinLog');
const MealLog = require('../models/MealLog');
const MedicationLog = require('../models/MedicationLog');
const WaterLog = require('../models/WaterLog');
const ExerciseLog = require('../models/ExerciseLog');
const SleepLog = require('../models/SleepLog');
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
      sleep: { model: SleepLog, type: 'Sleep' },
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
            title = log.insulinType || 'Insulin';
            subtitle = `${log.units} Units`;
            valueStr = [
              log.mealRelation && log.mealRelation !== 'None' ? log.mealRelation : null,
              log.injectionSite || null,
            ]
              .filter(Boolean)
              .join(' · ');
            color = 'blue';
          } else if (type === 'Meal') {
            title = log.mealType;
            subtitle = log.foodItems;
            valueStr = [
              `${log.carbohydrates || 0} g carbs`,
              log.protein ? `${log.protein} g protein` : null,
              log.fat ? `${log.fat} g fat` : null,
              log.calories ? `${log.calories} kcal` : null,
            ]
              .filter(Boolean)
              .join(' · ');
            color = 'orange';
          } else if (type === 'Medication') {
            title = log.medicineName;
            subtitle = log.dose;
            valueStr = log.status;
            color = log.status === 'Taken' ? 'green' : log.status === 'Missed' ? 'red' : 'yellow';
          } else if (type === 'Water') {
            title = `${log.amount} ml`;
            subtitle = 'Water Intake';
            valueStr = 'Hydration';
            color = 'teal';
          } else if (type === 'Exercise') {
            title = log.activity;
            subtitle = [
              log.duration > 0 ? `${log.duration} min` : null,
              log.steps ? `${log.steps} steps` : null,
              log.caloriesBurned ? `${log.caloriesBurned} kcal` : null,
              log.distance ? `${log.distance} km` : null,
              log.intensity ? `${log.intensity}` : null,
              log.source && log.source !== 'Manual' ? log.source : null,
            ]
              .filter(Boolean)
              .join(' · ');
            valueStr = subtitle;
            color = 'emerald';
          } else if (type === 'Sleep') {
            title = `${log.totalHours.toFixed(1)} Hours`;
            subtitle = `Quality: ${log.quality}`;
            valueStr = `${new Date(log.sleepTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(log.wakeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            color = 'indigo';
          } else if (type === 'Mood') {
            const moodLabel = {
              Great: 'Very Happy',
              Good: 'Happy',
              Okay: 'Neutral',
              Low: 'Sad',
              Stressed: 'Anxious',
            }[log.mood] || log.mood;
            title = moodLabel;
            subtitle = log.stressLevel ? `Stress: ${log.stressLevel}` : log.journalEntry || '';
            valueStr = log.journalEntry || '';
            color =
              moodLabel === 'Very Happy' || moodLabel === 'Happy'
                ? 'green'
                : moodLabel === 'Neutral'
                  ? 'yellow'
                  : 'red';
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
    const latestGlucoseLog = glucoseLogs[0] || null;
    const latestGlucose = latestGlucoseLog ? `${latestGlucoseLog.glucoseLevel} ${latestGlucoseLog.unit}` : null;
    // mg/dL-normalized value so the frontend can convert to the user's preferred unit
    const latestGlucoseMgDl = latestGlucoseLog
      ? latestGlucoseLog.unit === 'mmol/L'
        ? latestGlucoseLog.glucoseLevel * 18
        : latestGlucoseLog.glucoseLevel
      : null;
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

    // 6. Exercise Minutes + steps
    // NOTE: for GoogleHealth-sourced logs, the sync writes a `gh-day-*` daily rollup
    // (steps for the whole day) plus one row per `gh-ex-*` workout. To avoid double
    // counting, googleHealthController zeroes out the overlapping field on one side
    // (rollup duration when workouts exist, workout steps always) — so a plain sum
    // here is already de-duplicated. Manual logs have no such overlap and just add up.
    const exerciseLogs = await ExerciseLog.find(todayQuery);
    const exerciseTotal = exerciseLogs.reduce((sum, log) => sum + (Number(log.duration) || 0), 0);
    const stepsTotal = exerciseLogs.reduce((sum, log) => sum + (Number(log.steps) || 0), 0);

    // 7. Sleep Hours
    const sleepLogs = await SleepLog.find(todayQuery).sort({ timestamp: -1 });
    const sleepHours = sleepLogs[0] ? sleepLogs[0].totalHours : 0;

    // 8. Mood today
    const moodLogs = await MoodLog.find(todayQuery).sort({ timestamp: -1 });
    const moodToday = moodLogs[0] ? moodLogs[0].mood : null;

    const waterGoal = Number(req.user?.dailyGoals?.waterMl) || 2000;
    const stepsGoal = Number(req.user?.dailyGoals?.steps) || 8000;

    res.json({
      status: 'success',
      data: {
        glucose: { value: latestGlucose, valueMgDl: latestGlucoseMgDl, count: glucoseCount },
        meals: { value: mealsCount, goal: 3 },
        insulin: { value: insulinUnits },
        medications: { value: medsTaken },
        water: { value: waterTotal, goal: waterGoal },
        exercise: { value: exerciseTotal, goal: 30 }, // default 30 mins
        steps: { value: stepsTotal, goal: stepsGoal },
        sleep: { value: sleepHours, goal: 8 },
        mood: { value: moodToday },
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to retrieve today\'s summary', error: err.message });
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
    const { units, insulinType, injectionSite, mealRelation, reason, notes, timestamp } = req.body || {};
    const unitsNum = Number(units);
    if (!Number.isFinite(unitsNum) || unitsNum < 0.1) {
      return res.status(400).json({
        status: 'error',
        message: 'Insulin units must be a number of at least 0.1',
      });
    }

    const reasonMap = {
      'Before Meal': 'Before Breakfast',
      'After Meal': 'After Breakfast',
    };
    let resolvedReason = reason || mealRelation || 'Other';
    if (reasonMap[resolvedReason]) resolvedReason = reasonMap[resolvedReason];

    let site = injectionSite == null ? '' : String(injectionSite);
    if (site === 'Arm') site = 'Left Arm';
    if (site === 'Thigh') site = 'Left Thigh';

    let when = timestamp ? new Date(timestamp) : new Date();
    if (Number.isNaN(when.getTime())) when = new Date();

    const log = new InsulinLog({
      userId: req.user.id,
      units: unitsNum,
      insulinType: String(insulinType || '').trim() || 'Rapid-Acting',
      injectionSite: site,
      mealRelation: resolvedReason,
      notes: notes == null ? '' : String(notes),
      timestamp: when,
    });
    await log.save();
    res.status(201).json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message || 'Failed to create insulin log',
      error: err.message,
    });
  }
};

exports.updateInsulin = async (req, res) => {
  try {
    const { units, insulinType, injectionSite, mealRelation, reason, notes, timestamp } = req.body || {};
    const log = await InsulinLog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });

    if (units !== undefined) {
      const unitsNum = Number(units);
      if (!Number.isFinite(unitsNum) || unitsNum < 0.1) {
        return res.status(400).json({
          status: 'error',
          message: 'Insulin units must be a number of at least 0.1',
        });
      }
      log.units = unitsNum;
    }
    if (insulinType !== undefined) log.insulinType = String(insulinType || '').trim() || log.insulinType;
    if (injectionSite !== undefined) {
      let site = injectionSite == null ? '' : String(injectionSite);
      if (site === 'Arm') site = 'Left Arm';
      if (site === 'Thigh') site = 'Left Thigh';
      log.injectionSite = site;
    }
    if (reason !== undefined || mealRelation !== undefined) {
      const reasonMap = {
        'Before Meal': 'Before Breakfast',
        'After Meal': 'After Breakfast',
      };
      let resolvedReason = reason || mealRelation;
      if (reasonMap[resolvedReason]) resolvedReason = reasonMap[resolvedReason];
      log.mealRelation = resolvedReason;
    }
    if (notes !== undefined) log.notes = notes == null ? '' : String(notes);
    if (timestamp !== undefined) {
      const when = new Date(timestamp);
      if (!Number.isNaN(when.getTime())) log.timestamp = when;
    }

    await log.save();
    res.json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message || 'Failed to update insulin log',
      error: err.message,
    });
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

    // If water was logged within the meal, also save a linked WaterLog entry.
    // The link (relatedMealLogId) is what updateMeal/deleteMeal use to keep it in sync.
    if (waterConsumed && Number(waterConsumed) > 0) {
      await new WaterLog({
        userId: req.user.id,
        amount: Number(waterConsumed),
        timestamp: log.timestamp,
        relatedMealLogId: log._id,
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

    // Keep the linked WaterLog (if any) in sync with this meal's water amount/time
    if (waterConsumed !== undefined || timestamp !== undefined) {
      const linkedWater = await WaterLog.findOne({ relatedMealLogId: log._id });
      if (log.waterConsumed > 0) {
        if (linkedWater) {
          linkedWater.amount = log.waterConsumed;
          linkedWater.timestamp = log.timestamp;
          await linkedWater.save();
        } else {
          await new WaterLog({
            userId: req.user.id,
            amount: log.waterConsumed,
            timestamp: log.timestamp,
            relatedMealLogId: log._id,
          }).save();
        }
      } else if (linkedWater) {
        // Water was cleared from the meal — remove the now-stale water entry
        await WaterLog.findByIdAndDelete(linkedWater._id);
      }
    }

    res.json({ status: 'success', data: log });
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Failed to update meal log', error: err.message });
  }
};

exports.deleteMeal = async (req, res) => {
  try {
    const log = await MealLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });
    // Remove the linked water entry so deleting a meal doesn't leave orphaned intake
    await WaterLog.deleteMany({ relatedMealLogId: log._id });
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
    const { medicineName, dose, status, route, notes, timestamp } = req.body;
    const log = new MedicationLog({
      userId: req.user.id,
      medicineName,
      dose,
      status,
      route: route || '',
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
    const { medicineName, dose, status, route, notes, timestamp } = req.body;
    const log = await MedicationLog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });

    if (medicineName !== undefined) log.medicineName = medicineName;
    if (dose !== undefined) log.dose = dose;
    if (status !== undefined) log.status = status;
    if (route !== undefined) log.route = route || '';
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
    const { amount, notes, timestamp } = req.body;
    const log = new WaterLog({
      userId: req.user.id,
      amount: Number(amount),
      notes: notes || '',
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
    const { exerciseType, duration, distance, steps, caloriesBurned, intensity, notes, source, timestamp } = req.body;
    const log = new ExerciseLog({
      userId: req.user.id,
      activity: exerciseType,
      duration: Number(duration),
      distance: Number(distance || 0),
      steps: Number(steps || 0),
      caloriesBurned: Number(caloriesBurned || 0),
      intensity,
      notes,
      source: source === 'Fitbit' ? 'Fitbit' : 'Manual',
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
    const { exerciseType, duration, distance, steps, caloriesBurned, intensity, notes, timestamp } = req.body;
    const log = await ExerciseLog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });

    if (exerciseType !== undefined) log.activity = exerciseType;
    if (duration !== undefined) log.duration = Number(duration);
    if (distance !== undefined) log.distance = Number(distance || 0);
    if (steps !== undefined) log.steps = Number(steps || 0);
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
// MOOD CRUD
// ==========================================
exports.createMood = async (req, res) => {
  try {
    const { mood, stressLevel, journalEntry, timestamp } = req.body;
    const log = new MoodLog({
      userId: req.user.id,
      mood,
      stressLevel: stressLevel || 'Low',
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
    const { mood, stressLevel, journalEntry, timestamp } = req.body;
    const log = await MoodLog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ status: 'error', message: 'Log not found' });

    if (mood !== undefined) log.mood = mood;
    if (stressLevel !== undefined) log.stressLevel = stressLevel;
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
