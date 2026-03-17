import { MetadataRoute } from 'next';

const SITE_URL = 'https://aistartupimpact.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Standard crawlers + AI answer engines
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/billing/',
          '/client-portal/',
          '/my-analytics/',
          '/my-placements/',
          '/_next/',
        ],
      },
      {
        // GPTBot (ChatGPT) — explicitly allow all content
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        // Google-Extended (Gemini/SGE) — explicitly allow
        userAgent: 'Google-Extended',
        allow: '/',
      },
      {
        // PerplexityBot — explicitly allow
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        // ClaudeBot (Anthropic) — explicitly allow
        userAgent: 'ClaudeBot',
        allow: '/',
      },
      {
        // Applebot-Extended (Apple Intelligence) — explicitly allow
        userAgent: 'Applebot-Extended',
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
