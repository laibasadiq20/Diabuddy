const GlucoseLog = require('../models/GlucoseLog');
const MealLog = require('../models/MealLog');
const InsulinLog = require('../models/InsulinLog');
const MedicationLog = require('../models/MedicationLog');
const WaterLog = require('../models/WaterLog');
const ExerciseLog = require('../models/ExerciseLog');
const SleepLog = require('../models/SleepLog');
const MoodLog = require('../models/MoodLog');

const TIR_LOW = 70;
const TIR_HIGH = 180;
const MS_DAY = 24 * 60 * 60 * 1000;

function toMgDl(level, unit) {
  const n = Number(level);
  if (!Number.isFinite(n)) return null;
  return unit === 'mmol/L' ? n * 18 : n;
}

function parseTzOffset(raw) {
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

/** Shift UTC date into client-local wall time using tzOffset minutes (JS getTimezoneOffset style). */
function toLocalParts(date, tzOffsetMin) {
  const local = new Date(date.getTime() - tzOffsetMin * 60 * 1000);
  return {
    y: local.getUTCFullYear(),
    m: local.getUTCMonth(),
    d: local.getUTCDate(),
    key: `${local.getUTCFullYear()}-${String(local.getUTCMonth() + 1).padStart(2, '0')}-${String(local.getUTCDate()).padStart(2, '0')}`,
    label: local.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
  };
}

function startOfLocalDayUtc(y, m, d, tzOffsetMin) {
  // midnight local = UTC + offset
  return new Date(Date.UTC(y, m, d, 0, 0, 0, 0) + tzOffsetMin * 60 * 1000);
}

function endOfLocalDayUtc(y, m, d, tzOffsetMin) {
  return new Date(Date.UTC(y, m, d, 23, 59, 59, 999) + tzOffsetMin * 60 * 1000);
}

function resolveRange({ preset, startDate, endDate, tzOffset }) {
  const now = new Date();
  const localNow = toLocalParts(now, tzOffset);
  const end = endOfLocalDayUtc(localNow.y, localNow.m, localNow.d, tzOffset);

  if (preset === 'custom' && startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
      throw Object.assign(new Error('Invalid custom date range'), { statusCode: 400 });
    }
    const sParts = toLocalParts(s, tzOffset);
    const eParts = toLocalParts(e, tzOffset);
    const start = startOfLocalDayUtc(sParts.y, sParts.m, sParts.d, tzOffset);
    const finish = endOfLocalDayUtc(eParts.y, eParts.m, eParts.d, tzOffset);
    if (start > finish) {
      throw Object.assign(new Error('Start date must be before end date'), { statusCode: 400 });
    }
    const days = Math.max(1, Math.round((finish - start) / MS_DAY) + 1);
    if (days > 366) {
      throw Object.assign(new Error('Custom range cannot exceed 366 days'), { statusCode: 400 });
    }
    return { start, end: finish, days, label: `${sParts.label} – ${eParts.label}` };
  }

  const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
  const days = daysMap[preset] || 7;
  const startLocal = new Date(Date.UTC(localNow.y, localNow.m, localNow.d));
  startLocal.setUTCDate(startLocal.getUTCDate() - (days - 1));
  const start = startOfLocalDayUtc(
    startLocal.getUTCFullYear(),
    startLocal.getUTCMonth(),
    startLocal.getUTCDate(),
    tzOffset
  );
  const startParts = toLocalParts(start, tzOffset);
  const endParts = toLocalParts(end, tzOffset);
  const labels = { '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 3 months' };
  return {
    start,
    end,
    days,
    label: labels[preset] || `Last ${days} days`,
    shortLabel: `${startParts.label} – ${endParts.label}`,
  };
}

