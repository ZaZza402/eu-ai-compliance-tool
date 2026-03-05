/**
 * In-memory sliding window rate limiter
 * ======================================
 * Keyed per identifier (Clerk userId in our case).
 * Stores timestamps of recent requests in a Map; prunes expired entries on
 * each check so memory stays bounded.
 *
 * Limitations:
 *   • Resets on server restart / hot-reload (acceptable for development).
 *   • Does NOT work across multiple Node.js processes (e.g. serverless functions
 *     in separate instances). For multi-instance production, replace with Redis
 *     (Upstash Ratelimit is a drop-in upgrade).
 *
 * Usage:
 *   const result = rateLimiter.check("user_abc123");
 *   if (!result.allowed) {
 *     return NextResponse.json({ error: "Too many requests." }, { status: 429 });
 *   }
 */

interface RateLimitResult {
  allowed: boolean;
  /** How many requests remain in the current window */
  remaining: number;
  /** Unix ms timestamp when the oldest request in the window expires */
  resetAt: number;
}

interface RateLimiterOptions {
  /** Max requests per window. Default: 5 */
  limit?: number;
  /** Window size in milliseconds. Default: 60_000 (1 minute) */
  windowMs?: number;
}

class SlidingWindowRateLimiter {
  private readonly limit: number;
  private readonly windowMs: number;
  /** Map from identifier → sorted list of request timestamps (ms) */
  private readonly store = new Map<string, number[]>();

  constructor(options: RateLimiterOptions = {}) {
    this.limit = options.limit ?? 5;
    this.windowMs = options.windowMs ?? 60_000;
  }

  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Retrieve existing timestamps and prune those outside the window
    const timestamps = (this.store.get(identifier) ?? []).filter(
      (ts) => ts > windowStart,
    );

    if (timestamps.length >= this.limit) {
      // Rate limit exceeded — compute when the oldest request falls out of the window
      const oldestTs = timestamps[0]!;
      return {
        allowed: false,
        remaining: 0,
        resetAt: oldestTs + this.windowMs,
      };
    }

    // Allow — record this request
    timestamps.push(now);
    this.store.set(identifier, timestamps);

    return {
      allowed: true,
      remaining: this.limit - timestamps.length,
      resetAt: now + this.windowMs,
    };
  }

  /** Evict all tracking data for an identifier (e.g. for testing). */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }
}

/**
 * Singleton rate limiter for /api/analyze.
 * 5 requests per user per minute — matches the credit model (users rarely have
 * more than 5 credits) while blocking burst misuse.
 */
export const analyzeLimiter = new SlidingWindowRateLimiter({
  limit: 5,
  windowMs: 60_000,
});

/**
 * Singleton rate limiter for /api/contact (public, keyed on IP).
 * 5 submissions per IP per 10 minutes — prevents Resend quota abuse.
 */
export const contactLimiter = new SlidingWindowRateLimiter({
  limit: 5,
  windowMs: 10 * 60_000,
});
