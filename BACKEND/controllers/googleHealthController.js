const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ExerciseLog = require('../models/ExerciseLog');

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_HEALTH_BASE = 'https://health.googleapis.com/v4';

const SCOPE =
  process.env.GOOGLE_HEALTH_SCOPE ||
  'https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly';

function isConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI
  );
}

function clientUrl() {
  return (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
}

function signOAuthState(userId) {
  return jwt.sign(
    { uid: String(userId), purpose: 'google-health' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function verifyOAuthState(state) {
  const payload = jwt.verify(state, process.env.JWT_SECRET);
  if (payload.purpose !== 'google-health' || !payload.uid) {
    throw new Error('Invalid OAuth state');
  }
  return payload.uid;
}

/** Match healthLogController today-boundary logic (tzOffset = Date#getTimezoneOffset()). */
function clientDayContext(tzOffsetMinutes = 0) {
  const tz = Number.isFinite(Number(tzOffsetMinutes)) ? Number(tzOffsetMinutes) : 0;
  const now = new Date();
  const clientLocalNow = new Date(now.getTime() - tz * 60 * 1000);

  const startOfToday = new Date(clientLocalNow);
  startOfToday.setUTCHours(0, 0, 0, 0);
  startOfToday.setTime(startOfToday.getTime() + tz * 60 * 1000);

  const midOfToday = new Date(startOfToday.getTime() + 12 * 60 * 60 * 1000);

  const y = clientLocalNow.getUTCFullYear();
  const m = clientLocalNow.getUTCMonth() + 1;
  const d = clientLocalNow.getUTCDate();
  const dayKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const next = new Date(Date.UTC(y, m - 1, d + 1));
  const nextKey = {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };

  return {
    tz,
    dayKey,
    startOfToday,
    midOfToday,
    civilStart: { year: y, month: m, day: d },
    civilEndExclusive: nextKey,
  };
}

function firstNumber(...candidates) {
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return 0;
}

function extractStepCount(point) {
  return firstNumber(
    point?.steps?.count,
    point?.steps?.value,
    point?.count,
    point?.value,
    point?.numericValue,
    point?.steps
  );
}

function extractCalories(point) {
  return firstNumber(
    point?.activeEnergyBurned?.energyKcal,
    point?.activeEnergyBurned?.kcal,
    point?.totalCalories?.energyKcal,
    point?.totalCalories?.kcal,
    point?.calories?.energyKcal,
    point?.calories?.kcal,
    point?.energyKcal,
    point?.kcal,
    point?.value
  );
}

/** Google distance is often millimeters → store km (2 decimals). */
function extractDistanceKm(point) {
  const mm = firstNumber(
    point?.distance?.distanceMillimeters,
    point?.distance?.millimeters,
    point?.distanceMillimeters
  );
  if (mm > 0) return Math.round((mm / 1_000_000) * 100) / 100;

  const meters = firstNumber(point?.distance?.distanceMeters, point?.distance?.meters);
  if (meters > 0) return Math.round((meters / 1000) * 100) / 100;

  const km = firstNumber(point?.distance?.kilometers, point?.distance?.km, point?.distance);
  return km > 0 ? Math.round(km * 100) / 100 : 0;
}

function parseDurationMinutes(point) {
  const ex = point?.exercise || point || {};
  const seconds = firstNumber(
    ex.durationSeconds,
    ex.activeDurationSeconds,
    ex.duration?.seconds,
    point?.durationSeconds
  );
  if (seconds > 0) return Math.max(1, Math.round(seconds / 60));

  const millis = firstNumber(ex.durationMillis, ex.durationMs);
  if (millis > 0) return Math.max(1, Math.round(millis / 60000));

  const iso = ex.duration || point?.duration;
  if (typeof iso === 'string' && iso.startsWith('PT')) {
    const h = Number((iso.match(/(\d+)H/) || [])[1] || 0);
    const m = Number((iso.match(/(\d+)M/) || [])[1] || 0);
    const s = Number((iso.match(/(\d+)S/) || [])[1] || 0);
    const total = h * 60 + m + Math.round(s / 60);
    if (total > 0) return total;
  }

  const mins = firstNumber(ex.durationMinutes, ex.minutes);
  return mins > 0 ? Math.round(mins) : 0;
}

function extractActiveMinutes(point) {
  return firstNumber(
    point?.activeMinutes?.minutes,
    point?.activeMinutes?.value,
    point?.activeMinutes,
    point?.minutes,
    point?.value,
    point?.count
  );
}

function exerciseActivityName(point) {
  const ex = point?.exercise || {};
  return (
    ex.activityName ||
    ex.activityType ||
    ex.exerciseType ||
    ex.name ||
    'Workout'
  );
}

/** Best-effort start time from a Google Health data point. */
function extractPointTime(point, fallbackDate) {
  const candidates = [
    point?.exercise?.interval?.startTime,
    point?.exercise?.interval?.civilStartTime,
    point?.steps?.interval?.startTime,
    point?.steps?.interval?.civilStartTime,
    point?.distance?.interval?.startTime,
    point?.distance?.interval?.civilStartTime,
    point?.activeEnergyBurned?.interval?.startTime,
    point?.interval?.startTime,
    point?.interval?.civilStartTime,
    point?.startTime,
    point?.civilStartTime,
  ];
  for (const c of candidates) {
    if (!c) continue;
    const d = new Date(c);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return fallbackDate ? new Date(fallbackDate) : new Date();
}

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

async function exchangeCodeForTokens(code) {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'Token exchange failed');
  }
  return data;
}

async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'Token refresh failed');
  }
  return data;
}

