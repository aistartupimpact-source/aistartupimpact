import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create Redis client with error handling
let redis: Redis | null = null;
let rateLimitingEnabled = false;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    rateLimitingEnabled = true;
  } else {
    console.warn('⚠️ Upstash Redis credentials not found. Rate limiting disabled.');
  }
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
  rateLimitingEnabled = false;
}

// Rate limiters for different endpoints (only if Redis is available)
export const authRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 requests per 15 minutes
  analytics: true,
  prefix: "ratelimit:auth",
}) : null;

export const apiRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
  analytics: true,
  prefix: "ratelimit:api",
}) : null;

export const strictRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 requests per hour (for sensitive operations)
  analytics: true,
  prefix: "ratelimit:strict",
}) : null;

// Helper to get client identifier (IP or user ID)
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  
  return cfConnectingIp || realIp || forwarded?.split(",")[0] || "unknown";
}

// Rate limit check helper with fallback
export async function checkRateLimit(
  ratelimit: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // If rate limiting is disabled, always allow
  if (!ratelimit || !rateLimitingEnabled) {
    return { success: true, limit: 999, remaining: 999, reset: 0 };
  }
  
  try {
    const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
    return { success, limit, remaining, reset };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // On error, allow the request (fail open)
    return { success: true, limit: 999, remaining: 999, reset: 0 };
  }
}
