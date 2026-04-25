# Sponsor / Powered By Strip - Complete Guide

## Overview
The sponsor strip is a rotating banner that appears on the homepage between the "Latest Stories" and "Founder Spotlight" sections. It displays "Powered by [Brand]" with optional logo and tagline.

## Features
✅ **Rotating Display**: Multiple sponsors rotate automatically every 4 seconds
✅ **Schedule Support**: Set start and end dates for campaigns
✅ **Priority Ordering**: Control display order with sortOrder field
✅ **Active/Inactive Toggle**: Enable/disable sponsors without deleting
✅ **Mobile Responsive**: Optimized layout for all screen sizes
✅ **Logo Support**: Optional brand logo display
✅ **Click Tracking**: Links to sponsor website with proper attribution

## How to Add a Sponsor

### Step 1: Access Admin Panel
1. Go to `http://localhost:3001` (Admin panel)
2. Login with admin credentials
3. Navigate to **"Powered By / Sponsors"** from the sidebar

### Step 2: Add New Sponsor
1. Click **"Add Sponsor"** button (top right)
2. Fill in the required fields:

   **Required Fields:**
   - **Brand Name**: Company/product name (e.g., "Yotta Data Services")
   - **Tagline**: Short description, max 80 chars (e.g., "Powering Indian AI with NVIDIA H100 GPU Cloud")
   - **CTA URL**: Website link (e.g., "https://yotta.com")

   **Optional Fields:**
   - **Logo URL**: Direct link to logo image (recommended: transparent PNG, 200x60px)
   - **Start Date**: When to start showing (leave blank for immediate)
   - **End Date**: When to stop showing (leave blank for no expiry)
   - **Sort Order**: Display priority (lower numbers show first, default: 0)
   - **Active**: Toggle to enable/disable (default: checked)

3. Click **"Save Sponsor"**

### Step 3: Verify on Homepage
1. Go to `http://localhost:3000` (Web frontend)
2. Scroll to the section between "Latest Stories" and "Founder Spotlight"
3. You should see: **"Powered by [Your Brand] — [Your Tagline]"**

## Display Logic

### When Sponsors Show:
- At least one sponsor must be **Active** (isActive = true)
- Current date must be within the schedule:
  - After `startDate` (or no startDate set)
  - Before `endDate` (or no endDate set)

### Priority Order:
1. **sortOrder** (ascending) - Lower numbers show first
2. **createdAt** (descending) - Newer sponsors show first if sortOrder is same

### Rotation:
- If multiple active sponsors exist, they rotate every 4 seconds
- Smooth fade transition between sponsors
- Dots indicator shows current position

## Example Sponsors

### Example 1: Immediate Display
```
Brand: Yotta Data Services
Tagline: India's Largest AI Cloud Infrastructure
CTA URL: https://yotta.com
Logo URL: https://yotta.com/logo.png
Start Date: (leave blank)
End Date: (leave blank)
Sort Order: 0
Active: ✓
```

### Example 2: Scheduled Campaign
```
Brand: AWS India
Tagline: Build AI Applications with Amazon Bedrock
CTA URL: https://aws.amazon.com/bedrock
Logo URL: https://aws.amazon.com/logo.png
Start Date: 2026-05-01
End Date: 2026-05-31
Sort Order: 1
Active: ✓
```

### Example 3: High Priority
```
Brand: NVIDIA
Tagline: Accelerating AI Innovation in India
CTA URL: https://nvidia.com/ai
Logo URL: https://nvidia.com/logo.png
Start Date: (leave blank)
End Date: (leave blank)
Sort Order: -1  ← Shows before others
Active: ✓
```

## Status Indicators

The admin panel shows real-time status for each sponsor:

- 🟢 **Live**: Active and within date range
- 🔵 **Scheduled**: Active but start date is in the future
- 🔴 **Expired**: Active but end date has passed
- ⚫ **Inactive**: Manually disabled (isActive = false)

## Technical Details

### Database Schema
```prisma
model Sponsor {
  id        String    @id @default(uuid())
  brand     String
  tagline   String    @db.Text
  ctaUrl    String
  logoUrl   String?
  isActive  Boolean   @default(true)
  sortOrder Int       @default(0)
  startDate DateTime?
  endDate   DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

### Files Involved
- **Admin Panel**: `apps/admin/app/(dashboard)/sponsors/page.tsx`
- **Admin Actions**: `apps/admin/app/(dashboard)/sponsors/actions.ts`
- **Web Component**: `apps/web/components/SponsorStrip.tsx`
- **Database Query**: `apps/web/lib/db.ts` (getActiveSponsorsDirect)
- **Homepage**: `apps/web/app/(public)/page.tsx`

### API Endpoints
All sponsor operations use server actions (no REST API):
- `getSponsorsAction()` - Fetch all sponsors
- `createSponsorAction(data)` - Create new sponsor
- `updateSponsorAction(id, data)` - Update existing sponsor
- `deleteSponsorAction(id)` - Delete sponsor
- `toggleSponsorStatusAction(id, current)` - Toggle active status

## Best Practices

### Logo Guidelines
- **Format**: PNG with transparent background
- **Size**: 200x60px (or similar aspect ratio)
- **File Size**: < 50KB for fast loading
- **Hosting**: Use CDN or reliable image hosting

### Tagline Tips
- Keep it under 60 characters for best mobile display
- Focus on value proposition
- Avoid special characters that might break layout
- Test on mobile before publishing

### Scheduling Tips
- Set start date 1 day before campaign launch for testing
- Set end date at 23:59:59 of the last day (handled automatically)
- Use sortOrder to prioritize premium sponsors
- Keep 2-3 sponsors active for variety

### Performance
- Component uses client-side rotation (no server load)
- Lazy loaded with `dynamic()` import
- ISR revalidation: 60 seconds
- No impact on initial page load

## Troubleshooting

### Sponsor Not Showing?
1. ✓ Check if sponsor is **Active** in admin
2. ✓ Verify current date is within start/end date range
3. ✓ Ensure at least one sponsor exists
4. ✓ Check browser console for errors
5. ✓ Clear cache and refresh page

### Multiple Sponsors Not Rotating?
1. ✓ Verify multiple sponsors are active
2. ✓ Check browser console for JavaScript errors
3. ✓ Ensure SponsorStrip component is loaded (check Network tab)

### Logo Not Displaying?
1. ✓ Verify logo URL is accessible (open in new tab)
2. ✓ Check CORS headers if using external hosting
3. ✓ Ensure image format is supported (PNG, JPG, SVG)
4. ✓ Check image dimensions (should be reasonable)

## Current Status

✅ **Database Schema**: Updated with startDate and endDate fields
✅ **Admin Panel**: Fully functional with scheduling support
✅ **Web Component**: Rotating display with smooth transitions
✅ **Homepage Integration**: Active and displaying when sponsors exist
✅ **Mobile Responsive**: Optimized for all screen sizes

## Next Steps

1. **Add Your First Sponsor**: Go to admin panel and create a sponsor
2. **Test Display**: Verify it shows correctly on homepage
3. **Add More Sponsors**: Create 2-3 sponsors to see rotation
4. **Schedule Campaigns**: Use date ranges for time-limited promotions

---

**Note**: The sponsor strip only appears when at least one active sponsor exists. If no sponsors are configured, the section is hidden automatically.