function dayKeysBetween(start, end, tzOffset) {
  const keys = [];
  let cursor = toLocalParts(start, tzOffset);
  let cur = startOfLocalDayUtc(cursor.y, cursor.m, cursor.d, tzOffset);
  const last = end;
  while (cur <= last) {
    const parts = toLocalParts(cur, tzOffset);
    keys.push({ key: parts.key, label: parts.label });
    cur = new Date(cur.getTime() + MS_DAY);
  }
  return keys;
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

function avg(nums) {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

async function fetchLogs(userId, start, end) {
  const query = { userId, timestamp: { $gte: start, $lte: end } };
  const [glucose, meals, insulin, medications, water, exercise, sleep, mood] = await Promise.all([
    GlucoseLog.find(query).sort({ timestamp: 1 }).lean(),
    MealLog.find(query).sort({ timestamp: 1 }).lean(),
    InsulinLog.find(query).sort({ timestamp: 1 }).lean(),
    MedicationLog.find(query).sort({ timestamp: 1 }).lean(),
    WaterLog.find(query).sort({ timestamp: 1 }).lean(),
    ExerciseLog.find(query).sort({ timestamp: 1 }).lean(),
    SleepLog.find(query).sort({ timestamp: 1 }).lean(),
    MoodLog.find(query).sort({ timestamp: 1 }).lean(),
  ]);
  return { glucose, meals, insulin, medications, water, exercise, sleep, mood };
}

function aggregatePeriod(logs, start, end, tzOffset, label, shortLabel) {
  const days = dayKeysBetween(start, end, tzOffset);
  const dayMap = Object.fromEntries(
    days.map((d) => [
      d.key,
      {
        date: d.key,
        label: d.label,
        glucoseSum: 0,
        glucoseCount: 0,
        glucoseInRange: 0,
        glucoseHigh: 0,
        glucoseLow: 0,
        carbs: 0,
        meals: 0,
        insulin: 0,
        water: 0,
        exercise: 0,
        sleepHours: null,
        sleepSamples: [],
        medsTaken: 0,
        medsTotal: 0,
      },
    ])
  );

  const glucoseMg = [];
  let inRange = 0;
  let high = 0;
  let low = 0;

  for (const g of logs.glucose) {
    const mg = toMgDl(g.glucoseLevel, g.unit);
    if (mg == null) continue;
    glucoseMg.push(mg);
    const key = toLocalParts(new Date(g.timestamp), tzOffset).key;
    const bucket = dayMap[key];
    if (bucket) {
      bucket.glucoseSum += mg;
      bucket.glucoseCount += 1;
    }
    const ranged =
      typeof g.isInRange === 'boolean'
        ? g.isInRange
        : mg >= TIR_LOW && mg <= TIR_HIGH;
    if (ranged) {
      inRange += 1;
      if (bucket) bucket.glucoseInRange += 1;
    } else if (mg < TIR_LOW) {
      low += 1;
      if (bucket) bucket.glucoseLow += 1;
    } else {
      high += 1;
      if (bucket) bucket.glucoseHigh += 1;
    }
  }

  let totalCarbs = 0;
  let totalCalories = 0;
  const mealTypeCounts = {};
  for (const m of logs.meals) {
    const carbs = Number(m.carbohydrates) || 0;
    const cals = Number(m.calories) || 0;
    totalCarbs += carbs;
    totalCalories += cals;
    mealTypeCounts[m.mealType || 'Other'] = (mealTypeCounts[m.mealType || 'Other'] || 0) + 1;
    const key = toLocalParts(new Date(m.timestamp), tzOffset).key;
    if (dayMap[key]) {
      dayMap[key].carbs += carbs;
      dayMap[key].meals += 1;
    }
  }

  let totalInsulin = 0;
  const insulinByType = {};
  for (const i of logs.insulin) {
    const units = Number(i.units) || 0;
    totalInsulin += units;
    const type = i.insulinType || 'Other';
    insulinByType[type] = (insulinByType[type] || 0) + units;
    const key = toLocalParts(new Date(i.timestamp), tzOffset).key;
    if (dayMap[key]) dayMap[key].insulin += units;
  }

  let medsTaken = 0;
  let medsMissed = 0;
  let medsSkipped = 0;
  for (const med of logs.medications) {
    const key = toLocalParts(new Date(med.timestamp), tzOffset).key;
    if (dayMap[key]) dayMap[key].medsTotal += 1;
    if (med.status === 'Taken') {
      medsTaken += 1;
      if (dayMap[key]) dayMap[key].medsTaken += 1;
    } else if (med.status === 'Missed') medsMissed += 1;
    else if (med.status === 'Skipped') medsSkipped += 1;
  }
  const medsLogged = medsTaken + medsMissed + medsSkipped;
  const adherencePercent =
    medsLogged > 0 ? Math.round((medsTaken / medsLogged) * 1000) / 10 : null;

  let totalWater = 0;
  for (const w of logs.water) {
    const amt = Number(w.amount) || 0;
    totalWater += amt;
    const key = toLocalParts(new Date(w.timestamp), tzOffset).key;
    if (dayMap[key]) dayMap[key].water += amt;
  }

  let totalExercise = 0;
  let totalCaloriesBurned = 0;
  for (const e of logs.exercise) {
    const dur = Number(e.duration) || 0;
    totalExercise += dur;
    totalCaloriesBurned += Number(e.caloriesBurned) || 0;
    const key = toLocalParts(new Date(e.timestamp), tzOffset).key;
    if (dayMap[key]) dayMap[key].exercise += dur;
  }

  const sleepHoursList = [];
  for (const s of logs.sleep) {
    const hrs = Number(s.totalHours);
    if (!Number.isFinite(hrs)) continue;
    sleepHoursList.push(hrs);
    const key = toLocalParts(new Date(s.wakeTime || s.timestamp), tzOffset).key;
    if (dayMap[key]) dayMap[key].sleepSamples.push(hrs);
  }
  for (const d of Object.values(dayMap)) {
    if (d.sleepSamples.length) {
      d.sleepHours = round1(avg(d.sleepSamples));
    }
  }

  const moodCounts = {};
  let stressSum = 0;
  let stressCount = 0;
  const stressMap = { Low: 1, Medium: 2, Moderate: 2, High: 3 };
  for (const m of logs.mood) {
    const mood = m.mood || 'Unknown';
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    if (m.stressLevel && stressMap[m.stressLevel] != null) {
      stressSum += stressMap[m.stressLevel];
      stressCount += 1;
    }
  }

  const daily = days.map((d) => {
    const b = dayMap[d.key];
    return {
      date: d.key,
      label: d.label,
      avgGlucose: b.glucoseCount ? Math.round(b.glucoseSum / b.glucoseCount) : null,
      glucoseCount: b.glucoseCount,
      carbs: Math.round(b.carbs * 10) / 10,
      meals: b.meals,
      insulin: round1(b.insulin),
      water: b.water,
      exercise: b.exercise,
      sleepHours: b.sleepHours,
      medAdherence:
        b.medsTotal > 0 ? Math.round((b.medsTaken / b.medsTotal) * 1000) / 10 : null,
    };
  });

  const readings = glucoseMg.length;
  const timeInRangePercent =
    readings > 0 ? Math.round((inRange / readings) * 1000) / 10 : null;

  const glucoseSeries = logs.glucose.map((g) => {
    const mg = toMgDl(g.glucoseLevel, g.unit);
    const parts = toLocalParts(new Date(g.timestamp), tzOffset);
    return {
      at: new Date(g.timestamp).toISOString(),
      date: parts.key,
      label: parts.label,
      valueMgDl: mg == null ? null : Math.round(mg * 10) / 10,
      unit: g.unit,
      readingType: g.readingType,
      status: g.status,
    };
  });

  const metrics = {
    glucoseReadings: readings,
    avgGlucose: readings ? Math.round(avg(glucoseMg)) : null,
    highestGlucose: readings ? Math.round(Math.max(...glucoseMg)) : null,
    lowestGlucose: readings ? Math.round(Math.min(...glucoseMg)) : null,
    timeInRangePercent,
    highReadings: high,
    lowReadings: low,
    inRangeReadings: inRange,
    mealsLogged: logs.meals.length,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    avgCarbsPerMeal: logs.meals.length ? Math.round((totalCarbs / logs.meals.length) * 10) / 10 : null,
    totalCaloriesConsumed: Math.round(totalCalories),
    mealTypeCounts,
    totalInsulinUnits: round1(totalInsulin),
    insulinByType: Object.fromEntries(
      Object.entries(insulinByType).map(([k, v]) => [k, round1(v)])
    ),
    medicationsLogged: medsLogged,
    medsTaken,
    medsMissed,
    medsSkipped,
    adherencePercent,
    totalWaterMl: totalWater,
    avgWaterPerDay: days.length ? Math.round(totalWater / days.length) : null,
    totalExerciseMinutes: totalExercise,
    avgExercisePerDay: days.length ? round1(totalExercise / days.length) : null,
    totalCaloriesBurned: Math.round(totalCaloriesBurned),
    sleepNights: sleepHoursList.length,
    avgSleepHours: sleepHoursList.length ? round1(avg(sleepHoursList)) : null,
    moodCounts,
    moodEntries: logs.mood.length,
    avgStressScore: stressCount ? round1(stressSum / stressCount) : null,
    loggingDays: daily.filter(
      (d) =>
        d.glucoseCount ||
        d.meals ||
        d.insulin ||
        d.water ||
        d.exercise ||
        d.sleepHours != null ||
        d.medAdherence != null
    ).length,
    dayCount: days.length,
  };

  return {
    label,
    shortLabel: shortLabel || label,
    start: start.toISOString(),
    end: end.toISOString(),
    metrics,
    charts: {
      daily,
      glucoseSeries,
      tir: {
        inRange: inRange,
        high,
        low,
        targetLow: TIR_LOW,
        targetHigh: TIR_HIGH,
      },
      insulinByType: Object.entries(insulinByType).map(([name, units]) => ({
        name,
        units: round1(units),
      })),
      mealTypes: Object.entries(mealTypeCounts).map(([name, count]) => ({ name, count })),
      mood: Object.entries(moodCounts).map(([name, count]) => ({ name, count })),
    },
  };
}

function buildInsights(period) {
  const m = period.metrics;
  const insights = [];

  if (m.glucoseReadings === 0 && m.mealsLogged === 0 && m.medicationsLogged === 0) {
    insights.push({
      type: 'Suggestion',
      message: 'No health logs in this period yet. Start with a glucose or meal entry to unlock trends.',
    });
    return insights;
  }

  if (m.timeInRangePercent != null) {
    if (m.timeInRangePercent >= 70) {
      insights.push({
        type: 'Achievement',
        message: `Time in range was ${m.timeInRangePercent}% (${TIR_LOW}–${TIR_HIGH} mg/dL) across ${m.glucoseReadings} readings.`,
      });
    } else if (m.timeInRangePercent < 50) {
      insights.push({
        type: 'Warning',
        message: `Time in range was only ${m.timeInRangePercent}%. ${m.highReadings} high and ${m.lowReadings} low readings in this period.`,
      });
    } else {
      insights.push({
        type: 'Suggestion',
        message: `Time in range was ${m.timeInRangePercent}%. Aim toward 70%+ with steadier meal timing and logging.`,
      });
    }
  }

  if (m.avgGlucose != null) {
    insights.push({
      type: 'Suggestion',
      message: `Average glucose was ${m.avgGlucose} mg/dL (range ${m.lowestGlucose}–${m.highestGlucose}).`,
    });
  }

  if (m.adherencePercent != null) {
    if (m.adherencePercent >= 90) {
      insights.push({
        type: 'Achievement',
        message: `Medication adherence was ${m.adherencePercent}% (${m.medsTaken} taken of ${m.medicationsLogged} logged doses).`,
      });
    } else if (m.adherencePercent < 70) {
      insights.push({
        type: 'Warning',
        message: `Medication adherence was ${m.adherencePercent}% — ${m.medsMissed + m.medsSkipped} missed or skipped doses.`,
      });
    }
  }

  if (m.avgSleepHours != null && m.avgSleepHours < 6) {
    insights.push({
      type: 'Warning',
      message: `Average sleep was ${m.avgSleepHours} h. Short sleep can raise next-day glucose variability.`,
    });
  } else if (m.avgSleepHours != null && m.avgSleepHours >= 7) {
    insights.push({
      type: 'Achievement',
      message: `Average sleep was ${m.avgSleepHours} h across ${m.sleepNights} nights.`,
    });
  }

  if (m.avgWaterPerDay != null && m.avgWaterPerDay < 1200 && m.totalWaterMl > 0) {
    insights.push({
      type: 'Suggestion',
      message: `Average water intake was ${m.avgWaterPerDay} ml/day. A common daily target is around 2000 ml.`,
    });
  }

  if (m.totalExerciseMinutes === 0 && m.dayCount >= 7) {
    insights.push({
      type: 'Suggestion',
      message: 'No activity minutes logged in this period. Even short walks help glucose after meals.',
    });
  } else if (m.totalExerciseMinutes > 0) {
    insights.push({
      type: 'Suggestion',
      message: `You logged ${m.totalExerciseMinutes} activity minutes (about ${m.avgExercisePerDay} min/day).`,
    });
  }

  if (m.loggingDays < Math.min(3, m.dayCount) && m.dayCount >= 7) {
    insights.push({
      type: 'Suggestion',
      message: `Logs on ${m.loggingDays} of ${m.dayCount} days — more consistent logging makes patterns clearer.`,
    });
  }

  return insights.slice(0, 6);
}

function metricDeltas(current, previous) {
  const keys = [
    'avgGlucose',
    'timeInRangePercent',
    'totalInsulinUnits',
    'totalCarbs',
    'adherencePercent',
    'avgSleepHours',
    'totalExerciseMinutes',
    'avgWaterPerDay',
    'glucoseReadings',
    'mealsLogged',
  ];
  const deltas = {};
  for (const key of keys) {
    const a = current.metrics[key];
    const b = previous.metrics[key];
    if (a == null || b == null) {
      deltas[key] = null;
    } else {
      deltas[key] = typeof a === 'number' && typeof b === 'number' ? round1(a - b) : null;
    }
  }
  return deltas;
}

/**
 * GET /api/health-logs/report
 * Query:
 *  preset=7d|30d|90d|custom
 *  startDate, endDate (ISO) when custom
 *  compare=true
 *  comparePreset | compareStartDate + compareEndDate
 *  tzOffset (minutes, Date#getTimezoneOffset)
 */
exports.getHealthReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const tzOffset = parseTzOffset(req.query.tzOffset);
    const preset = req.query.preset || '7d';
    const compare = String(req.query.compare || '') === 'true' || req.query.compare === '1';

    const primary = resolveRange({
      preset,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      tzOffset,
    });

    const primaryLogs = await fetchLogs(userId, primary.start, primary.end);
    const period = aggregatePeriod(
      primaryLogs,
      primary.start,
      primary.end,
      tzOffset,
      primary.label,
      primary.shortLabel
    );
    const insights = buildInsights(period);

    let comparePeriod = null;
    let deltas = null;

    if (compare) {
      let compareRange;
      if (req.query.compareStartDate && req.query.compareEndDate) {
        compareRange = resolveRange({
          preset: 'custom',
          startDate: req.query.compareStartDate,
          endDate: req.query.compareEndDate,
          tzOffset,
        });
      } else if (req.query.comparePreset) {
        compareRange = resolveRange({
          preset: req.query.comparePreset,
          tzOffset,
        });
      } else {
        // Default: immediately preceding window of same length
        const prevEnd = new Date(primary.start.getTime() - 1);
        const prevStart = new Date(prevEnd.getTime() - (primary.days - 1) * MS_DAY);
        const sParts = toLocalParts(prevStart, tzOffset);
        const eParts = toLocalParts(prevEnd, tzOffset);
        compareRange = {
          start: startOfLocalDayUtc(sParts.y, sParts.m, sParts.d, tzOffset),
          end: endOfLocalDayUtc(eParts.y, eParts.m, eParts.d, tzOffset),
          days: primary.days,
          label: 'Previous period',
          shortLabel: `${sParts.label} – ${eParts.label}`,
        };
      }

      const compareLogs = await fetchLogs(userId, compareRange.start, compareRange.end);
      comparePeriod = aggregatePeriod(
        compareLogs,
        compareRange.start,
        compareRange.end,
        tzOffset,
        compareRange.label,
        compareRange.shortLabel
      );
      deltas = metricDeltas(period, comparePeriod);
    }

    res.json({
      status: 'success',
      data: {
        generatedAt: new Date().toISOString(),
        unitSystem: 'mg/dL',
        tirTarget: { low: TIR_LOW, high: TIR_HIGH },
        period,
        comparePeriod,
        deltas,
        insights,
      },
    });
  } catch (err) {
    const code = err.statusCode || 500;
    res.status(code).json({
      status: 'error',
      message: err.message || 'Failed to generate health report',
      error: code === 500 ? err.message : undefined,
    });
  }
};
