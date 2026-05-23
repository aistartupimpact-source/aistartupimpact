# Quick Start: Tool FAQ Migration

## 🚀 5-Minute Setup

### Step 1: Open Neon Console (1 min)
1. Go to: https://console.neon.tech
2. Login to your account
3. Select project: `aistartupimpact`
4. Click "SQL Editor" in sidebar

### Step 2: Run Migration (2 min)
1. Open file: `migrate-tool-faqs-to-database.sql` (in your project root)
2. Copy ALL content (Cmd+A, Cmd+C)
3. Paste into Neon SQL Editor
4. Click "Run" button
5. Wait for completion (~30 seconds)

### Step 3: Verify Results (1 min)
Look at the bottom of the SQL results. You should see:

```
tools_with_faqs: 50
total_faqs: 250
avg_faqs_per_tool: 5.00
```

✅ If you see numbers like this, migration was successful!

### Step 4: Test (1 min)
1. Go to admin panel: `http://localhost:3001/tools-dir`
2. Click "Add Tool" button
3. **Expected:** Opens full-page form (not modal!)
4. Scroll to "FAQs" section
5. Click "Edit" on any existing tool
6. **Expected:** See 3-5 FAQs loaded!

---

## ✅ Done!

Your AI tools now have:
- ✅ Editable FAQs (admin + founder portal)
- ✅ Full-page forms (matching startup forms)
- ✅ All fields standardized
- ✅ Screenshot management
- ✅ Complete tool information

---

## 🎯 What Changed

### Admin Panel:
- **Before:** Modal overlay with limited fields
- **After:** Full-page forms with all fields + FAQs

### Founder Portal:
- **Before:** No FAQ management
- **After:** FAQ section added to all forms

### Both Portals Now Have:
- Name, tagline, description
- Logo & screenshots
- Website, affiliate, pricing URLs
- Pricing model & starting price
- Has API / Has Mobile App
- Launch year, founders, headquarters
- **FAQs (NEW!)**

---

## 🆘 Need Help?

**FAQs still showing 0?**
- Hard refresh browser (Cmd+Shift+R)
- Check if SQL ran successfully
- Check browser console for errors

**SQL failed?**
- Make sure you copied the entire file
- Check if you're connected to the right database
- Try running in smaller chunks

**Forms not showing?**
- Clear browser cache
- Restart dev server
- Check for TypeScript errors

**Still stuck?**
- Check `TOOL_FAQ_IMPLEMENTATION_COMPLETE.md` for detailed documentation
- Check `FAQ_MIGRATION_READY.md` for startup FAQ reference
