import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiters specifically for the Events platform.
 * Separate from general API rate limits to allow fine-grained control.
 */

let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (error) {
  console.error("Failed to initialize Redis for event rate limiting:", error);
}

/**
 * Registration endpoint — 10 requests per 15 minutes per IP.
 * Prevents spam registrations while allowing legitimate multi-event signups.
 */
export const registrationRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "15 m"),
      analytics: true,
      prefix: "ratelimit:event:registration",
    })
  : null;

/**
 * Event listing/search — 60 requests per minute per IP.
 * Generous for normal browsing, blocks automated scraping.
 */
export const eventSearchRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: true,
      prefix: "ratelimit:event:search",
    })
  : null;

/**
 * Newsletter subscribe — 5 requests per hour per IP.
 * Very strict to prevent list poisoning.
 */
export const newsletterSubscribeRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "ratelimit:event:newsletter",
    })
  : null;

/**
 * Event creation — 10 events per hour per user.
 * Prevents abuse by organizers (keyed by user ID, not IP).
 */
export const eventCreationRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      analytics: true,
      prefix: "ratelimit:event:create",
    })
  : null;

/**
 * Email campaign sending — 5 campaigns per day per organizer.
 */
export const campaignSendRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "24 h"),
      analytics: true,
      prefix: "ratelimit:event:campaign",
    })
  : null;
