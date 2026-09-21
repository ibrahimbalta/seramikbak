/**
 * In-memory sliding window rate limiter
 * Protects against brute-force attacks and API abuse with zero external dependencies.
 */

const hitMap = new Map();

// Periodic cleanup of stale entries every 5 minutes to prevent memory leak
if (!global.__rateLimitCleanup) {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hitMap.entries()) {
      if (now > record.resetTime) {
        hitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  if (timer.unref) timer.unref();
  global.__rateLimitCleanup = timer;
}

/**
 * Checks if a given identifier exceeds rate limit.
 * @param {string} identifier - Client IP or User ID
 * @param {number} maxHits - Max allowed requests in time window
 * @param {number} windowMs - Time window in milliseconds (default: 60 seconds)
 * @returns {{ allowed: boolean, remaining: number, resetInMs: number }}
 */
export function checkRateLimit(identifier, maxHits = 60, windowMs = 60 * 1000) {
  if (!identifier) {
    return { allowed: true, remaining: maxHits, resetInMs: windowMs };
  }

  const now = Date.now();
  let record = hitMap.get(identifier);

  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + windowMs
    };
    hitMap.set(identifier, record);
    return { allowed: true, remaining: maxHits - 1, resetInMs: windowMs };
  }

  record.count += 1;

  if (record.count > maxHits) {
    const resetInMs = Math.max(0, record.resetTime - now);
    return {
      allowed: false,
      remaining: 0,
      resetInMs
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxHits - record.count),
    resetInMs: Math.max(0, record.resetTime - now)
  };
}

/**
 * Extracts best-effort client IP from request headers
 * @param {Request} request 
 * @returns {string}
 */
export function getClientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    '127.0.0.1'
  );
}
