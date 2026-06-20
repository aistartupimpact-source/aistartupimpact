import { MetadataRoute } from 'next';

const SITE_URL = 'https://aistartupimpact.com';

const DISALLOWED_PATHS = [
  '/api/',
  '/billing/',
  '/client-portal/',
  '/my-analytics/',
  '/my-placements/',
  '/_next/',
  
  // User requested disallows
  '/funding',
  '/funding/',
  '/india-ai',
  '/india-ai/',
  
  // Only allow home, news, tools, startups, newsletter, and policy pages:
  '/about',
  '/advertise',
  '/contact',
  '/careers',
  '/jobs',
  '/stories',
  '/stories/',
  '/opinion',
  '/search',
  '/submit-content',
  '/submit-startup',
  '/submit-tool',
];

const AI_USER_AGENTS = [
  'GPTBot',                // ChatGPT Crawler
  'ChatGPT-User',          // ChatGPT User Actions / Custom GPTs
  'Google-Extended',      // Gemini / Google SGE
  'ClaudeBot',            // Anthropic Claude Crawler
  'Claude-Web',           // Anthropic Web Interface
  'PerplexityBot',        // Perplexity AI Search Engine
  'Applebot-Extended',    // Apple Intelligence
  'xai-crawler',          // Grok / xAI Crawler
  'utility-xai',          // Grok / xAI Utility Crawler
  'facebookbot',          // Meta AI Crawler
  'cohere-ai',            // Cohere AI Crawler
];

export default function robots(): MetadataRoute.Robots {
  const rules = [
    // Standard crawlers (Googlebot, Bingbot, etc.) + Wildcard for other LLMs (like Sarvam AI)
    {
      userAgent: '*',
      allow: '/',
      disallow: DISALLOWED_PATHS,
    },
    // Explicitly configure specific AI Search & LLM Crawlers
    ...AI_USER_AGENTS.map((agent) => ({
      userAgent: agent,
      allow: '/',
      disallow: DISALLOWED_PATHS,
    })),
  ];

  return {
    rules,
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
