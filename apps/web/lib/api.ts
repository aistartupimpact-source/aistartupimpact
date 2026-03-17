// Utility to fetch data for the frontend from the Next.js API rewrite or external Express server
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

async function fetchAPI(endpoint: string, options: any = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      next: { revalidate: 60 },
      ...options,
    });
    if (!res.ok) {
      console.warn(`API ${endpoint} returned status ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.error(`Fetch error on ${endpoint}:`, error);
    return null;
  }
}

export async function getArticles(params: Record<string, string | number> = {}) {
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
  return fetchAPI(`/articles${qs ? `?${qs}` : ''}`);
}

export async function getArticleBySlug(slug: string) {
  return fetchAPI(`/articles/${slug}`);
}

export async function getHeroArticle() {
  const articles = await fetchAPI('/articles?isFeatured=true&limit=1');
  if (articles?.length) return articles[0];
  // fallback: latest article
  const latest = await fetchAPI('/articles?limit=1');
  return latest?.length ? latest[0] : null;
}

export async function getTrendingNews() {
  const trending = await fetchAPI('/articles/trending');
  return trending ? trending.map((t: any) => t.title) : [];
}

export async function getLatestStories(limit = 3) {
  return fetchAPI(`/articles?limit=${limit}`);
}

export async function getFounderSpotlight() {
  const stories = await fetchAPI('/articles?type=STORY&limit=1');
  return stories ? stories[0] : null;
}

export async function getToolPicks(limit = 3) {
  return fetchAPI(`/tools?isFeatured=true&limit=${limit}`);
}

export async function getFundingNews(limit = 3) {
  return fetchAPI(`/funding?limit=${limit}`);
}

export async function getFeaturedStartup() {
  const startups = await fetchAPI('/startups?isFeatured=true&limit=1');
  return startups ? startups[0] : null;
}

export async function getIndiaAIEcosystem(limit = 4) {
  return fetchAPI(`/articles?limit=${limit}`);
}
