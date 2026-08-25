import { describe, it, expect } from 'vitest';
import { isBot } from '@/lib/security';

describe('isBot', () => {
  describe('detects known bots', () => {
    const bots = [
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
      'DuckDuckBot/1.0',
      'facebookexternalhit/1.1',
      'Twitterbot/1.0',
      'LinkedInBot/1.0',
      'WhatsApp/2.21',
      'Slackbot-LinkExpanding 1.0',
      'AhrefsBot/7.0',
      'SemrushBot/7',
      'Screaming Frog SEO Spider',
    ];

    it.each(bots)('detects %s', (ua) => {
      expect(isBot(ua)).toBe(true);
    });
  });

  describe('allows real browsers', () => {
    const browsers = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    ];

    it.each(browsers)('allows %s', (ua) => {
      expect(isBot(ua)).toBe(false);
    });
  });

  it('is case insensitive', () => {
    expect(isBot('GOOGLEBOT/2.1')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isBot('')).toBe(false);
  });
});
