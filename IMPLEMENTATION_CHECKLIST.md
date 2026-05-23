# SEO Engine - Implementation Checklist
## Step-by-Step Execution Guide

---

## 📋 Pre-Implementation (30 minutes)

### Environment Setup:
- [ ] Ensure development environment is running
- [ ] Verify database connection
- [ ] Check Node.js version (18+)
- [ ] Verify Next.js version (14+)
- [ ] Create feature branch: `git checkout -b feature/seo-engine`

### Database Audit:
```bash
# Run these queries and save results
psql $DATABASE_URL -c "SELECT slug, \"avgRating\", \"reviewCount\" FROM \"AiTool\" WHERE \"reviewCount\" = 0 LIMIT 5;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Startup\" WHERE \"deletedAt\" IS NULL;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"AiTool\" WHERE status = 'APPROVED';"
```

---

## 🔨 Phase 1: Foundation (Day 1)

### Task 1.1: Create SEO Utilities (2 hours)
- [ ] Create directory: `mkdir -p apps/web/lib`
- [ ] Create file: `touch apps/web/lib/seo-utils.ts`
- [ ] Implement helper functions
- [ ] Add TypeScript interfaces
- [ ] Test compilation: `npm run build`

### Task 1.2: Create Schema Components (3 hours)
- [ ] Create directory: `mkdir -p apps/web/components/seo`
- [ ] Create `StartupSchema.tsx`
- [ ] Create `ToolSchema.tsx`
- [ ] Create `FAQSchema.tsx`
- [ ] Create `index.ts` barrel export
- [ ] Test compilation

### Task 1.3: Validate Schemas (1 hour)
- [ ] Copy JSON-LD from components
- [ ] Validate at https://validator.schema.org/
- [ ] Fix any validation errors
- [ ] Document validation results

**End of Day 1 Checkpoint:**
- [ ] All schema components created
- [ ] All schemas validate successfully
- [ ] No TypeScript errors
- [ ] Commit: `git commit -m "Add SEO schema components"`

---

## 🎨 Phase 2: FAQ Implementation (Day 2)

### Task 2.1: Create FAQ UI Component (2 hours)
- [ ] Create file: `touch apps/web/components/FAQSection.tsx`
- [ ] Implement accordion UI
- [ ] Add animations
- [ ] Test in Storybook (if available)
- [ ] Test accessibility

### Task 2.2: Implement FAQ Generation (4 hours)
- [ ] Add `generateStartupFAQs()` to `seo-utils.ts`
- [ ] Add `generateToolFAQs()` to `seo-utils.ts`
- [ ] Add `getCityContext()` helper
- [ ] Test with sample data
- [ ] Verify uniqueness

**End of Day 2 Checkpoint:**
- [ ] FAQ component renders correctly
- [ ] FAQ generation produces unique answers
- [ ] No console errors
- [ ] Commit: `git commit -m "Add FAQ components and generation logic"`

---

## 🖼️ Phase 3: Dynamic OG Images (Day 3)

### Task 3.1: Create Startup OG Image (3 hours)
- [ ] Create file: `touch apps/web/app/(public)/startups/[slug]/opengraph-image.tsx`
- [ ] Implement ImageResponse
- [ ] Test locally: `npm run dev`
- [ ] Visit: `http://localhost:3000/startups/sarvam-ai/opengraph-image`
- [ ] Verify 1200x630 dimensions

### Task 3.2: Create Tool OG Image (2 hours)
- [ ] Create file: `touch apps/web/app/(public)/tools/[slug]/opengraph-image.tsx`
- [ ] Implement ImageResponse
- [ ] Test locally
- [ ] Verify dimensions

### Task 3.3: Update Metadata (2 hours)
- [ ] Update `generateMetadata()` in startup page
- [ ] Update `generateMetadata()` in tool page
- [ ] Test with Meta Debugger
- [ ] Verify OG images load

**End of Day 3 Checkpoint:**
- [ ] OG images generate successfully
- [ ] Meta tags include dynamic OG image URLs
- [ ] Images display correctly in debuggers
- [ ] Commit: `git commit -m "Add dynamic OG image generation"`

---

## 🗺️ Phase 4: Sitemaps & robots.txt (Day 4)

### Task 4.1: Create Sitemaps (2 hours)
- [ ] Create `apps/web/app/(public)/startups/sitemap.ts`
- [ ] Create `apps/web/app/(public)/tools/sitemap.ts`
- [ ] Update `apps/web/app/sitemap.ts`
- [ ] Test locally: visit `/sitemap.xml`

