# Quick Start: FAQ Implementation 🚀

## What Was Done

I've implemented FAQ management for startup forms in both Admin and Founder portals, plus added social media URL fields (LinkedIn, Twitter).

## What You Need to Do (3 Steps)

### 1️⃣ Run SQL Migration (5 minutes)

**In Neon Console:**
1. Go to https://console.neon.tech
2. Select your project
3. Click "SQL Editor"
4. Open the file `add-faq-tables.sql` from your project root
5. Copy all content and paste in SQL Editor
6. Click "Run"

This creates:
- `StartupFAQ` table
- `ToolFAQ` table  
- `linkedinUrl` and `twitterUrl` columns

### 2️⃣ Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 3️⃣ Test It

**Admin Portal:**
1. Go to Admin → Startups Directory
2. Click "Add Startup" or edit existing
3. Scroll down to see:
   - LinkedIn URL field
   - Twitter URL field
   - FAQs section (can add up to 10)
4. Add some FAQs and save
5. Edit again to verify FAQs loaded

**Founder Portal:**
1. Go to Founder → Submit Startup
2. Fill form and scroll down
3. Add FAQs
4. Submit and verify

## What's New

### Admin Form:
- ✅ LinkedIn URL field
- ✅ Twitter/X URL field
- ✅ FAQ Manager (add/edit/delete/reorder)
- ✅ Loads existing FAQs when editing

### Founder Form:
- ✅ FAQ Manager (add/edit/delete/reorder)
- ✅ LinkedIn and Twitter fields (already existed)

### FAQ Features:
- Add up to 10 FAQs per startup
- Character limits (question: 200, answer: 1000)
- Reorder with up/down buttons
- Edit/delete with confirmation
- Beautiful UI matching your design

## Files Changed

**Created:**
- `apps/web/app/api/startups/[id]/faqs/route.ts`
- `apps/web/app/api/startups/[id]/faqs/[faqId]/route.ts`
- `apps/web/app/api/tools/[id]/faqs/route.ts`
- `apps/web/app/api/tools/[id]/faqs/[faqId]/route.ts`
- `apps/web/components/shared/FAQManager.tsx`
- `add-faq-tables.sql`

**Modified:**
- `apps/admin/app/(dashboard)/startups-dir/page.tsx`
- `apps/admin/app/(dashboard)/startups-dir/actions.ts`
- `apps/web/components/founder/StartupForm.tsx`
- `apps/web/app/founder/startups/actions.ts`

## Next Steps (Optional)

After testing, you can optionally:
1. Create full-page admin forms (instead of modal)
2. Add FAQ management to AI Tools
3. Enhance founder input (multi-input instead of comma-separated)

## Need Help?

Check `FORM_STANDARDIZATION_MVP_COMPLETE.md` for detailed documentation.

---

**Status:** ✅ Ready for testing  
**Time to test:** 15-20 minutes  
**Implementation time:** 2 hours
