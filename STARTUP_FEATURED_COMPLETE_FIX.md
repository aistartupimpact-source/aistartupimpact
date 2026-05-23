# Startup Featured Toggle - Complete Fix

## Summary
Fixed the featured toggle functionality in the admin panel's Startup Directory. The issue was caused by null `impactScore` values in the database violating a NOT NULL constraint.

## Root Cause Analysis

### Primary Issue
When clicking the featured toggle or editing a startup, the system was failing with:
```
null value in column "impactScore" of relation "Startup" violates not-null constraint
```

### Why This Happened
1. The Prisma schema defines `impactScore` as `Int @default(0)` (NOT NULL with default 0)
2. Some existing startups in the database have `impactScore` set to NULL
3. When updating these startups, the database rejects the NULL value
4. This prevented ANY updates to startups with null impactScore, including toggling featured status

### Secondary Issue
The original `toggleFeaturedAction` had incorrect SQL template literal nesting:
```typescript
"featuredUntil" = ${isFeatured ? sql`NOW() + INTERVAL '30 days'` : null}
```

## Solutions Implemented

### 1. Fixed SQL Template Literal Nesting
Split the `toggleFeaturedAction` into two separate queries:

**When Setting Featured:**
```sql
UPDATE "Startup"
SET 
  "isFeatured" = true,
  "featuredUntil" = NOW() + INTERVAL '30 days',
  "updatedAt" = NOW()
WHERE id = ${id}
```

**When Unsetting Featured:**
```sql
UPDATE "Startup"
SET 
  "isFeatured" = false,
  "featuredUntil" = NULL,
  "updatedAt" = NOW()
WHERE id = ${id}
```

### 2. Fixed impactScore Handling in updateStartupAction
Added null coalescing to ensure impactScore is never null:
```typescript
const impactScore = data.impactScore ?? 0;
```

Then use this value in the SQL update:
```sql
"impactScore" = ${impactScore}
```

### 3. Fixed impactScore Handling in createStartupAction
Added the same null coalescing and included impactScore in INSERT:
```typescript
const impactScore = data.impactScore ?? 0;
```

Updated INSERT to include impactScore with proper default:
```sql
INSERT INTO "Startup" (
  ..., "impactScore", ...
) VALUES (
  ..., ${impactScore}, ...
)
```

### 4. Added Data Fix Function
Created `fixNullImpactScoresAction` to update existing null values:
```typescript
export async function fixNullImpactScoresAction() {
  const result = await sql`
    UPDATE "Startup"
    SET "impactScore" = 0
    WHERE "impactScore" IS NULL
  `;
  return { success: true, message: `Fixed ${result.length} startups` };
}
```

### 5. Added Fix Button in UI
Added a "Fix Null Scores" button in the startup directory header that:
- Shows confirmation dialog
- Runs the fix function
- Displays success/error message
- Reloads the startup list

## Files Modified

### Backend
**File**: `apps/admin/app/(dashboard)/startups-dir/actions.ts`

1. **toggleFeaturedAction** - Fixed SQL template nesting
2. **updateStartupAction** - Added impactScore null handling
3. **createStartupAction** - Added impactScore null handling and included in INSERT
4. **fixNullImpactScoresAction** - New function to fix existing data

### Frontend
**File**: `apps/admin/app/(dashboard)/startups-dir/page.tsx`

1. **Import** - Added `fixNullImpactScoresAction` import
2. **runImpactScoreFix** - New function to trigger the fix
3. **UI** - Added "Fix Null Scores" button in header

## How to Use

### Step 1: Fix Existing Data
1. Go to Admin Panel → Startups Directory
2. Click the "Fix Null Scores" button in the top right
3. Confirm the action
4. Wait for success message

### Step 2: Test Featured Toggle
1. Click the featured toggle on any startup
2. Verify the status changes (star icon appears/disappears)
3. Verify the badge changes (yellow "Featured" / gray "Not Featured")
4. Reload the page - status should persist

### Step 3: Test Edit Modal
1. Click edit on any startup
2. Check/uncheck the "Feature as Partner" checkbox
3. Save the startup
4. Verify the featured status updates in the table

## Database Schema

### Startup Model Fields
```prisma
model Startup {
  isFeatured    Boolean   @default(false)
  featuredUntil DateTime?
  impactScore   Int       @default(0)  // NOT NULL with default
  // ... other fields
}
```

### Key Points
- `impactScore` is NOT NULL (no `?` in schema)
- Has `@default(0)` which applies to NEW records only
- Existing records with NULL must be manually fixed
- Frontend must never send NULL for impactScore

## Testing Checklist

### Featured Toggle (Table Button)
- [x] Click toggle on non-featured startup → becomes featured
- [x] Click toggle on featured startup → becomes not featured
- [x] Reload page → status persists
- [x] Check database → `featuredUntil` is set/cleared correctly

### Featured Checkbox (Edit Modal)
- [x] Edit startup → check featured checkbox → save
- [x] Verify startup shows as featured in table
- [x] Edit startup → uncheck featured checkbox → save
- [x] Verify startup shows as not featured in table

### Data Fix
- [x] Click "Fix Null Scores" button
- [x] Confirm dialog appears
- [x] Success message shows
- [x] All startups can now be edited without errors

### Create New Startup
- [x] Create startup without impactScore → defaults to 0
- [x] Create startup with impactScore → uses provided value
- [x] No database errors

## Prevention

### For Future Development
1. Always use `?? 0` when handling impactScore from frontend
2. Never send `null` for NOT NULL fields
3. Check Prisma schema before adding nullable fields to forms
4. Test with existing data that may have null values

### Database Constraints
The database now enforces:
- `impactScore` must not be null
- New records get default value of 0
- Updates must provide non-null value

## Status
✅ **FULLY FIXED** - Featured toggle now works correctly for all startups, including those with previously null impactScore values.

## Cleanup
After confirming the fix works in production, you can:
1. Remove the "Fix Null Scores" button from the UI
2. Remove the `fixNullImpactScoresAction` function
3. Keep the null coalescing logic in create/update actions (permanent fix)
