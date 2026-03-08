// Utility to fetch data for the frontend from the Next.js API rewrite or external Express server
// Ensure NEXT_PUBLIC_API_URL is available, otherwise default to local dev.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

async function fetchAPI(endpoint: string, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds
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

// ─── HERO & LATEST STORIES ───────────────────────────────────────

export async function getHeroArticle() {
  const articles = await fetchAPI('/articles?isFeatured=true&limit=1');
  return articles ? articles[0] : null;
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

// ─── AI TOOLS ───────────────────────────────────────────────────

export async function getToolPicks(limit = 3) {
  return fetchAPI(`/tools?isFeatured=true&limit=${limit}`);
}

// ─── FUNDING & STARTUPS ──────────────────────────────────────────

export async function getFundingNews(limit = 3) {
  return fetchAPI(`/funding?limit=${limit}`);
}

export async function getFeaturedStartup() {
  const startups = await fetchAPI('/startups?isFeatured=true&limit=1');
  return startups ? startups[0] : null;
}

// ─── INDIA AI ECOSYSTEM ──────────────────────────────────────────

export async function getIndiaAIEcosystem(limit = 4) {
  return fetchAPI(`/articles?category=ecosystem&limit=${limit}`);
}
