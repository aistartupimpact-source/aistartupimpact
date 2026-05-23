# Build Fix: FAQ Manager Component

## Issue
Build error in admin app:
```
Module not found: Can't resolve '@/components/shared/FAQManager'
```

## Root Cause
In a monorepo setup, each app (web, admin, api) has its own `components` folder. The admin app was trying to import from the web app's components, which doesn't work.

## Solution
Created a copy of the FAQManager component in the admin app:
- `apps/admin/components/shared/FAQManager.tsx` (NEW)
- `apps/web/components/shared/FAQManager.tsx` (existing)

Both components are identical and work independently in their respective apps.

## Files Changed
1. Created: `apps/admin/components/shared/FAQManager.tsx`
2. Fixed import in: `apps/admin/app/(dashboard)/startups-dir/page.tsx`

## Status
✅ Build error fixed  
✅ Admin app should now compile successfully  
✅ Both apps have their own FAQManager component

## Next Steps
1. Restart dev server if needed
2. Test admin form with FAQ management
3. Proceed with SQL migration as documented
