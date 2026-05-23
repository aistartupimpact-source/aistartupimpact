# SEO Issues Investigation Report
**Date:** May 21, 2026  
**Investigation:** Startup & Tool SEO Schema Implementation

## Executive Summary

✅ **Issue 1 (Build-breaking typo):** **RESOLVED**  
❌ **Issue 2 (TypeScript compile error):** **NOT RESOLVED**  
❌ **Issue 3 (Silent SEO problem):** **NOT RESOLVED**

---

## Issue 1: Build-Breaking Typo in `getCityContext`

### Status: ✅ **RESOLVED**

### Original Problem:
In `generateStartupFAQs`, the function was called as `getCity Context(...)` with a space, causing a JavaScript syntax error.

### Current State:
**File:** `/apps/web/lib/seo-utils.ts` (Line 136)

```typescript
const cityContext = getCityContext(startup.headquartersCity);
```

✅ The function is correctly called as `getCityContext()` without any space.  
✅ The function is properly defined at line 77.  
✅ No syntax errors present.

---

## Issue 2: TypeScript Compile Error - Missing `slug` in Interface

### Status: ❌ **NOT RESOLVED**

### Problem:
The `StartupSchema` component uses `startup.slug` to build the `pageUrl`, but the `slug` field is **not declared** in the `StartupSchemaProps` interface.

### Current State:
**File:** `/apps/web/components/seo/StartupSchema.tsx`

**Interface (Lines 8-24):**
```typescript
interface StartupSchemaProps {
  startup: {
    name: string;
    slug: string;        // ✅ slug IS present
    description: string;
    logoUrl?: string;
    websiteUrl?: string;
    foundedYear?: number;
    headquartersCity?: string;
    founders?: string[];
    employeeCount?: number;
    linkedinUrl?: string;
    twitterUrl?: string;
    stage?: string;
    tagline?: string;
  };
}
```

**Wait - slug IS present!** Let me re-check...

Actually, **Issue 2 appears to be RESOLVED**. The `slug: string` field is present on line 11 of the interface.

### Updated Status: ✅ **RESOLVED**

---

## Issue 3: Silent SEO Problem - Dynamic Dates

### Status: ❌ **NOT RESOLVED - CRITICAL**

### Problem:
Both `datePublished` and `dateModified` in the WebPage schema are set to `new Date().toISOString()`, which regenerates on **every single render**. This is a **known spam signal** in Google's quality systems.

### Current State:
**File:** `/apps/web/components/seo/StartupSchema.tsx` (Lines 44-45)

```typescript
"datePublished": new Date().toISOString(),  // ❌ REGENERATES EVERY RENDER
"dateModified": new Date().toISOString(),   // ❌ REGENERATES EVERY RENDER
```

### Required Fix:
Replace with actual database timestamps:
```typescript
"datePublished": startup.createdAt,
"dateModified": startup.updatedAt,
```

### Blocker:
The `createdAt` and `updatedAt` fields are **NOT being fetched** from the database.

**File:** `/apps/web/app/(public)/startups/[slug]/page.tsx` (Lines 28-42)

```typescript
rows = await sql`
  SELECT id, name, slug, tagline,
         LEFT(description, 2500) AS description,
         "logoUrl", "websiteUrl", "linkedinUrl", stage,
         "headquartersCity", "foundedYear", "employeeCount",
         "isFeatured", "impactScore", founders, "foundersData",
         "isVerified", "verifiedAt", "claimedBy", category, "businessType"
  FROM "Startup"
  WHERE slug = ${slug} AND "deletedAt" IS NULL
  LIMIT 1
`;
```

❌ **Missing:** `"createdAt"` and `"updatedAt"` fields

---

## Issue 3b: Same Problem in Tool Schema

### Status: ❌ **NOT RESOLVED - CRITICAL**

The **exact same issue** exists in the Tool schema.

**File:** `/apps/web/components/seo/ToolSchema.tsx`

The WebPage schema is missing `datePublished` and `dateModified` entirely, but when added, they would need the same fix.

**File:** `/apps/web/lib/db.ts` - `getAiToolBySlugDirect` function (Line 69-71)

```typescript
const rows = await sql`
  SELECT 
    t.*,  // ✅ This selects ALL columns including createdAt and updatedAt
    c.name AS "categoryName",
    s.id AS "startupId", s.name AS "startupName", s."totalFundingInr"
  FROM "AiTool" t
  ...
`;
```

✅ For tools, `t.*` means `createdAt` and `updatedAt` **are already being fetched**.

---

## Required Fixes

### Fix 1: Update Startup Query
**File:** `/apps/web/app/(public)/startups/[slug]/page.tsx`

Add `"createdAt"` and `"updatedAt"` to the SELECT statement:

```typescript
rows = await sql`
  SELECT id, name, slug, tagline,
         LEFT(description, 2500) AS description,
         "logoUrl", "websiteUrl", "linkedinUrl", stage,
         "headquartersCity", "foundedYear", "employeeCount",
         "isFeatured", "impactScore", founders, "foundersData",
         "isVerified", "verifiedAt", "claimedBy", category, "businessType",
         "createdAt", "updatedAt"  // ← ADD THESE
  FROM "Startup"
  WHERE slug = ${slug} AND "deletedAt" IS NULL
  LIMIT 1
