import { createHash } from 'crypto';
import { prisma } from '@aistartupimpact/database';

// Bot user agents to filter
const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'slurp', // Yahoo
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegram',
  'slackbot',
  'discordbot',
  'applebot',
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'dotbot',
  'rogerbot',
  'screaming frog',
  'crawler',
  'spider',
  'bot',
  'scraper',
];

export function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

/**
 * Check rate limit: 5 clicks per tool per hour per IP
 * 
 * NOTE: This uses a database COUNT query on every click.
 * At low volume (< 500 clicks/hour) this is fine.
 * Above ~500 clicks/hour, migrate to Redis counters for better performance.
 * 
 * Redis version available in: lib/security-redis.ts
 */
export async function checkRateLimit(
  ip: string,
  toolId: string
): Promise<boolean> {
  const ipHash = hashIP(ip);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // Count clicks from this IP for this tool in last hour
  const clickCount = await prisma.affiliateClick.count({
    where: {
      ipHash,
      toolId,
      createdAt: {
        gte: oneHourAgo,
      },
    },
  });

  // Allow max 5 clicks per tool per hour per IP
  return clickCount < 5;
}
