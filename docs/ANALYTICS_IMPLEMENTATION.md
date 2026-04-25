# Real-Time Analytics Implementation

## Overview
Comprehensive analytics tracking system for AI Startup Impact that captures real user traffic data including page views, device types, traffic sources, session duration, and bounce rates.

## What Was Implemented

### 1. Database Schema (`PageView` Model)
Added a new `PageView` table to track all site traffic:

```prisma
model PageView {
  id          String   @id @default(uuid())
  pathname    String
  referrer    String?
  source      String   // "DIRECT", "SEARCH", "SOCIAL", "REFERRAL", "EMAIL"
  device      String   // "DESKTOP", "MOBILE", "TABLET"
  browser     String?
  os          String?
  country     String?
  sessionHash String   // Hash of IP + User Agent for session tracking
  ipHash      String?  // Hashed IP for privacy
  userAgent   String?
  duration    Int?     // Session duration in seconds
  bounced     Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

**Key Features:**
- Privacy-focused: IPs are hashed, not stored in plain text
- Session tracking via sessionHash (IP + User Agent hash)
- Automatic device, browser, and OS detection
- Traffic source classification (Direct, Search, Social, Referral, Email)
- Bounce rate tracking (single-page sessions)

### 2. Analytics Tracking Library (`apps/web/lib/analytics.ts`)
Server-side utility functions for tracking:

**Functions:**
- `trackPageView(pathname)` - Records page views with full context
- `trackArticleView(articleId)` - Increments article view counter
- `getDeviceType(userAgent)` - Detects Desktop/Mobile/Tablet
- `getBrowser(userAgent)` - Identifies browser (Chrome, Safari, Firefox, etc.)
- `getOS(userAgent)` - Detects operating system
- `getTrafficSource(referrer)` - Classifies traffic source

**Privacy Features:**
- IP addresses are hashed using SHA-256
- Session tracking uses combined hash of IP + User Agent
- No personally identifiable information stored

### 3. Client-Side Tracking Component (`apps/web/components/Analytics.tsx`)
React component that automatically tracks page views:

```tsx
<Analytics />
```

- Tracks on mount and route changes
- Uses Next.js `usePathname` hook
- Sends data to tracking API
- Fails silently to not break user experience

### 4. Tracking API Route (`apps/web/app/api/track/route.ts`)
POST endpoint for client-side tracking:

```
POST /api/track
Body: { pathname: string }
```

### 5. Enhanced Admin Analytics (`apps/admin/app/(dashboard)/analytics/actions.ts`)
Updated analytics dashboard to use real data:

**Real Metrics Now Tracked:**
- ✅ **Pageviews** - Total page views from PageView table
- ✅ **Unique Visitors** - Count of unique sessionHash values
- ✅ **Average Session Duration** - Calculated from duration field
- ✅ **Bounce Rate** - Percentage of single-page sessions
- ✅ **Traffic Sources** - Real breakdown by source (Search, Social, Direct, etc.)
- ✅ **Device Breakdown** - Actual Desktop/Mobile/Tablet percentages
- ✅ **Browser & OS Stats** - Real user agent data
- ✅ **Top Articles** - Based on Article.viewCount
- ✅ **Ad Performance** - CTR from AdImpression/AdClick tables

**Previous Mock Data Removed:**
- ❌ Hardcoded traffic source percentages
- ❌ Estimated unique visitor calculations
- ❌ Placeholder device breakdowns
- ❌ Mock session duration and bounce rates

## How It Works

### Tracking Flow
1. User visits a page on the website
2. `<Analytics />` component detects the page view
3. Component sends POST request to `/api/track`
4. API route calls `trackPageView()` function
5. Function extracts headers (User-Agent, Referrer, IP)
6. Parses device type, browser, OS from User-Agent
7. Classifies traffic source from referrer
8. Creates session hash for privacy
9. Checks if this is a bounce (first page in session)
10. Inserts record into PageView table
11. Updates previous pages in session to mark as not bounced

### Session Tracking
- Sessions are identified by `sessionHash` (hash of IP + User Agent)
- Session window: 30 minutes
- If user views multiple pages within 30 minutes, they're in the same session
- First page view in session is marked as potentially bounced
- Subsequent page views update all pages in session to not bounced

### Privacy Compliance
- IP addresses are hashed using SHA-256 (16 character substring)
- No plain-text IPs stored in database
- Session tracking uses combined hash, not individual identifiers
- User agents stored for analytics but can be purged
- GDPR/CCPA compliant approach

## Usage

### In Web App Layout
Already integrated in `apps/web/app/layout.tsx`:

```tsx
import AnalyticsTracker from '@/components/Analytics';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <AnalyticsTracker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Viewing Analytics
Navigate to Admin Dashboard → Analytics to see:
- Real-time pageview counts
- Unique visitor tracking
- Traffic source breakdown
- Device type distribution
- Top performing articles
- Session metrics (duration, bounce rate)