### Task 4.2: Create robots.txt (30 minutes)
- [ ] Create `apps/web/public/robots.txt`
- [ ] Add sitemap directives
- [ ] Add disallow rules
- [ ] Test locally: visit `/robots.txt`

### Task 4.3: Verify Sitemaps (1 hour)
- [ ] Check all URLs are valid
- [ ] Verify lastModified dates
- [ ] Check priorities
- [ ] Validate XML format

**End of Day 4 Checkpoint:**
- [ ] All sitemaps accessible
- [ ] robots.txt configured
- [ ] All URLs valid
- [ ] Commit: `git commit -m "Add sitemaps and robots.txt"`

---

## 🔗 Phase 5: Integration & Testing (Day 5)

### Task 5.1: Integrate into Startup Page (2 hours)
- [ ] Update `apps/web/app/(public)/startups/[slug]/page.tsx`
- [ ] Import schema components
- [ ] Add schemas to page
- [ ] Add FAQ section
- [ ] Test locally with 5 different startups

### Task 5.2: Integrate into Tool Page (2 hours)
- [ ] Update `apps/web/app/(public)/tools/[slug]/page.tsx`
- [ ] Import schema components
- [ ] Add schemas to page
- [ ] Add FAQ section
- [ ] Test locally with 5 different tools

### Task 5.3: Comprehensive Testing (4 hours)
- [ ] Test 10 startup pages
- [ ] Test 10 tool pages
- [ ] Validate all schemas
- [ ] Test OG images
- [ ] Test sitemaps
- [ ] Run Lighthouse
- [ ] Check mobile responsiveness
- [ ] Test dark mode

**End of Day 5 Checkpoint:**
- [ ] All pages render correctly
- [ ] All schemas validate
- [ ] All OG images generate
- [ ] No console errors
- [ ] Lighthouse score > 90
- [ ] Commit: `git commit -m "Integrate SEO components into pages"`

---

## 🚀 Deployment (Day 6)

### Pre-Deployment Checklist:
- [ ] All tests passing
- [ ] All schemas validated
- [ ] OG images working
- [ ] Sitemaps accessible
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Code reviewed

### Deployment Steps:
1. [ ] Push to staging: `git push origin feature/seo-engine`
2. [ ] Create PR to main
3. [ ] Review PR
4. [ ] Merge to main
5. [ ] Deploy to production
6. [ ] Verify production deployment

### Post-Deployment:
1. [ ] Visit 5 startup pages on production
2. [ ] Visit 5 tool pages on production
3. [ ] Validate schemas on production URLs
4. [ ] Test OG images on production
5. [ ] Submit sitemaps to Search Console
6. [ ] Request indexing for sample pages

---

## 📊 Validation Checklist

### Schema Validation:
- [ ] Google Rich Results Test: 0 errors
- [ ] Schema.org Validator: Valid
- [ ] No warnings in Search Console

### Meta Tags:
- [ ] Meta Tags Debugger: All tags present
- [ ] Twitter Card Validator: Card shows
- [ ] LinkedIn Post Inspector: Preview shows

### Performance:
- [ ] PageSpeed Insights: Score > 90
- [ ] Lighthouse SEO: Score 100
- [ ] Core Web Vitals: All green

### Functionality:
- [ ] All pages load correctly
- [ ] FAQ sections work
- [ ] OG images generate
- [ ] Sitemaps accessible
- [ ] robots.txt accessible

---

## 🐛 Troubleshooting

### Issue: Schema validation errors
**Solution**: Check JSON-LD syntax, verify all required fields present

### Issue: OG images not generating
**Solution**: Check edge runtime compatibility, verify database queries

### Issue: Sitemaps not accessible
**Solution**: Check file location, verify Next.js routing

### Issue: TypeScript errors
**Solution**: Check imports, verify types, run `npm run type-check`

---

## 📝 Documentation Tasks

- [ ] Update README with SEO section
- [ ] Document schema structure
- [ ] Document FAQ generation logic
- [ ] Document OG image generation
- [ ] Create troubleshooting guide

---

## ✅ Final Sign-Off

Before marking complete:
- [ ] All code committed
- [ ] All tests passing
- [ ] Production deployment successful
- [ ] Sitemaps submitted to Search Console
- [ ] Documentation updated
- [ ] Team notified

**Project Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Complete

**Completion Date**: _______________

**Notes**: _______________________________________________
