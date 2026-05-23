# Web App - Complete Project Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [Pages and Routes](#pages-and-routes)
4. [Data Layer](#data-layer)
5. [Analytics System](#analytics-system)
6. [Tool Click Tracking](#tool-click-tracking)
7. [Directory Systems](#directory-systems)
8. [SEO Implementation](#seo-implementation)
9. [Authentication](#authentication)
10. [Known Issues and Patterns](#known-issues-and-patterns)

---

## Architecture Overview

The web app is a Next.js 14 application using the App Router pattern. It serves the public-facing website at aistartupimpact.com on port 3000.

**Stack:**
- Next.js 14 (App Router, Server Components, Server Actions)
- TypeScript
- Tailwind CSS (with custom design tokens)
- Neon Serverless PostgreSQL (direct SQL via tagged templates)
- Prisma 5.22 (for writes only, with Neon HTTP adapter)
- Vercel (deployment)

**Fonts:**
- Sora (headings, bold text)
- Plus Jakarta Sans (body text)

**Color System:**
- Brand: Indigo/Purple gradient
- Navy: Dark headings
- Gray scale for text hierarchy

---

## Directory Structure

```
apps/web/
├── app/
│   ├── (public)/                 # Public routes
│   │   ├── page.tsx              # Homepage
│   │   ├── news/                 # News listing + detail
│   │   │   ├── page.tsx          # News listing (type=NEWS only)
│   │   │   └── [slug]/page.tsx   # Article detail
│   │   ├── stories/             # Founder stories
│   │   │   ├── page.tsx          # Stories listing (type=STORY)
│   │   │   └── [slug]/page.tsx   # Story detail
│   │   ├── tools/               # Tool directory
│   │   │   ├── page.tsx          # Tool listing with filters
│   │   │   └── [slug]/page.tsx   # Tool detail page
│   │   ├── startups/            # Startup directory
│   │   │   ├── page.tsx          # Startup listing with search
│   │   │   ├── [slug]/page.tsx   # Startup detail
│   │   │   └── submit/page.tsx   # Submit startup form
│   │   ├── funding/             # Funding tracker
│   │   │   ├── page.tsx          # Dashboard with charts
│   │   │   └── [slug]/page.tsx   # Individual round detail
│   │   ├── india-ai/            # India AI ecosystem section
│   │   ├── search/page.tsx       # Global search
│   │   ├── newsletter/page.tsx   # Newsletter subscribe page
│   │   └── ...                   # Other public pages
│   ├── (client)/                 # Authenticated user routes
│   │   ├── layout.tsx            # Auth-gated layout
│   │   ├── profile/             # User profile
│   │   └── saved/               # Saved items
│   ├── api/                      # API routes
│   │   ├── track/pageview/       # Page view tracking
│   │   ├── tools/click/          # Tool click tracking + redirect
│   │   ├── tools/[id]/faqs/      # Tool FAQ CRUD
│   │   ├── startups/search/      # Startup search endpoint
│   │   ├── startups/[id]/faqs/   # Startup FAQ CRUD
│   │   └── ...                   # Other API routes
│   ├── layout.tsx                # Root layout (fonts, analytics, theme)
│   ├── globals.css               # Tailwind + custom styles
│   ├── sitemap.xml/              # Main sitemap
│   ├── news-sitemap.xml/         # News sitemap
│   ├── stories-sitemap.xml/      # Stories sitemap
│   └── ...                       # Other sitemaps
├── components/
│   ├── layout/                   # Header, Footer, Ticker, Navigation
│   │   ├── BreakingTicker.tsx    # Breaking news ticker
│   │   ├── BreakingTickerClient.tsx
│   │   └── ...
│   ├── tools/                    # Tool-specific components
│   │   ├── ToolCTAButton.tsx     # Click-tracked visit button
│   │   └── SimilarTools.tsx      # Similar tools sidebar
│   ├── seo/                      # Structured data components
│   │   ├── ToolSchema.tsx
│   │   ├── FAQSchema.tsx
│   │   └── FundingDashboardSchema.tsx
│   ├── Analytics.tsx             # Page view tracker (client)
│   ├── ArticlesListClient.tsx    # News list with filters
│   ├── StoriesListClient.tsx     # Stories list with filters
│   ├── StartupSearch.tsx         # Startup directory client
│   ├── ToolsListWithComparison.tsx # Tool directory client
│   ├── WriteReviewClient.tsx     # Review form with auth gate
│   ├── BookmarkButton.tsx        # Save/bookmark feature
│   ├── SubscribeForm.tsx         # Newsletter subscribe
│   ├── HeroCarousel.tsx          # Homepage hero
│   ├── FeaturedPartnerRotator.tsx
│   └── ...
├── lib/
│   ├── db.ts                     # Neon SQL queries (primary data layer)
│   ├── analytics.ts              # trackPageView() function
│   ├── tool-tracking.ts          # Tool click tracking utilities
│   ├── security.ts               # Bot detection, rate limiting
│   ├── seo.ts                    # Schema.org generators
│   ├── seo-utils.ts              # FAQ generation, meta helpers
│   ├── auth.ts                   # NextAuth stub for API routes
│   ├── consent-manager.ts        # Cookie consent logic
│   └── ...
├── public/                       # Static assets
│   ├── logo.png
│   ├── og-default.png
│   └── india-map.json
└── docs/                         # This documentation folder
```

---

## Pages and Routes

### Homepage (`/`)
- Hero carousel with featured articles
- Breaking news ticker
- Tool picks section
- Featured startups
- Latest news grid
- India AI stats
- Newsletter CTA

### News (`/news`)
- Only articles with type = NEWS
- Sticky category pills (derived from article categories)
- Search bar (title + excerpt)
- Time filter (Today / This Week / This Month / All Time)
- 12 articles per page with "Load more"
- Featured articles section (top 2)
- Sidebar: Newsletter CTA, Quick Links, Trending

### Stories (`/stories`)
- Only articles with type = STORY
- Sticky category pills
- Search bar
- 12 per page pagination
- Featured stories section
- Sidebar: Newsletter, About, Themes, Recent

### Tool Directory (`/tools`)
- Sticky category pills with counts
- Search (name, tagline, category)
- Pricing filter dropdown
- Sort (Top Rated, Newest, A-Z)
- Grid/List view toggle
- 24 per page pagination
- Tool comparison (up to 3)

### Tool Detail (`/tools/[slug]`)
- Full profile (description, screenshots, features)
- User reviews with auth-gated "Write a Review"
- Similar tools sidebar (same category)
- Click-tracked "Visit Website" CTA
- FAQ section (auto-generated)
- Structured data (SoftwareApplication + FAQPage)

### Startup Directory (`/startups`)
- Sticky sector pills (FinTech, HealthTech, etc.)
- Search (name, tagline, city)
- Stage filter (Pre-Seed through Public)
- Business model filter (B2B, B2C, etc.)
- 24 per page pagination
- Card design with team size + funding raised

### Funding Tracker (`/funding`)
- Interactive dashboard (Recharts)
- Filterable table (stage, year, sector, city, amount)
- Sector breakdown, city distribution
- Top investors analysis
- PDF download with email gate
- Proper USD formatting (stored in cents)

---

## Data Layer

### Primary: Neon SQL (`lib/db.ts`)

All server-side reads use the Neon serverless driver directly:

```typescript
import { sql } from '@/lib/db';
const rows = await sql`SELECT * FROM "AiTool" WHERE slug = ${slug}`;
```

This avoids Prisma ORM issues with the Neon HTTP adapter.

### Secondary: Prisma (for writes)

Writes use Prisma since they don't involve Date-based where clauses:

```typescript
import { prisma } from '@aistartupimpact/database';
await prisma.affiliateClick.create({ data: { ... } });
```

### API Routes

Some features use API routes for client-side data fetching:
- `/api/startups/search` - Startup search with full-text
- `/api/track/pageview` - Page view recording
- `/api/tools/click` - Tool click tracking + redirect

---

## Analytics System

### Page View Tracking

Flow:
1. `<Analytics />` component in root layout detects pathname changes
2. Sends POST to `/api/track/pageview` with pathname
3. API route calls `trackPageView()` from `lib/analytics.ts`
4. Inserts record into `PageView` table

Tracked: pathname, referrer, source, device, browser, OS, session hash, IP hash.

Important: Bounce detection was removed (Neon adapter Date issue). All views are simple inserts.

### Tool Click Tracking

Flow:
1. User clicks `<ToolCTAButton>` (renders as `<a href="/api/tools/click?...">`)
2. API route fetches tool URL, validates it
3. Records click in `AffiliateClick` table (awaited, not fire-and-forget)
4. Returns 302 redirect to tool website

Important: Uses `await` not `setImmediate` because serverless functions terminate after response.

---

## SEO Implementation

### Structured Data (JSON-LD)

Every page includes relevant schemas:
- Root layout: WebSite + Organization
- News/Stories: Article/NewsArticle
- Tool detail: SoftwareApplication + FAQPage + BreadcrumbList
- Directories: ItemList + CollectionPage

### Dynamic Sitemaps

- `/sitemap.xml` - Index
- `/news-sitemap.xml` - All published news
- `/stories-sitemap.xml` - All published stories
- `/tools/sitemap.xml` - All approved tools
- `/funding-sitemap.xml` - Funding rounds
- `/india-ai-sitemap.xml` - India AI pages

### Meta Tags

Each page has full OpenGraph + Twitter Card meta via Next.js `generateMetadata()`.

---

## Authentication

### Web Users (Google OAuth)

Flow:
1. Click "Sign In" -> `/api/user/auth/google?returnTo=/path`
2. Google OAuth -> API server creates/finds user
3. Session cookie set
4. `UserProvider` context provides `user`, `signIn()`, `signOut()`

### Protected Features

- Write a Review: redirects to sign-in if not authenticated
- Bookmarks/Saved Items: requires sign-in
- Profile page: requires sign-in

---

## Known Issues and Patterns

### Neon HTTP Adapter

1. `findMany({ where: { createdAt: { gte: date } } })` - FAILS (Date = {})
2. `groupBy({ by: ['enumField'] })` - FAILS (enum not scalar)
3. `Prisma.sql` helper - FAILS
4. `$queryRaw` template literals - WORKS
5. `create({ data })` - WORKS (no Date in where)

### Hydration Errors

Nested `<a>` tags cause hydration mismatch. The `ToolCTAButton` uses `onClick={e => e.stopPropagation()}` when nested inside a `<Link>`.

### Serverless Limitations

`setImmediate()` and fire-and-forget patterns do not work in Vercel serverless. Always `await` database operations before returning a response.

### Date Columns

PostgreSQL `date` type returns as JavaScript Date object. Always cast to text in SQL or handle in JS before rendering.
