const attempts = new Map();

/**
 * Simple in-memory rate limiter.
 * @param {string} ip - The IP address to check.
 * @param {number} limit - Max attempts allowed.
 * @param {number} windowMs - Time window in milliseconds.
 * @returns {boolean} - True if rate limited, false otherwise.
 */
export function isRateLimited(ip, limit = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record) {
    attempts.set(ip, { count: 1, resetTime: now + windowMs });
    return false; // Not limited
  }

  if (now > record.resetTime) {
    attempts.set(ip, { count: 1, resetTime: now + windowMs });
    return false; // Not limited
  }

  record.count += 1;
  if (record.count > limit) {
    return true; // Limited
  }

  return false; // Not limited
}

/**
 * Cleanup expired entries.
 */
export function cleanup() {
  const now = Date.now();
  for (const [ip, record] of attempts.entries()) {
    if (now > record.resetTime) {
      attempts.delete(ip);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanup, 5 * 60 * 1000);
}
