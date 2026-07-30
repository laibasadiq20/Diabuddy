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

function localDayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function extractStepCount(point) {
  if (!point || typeof point !== 'object') return 0;
  const candidates = [
    point.steps?.count,
    point.steps?.value,
    point.count,
    point.value,
    point.numericValue,
    point.steps,
  ];
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return 0;
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
    const msg = data.error_description || data.error || 'Token exchange failed';
    throw new Error(msg);
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
    const msg = data.error_description || data.error || 'Token refresh failed';
    throw new Error(msg);
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
  if (tokens.refresh_token) {
    user.googleHealth.refreshToken = tokens.refresh_token;
  }
  user.googleHealth.tokenExpiresAt = new Date(
    Date.now() + (Number(tokens.expires_in) || 3600) * 1000
  );
  user.googleHealth.connected = true;
  await user.save();
  return user.googleHealth.accessToken;
}

/**
 * Sum today's steps from Google Health list endpoint.
 */
async function fetchTodaySteps(accessToken) {
  const day = localDayKey();
  const filter = `steps.interval.civil_start_time >= "${day}T00:00:00"`;
  const url = `${GOOGLE_HEALTH_BASE}/users/me/dataTypes/steps/dataPoints?filter=${encodeURIComponent(filter)}&pageSize=1440`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data.error?.message ||
      data.message ||
      `Google Health steps request failed (${res.status})`;
    throw new Error(msg);
  }

  const points = data.dataPoints || data.datapoints || data.points || [];
  const total = points.reduce((sum, p) => sum + extractStepCount(p), 0);
  return Math.round(total);
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

// GET /api/google-health/callback  (public — uses signed state)
exports.callback = async (req, res) => {
  const front = clientUrl();
  try {
    const { code, state, error, error_description: errorDescription } = req.query;

    if (error) {
      const reason = encodeURIComponent(errorDescription || error);
      return res.redirect(`${front}/fitbit?error=${reason}`);
    }
    if (!code || !state) {
      return res.redirect(`${front}/fitbit?error=${encodeURIComponent('Missing OAuth code')}`);
    }

    const userId = verifyOAuthState(String(state));
    const tokens = await exchangeCodeForTokens(String(code));
    const user = await User.findById(userId);
    if (!user) {
      return res.redirect(`${front}/fitbit?error=${encodeURIComponent('User not found')}`);
    }

    user.googleHealth = user.googleHealth || {};
    user.googleHealth.connected = true;
    user.googleHealth.accessToken = tokens.access_token || '';
    if (tokens.refresh_token) {
      user.googleHealth.refreshToken = tokens.refresh_token;
    }
    user.googleHealth.tokenExpiresAt = new Date(
      Date.now() + (Number(tokens.expires_in) || 3600) * 1000
    );
    await user.save();

    return res.redirect(`${front}/fitbit?connected=1`);
  } catch (err) {
    console.error('Google Health callback error:', err);
    const reason = encodeURIComponent(err.message || 'Connect failed');
    return res.redirect(`${front}/fitbit?error=${reason}`);
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

    const accessToken = await ensureAccessToken(user);
    const steps = await fetchTodaySteps(accessToken);
    const day = localDayKey();
    const externalId = `gh-steps-${day}`;

    const startOfDay = new Date();
    startOfDay.setHours(12, 0, 0, 0);

    let log = await ExerciseLog.findOne({
      userId: user._id,
      fitbitLogId: externalId,
    });

    if (!log) {
      log = new ExerciseLog({
        userId: user._id,
        activity: 'Steps (Google Health)',
        duration: 1,
        steps,
        source: 'GoogleHealth',
        fitbitLogId: externalId,
        intensity: 'Low',
        notes: 'Synced from Google Health',
        timestamp: startOfDay,
      });
    } else {
      log.steps = steps;
      log.source = 'GoogleHealth';
      log.activity = 'Steps (Google Health)';
      log.notes = 'Synced from Google Health';
      log.timestamp = startOfDay;
    }
    await log.save();

    user.googleHealth.lastSyncAt = new Date();
    user.googleHealth.lastSteps = steps;
    user.googleHealth.connected = true;
    await user.save();

    res.json({
      status: 'success',
      data: {
        steps,
        day,
        lastSyncAt: user.googleHealth.lastSyncAt,
        logId: log._id,
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
    };
    await user.save();

    res.json({ status: 'success', message: 'Google Health disconnected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message || 'Disconnect failed' });
  }
};