### Manual Tracking
To track custom events:

```typescript
import { trackPageView, trackArticleView } from '@/lib/analytics';

// Track a page view
await trackPageView('/custom-page');

// Track article view
await trackArticleView(articleId);
```

## Database Queries

### Get Traffic by Source
```sql
SELECT source, COUNT(*) as visits
FROM "PageView"
WHERE "createdAt" >= NOW() - INTERVAL '7 days'
GROUP BY source
ORDER BY visits DESC;
```

### Get Device Breakdown
```sql
SELECT device, COUNT(*) as count
FROM "PageView"
WHERE "createdAt" >= NOW() - INTERVAL '7 days'
GROUP BY device;
```

### Calculate Bounce Rate
```sql
SELECT 
  COUNT(*) FILTER (WHERE bounced = true) * 100.0 / COUNT(*) as bounce_rate
FROM "PageView"
WHERE "createdAt" >= NOW() - INTERVAL '7 days';
```

### Get Unique Visitors
```sql
SELECT COUNT(DISTINCT "sessionHash") as unique_visitors
FROM "PageView"
WHERE "createdAt" >= NOW() - INTERVAL '7 days';
```

## Performance Considerations

### Indexes
The PageView table has optimized indexes:
- `(pathname, createdAt)` - Fast queries by page
- `(sessionHash, createdAt)` - Session tracking
- `(source, createdAt)` - Traffic source analysis
- `(device, createdAt)` - Device breakdown
- `(createdAt)` - Time-based queries

### Data Retention
Consider implementing data retention policies:
- Keep detailed data for 90 days
- Aggregate older data into daily/monthly summaries
- Archive or delete data older than 1 year

### Scaling
For high-traffic sites:
- Consider batching inserts
- Use background jobs for processing
- Implement sampling (track 10% of traffic)
- Use time-series database for analytics data

## Testing

### Test Tracking Locally
1. Start the web app: `npm run dev`
2. Visit any page
3. Check database for PageView records:
```sql
SELECT * FROM "PageView" ORDER BY "createdAt" DESC LIMIT 10;
```

### Test Analytics Dashboard
1. Start admin app: `cd apps/admin && npm run dev`
2. Login as SUPER_ADMIN or EDITOR_IN_CHIEF
3. Navigate to Analytics page
4. Verify real data is displayed

## Migration Applied

```sql
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pathname" TEXT NOT NULL,
    "referrer" TEXT,
    "source" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "sessionHash" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "duration" INTEGER,
    "bounced" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "PageView_pathname_createdAt_idx" ON "PageView"("pathname", "createdAt");
CREATE INDEX "PageView_sessionHash_createdAt_idx" ON "PageView"("sessionHash", "createdAt");
CREATE INDEX "PageView_source_createdAt_idx" ON "PageView"("source", "createdAt");
CREATE INDEX "PageView_device_createdAt_idx" ON "PageView"("device", "createdAt");
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");
```

## Next Steps

### Enhancements to Consider
1. **Geographic Tracking** - Add country/city detection using IP geolocation
2. **Real-time Dashboard** - WebSocket updates for live analytics
3. **Custom Events** - Track button clicks, form submissions, etc.
4. **Conversion Funnels** - Track user journeys through the site
5. **A/B Testing** - Integrate with feature flags
6. **Heatmaps** - Track click positions and scroll depth
7. **Performance Metrics** - Track page load times, Core Web Vitals

### Monitoring
- Set up alerts for traffic spikes/drops
- Monitor database size and query performance
- Track API endpoint response times
- Review bounce rate trends

## Files Modified/Created

### Created
- `apps/web/lib/analytics.ts` - Analytics tracking utilities
- `apps/web/components/Analytics.tsx` - Client-side tracking component
- `apps/web/app/api/track/route.ts` - Tracking API endpoint
- `packages/database/prisma/migrations/add_pageview_analytics.sql` - Migration SQL
- `docs/ANALYTICS_IMPLEMENTATION.md` - This documentation

### Modified
- `packages/database/prisma/schema.prisma` - Added PageView model
- `apps/web/app/layout.tsx` - Integrated Analytics component
- `apps/admin/app/(dashboard)/analytics/actions.ts` - Enhanced with real data queries

## Support

For issues or questions:
1. Check database connection and PageView table exists
2. Verify Analytics component is mounted in layout
3. Check browser console for tracking errors
4. Review server logs for API errors
5. Ensure Prisma client is generated: `npx prisma generate`
