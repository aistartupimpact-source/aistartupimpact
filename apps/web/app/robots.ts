import { MetadataRoute } from 'next';

const SITE_URL = 'https://aistartupimpact.com';

const DISALLOWED_PATHS = [
  '/api/',
  '/_next/',
  '/founder/',
  '/organizer/',
  '/employer/',
  '/billing/',
  '/client-portal/',
  '/my-analytics/',
  '/my-placements/',
  '/submit-content',
  '/submit-startup',
  '/submit-tool',
  '/search',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/news/sitemap.xml`,
      `${SITE_URL}/stories/sitemap.xml`,
      `${SITE_URL}/tools/sitemap.xml`,
      `${SITE_URL}/tools/category/sitemap.xml`,
      `${SITE_URL}/startups/sitemap.xml`,
      `${SITE_URL}/events/sitemap.xml`,
      `${SITE_URL}/jobs/sitemap.xml`,
      `${SITE_URL}/india-ai/sitemap.xml`,
    ],
    host: SITE_URL,
  };
}
