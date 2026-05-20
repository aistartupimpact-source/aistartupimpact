# SEO Engine - Quick Testing Guide

## 🚀 Quick Start Testing

### 1. Start Development Server
```bash
cd /Users/lahorivenkatesh/Desktop/aistartupimpact
npm run dev
```

### 2. Test Startup Pages
Visit these URLs in your browser:
- http://localhost:3000/startups/sarvam-ai
- http://localhost:3000/startups/krutrim
- http://localhost:3000/startups/ola-electric

**What to Check:**
- ✅ Page loads without errors
- ✅ FAQ section appears at bottom
- ✅ FAQs are unique (not identical across pages)
- ✅ No console errors

### 3. Test Tool Pages
Visit these URLs:
- http://localhost:3000/tools/chatgpt
- http://localhost:3000/tools/midjourney
- http://localhost:3000/tools/claude

**What to Check:**
- ✅ Page loads without errors
- ✅ FAQ section appears after reviews
- ✅ FAQs are unique per tool
- ✅ No console errors

### 4. Test OG Images
Visit these URLs:
- http://localhost:3000/startups/sarvam-ai/opengraph-image
- http://localhost:3000/tools/chatgpt/opengraph-image

**What to Check:**
- ✅ Image generates (1200x630)
- ✅ Shows logo, name, tagline
- ✅ Shows metadata badges
- ✅ Unique per startup/tool

### 5. Test Sitemaps
Visit these URLs:
- http://localhost:3000/sitemap.xml
- http://localhost:3000/startups/sitemap.xml
- http://localhost:3000/tools/sitemap.xml

**What to Check:**
- ✅ XML format is valid
- ✅ Contains URLs
- ✅ Has lastModified dates

### 6. Test robots.txt
Visit:
- http://localhost:3000/robots.txt

**What to Check:**
- ✅ Contains 3 sitemap directives
- ✅ Allows public routes
- ✅ Disallows admin/api

---

## 🔍 Validate JSON-LD Schema

### Method 1: View Page Source
1. Visit: http://localhost:3000/startups/sarvam-ai
2. Right-click → View Page Source
3. Search for: `application/ld+json`
4. You should see 2 script tags:
   - One with `@graph` (Organization + WebPage + BreadcrumbList)
   - One with `@type: FAQPage`

### Method 2: Browser Console
```javascript
// Run in browser console
const scripts = document.querySelectorAll('script[type="application/ld+json"]');
scripts.forEach((s, i) => {
  console.log(`Schema ${i+1}:`, JSON.parse(s.textContent));
});
```

### Method 3: Online Validator (After Deployment)
1. Go to: https://validator.schema.org/
2. Enter your page URL
3. Click "Run Test"
4. Should show: ✅ Valid

---

## 🧪 Test FAQ Generation

### Check FAQ Uniqueness
1. Visit 3 different startup pages
2. Scroll to FAQ section
3. Read the "IndiaAI eligibility" answer
4. Verify each answer contains:
   - Startup name
   - Founded year
   - City name
   - Stage
   - Tagline

**Example for Sarvam AI:**
> "Sarvam AI, founded in 2023 and based in Bengaluru, is an AI startup in the seed stage working on building India's own AI models..."

**Example for Krutrim:**
> "Krutrim, founded in 2023 and based in Bengaluru, is an AI startup in the series a stage working on India's first AI unicorn..."

They should be **different**, not identical!

---

## 📊 Test Dynamic OG Images

### Visual Test
1. Visit: http://localhost:3000/startups/sarvam-ai/opengraph-image
2. Check:
   - ✅ Purple gradient background
   - ✅ Sarvam AI logo (if available)
   - ✅ "Sarvam AI" text
   - ✅ Tagline
   - ✅ City badge (Bengaluru)
   - ✅ Stage badge (SEED)
   - ✅ Founded year (2023)
   - ✅ "aistartupimpact.com" footer

