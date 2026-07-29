# SEO Implementation

How search engine optimization is handled across the platform.

---

## Metadata Strategy

Every page exports a `metadata` object or `generateMetadata()` function:

```typescript
// Static metadata
export const metadata: Metadata = {
  title: 'AI Tools Directory — Find the Best AI Tools',
  description: 'Discover and compare 500+ AI tools...',
  alternates: { canonical: '/tools' },
  openGraph: { title: '...', description: '...', url: '/tools' },
};

// Dynamic metadata (detail pages)
export async function generateMetadata({ params }): Promise<Metadata> {
  const tool = await getToolBySlug(params.slug);
  return {
    title: `${tool.name} — AI Tool Review`,
    description: tool.tagline,
    alternates: { canonical: `/tools/${tool.slug}` },
  };
}
```

---

## Canonical URLs

Every page specifies a canonical URL via `alternates.canonical`:
- Prevents duplicate content issues
- Base URL: `https://aistartupimpact.com`
- Set in `metadataBase` in root layout

---

## Structured Data (JSON-LD)

### Site-Level (root layout)
| Schema | Purpose |
|--------|---------|
| `WebSite` | Enables Google Sitelinks Search Box |
| `Organization` | Publisher identity for all content |

### Page-Level
| Schema | Pages | Purpose |
|--------|-------|---------|
| `SoftwareApplication` | `/tools/[slug]` | Rich result for AI tools |
| `NewsArticle` | `/stories/[slug]`, `/news/[slug]` | News rich results |
| `FAQPage` | Detail pages with FAQs | FAQ rich results |
| `BreadcrumbList` | All pages | Navigation hierarchy |
| `ItemList` | Directory listing pages | List rich results |
| `Event` | `/events/[slug]` | Event rich results |
| `CollectionPage` | Category pages | Collection markup |
| `Person` | Founder profiles | People markup |

### Implementation (`apps/web/lib/seo.ts`)
```typescript
export function generateArticleSchema(data) { /* ... */ }
export function generateBreadcrumbSchema(crumbs) { /* ... */ }
export const generateWebSiteSchema = () => ({ /* ... */ });
export const generateOrganizationSchema = () => ({ /* ... */ });
```

---

## Sitemaps

| File | Type | Content |
|------|------|---------|
| `/sitemap.xml` | Static + Dynamic | Main pages + sections |
| `/tools/sitemap.xml` | Dynamic | All approved tools |
| `/startups/sitemap.xml` | Dynamic | All approved startups |
| `/tools/category/sitemap.xml` | Dynamic | Category landing pages |
| `/stories-sitemap.xml` | Dynamic | All published stories |

Generated via Next.js `sitemap.ts` convention.

---

## Robots.txt

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /founder/
Disallow: /organizer/
Disallow: /admin/
Sitemap: https://aistartupimpact.com/sitemap.xml
```

---

## Open Graph & Twitter

Every public page includes:
- `og:title`, `og:description`, `og:url`, `og:image`
- `twitter:card: summary_large_image`
- `twitter:site: @aikitstartup`

Dynamic OG images generated for tool and startup detail pages via `opengraph-image` route handlers.

---

## Performance SEO

| Metric | Target | Implementation |
|--------|--------|----------------|
| LCP | < 2.5s | Server Components, font preload, image optimization |
| FID | < 100ms | Minimal client JS, Server Components |
| CLS | < 0.1 | Fixed dimensions for images, font-display: swap |
| TTFB | < 800ms | ISR caching, Redis, edge CDN |

---

## Keywords Strategy

Primary keywords defined in root layout:
- `ai startups india 2026`
- `India AI ecosystem`
- `AI startup news`
- `best AI tools India`
- `AI funding India`

Per-page keywords added via metadata.

---

## Related Documents

- [Frontend Overview](./OVERVIEW.md)
- [Performance](./PERFORMANCE.md)
- [Caching](../architecture/CACHING.md)
