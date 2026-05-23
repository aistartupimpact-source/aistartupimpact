# FAQ Migration - Hardcoded to Database ✅
**Date:** May 21, 2026  
**Status:** ✅ **READY TO RUN**

---

## 🎯 What This Does

Converts the **hardcoded/generated FAQs** on public startup pages into **editable database FAQs** that can be managed through admin/founder portals.

### Before:
- ❌ FAQs were dynamically generated from startup data
- ❌ Couldn't edit or customize FAQs
- ❌ Same generic questions for all startups
- ❌ No way to add custom FAQs

### After:
- ✅ FAQs stored in database
- ✅ Can edit through admin panel
- ✅ Can edit through founder portal
- ✅ Can add custom FAQs
- ✅ Can delete unwanted FAQs
- ✅ Can reorder FAQs
- ✅ Fallback to generated FAQs if none exist

---

## 📋 How It Works

### 1. Public Page Logic (Updated)
The startup detail page now:
1. **First** tries to load FAQs from database
2. **If found** → displays database FAQs
3. **If not found** → generates FAQs dynamically (old behavior)
4. **On error** → falls back to generated FAQs

### 2. Migration Script
Creates 3-5 basic FAQs for each startup:
- What does [Startup] do?
- Where is [Startup] located?
- When was [Startup] founded?
- How many employees does [Startup] have?
- Is [Startup] hiring?

These are **starting points** that can be edited/deleted/customized.

---

## 🚀 How to Run Migration

### Step 1: Run the Migration SQL

1. **Go to Neon Console**: https://console.neon.tech
2. **Select your project**
3. **Click "SQL Editor"**
4. **Copy and paste** the content of `migrate-faqs-to-database.sql`
5. **Click "Run"**

### Step 2: Verify Migration

After running, you should see:
- Summary of FAQs created
- Number of startups with FAQs
- Average FAQs per startup

Example output:
```
startups_with_faqs: 50
total_faqs: 200
avg_faqs_per_startup: 4.00
```

### Step 3: Test in Admin Panel

1. Go to Admin → Startups Directory
2. Click edit on any startup
3. Scroll to FAQs section
4. You should see 3-5 FAQs loaded!
5. Edit them, add more, or delete unwanted ones

### Step 4: Test on Public Page

1. Go to any startup page (e.g., `/startups/sarvam-ai`)
2. Scroll to FAQ section
3. You should see the database FAQs
4. Edit them in admin, refresh page to see changes

---

## 📁 Files Modified

1. **`apps/web/app/(public)/startups/[slug]/page.tsx`**
   - Added database FAQ loading
   - Falls back to generated FAQs if none exist
   - Error handling

2. **`migrate-faqs-to-database.sql`** (NEW)
   - Migration script to populate FAQs
   - Creates 3-5 FAQs per startup
   - Includes verification queries

---

## 🎨 FAQ Examples Created

### For "Sarvam AI":
1. **Q:** What does Sarvam AI do?
   **A:** [Uses actual description from database]

2. **Q:** Where is Sarvam AI located?
   **A:** Sarvam AI is headquartered in Bengaluru, where it was founded in 2023.

3. **Q:** When was Sarvam AI founded?
   **A:** Sarvam AI was founded in 2023. Since then, it has grown to 50+ employees.

4. **Q:** How many employees does Sarvam AI have?
   **A:** Sarvam AI currently has 50+ employees.

5. **Q:** Is Sarvam AI hiring?
   **A:** For current job openings at Sarvam AI, visit their careers page at https://sarvam.ai or check their LinkedIn profile.

---

## ✅ Benefits

### For Admins:
- ✅ Can edit FAQs for any startup
- ✅ Can add custom FAQs
- ✅ Can delete irrelevant FAQs
- ✅ Can reorder FAQs
- ✅ Full control over content

### For Founders:
- ✅ Can edit their own startup FAQs
- ✅ Can add custom questions
- ✅ Can highlight unique features
- ✅ Better control over messaging

### For Users:
- ✅ More accurate FAQs
- ✅ Custom content per startup
- ✅ Better information quality
- ✅ SEO benefits (unique content)

---

## 🔄 Workflow

### Initial Setup (One Time):
1. Run migration SQL → Creates initial FAQs for all startups
2. FAQs are now in database

### Ongoing Management:
1. **New Startups:**
   - Create through admin/founder portal
   - Add FAQs during creation
   - Or add later through edit

2. **Existing Startups:**
   - Edit through admin panel
   - Edit through founder portal
   - FAQs load automatically

3. **Public Display:**
   - Shows database FAQs if they exist
   - Falls back to generated FAQs if none
   - Always shows something

---

## 📊 Migration Stats

**What Gets Migrated:**
- All startups with descriptions → FAQ 1
- All startups with location → FAQ 2
- All startups with founded year → FAQ 3
- All startups with employee count → FAQ 4
- All startups with website → FAQ 5

**Expected Results:**
- ~50-100 startups with FAQs
- ~3-5 FAQs per startup
- ~200-500 total FAQs created

---

## 🎯 Testing Checklist

### Before Migration:
- [ ] Check public startup page → sees generated FAQs
- [ ] Check admin edit → sees 0 FAQs
- [ ] Check founder edit → sees 0 FAQs

### After Migration:
- [ ] Run migration SQL
- [ ] Check verification query results
- [ ] Check public startup page → sees database FAQs
- [ ] Check admin edit → sees 3-5 FAQs loaded
- [ ] Check founder edit → sees 3-5 FAQs loaded
- [ ] Edit an FAQ in admin → save → check public page
- [ ] Add new FAQ → save → check public page
- [ ] Delete FAQ → save → check public page

---

## 💡 Important Notes

1. **Migration is safe** - Uses `ON CONFLICT DO NOTHING` to avoid duplicates
2. **Can run multiple times** - Won't create duplicates
3. **Non-destructive** - Doesn't delete or modify existing data
4. **Reversible** - Can delete FAQs if needed
5. **Fallback exists** - If FAQs deleted, page shows generated ones

---

## 🐛 Troubleshooting

### Issue: No FAQs showing after migration
**Solution:** Check if StartupFAQ table exists. Run the table creation SQL first.

### Issue: FAQs not loading in admin
**Solution:** Check browser console for errors. Verify getStartupFAQsAction is working.

### Issue: Public page still shows generated FAQs
**Solution:** Clear cache, refresh page. Check if database FAQs exist for that startup.

### Issue: Can't edit FAQs
**Solution:** Verify you ran the SQL migration. Check if FAQs exist in database.

---

## 🎉 Summary

**What's Working:**
- ✅ Public pages load database FAQs
- ✅ Fallback to generated FAQs if none exist
- ✅ Admin can edit FAQs
- ✅ Founders can edit FAQs
- ✅ Migration script ready to run
- ✅ All existing startups can have FAQs

**What's Next:**
1. Run migration SQL in Neon Console
2. Verify FAQs were created
3. Test editing FAQs in admin
4. Test viewing FAQs on public pages
5. Customize FAQs as needed

---

**Status:** ✅ READY TO MIGRATE  
**Next Action:** Run `migrate-faqs-to-database.sql` in Neon Console  
**Time to Run:** ~30 seconds  
**Impact:** All startups will have editable FAQs
