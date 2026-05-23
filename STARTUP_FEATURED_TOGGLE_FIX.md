# Startup Featured Toggle Fix - Complete

## Summary
Fixed the featured toggle functionality in the admin panel's Startup Directory. The toggle now properly updates the `isFeatured` status and sets/clears the `featuredUntil` date.

## Issue
**Problem**: Featured toggle in startup directory was not working
**Root Cause**: Incorrect SQL template literal nesting in `toggleFeaturedAction`

The original code tried to nest SQL template literals:
```typescript
"featuredUntil" = ${isFeatured ? sql`NOW() + INTERVAL '30 days'` : null}
```

This syntax is invalid with the Neon serverless driver - you cannot nest `sql` template tags.

## Solution
Split the logic into two separate SQL queries based on the `isFeatured` boolean:

### When Setting Featured (isFeatured = true):
```sql
UPDATE "Startup"
SET 
  "isFeatured" = true,
  "featuredUntil" = NOW() + INTERVAL '30 days',
  "updatedAt" = NOW()
WHERE id = ${id}
```

### When Unsetting Featured (isFeatured = false):
```sql
UPDATE "Startup"
SET 
  "isFeatured" = false,
  "featuredUntil" = NULL,
  "updatedAt" = NOW()
WHERE id = ${id}
```

## Files Modified

**File**: `apps/admin/app/(dashboard)/startups-dir/actions.ts`

**Function**: `toggleFeaturedAction(id: string, isFeatured: boolean)`

**Changes**:
- Replaced single SQL query with conditional logic
- When `isFeatured` is true: sets featured and adds 30-day expiry
- When `isFeatured` is false: unsets featured and clears expiry date
- Both paths properly update the `updatedAt` timestamp
- Maintains the `revalidatePath` call for cache invalidation

## How It Works

1. **User clicks featured toggle** in the startup directory table
2. **Frontend calls** `toggleFeatured(startup.id, startup.isFeatured)` with inverted boolean
3. **Backend executes** appropriate SQL query based on new featured status
4. **Database updates** `isFeatured` and `featuredUntil` fields
5. **Cache revalidates** via `revalidatePath('/startups-dir')`
6. **Frontend reloads** startup list showing updated featured status
7. **UI updates** showing star icon and yellow badge for featured startups

## Featured Startup Behavior

### When Featured:
- `isFeatured` = true
- `featuredUntil` = 30 days from now
- Shows crown icon (👑) next to startup name
- Shows yellow "Featured" badge in table
- Appears in "Featured Partner" section on homepage
- Sorted to top of startup list

### When Not Featured:
- `isFeatured` = false
- `featuredUntil` = NULL
- Shows "Not Featured" badge in gray
- Does not appear in featured sections
- Normal sorting in startup list

## Testing Checklist

- [x] Click featured toggle on a non-featured startup
- [x] Verify startup shows as featured with crown icon
- [x] Verify yellow "Featured" badge appears
- [x] Reload page - featured status persists
- [x] Click toggle again to unfeature
- [x] Verify startup shows as not featured
- [x] Verify gray "Not Featured" badge appears
- [x] Reload page - unfeatured status persists
- [x] Check database - `featuredUntil` is set/cleared correctly
- [x] Verify featured count updates in page header

## Database Schema
The Startup model already has the required fields:
- `isFeatured` (Boolean, default false)
- `featuredUntil` (DateTime?, nullable)
- `updatedAt` (DateTime)

## Status
✅ **FIXED** - Featured toggle now works correctly in startup directory.
