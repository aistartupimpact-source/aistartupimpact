# Admin Panel - Complete Project Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [Authentication and Roles](#authentication-and-roles)
4. [Modules](#modules)
5. [Newsletter System](#newsletter-system)
6. [Analytics Dashboards](#analytics-dashboards)
7. [Content Management](#content-management)
8. [Database Patterns](#database-patterns)

---

## Architecture Overview

The admin panel is a Next.js 14 application with NextAuth.js authentication. It runs on port 3001 and provides content management, analytics, and operational tools for the AI Startup Impact platform.

**Stack:**
- Next.js 14 (App Router, Server Actions)
- TypeScript
- Tailwind CSS
- NextAuth.js v4 (credential-based login)
- Prisma 5.22 with Neon HTTP Adapter
- Resend (email delivery)
- Recharts (charts)

---

## Directory Structure

```
apps/admin/
├── app/
│   ├── (dashboard)/              # All authenticated routes
│   │   ├── analytics/            # Site-wide analytics
│   │   │   ├── page.tsx          # Dashboard UI
│   │   │   └── actions.ts       # Data fetching
│   │   ├── articles/             # Article management
│   │   │   ├── page.tsx          # Article list
│   │   │   ├── actions.ts       # CRUD operations
│   │   │   └── [id]/edit/       # Article editor
│   │   ├── funding-dir/          # Funding rounds + digests
│   │   │   ├── page.tsx          # Tabs: Rounds | Digests
│   │   │   └── actions.ts       # CRUD operations
│   │   ├── india-ai/             # India AI section
│   │   │   ├── tools/           # Indian AI tools
│   │   │   └── ...
│   │   ├── newsletter-admin/     # Newsletter campaigns
│   │   │   ├── page.tsx          # Campaign editor + list
│   │   │   └── actions.ts       # Send, CRUD
│   │   ├── newsletter-highlights/ # Content curation
│   │   ├── placements/           # Ad campaigns
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   ├── startups-dir/         # Startup management
│   │   │   ├── page.tsx          # Startup list
│   │   │   ├── [id]/edit/       # Edit startup
│   │   │   └── new/             # Create startup
│   │   ├── tool-analytics/       # Tool click analytics
│   │   │   ├── page.tsx          # Dashboard
│   │   │   └── actions.ts       # Data queries
│   │   ├── tools-dir/            # Tool management
│   │   │   ├── page.tsx          # Tool list
│   │   │   ├── [id]/edit/       # Edit tool
│   │   │   └── new/             # Create tool
│   │   ├── users/                # User management
│   │   └── components/
│   │       └── Sidebar.tsx       # Navigation sidebar
│   ├── api/                      # Admin API routes
│   └── layout.tsx                # Root layout
├── components/
│   └── shared/
│       └── FAQManager.tsx        # Reusable FAQ editor
├── lib/
│   ├── auth.ts                   # NextAuth configuration
│   ├── api.ts                    # API client helpers
│   └── newsletter-templates.ts   # Email template system
└── docs/                         # This documentation folder
```

---

## Authentication and Roles

### Login

NextAuth.js with credentials provider. Admin users are stored in the `User` table with role field.

### Role Hierarchy

| Role | Access |
|------|--------|
| SUPER_ADMIN | Everything |
| EDITOR_IN_CHIEF | Content, newsletter, analytics, directories |
| SENIOR_WRITER | Articles only |
| AD_MANAGER | Placements, analytics |

### Authorization Pattern

Every server action checks the session:
```typescript
"use server";
const ALLOWED = ["SUPER_ADMIN", "EDITOR_IN_CHIEF"];
const session = await getServerSession(authOptions);
if (!session?.user || !ALLOWED.includes(session.user.role)) {
  return { success: false, error: 'Unauthorized' };
}
```

---

## Modules

### Analytics Dashboard (`/analytics`)

**Access:** SUPER_ADMIN, EDITOR_IN_CHIEF, AD_MANAGER

Displays:
- Page views (total, unique visitors, avg session, bounce rate)
- Top articles by view count
- Traffic sources (Direct, Search, Social, Referral, Email)
- Device breakdown (Desktop, Mobile, Tablet)
- Newsletter subscriber growth
- Ad placement performance (impressions, clicks, CTR)
- Period selector (7d, 30d, 90d, This year)

Data comes from `PageView` table via raw SQL with interval-based filtering.

### Tool Click Analytics (`/tool-analytics`)

**Access:** SUPER_ADMIN, EDITOR_IN_CHIEF, AD_MANAGER

Displays:
- Total clicks, unique sessions, unique tools
- Top 10 tools by clicks (with logo, category)
- Click source breakdown (TOOL_DETAIL, DIRECTORY, HOMEPAGE, SEARCH)
- Device, browser, country breakdowns
- Daily trend
- CSV export
- Period selector

Data from `AffiliateClick` table. Uses `$queryRaw` template literal for the main query, aggregates in JavaScript.

### Newsletter (`/newsletter-admin`)

**Access:** SUPER_ADMIN, EDITOR_IN_CHIEF

Full campaign management:
- Create/edit campaigns (subject, preview text, HTML body)
- 4 template variants (Minimal, Bold, Classic, Modern)
- Live preview with device toggle
- Send test email (with confirmation popup)
- Send to all subscribers (with confirmation popup)
- Campaign stats (sent, opens, clicks, unsubscribes)

Template system in `lib/newsletter-templates.ts`. Content auto-styled with inline CSS for email client compatibility.

### Articles (`/articles`)

**Access:** SUPER_ADMIN, EDITOR_IN_CHIEF, SENIOR_WRITER

- Create/edit articles (NEWS or STORY type)
- Rich HTML body editor
- Cover image upload to R2
- Category and tag management
- SEO fields (title, description, keyword)
- Publish/draft/schedule workflow

### Funding Directory (`/funding-dir`)

**Access:** SUPER_ADMIN, EDITOR_IN_CHIEF

Two tabs:
- **Funding Rounds** - CRUD for individual deals (startup, amount, stage, investors)
- **Weekly Digests** - Curated weekly summaries

Auto-creates startup record if not exists. Date columns cast to text to avoid rendering issues.

### Ad Placements (`/placements`)

**Access:** SUPER_ADMIN, AD_MANAGER

- Campaign management (client, dates, budget)
- Creative management (headline, body, CTA, image, zone)
- Performance tracking (impressions, clicks)

### Tool Directory (`/tools-dir`)

**Access:** SUPER_ADMIN, EDITOR_IN_CHIEF

- List/search all tools
- Create/edit tool profiles
- Approval workflow (PENDING -> APPROVED -> REJECTED)
- Listing tier management (FREE, PRIORITY, FEATURED)
- FAQ management per tool

### Startup Directory (`/startups-dir`)

**Access:** SUPER_ADMIN, EDITOR_IN_CHIEF

- List/search all startups
- Create/edit profiles
- Verification workflow
- Featured toggle

### Users (`/users`)

**Access:** SUPER_ADMIN

- View all registered users
- Role management
- Activity tracking

---

## Newsletter System (Detailed)

### Template Architecture

File: `lib/newsletter-templates.ts`

Four templates, all sharing a common footer:

| Template | Background | Content Style |
|----------|-----------|---------------|
| Minimal | White | Serif heading, max readability |
| Bold | Dark navy (body bg) | Sans-serif, high contrast |
| Classic | Light gray | Red accent bar, serif heading |
| Modern | Light gray | Rounded container, soft shadow |

### Footer Structure

All templates use the same footer:
1. Navigation links (News, Stories, Tools, Startups, Funding)
2. Social icons (X, LinkedIn, YouTube, Instagram) - red themed PNGs
3. Subscription disclaimer
4. Legal links (Unsubscribe, Privacy, Website, Contact)
5. Copyright (Hyderabad, India)

### Content Inline Styling

The `inlineContentStyles()` function converts CSS classes to inline styles:
- `.cta-block` -> card container
- `.cta-title` -> bold heading
- `.cta-text` -> paragraph
- `.cta-btn` -> red button
- `.highlight` -> red-bordered box
- `.note` -> blue info box
- All standard HTML elements (h2, h3, p, ul, ol, li, a, img, hr, blockquote, strong, code, pre)

### Email Delivery

Provider: Resend
- Batch sending (100 per batch)
- Open tracking (1x1 pixel)
- Click tracking (link wrapping)
- Personalized unsubscribe links

### Confirmation Popups

Both send actions require explicit confirmation:
- "Send to All Subscribers?" - warns about irreversibility
- "Send Test Email?" - shows target email address

---

## Database Patterns

### Reads with Date Filtering

Use `$queryRaw` template literals (not `findMany` with Date):
```typescript
const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);
const results = await prisma.$queryRaw<any[]>`
  SELECT * FROM "PageView" WHERE "createdAt" >= ${startDate}
`;
```

### Writes

Use standard Prisma or `$executeRaw`:
```typescript
await prisma.$executeRaw`
  UPDATE "NewsletterCampaign" SET status = 'SENT' WHERE id = ${id}
`;
```

### Date Column Handling

PostgreSQL `date` columns return as Date objects. Cast to text:
```sql
SELECT date::text AS date FROM "FundingDigest"
```

Or handle in JavaScript:
```typescript
const dateStr = x.date instanceof Date
  ? x.date.toISOString().split('T')[0]
  : String(x.date);
```

### Aggregation

Avoid Prisma `groupBy` with enum fields. Fetch raw data and aggregate in JS:
```typescript
const allClicks = await prisma.$queryRaw<any[]>`SELECT ... FROM "AffiliateClick"`;
const countBySource = new Map();
allClicks.forEach(c => countBySource.set(c.sourcePage, (countBySource.get(c.sourcePage) || 0) + 1));
```

---

## Sidebar Navigation

The admin sidebar (`components/Sidebar.tsx`) includes links to:
- Dashboard (analytics)
- Articles
- Tools Directory
- Tool Analytics
- Startups Directory
- Funding
- Newsletter
- Placements
- Users
- India AI

Each link shows an icon and label. Active route is highlighted.
