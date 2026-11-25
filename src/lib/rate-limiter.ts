/**
 * Production Security Middleware & In-Memory Rate Limiter
 * Enforces per-IP request pacing to protect against API flooding, credential stuffing, and brute force attacks.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export function checkRateLimit(
  ip: string,
  options: RateLimitOptions = { windowMs: 60000, maxRequests: 60 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  // Clean old window
  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + options.windowMs
    };
    rateLimitStore.set(ip, newRecord);
    return { allowed: true, remaining: options.maxRequests - 1, resetTime: newRecord.resetTime };
  }

  // Increment within window
  record.count += 1;
  if (record.count > options.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  return {
    allowed: true,
    remaining: options.maxRequests - record.count,
    resetTime: record.resetTime
  };
}