async function ensureAccessToken(user) {
  const gh = user.googleHealth || {};
  if (!gh.refreshToken && !gh.accessToken) {
    throw new Error('Google Health is not connected');
  }

  const expiresAt = gh.tokenExpiresAt ? new Date(gh.tokenExpiresAt).getTime() : 0;
  const stillValid = gh.accessToken && expiresAt > Date.now() + 60_000;
  if (stillValid) return gh.accessToken;

  if (!gh.refreshToken) {
    throw new Error('Google Health session expired — reconnect');
  }

  const tokens = await refreshAccessToken(gh.refreshToken);
  user.googleHealth = user.googleHealth || {};
  user.googleHealth.accessToken = tokens.access_token;
  if (tokens.refresh_token) user.googleHealth.refreshToken = tokens.refresh_token;
  user.googleHealth.tokenExpiresAt = new Date(
    Date.now() + (Number(tokens.expires_in) || 3600) * 1000
  );
  user.googleHealth.connected = true;
  await user.save();
  return user.googleHealth.accessToken;
}

async function listDataPoints(accessToken, dataType, filter) {
  const url = `${GOOGLE_HEALTH_BASE}/users/me/dataTypes/${dataType}/dataPoints?filter=${encodeURIComponent(filter)}&pageSize=1440`;
  const res = await fetch(url, { headers: authHeaders(accessToken) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message || data.message || `${dataType} list failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data.dataPoints || data.datapoints || data.points || [];
}

async function dailyRollUpSum(accessToken, dataType, civilStart, civilEndExclusive, extractFn) {
  const url = `${GOOGLE_HEALTH_BASE}/users/me/dataTypes/${dataType}/dataPoints:dailyRollUp`;
  const bodies = [
    {
      timeFilter: {
        civilDateRange: {
          start: civilStart,
          endExclusive: civilEndExclusive,
        },
      },
    },
    {
      civilDateFilter: {
        startDate: civilStart,
        endDate: civilEndExclusive,
      },
    },
  ];

  for (const body of bodies) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(accessToken),
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) continue;
      const buckets =
        data.dailyRollUps ||
        data.rollUps ||
        data.dataPoints ||
        data.buckets ||
        [];
      if (!Array.isArray(buckets) || buckets.length === 0) {
        // Some responses nest under result
        const nested = data.result || data.dailyRollUp || null;
        if (nested) return Math.round(extractFn(nested));
        continue;
      }
      const total = buckets.reduce((sum, b) => sum + extractFn(b), 0);
      return Math.round(total);
    } catch {
      /* try next body shape */
    }
  }
  return null;
}

async function fetchTodayActivity(accessToken, dayCtx) {
  const { dayKey, civilStart, civilEndExclusive } = dayCtx;
  const civilFilter = (prefix) =>
    `${prefix}.interval.civil_start_time >= "${dayKey}T00:00:00"`;

  let steps = 0;
  let calories = 0;
  let distanceKm = 0;
  const workouts = [];

  let lastActivityAt = null;

  try {
    const stepPoints = await listDataPoints(accessToken, 'steps', civilFilter('steps'));
    steps = Math.round(stepPoints.reduce((s, p) => s + extractStepCount(p), 0));
    for (const p of stepPoints) {
      const t = extractPointTime(p);
      if (!lastActivityAt || t > lastActivityAt) lastActivityAt = t;
    }
  } catch (err) {
    console.warn('Google Health steps fetch:', err.message);
  }

  // Prefer active energy; fall back to total-calories
  let cal =
    (await dailyRollUpSum(
      accessToken,
      'active-energy-burned',
      civilStart,
      civilEndExclusive,
      extractCalories
    )) ??
    (await dailyRollUpSum(
      accessToken,
      'total-calories',
      civilStart,
      civilEndExclusive,
      extractCalories
    ));

  if (cal == null) {
    try {
      const points = await listDataPoints(
        accessToken,
        'active-energy-burned',
        civilFilter('active_energy_burned')
      );
      cal = Math.round(points.reduce((s, p) => s + extractCalories(p), 0));
    } catch {
      cal = 0;
    }
  }
  calories = cal || 0;

  try {
    const distPoints = await listDataPoints(accessToken, 'distance', civilFilter('distance'));
    distanceKm =
      Math.round(distPoints.reduce((s, p) => s + extractDistanceKm(p), 0) * 100) / 100;
  } catch (err) {
    console.warn('Google Health distance fetch:', err.message);
  }

  // Active minutes from Google (not estimated from steps)
  let activeMinutes =
    (await dailyRollUpSum(
      accessToken,
      'active-minutes',
      civilStart,
      civilEndExclusive,
      extractActiveMinutes
    )) || 0;

  try {
    const exPoints = await listDataPoints(
      accessToken,
      'exercise',
      civilFilter('exercise')
    );
    for (const p of exPoints) {
      const minutes = parseDurationMinutes(p);
      // Only store workouts that have a real Google duration
      if (!(minutes > 0)) continue;
      const name = String(exerciseActivityName(p)).slice(0, 100);
      const id =
        p.name ||
        p.dataPointName ||
        p.id ||
        `ex-${dayKey}-${workouts.length + 1}`;
      const shortId = String(id).split('/').pop();
      const at = extractPointTime(p, dayCtx.midOfToday);
      if (!lastActivityAt || at > lastActivityAt) lastActivityAt = at;
      workouts.push({
        externalId: `gh-ex-${shortId}`,
        activity: name,
        duration: minutes,
        caloriesBurned: Math.round(extractCalories(p)),
        distance: extractDistanceKm(p),
        steps: Math.round(extractStepCount(p)),
        timestamp: at,
      });
    }
  } catch (err) {
    console.warn('Google Health exercise fetch:', err.message);
  }

  const workoutMinutes = workouts.reduce((s, w) => s + (w.duration || 0), 0);
  // Duration must come from Google: workouts or active-minutes — never steps÷100
  const summaryDuration = Math.max(workoutMinutes, activeMinutes, 0);

  return {
    steps,
    calories,
    distanceKm,
    workouts,
    summaryDuration,
    activeMinutes,
    // Prefer latest activity time from Google; else "now" so Today • time reflects this sync
    summaryTimestamp: lastActivityAt || new Date(),
  };
}

async function upsertExerciseLog(userId, payload) {
  let log = await ExerciseLog.findOne({
    userId: userId,
    fitbitLogId: payload.fitbitLogId,
  });

  if (!log) {
    log = new ExerciseLog({
      userId,
      ...payload,
      source: 'GoogleHealth',
    });
  } else {
    Object.assign(log, payload, { source: 'GoogleHealth' });
  }
  await log.save();
  return log;
}

// GET /api/google-health/status
exports.getStatus = async (req, res) => {
  try {
    const configured = isConfigured();
    const user = await User.findById(req.user.id).select('googleHealth');
    const gh = user?.googleHealth || {};
    res.json({
      status: 'success',
      data: {
        configured,
        connected: Boolean(gh.connected && (gh.refreshToken || gh.accessToken)),
        lastSyncAt: gh.lastSyncAt || null,
        lastSteps: gh.lastSteps || 0,
        lastCalories: gh.lastCalories || 0,
        lastDistanceKm: gh.lastDistanceKm || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to load status' });
  }
};

// GET /api/google-health/connect
exports.connect = async (req, res) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({
        status: 'error',
        message: 'Google Health is not configured on the server',
      });
    }

    const state = signOAuthState(req.user.id);
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: SCOPE,
      access_type: 'offline',
      include_granted_scopes: 'true',
      prompt: 'consent',
      state,
    });

    return res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
  } catch (err) {
    console.error('Google Health connect error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to start Google connect' });
  }
};

// GET /api/google-health/callback
exports.callback = async (req, res) => {
  const front = clientUrl();
  try {
    const { code, state, error, error_description: errorDescription } = req.query;

    if (error) {
      return res.redirect(
        `${front}/google-health?error=${encodeURIComponent(errorDescription || error)}`
      );
    }
    if (!code || !state) {
      return res.redirect(`${front}/google-health?error=${encodeURIComponent('Missing OAuth code')}`);
    }

    const userId = verifyOAuthState(String(state));
    const tokens = await exchangeCodeForTokens(String(code));
    const user = await User.findById(userId);
    if (!user) {
      return res.redirect(`${front}/google-health?error=${encodeURIComponent('User not found')}`);
    }

    user.googleHealth = user.googleHealth || {};
    user.googleHealth.connected = true;
    user.googleHealth.accessToken = tokens.access_token || '';
    if (tokens.refresh_token) user.googleHealth.refreshToken = tokens.refresh_token;
    user.googleHealth.tokenExpiresAt = new Date(
      Date.now() + (Number(tokens.expires_in) || 3600) * 1000
    );
    await user.save();

    // Replace history target: land on the Google Health page without stacking Google pages for Back
    return res.redirect(`${front}/google-health?connected=1`);
  } catch (err) {
    console.error('Google Health callback error:', err);
    return res.redirect(
      `${front}/google-health?error=${encodeURIComponent(err.message || 'Connect failed')}`
    );
  }
};

// POST /api/google-health/sync
exports.sync = async (req, res) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({
        status: 'error',
        message: 'Google Health is not configured on the server',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user?.googleHealth?.connected) {
      return res.status(400).json({
        status: 'error',
        message: 'Connect Google Health first',
      });
    }

    const tzOffset =
      req.body?.tzOffset != null ? Number(req.body.tzOffset) : Number(req.query.tzOffset) || 0;
    const dayCtx = clientDayContext(tzOffset);
    const accessToken = await ensureAccessToken(user);
    const activity = await fetchTodayActivity(accessToken, dayCtx);

    const summaryId = `gh-day-${dayCtx.dayKey}`;
    // Only Google active-minutes / workout duration — never invent minutes from steps
    const durationMinutes = activity.summaryDuration > 0 ? activity.summaryDuration : 0;
    const hasWorkouts = activity.workouts.length > 0;

    // De-dup rule (getTodaySummary sums `duration`/`steps` across ALL ExerciseLog rows
    // for the day, so the same value must never live on both the daily rollup AND a
    // per-workout row):
    //   - `steps` is a day-level total (from Google's `steps` data type) and only
    //     ever lives on the `gh-day-*` summary row; per-workout rows are zeroed for
    //     steps since workout-time steps are already part of that day total.
    //   - `duration` lives on the per-workout `gh-ex-*` rows when workouts exist (each
    //     workout's real duration); the summary row's duration is zeroed in that case
    //     so it isn't added again on top of the workout rows. When there are no
    //     workouts, the summary row keeps Google's active-minutes as the only source.
    //   - caloriesBurned/distance are kept per-workout for detail views; they are not
    //     summed by getTodaySummary today, so they can't double-count that total.
    const summaryLog = await upsertExerciseLog(user._id, {
      fitbitLogId: summaryId,
      activity: 'Google Health sync',
      duration: hasWorkouts ? 0 : durationMinutes,
      steps: activity.steps,
      caloriesBurned: activity.calories,
      distance: activity.distanceKm,
      intensity: durationMinutes >= 30 ? 'Medium' : 'Low',
      notes: 'Synced',
      timestamp: activity.summaryTimestamp || new Date(),
    });

    const workoutLogs = [];
    for (const w of activity.workouts) {
      const log = await upsertExerciseLog(user._id, {
        fitbitLogId: w.externalId,
        activity: w.activity,
        duration: w.duration,
        // Steps already counted in the daily summary row above — don't double-count
        steps: 0,
        caloriesBurned: w.caloriesBurned || 0,
        distance: w.distance || 0,
        intensity: w.duration >= 45 ? 'High' : w.duration >= 20 ? 'Medium' : 'Low',
        notes: 'Synced',
        timestamp: w.timestamp || activity.summaryTimestamp || new Date(),
      });
      workoutLogs.push(log._id);
    }

    user.googleHealth.lastSyncAt = new Date();
    user.googleHealth.lastSteps = activity.steps;
    user.googleHealth.lastCalories = activity.calories;
    user.googleHealth.lastDistanceKm = activity.distanceKm;
    user.googleHealth.connected = true;
    await user.save();

    res.json({
      status: 'success',
      data: {
        day: dayCtx.dayKey,
        steps: activity.steps,
        calories: activity.calories,
        distanceKm: activity.distanceKm,
        durationMinutes: durationMinutes,
        activeMinutes: activity.activeMinutes || 0,
        workouts: activity.workouts.length,
        lastSyncAt: user.googleHealth.lastSyncAt,
        logId: summaryLog._id,
        workoutLogIds: workoutLogs,
      },
    });
  } catch (err) {
    console.error('Google Health sync error:', err);
    res.status(400).json({
      status: 'error',
      message: err.message || 'Sync failed',
    });
  }
};

// POST /api/google-health/disconnect
exports.disconnect = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    user.googleHealth = {
      connected: false,
      accessToken: '',
      refreshToken: '',
      tokenExpiresAt: undefined,
      lastSyncAt: user.googleHealth?.lastSyncAt,
      lastSteps: user.googleHealth?.lastSteps || 0,
      lastCalories: user.googleHealth?.lastCalories || 0,
      lastDistanceKm: user.googleHealth?.lastDistanceKm || 0,
    };
    await user.save();

    res.json({ status: 'success', message: 'Google Health disconnected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message || 'Disconnect failed' });
  }
};
