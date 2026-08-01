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
    const parseYmd = (raw) => {
      const m = String(raw).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) {
        return {
          y: Number(m[1]),
          m: Number(m[2]) - 1,
          d: Number(m[3]),
        };
      }
      const dt = new Date(raw);
      if (Number.isNaN(dt.getTime())) return null;
      return toLocalParts(dt, tzOffset);
    };
    const sParts = parseYmd(startDate);
    const eParts = parseYmd(endDate);
    if (!sParts || !eParts) {
      throw Object.assign(new Error('Invalid custom date range'), { statusCode: 400 });
    }
    const start = startOfLocalDayUtc(sParts.y, sParts.m, sParts.d, tzOffset);
    const finish = endOfLocalDayUtc(eParts.y, eParts.m, eParts.d, tzOffset);
    if (start > finish) {
      throw Object.assign(new Error('Start date must be before end date'), { statusCode: 400 });
    }
    const days = Math.max(1, Math.floor((finish.getTime() - start.getTime()) / MS_DAY) + 1);
    if (days > 366) {
      throw Object.assign(new Error('Custom range cannot exceed 366 days'), { statusCode: 400 });
    }
    const startLabel = new Date(Date.UTC(sParts.y, sParts.m, sParts.d)).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
    const endLabel = new Date(Date.UTC(eParts.y, eParts.m, eParts.d)).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
    return { start, end: finish, days, label: `${startLabel} – ${endLabel}`, shortLabel: `${startLabel} – ${endLabel}` };
  }

  const daysMap = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 };
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
  const labels = {
    '1d': 'Daily report',
    '7d': 'Weekly report',
    '30d': 'Monthly report',
    '90d': '3-month report',
  };
  return {
    start,
    end,
    days,
    label: labels[preset] || `Last ${days} days`,
    shortLabel: `${startParts.label} – ${endParts.label}`,
  };
}

/** Don't start a report before the user created their account. */
function clampRangeToAccountStart(range, accountCreatedAt, tzOffset) {
  if (!range || !accountCreatedAt) return range;
  const joined = new Date(accountCreatedAt);
  if (Number.isNaN(joined.getTime())) return range;

  const joinParts = toLocalParts(joined, tzOffset);
  const joinStart = startOfLocalDayUtc(joinParts.y, joinParts.m, joinParts.d, tzOffset);
  if (range.start >= joinStart) return range;

  // Account created after the selected window ended — keep original (empty report).
  if (joinStart > range.end) return range;

  const start = joinStart;
  const days = Math.max(1, Math.floor((range.end.getTime() - start.getTime()) / MS_DAY) + 1);
  const startParts = toLocalParts(start, tzOffset);
  const endParts = toLocalParts(range.end, tzOffset);
  return {
    ...range,
    start,
    days,
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

function round2(n) {
  return Math.round(n * 100) / 100;
}

function avg(nums) {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function stdDev(nums) {
  if (!nums || nums.length < 2) return null;
  const mean = avg(nums);
  if (mean == null) return null;
  const variance = nums.reduce((sum, n) => sum + (n - mean) ** 2, 0) / (nums.length - 1);
  return Math.sqrt(variance);
}

/** Estimated A1c (%) from mean glucose (mg/dL) — Nathan formula. Informational only. */
function estimatedA1cFromAvg(avgMgDl) {
  if (avgMgDl == null || !Number.isFinite(avgMgDl)) return null;
  return round2((avgMgDl + 46.7) / 28.7);
}

function classifyReadingType(readingType) {
  const rt = String(readingType || '');
  if (rt === 'Fasting' || rt === 'Before Breakfast') return 'Fasting';
  if (rt.startsWith('After ')) return 'After meal';
  if (rt.startsWith('Before ')) return 'Before meal';
  if (rt === 'Bedtime' || rt === 'Night') return 'Bedtime';
  return 'Other';
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
        mood: 0,
      },
    ])
  );

  const glucoseMg = [];
  const byReadingType = {};
  let inRange = 0;
  let high = 0;
  let low = 0;

  for (const g of logs.glucose) {
    const mg = toMgDl(g.glucoseLevel, g.unit);
    if (mg == null) continue;
    glucoseMg.push(mg);
    const typeKey = classifyReadingType(g.readingType);
    if (!byReadingType[typeKey]) byReadingType[typeKey] = { sum: 0, count: 0 };
    byReadingType[typeKey].sum += mg;
    byReadingType[typeKey].count += 1;
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
    const key = toLocalParts(new Date(m.timestamp), tzOffset).key;
    if (dayMap[key]) dayMap[key].mood += 1;
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
      mood: b.mood,
      medAdherence:
        b.medsTotal > 0 ? Math.round((b.medsTaken / b.medsTotal) * 1000) / 10 : null,
    };
  });

  const readings = glucoseMg.length;
  const timeInRangePercent =
    readings > 0 ? Math.round((inRange / readings) * 1000) / 10 : null;
  const avgGlucose = readings ? Math.round(avg(glucoseMg)) : null;
  const glucoseStdDev = readings >= 2 ? round1(stdDev(glucoseMg)) : null;
  const estimatedA1c = estimatedA1cFromAvg(avgGlucose);
  const glucoseByReadingType = Object.entries(byReadingType)
    .map(([name, v]) => ({
      name,
      count: v.count,
      avgGlucose: Math.round(v.sum / v.count),
    }))
    .sort((a, b) => b.count - a.count);

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
    avgGlucose,
    highestGlucose: readings ? Math.round(Math.max(...glucoseMg)) : null,
    lowestGlucose: readings ? Math.round(Math.min(...glucoseMg)) : null,
    glucoseStdDev,
    estimatedA1c,
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
        d.medAdherence != null ||
        d.mood
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
      glucoseByReadingType,
      insulinByType: Object.entries(insulinByType).map(([name, units]) => ({
        name,
        units: round1(units),
      })),
      mealTypes: Object.entries(mealTypeCounts).map(([name, count]) => ({ name, count })),
      mood: Object.entries(moodCounts).map(([name, count]) => ({ name, count })),
    },
  };
}

