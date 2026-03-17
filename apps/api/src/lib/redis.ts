import { Redis } from '@upstash/redis';
import { Request, Response, NextFunction } from 'express';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis only if credentials exist
export const redis = url && token ? new Redis({ url, token }) : null;

/**
 * Express Middleware to cache API responses in Upstash Redis
 * @param duration Duration in seconds to cache the response (Default: 60s)
 */
export const cacheRoute = (duration: number = 60) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching if Redis is not configured or in development mode (optional)
    if (!redis) {
      return next();
    }

    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create a unique cache key based on the URL path and query parameters
    const key = `cache:${req.originalUrl}`;

    try {
      const cachedResponse = await redis.get(key);

      if (cachedResponse) {
        // Return the cached response immediately
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedResponse);
      }

      res.setHeader('X-Cache', 'MISS');

      // Intercept the res.json() call to cache the response before sending it
      const originalJson = res.json;
      res.json = (body: any) => {
        // Only cache successful responses
        if (body && body.success !== false) {
          redis.set(key, body, { ex: duration }).catch((err) => {
            console.error('Redis cache set error:', err);
          });
        }
        return originalJson.call(res, body);
      };

      next();
    } catch (error) {
      console.error('Redis cache get error:', error);
      next();
    }
  };
};

/**
 * Express Middleware to rate limit requests using Upstash Redis
 * @param limit Max requests per window
 * @param window Duration in seconds
 */
export const rateLimit = (limit: number = 10, window: number = 60) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!redis) return next();

    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const key = `ratelimit:${req.route.path}:${ip}`;

    try {
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, window);
      }

      if (current > limit) {
        return res.status(429).json({
          success: false,
          error: 'Too many requests, please try again later.'
        });
      }

      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      next();
    }
  };
};
