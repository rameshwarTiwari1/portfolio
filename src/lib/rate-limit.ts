/**
 * Fixed-window in-memory rate limiter.
 *
 * Scope: one serverless instance. A determined attacker across many cold
 * instances can exceed the limit — that is accepted. This exists to stop
 * casual abuse and runaway retries, and it pairs with the honeypot and timing
 * checks. Anything stronger would need a shared store, which would mean a
 * database, which this project deliberately does not have.
 */

interface Window {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Window>();

/** Stop the map growing without bound on a long-lived instance. */
const MAX_KEYS = 5_000;

function sweep(now: number): void {
  for (const [key, window] of buckets) {
    if (window.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  if (buckets.size > MAX_KEYS) sweep(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;

  return {
    allowed: true,
    remaining: limit - existing.count,
    retryAfterSeconds: 0,
  };
}

/** Test-only. */
export function resetRateLimits(): void {
  buckets.clear();
}