function periodPhrase(label) {
  const lower = String(label || '').toLowerCase();
  if (lower.includes('daily')) {
    return {
      when: 'today',
      nextGoals: 'Recommended Goals for Tomorrow',
      careLetterTitle: 'Daily Care Letter',
    };
  }
  if (lower.includes('weekly')) {
    return {
      when: 'this week',
      nextGoals: 'Recommended Goals Next Week',
      careLetterTitle: 'Weekly Care Letter',
    };
  }
  if (lower.includes('monthly')) {
    return {
      when: 'this month',
      nextGoals: 'Recommended Goals Next Month',
      careLetterTitle: 'Monthly Care Letter',
    };
  }
  return {
    when: 'this period',
    nextGoals: 'Recommended Goals Ahead',
    careLetterTitle: 'Care Letter',
  };
}

function variabilityLabel(stdDev) {
  if (stdDev == null || !Number.isFinite(stdDev)) return null;
  if (stdDev < 30) return 'Low';
  if (stdDev < 50) return 'Moderate';
  return 'High';
}

/**
 * Story-first report block: headline, narrative, rating, feedback, goals.
 * Answers “How did my week go?” in one glance.
 */
function buildStoryReport(period) {
  const m = period.metrics;
  const phrase = periodPhrase(period.label);
  const hasData =
    m.glucoseReadings > 0 ||
    m.mealsLogged > 0 ||
    m.medicationsLogged > 0 ||
    m.totalInsulinUnits > 0 ||
    m.totalExerciseMinutes > 0 ||
    m.sleepNights > 0;

  if (!hasData) {
    const emptyLetter =
      `We don’t have enough health logs from ${phrase.when} yet to write a full care letter. ` +
      'Add glucose, meals, or medication entries as you go — even a few days of consistent logging will unlock clearer insights and friendlier next steps. You’ve got this.';
    return {
      rating: 'empty',
      ratingLabel: 'No data yet',
      careLetterTitle: phrase.careLetterTitle,
      careLetter: emptyLetter,
      headline: phrase.careLetterTitle,
      narrative: emptyLetter,
      summary: emptyLetter,
      variabilityLabel: null,
      positiveNotes: [],
      recommendations: [
        'Log at least one glucose reading each day',
        'Record meals and medications as you go',
        'Check back after a few days of consistent logging',
      ],
      goalsTitle: phrase.nextGoals,
      sections: {
        glucose: 'No glucose readings logged.',
        medication: 'No medication doses logged.',
        nutrition: 'No meals logged.',
        lifestyle: 'No activity, water, or sleep logged.',
      },
    };
  }

  const tir = m.timeInRangePercent;
  const highs = m.highReadings || 0;
  const lows = m.lowReadings || 0;
  const varLabel = variabilityLabel(m.glucoseStdDev);
  let rating = 'fair';
  if (tir != null) {
    if (tir >= 80 && lows === 0 && (m.adherencePercent == null || m.adherencePercent >= 90)) {
      rating = 'excellent';
    } else if (tir >= 70) {
      rating = 'good';
    } else if (tir >= 50) {
      rating = 'fair';
    } else {
      rating = 'needs_attention';
    }
  } else if (m.adherencePercent != null && m.adherencePercent >= 90) {
    rating = 'good';
  }

  const ratingLabels = {
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    needs_attention: 'Needs attention',
  };

  const headline = phrase.careLetterTitle;

  // Warm companion-style care letter (one flowing paragraph).
  const letterParts = [];
  if (rating === 'excellent') {
    letterParts.push(
      `You maintained excellent glucose control throughout ${phrase.when.replace('this ', 'the ')}.`
    );
  } else if (rating === 'good') {
    letterParts.push(
      `You kept solid diabetes management through ${phrase.when}, with most readings near your target zone.`
    );
  } else if (rating === 'fair') {
    letterParts.push(
      `${phrase.when.charAt(0).toUpperCase() + phrase.when.slice(1)} had mixed results — there is a clear path to steadier control.`
    );
  } else {
    letterParts.push(
      `${phrase.when.charAt(0).toUpperCase() + phrase.when.slice(1)} was more challenging for glucose control, and small adjustments can help.`
    );
  }

  if (m.glucoseReadings > 0) {
    if (highs === 0 && lows === 0) {
      letterParts.push('There were no recorded high or low glucose events.');
    } else {
      letterParts.push(
        `There were ${highs} high and ${lows} low reading${highs + lows === 1 ? '' : 's'} worth a closer look.`
      );
    }
    if (tir != null) {
      letterParts.push(
        `Time in range was ${tir}%${m.avgGlucose != null ? ` with an average of ${m.avgGlucose} mg/dL` : ''}.`
      );
    }
  }

  if (m.adherencePercent != null) {
    if (m.adherencePercent >= 90) {
      letterParts.push(
        'Your medication routine was consistent, which supports steadier glucose levels.'
      );
    } else {
      letterParts.push(
        `Medication adherence was ${m.adherencePercent}% — tightening that routine can make a real difference.`
      );
    }
  } else if (m.totalInsulinUnits > 0) {
    letterParts.push(`You logged ${m.totalInsulinUnits} units of insulin across the period.`);
  }

  const gentleNudge = [];
  if (m.avgWaterPerDay != null && m.avgWaterPerDay < 1500 && m.totalWaterMl > 0) {
    gentleNudge.push('increasing your daily water intake');
  }
  if (m.loggingDays < (m.dayCount || 0)) {
    gentleNudge.push('logging glucose more frequently');
  }
  if (m.totalExerciseMinutes === 0 && (m.dayCount || 0) >= 3) {
    gentleNudge.push('adding short walks after meals');
  }
  if (tir != null && tir < 70) {
    gentleNudge.push('aiming for more readings in the target range');
  }

  if (gentleNudge.length) {
    const nudgeText =
      gentleNudge.length === 1
        ? gentleNudge[0].charAt(0).toUpperCase() + gentleNudge[0].slice(1)
        : gentleNudge.length === 2
          ? `${gentleNudge[0].charAt(0).toUpperCase() + gentleNudge[0].slice(1)} and ${gentleNudge[1]}`
          : `${gentleNudge
              .slice(0, -1)
              .map((s, i) => (i === 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s))
              .join(', ')}, and ${gentleNudge[gentleNudge.length - 1]}`;
    letterParts.push(
      `${nudgeText} will provide even better insights in future reports.`
    );
  }

  if (rating === 'excellent' || rating === 'good') {
    letterParts.push('Keep up the great work!');
  } else {
    letterParts.push('DiaBuddy is here with you — steady progress still counts.');
  }

  const careLetter = letterParts.join(' ');

  const positiveNotes = [];
  if (tir != null && tir >= 70) {
    positiveNotes.push(`Solid time in range at ${tir}% — keep reinforcing what’s working.`);
  }
  if (m.adherencePercent != null && m.adherencePercent >= 90) {
    positiveNotes.push('Great consistency with medications — that discipline protects long-term control.');
  }
  if (varLabel === 'Low') {
    positiveNotes.push('Glucose variability stayed low, which usually means steadier day-to-day control.');
  }
  if (m.avgSleepHours != null && m.avgSleepHours >= 7) {
    positiveNotes.push(`Sleep averaged ${m.avgSleepHours} h — a helpful foundation for glucose stability.`);
  }
  if (m.totalExerciseMinutes > 0) {
    positiveNotes.push(`You logged ${m.totalExerciseMinutes} activity minutes — movement supports post-meal glucose.`);
  }
  if (m.loggingDays >= Math.max(1, Math.ceil((m.dayCount || 1) * 0.7))) {
    positiveNotes.push('Logging consistency was strong enough to make this summary meaningful.');
  }
  if (!positiveNotes.length && hasData) {
    positiveNotes.push('Showing up to log your data is already a meaningful step in self-management.');
  }

  const when = phrase.when;
  const recommendations = [];

  if (tir != null && tir < 70) {
    recommendations.push(
      `Raise time in range toward at least 70% (${TIR_LOW}–${TIR_HIGH} mg/dL); it was ${tir}% ${when} across ${m.glucoseReadings} reading${m.glucoseReadings === 1 ? '' : 's'}.`
    );
  }
  if (highs > 0) {
    recommendations.push(
      `Review meal timing and carbohydrate portions on days with highs — ${highs} high reading${highs === 1 ? '' : 's'} ${when}${m.highestGlucose != null ? ` (peak ${m.highestGlucose} mg/dL)` : ''}.`
    );
  }
  if (lows > 0) {
    recommendations.push(
      `Watch for lows relative to insulin, meals, and activity — ${lows} low reading${lows === 1 ? '' : 's'} ${when}${m.lowestGlucose != null ? ` (lowest ${m.lowestGlucose} mg/dL)` : ''}.`
    );
  }
  if (m.adherencePercent != null && m.adherencePercent < 90) {
    const missed = (m.medsMissed || 0) + (m.medsSkipped || 0);
    recommendations.push(
      `Improve medication adherence to at least 90% of logged doses; it was ${m.adherencePercent}% ${when} (${m.medsTaken} taken, ${missed} missed/skipped).`
    );
  }
  if (varLabel === 'High' && m.glucoseStdDev != null) {
    recommendations.push(
      `Reduce glucose swings with steadier meal spacing — variability was high at ${m.glucoseStdDev} mg/dL std. deviation ${when}.`
    );
  }
  if (m.avgWaterPerDay != null && m.avgWaterPerDay < 1500 && m.totalWaterMl > 0) {
    const liters = (m.avgWaterPerDay / 1000).toFixed(1);
    recommendations.push(
      `Increase water intake to at least 2 L/day, as your average intake ${when} was ${liters} L (${m.avgWaterPerDay} ml/day), below the common recommended level.`
    );
  }
  if (m.totalExerciseMinutes === 0 && (m.dayCount || 0) >= 3) {
    recommendations.push(
      `Add about 10–15 minutes of walking after meals on most days — no activity minutes were logged ${when}.`
    );
  } else if (m.avgExercisePerDay != null && m.avgExercisePerDay < 20 && m.totalExerciseMinutes > 0) {
    recommendations.push(
      `Build toward ~20–30 activity minutes most days; you averaged about ${m.avgExercisePerDay} min/day ${when} (${m.totalExerciseMinutes} min total).`
    );
  }
  if (m.avgSleepHours != null && m.avgSleepHours < 7) {
    recommendations.push(
      `Aim for 7–9 hours of sleep most nights; average sleep was ${m.avgSleepHours} h across ${m.sleepNights} night${m.sleepNights === 1 ? '' : 's'} ${when}.`
    );
  }
  // One logging tip max (avoid stacking “more days” + “more readings”).
  if (m.loggingDays < (m.dayCount || 0)) {
    const gap = (m.dayCount || 0) - (m.loggingDays || 0);
    recommendations.push(
      `Log glucose or meals on more days for clearer insights — entries covered ${m.loggingDays} of ${m.dayCount} days ${when} (${gap} day${gap === 1 ? '' : 's'} without a log).`
    );
  } else if (m.glucoseReadings > 0 && m.glucoseReadings < Math.max(3, (m.dayCount || 1))) {
    recommendations.push(
      `Log glucose more frequently (ideally at least once most days); only ${m.glucoseReadings} reading${m.glucoseReadings === 1 ? '' : 's'} ${when} limits how precise the trend can be.`
    );
  }
  if (!recommendations.length) {
    recommendations.push(
      `Keep the same routines that supported ${rating === 'excellent' ? 'excellent' : 'strong'} control ${when}${tir != null ? ` (${tir}% time in range)` : ''}.`
    );
    recommendations.push(
      `Maintain daily logging so next ${when.includes('week') ? 'week’s' : when.includes('month') ? 'month’s' : 'period’s'} report stays as clear as this one.`
    );
  }

  const sections = {
    glucose:
      m.glucoseReadings > 0
        ? `${m.glucoseReadings} reading${m.glucoseReadings === 1 ? '' : 's'}; avg ${m.avgGlucose ?? '—'} mg/dL; TIR ${tir ?? '—'}%; range ${m.lowestGlucose ?? '—'}–${m.highestGlucose ?? '—'}; ${highs} high / ${lows} low.`
        : 'No glucose readings logged.',
    medication:
      m.medicationsLogged > 0
        ? `${m.medsTaken} taken, ${m.medsMissed + m.medsSkipped} missed/skipped (${m.adherencePercent ?? '—'}% adherence). Insulin total ${m.totalInsulinUnits || 0} u.`
        : m.totalInsulinUnits > 0
          ? `Insulin logged: ${m.totalInsulinUnits} u. No oral/other medication status entries.`
          : 'No medication or insulin doses logged.',
    nutrition:
      m.mealsLogged > 0
        ? `${m.mealsLogged} meal${m.mealsLogged === 1 ? '' : 's'}; ${m.totalCarbs} g carbs total${m.avgCarbsPerMeal != null ? ` (avg ${m.avgCarbsPerMeal} g/meal)` : ''}.`
        : 'No meals logged.',
    lifestyle: [
      m.totalExerciseMinutes > 0 ? `${m.totalExerciseMinutes} activity min` : null,
      m.totalWaterMl > 0 ? `${m.totalWaterMl} ml water` : null,
      m.avgSleepHours != null ? `${m.avgSleepHours} h avg sleep` : null,
      m.moodEntries > 0 ? `${m.moodEntries} mood entries` : null,
    ]
      .filter(Boolean)
      .join(' · ') || 'No activity, water, sleep, or mood logged.',
  };

  const summary = careLetter;

  return {
    rating,
    ratingLabel: ratingLabels[rating],
    careLetterTitle: phrase.careLetterTitle,
    careLetter,
    headline,
    narrative: careLetter,
    summary,
    variabilityLabel: varLabel,
    positiveNotes: positiveNotes.slice(0, 2),
    recommendations: recommendations.slice(0, 3),
    goalsTitle: phrase.nextGoals,
    sections,
  };
}

