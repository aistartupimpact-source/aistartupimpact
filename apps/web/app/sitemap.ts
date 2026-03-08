import { MetadataRoute } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

// Direct fetch utility since sitemap runs at build/ISR time
async function fetchAll(endpoint: string) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}?limit=1000`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error(`Sitemap fetch error mapping ${endpoint}:`, error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://aistartupimpact.com';

  // 1. Static Routes
  const staticRoutes = [
    '',
    '/news',
    '/stories',
    '/tools',
    '/funding',
    '/india-ai',
    '/about',
    '/advertise',
    '/contact',
    '/newsletter',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Fetch all dynamic content
  const [articles, tools, startups] = await Promise.all([
    fetchAll('/articles'),
    fetchAll('/tools'),
    fetchAll('/startups'),
  ]);

  // 3. Map Articles (News & Stories)
  const articleRoutes = articles.map((article: any) => ({
    url: `${baseUrl}/${article.type?.toLowerCase() === 'story' ? 'stories' : 'news'}/${article.slug}`,
    lastModified: new Date(article.updatedAt || article.createdAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 4. Map Tools
  const toolRoutes = tools.map((tool: any) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: new Date(tool.updatedAt || tool.createdAt || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // 5. Map Startups
  const startupRoutes = startups.map((startup: any) => ({
    url: `${baseUrl}/startups/${startup.slug}`,
    lastModified: new Date(startup.updatedAt || startup.createdAt || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes, ...toolRoutes, ...startupRoutes];
}