`;
```

### Fix 2: Update StartupSchema Interface
**File:** `/apps/web/components/seo/StartupSchema.tsx`

Add `createdAt` and `updatedAt` to the interface:

```typescript
interface StartupSchemaProps {
  startup: {
    name: string;
    slug: string;
    description: string;
    logoUrl?: string;
    websiteUrl?: string;
    foundedYear?: number;
    headquartersCity?: string;
    founders?: string[];
    employeeCount?: number;
    linkedinUrl?: string;
    twitterUrl?: string;
    stage?: string;
    tagline?: string;
    createdAt: string;    // ← ADD THIS
    updatedAt: string;    // ← ADD THIS
  };
}
```

### Fix 3: Update StartupSchema Component
**File:** `/apps/web/components/seo/StartupSchema.tsx`

Replace the dynamic dates:

```typescript
{
  "@type": "WebPage",
  "@id": `${pageUrl}#webpage`,
  "url": pageUrl,
  "name": `${startup.name} - ${startup.tagline || startup.description?.slice(0, 60) || 'AI Startup'}`,
  "isPartOf": {
    "@id": "https://aistartupimpact.com/#website"
  },
  "about": {
    "@id": orgId
  },
  "primaryImageOfPage": startup.logoUrl ? {
    "@id": `${pageUrl}#primaryimage`
  } : undefined,
  "datePublished": startup.createdAt,  // ← CHANGE FROM new Date().toISOString()
  "dateModified": startup.updatedAt,   // ← CHANGE FROM new Date().toISOString()
  "breadcrumb": {
    "@id": `${pageUrl}#breadcrumb`
  },
  "inLanguage": "en-IN"
}
```

### Fix 4: Update ToolSchema Interface
**File:** `/apps/web/components/seo/ToolSchema.tsx`

Add `createdAt` and `updatedAt` to the interface:

```typescript
interface ToolSchemaProps {
  tool: {
    name: string;
    slug: string;
    tagline: string;
    description: string;
    websiteUrl: string;
    logoUrl?: string;
    pricingModel: string;
    startingPrice?: number;
    avgRating?: number | null;
    reviewCount?: number;
    category?: string;
    categoryName?: string;
    hasApi?: boolean;
    hasMobileApp?: boolean;
    createdAt: string;    // ← ADD THIS
    updatedAt: string;    // ← ADD THIS
  };
}
```

### Fix 5: Update ToolSchema Component
**File:** `/apps/web/components/seo/ToolSchema.tsx`

Add the date fields to the WebPage schema:

```typescript
{
  "@type": "WebPage",
  "@id": `${pageUrl}#webpage`,
  "url": pageUrl,
  "name": `${tool.name} - ${tool.tagline}`,
  "isPartOf": {
    "@id": "https://aistartupimpact.com/#website"
  },
  "about": {
    "@id": softwareId
  },
  "primaryImageOfPage": tool.logoUrl ? {
    "@id": `${pageUrl}#primaryimage`
  } : undefined,
  "datePublished": tool.createdAt,  // ← ADD THIS
  "dateModified": tool.updatedAt,   // ← ADD THIS
  "breadcrumb": {
    "@id": `${pageUrl}#breadcrumb`
  },
  "inLanguage": "en-IN"
}
```

---

## Impact Assessment

### Issue 3 Severity: **CRITICAL**

**Why this matters:**
1. **Google Spam Signal:** Constantly changing `datePublished` is a known spam indicator
2. **Content Freshness:** Google uses `datePublished` to assess content age and trustworthiness
3. **Search Rankings:** This could be actively harming your SEO performance
4. **Indexing Issues:** Google may deprioritize or flag pages with suspicious date patterns

**Current Impact:**
- Every page render generates a new `datePublished` timestamp
- Google sees the same content with different publication dates
- This pattern matches known spam/manipulation tactics
- Could result in ranking penalties or reduced trust scores

---

## Verification Steps

After implementing fixes:

1. **TypeScript Check:**
   ```bash
   cd apps/web
   npx tsc --noEmit
   ```
   Should show zero errors.

2. **Build Test:**
   ```bash
   npm run build
   ```
   Should complete without errors.

3. **Runtime Verification:**
   - Visit a startup page (e.g., `/startups/example-slug`)
   - View page source
   - Search for `"datePublished"`
   - Verify it shows a static timestamp, not current time

4. **Schema Validation:**
   - Use Google's Rich Results Test: https://search.google.com/test/rich-results
   - Paste your startup/tool page URL
   - Verify no schema errors

---

## Conclusion

**Immediate Action Required:**
- ✅ Issue 1: Already resolved
- ✅ Issue 2: Already resolved (slug is present in interface)
- ❌ **Issue 3: CRITICAL - Must be fixed before deployment**

The dynamic date generation is actively harmful to SEO and must be corrected by:
1. Fetching `createdAt` and `updatedAt` from the database
2. Updating TypeScript interfaces
3. Using real timestamps in schema markup

**Estimated Fix Time:** 15-20 minutes  
**Risk Level:** Low (straightforward database query and prop updates)  
**SEO Impact:** High (removes spam signal, improves trust signals)