function buildInsights(period) {
  const m = period.metrics;
  const insights = [];

  if (
    m.glucoseReadings === 0 &&
    m.mealsLogged === 0 &&
    m.medicationsLogged === 0 &&
    m.totalInsulinUnits === 0 &&
    m.totalWaterMl === 0 &&
    m.totalExerciseMinutes === 0 &&
    m.sleepNights === 0 &&
    m.moodEntries === 0
  ) {
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
        message: `Time in range was ${m.timeInRangePercent}% this period (${m.highReadings} high, ${m.lowReadings} low). Worth a look with meals and timing.`,
      });
    } else {
      insights.push({
        type: 'Suggestion',
        message: `Time in range was ${m.timeInRangePercent}%. A common goal is 70%+ in ${TIR_LOW}–${TIR_HIGH} mg/dL.`,
      });
    }
  }

  if (m.avgGlucose != null) {
    insights.push({
      type: 'Suggestion',
      message: `Average glucose was ${m.avgGlucose} mg/dL (range ${m.lowestGlucose}–${m.highestGlucose}).`,
    });
  }

  if (m.estimatedA1c != null && m.glucoseReadings >= 3) {
    insights.push({
      type: 'Suggestion',
      message: `Estimated A1c from this period’s average is about ${m.estimatedA1c}% (not a lab result — for self-tracking only).`,
    });
  }

  if (m.glucoseStdDev != null && m.glucoseStdDev >= 50) {
    insights.push({
      type: 'Warning',
      message: `Glucose variability was high (std. dev. ${m.glucoseStdDev} mg/dL). Large swings may relate to meals, timing, or missed meds.`,
    });
  } else if (m.glucoseStdDev != null && m.glucoseReadings >= 5) {
    insights.push({
      type: 'Suggestion',
      message: `Glucose variability (std. dev.) was ${m.glucoseStdDev} mg/dL across ${m.glucoseReadings} readings.`,
    });
  }

  const byType = period.charts?.glucoseByReadingType || [];
  const fasting = byType.find((x) => x.name === 'Fasting');
  const afterMeal = byType.find((x) => x.name === 'After meal');
  if (fasting?.count >= 2 && afterMeal?.count >= 2) {
    const diff = afterMeal.avgGlucose - fasting.avgGlucose;
    if (diff >= 40) {
      insights.push({
        type: 'Suggestion',
        message: `After-meal averages (${afterMeal.avgGlucose} mg/dL) ran about ${diff} mg/dL above fasting (${fasting.avgGlucose} mg/dL).`,
      });
    }
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

  return insights.slice(0, 8);
}

