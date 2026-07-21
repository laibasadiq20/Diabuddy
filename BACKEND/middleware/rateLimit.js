/**
 * Lightweight in-memory rate limiter (no extra dependency).
 * Suitable for single-instance deployments (Railway/Render one dyno).
 */
function rateLimit({ windowMs = 60_000, max = 30, keyPrefix = 'rl' } = {}) {
  const hits = new Map();

  const sweep = () => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  };

  setInterval(sweep, Math.min(windowMs, 60_000)).unref?.();

  return (req, res, next) => {
    const id = req.user?.id || req.ip || 'anon';
    const key = `${keyPrefix}:${id}`;
    const now = Date.now();
    let entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - entry.count)));

    if (entry.count > max) {
      return res.status(429).json({
        message: 'Too many requests. Please wait a moment and try again.',
      });
    }

    next();
  };
}

module.exports = { rateLimit };