3. Visit: http://localhost:3000/startups/krutrim/opengraph-image
4. Verify it's **different** from Sarvam AI image

### Meta Tag Test
1. Visit: http://localhost:3000/startups/sarvam-ai
2. View page source
3. Search for: `og:image`
4. Should see: `content="/startups/sarvam-ai/opengraph-image"`

---

## ✅ Pre-Deployment Checklist

Run these commands:

```bash
# 1. Check TypeScript
cd apps/web
npx tsc --noEmit
# Should output: no errors

# 2. Check for console errors
npm run dev
# Visit pages, check browser console

# 3. Test build (optional - may take time)
npm run build
```

---

## 🚀 Post-Deployment Testing

### 1. Test Live Schema
```bash
# Replace with your actual URLs
curl -s https://aistartupimpact.com/startups/sarvam-ai | grep -o 'application/ld+json' | wc -l
# Should output: 2 (two schema tags)
```

### 2. Google Rich Results Test
1. Go to: https://search.google.com/test/rich-results
2. Enter: `https://aistartupimpact.com/startups/sarvam-ai`
3. Click "Test URL"
4. Wait for results
5. Should show:
   - ✅ Organization detected
   - ✅ WebPage detected
   - ✅ BreadcrumbList detected
   - ✅ FAQPage detected
   - ✅ 0 errors

### 3. Meta Tags Debugger
1. Go to: https://metatags.io/
2. Enter: `https://aistartupimpact.com/startups/sarvam-ai`
3. Check preview shows:
   - ✅ Unique OG image
   - ✅ Correct title
   - ✅ Correct description

### 4. Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Enter: `https://aistartupimpact.com/startups/sarvam-ai`
3. Check:
   - ✅ Card preview shows
   - ✅ Image displays
   - ✅ Title and description correct

### 5. LinkedIn Post Inspector
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter: `https://aistartupimpact.com/startups/sarvam-ai`
3. Click "Inspect"
4. Check:
   - ✅ Preview shows
   - ✅ Unique image displays

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot find module '@/components/seo'"
**Fix**: Check import path, should be `@/components/seo`

### Issue: "generateStartupFAQs is not a function"
**Fix**: Check import: `import { generateStartupFAQs } from '@/lib/seo-utils'`

### Issue: OG image shows "Startup Not Found"
**Fix**: Check database query, verify slug exists

### Issue: FAQ section not showing
**Fix**: Check if `faqs` array has data, verify component import

### Issue: Schema validation errors
**Fix**: Check JSON-LD syntax in browser console

---

## 📝 Quick Validation Commands

```bash
# Check if sitemaps are accessible
curl -I http://localhost:3000/sitemap.xml
curl -I http://localhost:3000/startups/sitemap.xml
curl -I http://localhost:3000/tools/sitemap.xml

# Check robots.txt
curl http://localhost:3000/robots.txt

# Check OG image
curl -I http://localhost:3000/startups/sarvam-ai/opengraph-image

# Count schema tags on a page
curl -s http://localhost:3000/startups/sarvam-ai | grep -c 'application/ld+json'
# Should output: 2
```

---

## ✅ Success Criteria

Your implementation is successful if:

1. ✅ All pages load without errors
2. ✅ FAQ sections display on all startup/tool pages
3. ✅ FAQs are unique (contain specific data per startup/tool)
4. ✅ OG images generate dynamically (different per page)
5. ✅ Sitemaps are accessible
6. ✅ robots.txt contains sitemap directives
7. ✅ No TypeScript errors
8. ✅ No console errors
9. ✅ Schema validates with 0 errors
10. ✅ Meta tags show correct OG images

---

## 🎯 Ready for Production?

If all tests pass:
1. ✅ Commit changes
2. ✅ Push to production
3. ✅ Run post-deployment tests
4. ✅ Submit sitemaps to Google Search Console
5. ✅ Monitor indexing status

**You're done! 🚀**