function metricDeltas(current, previous) {
  const keys = [
    'avgGlucose',
    'timeInRangePercent',
    'estimatedA1c',
    'glucoseStdDev',
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

/** Human label for the previous equal-length window (PDF / UI copy). */
function previousPeriodPhrase(preset, periodLabel) {
  const lower = String(periodLabel || preset || '').toLowerCase();
  if (preset === '1d' || lower.includes('daily')) return 'yesterday';
  if (preset === '7d' || lower.includes('weekly')) return 'last week';
  if (preset === '30d' || lower.includes('monthly')) return 'last month';
  if (preset === '90d') return 'the previous 3 months';
  return 'the previous period';
}

function buildPrecedingRange(primary, tzOffset) {
  const prevEnd = new Date(primary.start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - (primary.days - 1) * MS_DAY);
  const sParts = toLocalParts(prevStart, tzOffset);
  const eParts = toLocalParts(prevEnd, tzOffset);
  return {
    start: startOfLocalDayUtc(sParts.y, sParts.m, sParts.d, tzOffset),
    end: endOfLocalDayUtc(eParts.y, eParts.m, eParts.d, tzOffset),
    days: primary.days,
    label: 'Previous period',
    shortLabel: `${sParts.label} – ${eParts.label}`,
  };
}

/**
 * GET /api/health-logs/report
 * Query:
 *  preset=1d|7d|30d|90d|custom
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

    const accountCreatedAt = req.user.createdAt;
    let primary = resolveRange({
      preset,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      tzOffset,
    });
    primary = clampRangeToAccountStart(primary, accountCreatedAt, tzOffset);

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
    const story = buildStoryReport(period);
    const summary = story.summary;

    let comparePeriod = null;
    let deltas = null;
    const compareAgainst = previousPeriodPhrase(preset, primary.label);

    // Always compute previous equal-length window so PDF/UI can show “↓ 6 from last week”.
    // Explicit compare=true can override with custom dates / preset.
    let compareRange = buildPrecedingRange(primary, tzOffset);
    if (compare) {
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
      }
    }
    compareRange = clampRangeToAccountStart(compareRange, accountCreatedAt, tzOffset);

    if (compareRange.start <= compareRange.end) {
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
        compareAgainst,
        deltas,
        insights,
        summary,
        story,
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

function shiftDayKey(key, deltaDays) {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

/**
 * GET /api/health-logs/streak
 * A day counts toward streak if the user logged any health entry that local day.
 */
exports.getLoggingStreak = async (req, res) => {
  try {
    const userId = req.user.id;
    const tzOffset = parseTzOffset(req.query.tzOffset);
    const lookbackDays = Math.min(Math.max(parseInt(req.query.days, 10) || 120, 14), 400);

    const now = new Date();
    const todayParts = toLocalParts(now, tzOffset);
    const todayKey = todayParts.key;
    const startLocal = new Date(Date.UTC(todayParts.y, todayParts.m, todayParts.d));
    startLocal.setUTCDate(startLocal.getUTCDate() - (lookbackDays - 1));
    const rangeStart = startOfLocalDayUtc(
      startLocal.getUTCFullYear(),
      startLocal.getUTCMonth(),
      startLocal.getUTCDate(),
      tzOffset
    );
    const rangeEnd = endOfLocalDayUtc(todayParts.y, todayParts.m, todayParts.d, tzOffset);

    const query = { userId, timestamp: { $gte: rangeStart, $lte: rangeEnd } };
    const [glucose, meals, insulin, medications, water, exercise, sleep, mood] = await Promise.all([
      GlucoseLog.find(query).select('timestamp').lean(),
      MealLog.find(query).select('timestamp').lean(),
      InsulinLog.find(query).select('timestamp').lean(),
      MedicationLog.find(query).select('timestamp').lean(),
      WaterLog.find(query).select('timestamp').lean(),
      ExerciseLog.find(query).select('timestamp').lean(),
      SleepLog.find(query).select('timestamp wakeTime').lean(),
      MoodLog.find(query).select('timestamp').lean(),
    ]);

    const loggedDays = new Set();
    const addTs = (ts) => {
      if (!ts) return;
      loggedDays.add(toLocalParts(new Date(ts), tzOffset).key);
    };
    glucose.forEach((x) => addTs(x.timestamp));
    meals.forEach((x) => addTs(x.timestamp));
    insulin.forEach((x) => addTs(x.timestamp));
    medications.forEach((x) => addTs(x.timestamp));
    water.forEach((x) => addTs(x.timestamp));
    exercise.forEach((x) => addTs(x.timestamp));
    sleep.forEach((x) => addTs(x.wakeTime || x.timestamp));
    mood.forEach((x) => addTs(x.timestamp));

    const loggedToday = loggedDays.has(todayKey);
    const yesterdayKey = shiftDayKey(todayKey, -1);

    // Current streak: count back from today if logged, else from yesterday (streak at risk)
    let cursor = loggedToday ? todayKey : yesterdayKey;
    let currentStreak = 0;
    if (loggedDays.has(cursor) || loggedToday) {
      if (!loggedToday && !loggedDays.has(yesterdayKey)) {
        currentStreak = 0;
      } else {
        while (loggedDays.has(cursor)) {
          currentStreak += 1;
          cursor = shiftDayKey(cursor, -1);
        }
      }
    }

    // Longest streak in window
    let longestStreak = 0;
    let run = 0;
    let walk = `${startLocal.getUTCFullYear()}-${String(startLocal.getUTCMonth() + 1).padStart(2, '0')}-${String(startLocal.getUTCDate()).padStart(2, '0')}`;
    for (let i = 0; i < lookbackDays; i += 1) {
      if (loggedDays.has(walk)) {
        run += 1;
        if (run > longestStreak) longestStreak = run;
      } else {
        run = 0;
      }
      walk = shiftDayKey(walk, 1);
    }
    if (currentStreak > longestStreak) longestStreak = currentStreak;

    const atRisk = currentStreak > 0 && !loggedToday;
    let lastLoggedDate = null;
    if (loggedToday) lastLoggedDate = todayKey;
    else {
      let probe = yesterdayKey;
      for (let i = 0; i < lookbackDays; i += 1) {
        if (loggedDays.has(probe)) {
          lastLoggedDate = probe;
          break;
        }
        probe = shiftDayKey(probe, -1);
      }
    }

    // Last 7 day dots for UI
    const last7 = [];
    for (let i = 6; i >= 0; i -= 1) {
      const key = shiftDayKey(todayKey, -i);
      last7.push({ date: key, logged: loggedDays.has(key), isToday: key === todayKey });
    }

    res.json({
      status: 'success',
      data: {
        currentStreak,
        longestStreak,
        loggedToday,
        atRisk,
        lastLoggedDate,
        last7,
        message: atRisk
          ? `Your ${currentStreak}-day streak ends tonight if you don’t log something today.`
          : loggedToday
            ? currentStreak > 1
              ? `${currentStreak}-day logging streak — keep it going.`
              : 'Logged today — streak started.'
            : 'Log anything today to start a streak.',
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to compute logging streak',
      error: err.message,
    });
  }
};
