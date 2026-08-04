const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

// In-memory layer (fastest, zero parse overhead)
const memoryCache = new Map();

function storageKey(key) {
  return `db_cache_${key}`;
}

/**
 * Get cached data. Checks memory first, then localStorage.
 * Returns null if missing or expired.
 */
export function getCachedData(key) {
  // 1. Memory cache (fastest)
  if (memoryCache.has(key)) return memoryCache.get(key);

  // 2. localStorage (survives page refresh)
  try {
    const raw = localStorage.getItem(storageKey(key));
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) {
      localStorage.removeItem(storageKey(key));
      return null;
    }
    // Warm memory cache
    memoryCache.set(key, data);
    return data;
  } catch {
    return null;
  }
}

/**
 * Store data in both memory and localStorage.
 */
export function setCachedData(key, data) {
  memoryCache.set(key, data);
  try {
    localStorage.setItem(storageKey(key), JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage quota exceeded — memory cache still works
  }
}

/**
 * Invalidate a specific key from all layers.
 */
export function clearCachedData(key) {
  memoryCache.delete(key);
  try {
    localStorage.removeItem(storageKey(key));
  } catch {
    // ignore
  }
}
