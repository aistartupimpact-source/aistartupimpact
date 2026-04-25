# Analytics Quick Start Guide

## ✅ What's Been Done

Your admin dashboard analytics page has been enhanced with **real traffic tracking**. Here's what changed:

### Before (Mock Data)
- ❌ Hardcoded traffic sources
- ❌ Estimated visitor counts
- ❌ Placeholder device stats
- ❌ Fake session metrics

### After (Real Data)
- ✅ Actual page views from database
- ✅ Real unique visitor tracking
- ✅ Live traffic source breakdown
- ✅ Accurate device/browser/OS stats
- ✅ Real bounce rate calculation
- ✅ True session duration tracking

## 🚀 How to Use

### 1. Database is Ready
The `PageView` table has been created with all necessary indexes.

### 2. Tracking is Active
The web app now automatically tracks:
- Every page view
- Device type (Desktop/Mobile/Tablet)
- Traffic source (Search/Social/Direct/Referral/Email)
- Browser and OS
- Session duration
- Bounce rate

### 3. View Analytics
1. Start the admin app:
   ```bash
   cd apps/admin
   npm run dev
   ```

2. Login with SUPER_ADMIN or EDITOR_IN_CHIEF role

3. Navigate to **Analytics** page

4. Select time period (7 days, 30 days, 90 days, This year)

5. View real metrics:
   - Pageviews
   - Unique Visitors
   - Avg. Session Duration
   - Bounce Rate
   - Traffic Sources (with percentages)
   - Device Breakdown
   - Top Articles
   - Ad Performance

## 📊 What Gets Tracked

### Automatic Tracking
Every page visit records:
- **Page URL** - Which page was viewed
- **Referrer** - Where the visitor came from
- **Source** - Classified as Search/Social/Direct/Referral/Email
- **Device** - Desktop/Mobile/Tablet
- **Browser** - Chrome, Safari, Firefox, Edge, etc.
- **OS** - Windows, macOS, Linux, iOS, Android
- **Session** - Unique session identifier (privacy-safe hash)
- **Timestamp** - When the visit occurred
- **Bounce** - Whether user left after one page

### Privacy Features
- ✅ IP addresses are hashed (not stored in plain text)
- ✅ Session tracking uses combined hash
- ✅ No personally identifiable information
- ✅ GDPR/CCPA compliant

## 🔍 Testing

### Test Tracking
1. Start the web app:
   ```bash
   cd apps/web
   npm run dev
   ```

2. Visit http://localhost:3000

3. Navigate to a few pages

4. Check the database:
   ```sql
   SELECT * FROM "PageView" ORDER BY "createdAt" DESC LIMIT 10;
   ```

### Test Analytics Dashboard
1. Generate some traffic on the web app
2. Open admin dashboard
3. Go to Analytics page
4. Verify you see real numbers (not zeros)

## 📈 Understanding the Metrics

### Pageviews
Total number of pages viewed in the selected period.

### Unique Visitors
Number of unique sessions (based on sessionHash).

### Avg. Session Duration
Average time users spend on the site per session.

### Bounce Rate
Percentage of visitors who leave after viewing only one page.

### Traffic Sources
Where your visitors come from:
- **Search** - Google, Bing, Yahoo, DuckDuckGo
- **Social** - Twitter, LinkedIn, Facebook, Reddit
- **Direct** - Typed URL or bookmarks
- **Referral** - Other websites linking to you
- **Email** - Newsletter or email campaigns

### Device Breakdown
Percentage of visitors by device type:
- **Desktop** - Laptop/desktop computers
- **Mobile** - Smartphones
- **Tablet** - iPads and tablets

## 🛠️ Troubleshooting

### No Data Showing
1. **Check if tracking is working:**
   ```sql
   SELECT COUNT(*) FROM "PageView";
   ```
   If zero, tracking isn't working.

2. **Verify Analytics component is loaded:**
   Check `apps/web/app/layout.tsx` has `<AnalyticsTracker />`

3. **Check API endpoint:**
   Visit http://localhost:3000/api/track in browser
   Should return 400 error (expected - needs POST with pathname)

### Analytics Page Shows Errors
1. **Check database connection:**
   Ensure DATABASE_URL is set correctly

2. **Verify Prisma client is generated:**
   ```bash
   cd packages/database
   npx prisma generate
   ```

3. **Check user role:**
   Only SUPER_ADMIN, EDITOR_IN_CHIEF, and AD_MANAGER can view analytics

### Tracking Not Working
1. **Check browser console** for errors
2. **Verify API route exists:** `apps/web/app/api/track/route.ts`
3. **Check server logs** for tracking errors
4. **Ensure database is accessible**

## 📝 Next Steps

### Recommended Enhancements
1. **Add Geographic Tracking** - Show visitor locations on a map
2. **Real-time Updates** - Live dashboard with WebSocket
3. **Custom Events** - Track button clicks, downloads, etc.
4. **Conversion Funnels** - Track user journeys
5. **Export Reports** - Download analytics as CSV/PDF

### Data Retention
Consider setting up:
- Daily aggregation jobs
- Archive old data after 90 days
- Automated cleanup scripts

### Performance Optimization
For high traffic:
- Implement batch inserts
- Use background jobs
- Consider sampling (track 10% of traffic)
- Add caching layer

## 📚 Documentation

Full documentation available in:
- `docs/ANALYTICS_IMPLEMENTATION.md` - Complete technical details
- `apps/web/lib/analytics.ts` - Code comments
- `packages/database/prisma/schema.prisma` - PageView model

## ✨ Summary

Your analytics system is now tracking **real user data** instead of mock values. The admin dashboard shows accurate metrics for:

- ✅ Traffic volume and trends
- ✅ Visitor behavior (bounce rate, session duration)
- ✅ Traffic sources (where visitors come from)
- ✅ Device and browser breakdown
- ✅ Top performing content
- ✅ Ad campaign performance

All data is privacy-compliant and ready for production use!
