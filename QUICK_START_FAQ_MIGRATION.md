# Quick Start: FAQ Migration

## 🚀 5-Minute Setup

### Step 1: Open Neon Console (1 min)
1. Go to: https://console.neon.tech
2. Login to your account
3. Select project: `aistartupimpact`
4. Click "SQL Editor" in sidebar

### Step 2: Run Migration (2 min)
1. Open file: `migrate-faqs-to-database.sql` (in your project root)
2. Copy ALL content (Cmd+A, Cmd+C)
3. Paste into Neon SQL Editor
4. Click "Run" button
5. Wait for completion (~30 seconds)

### Step 3: Verify Results (1 min)
Look at the bottom of the SQL results. You should see:

```
startups_with_faqs: 50
total_faqs: 200
avg_faqs_per_startup: 4.00
```

✅ If you see numbers like this, migration was successful!

### Step 4: Test (1 min)
1. Go to admin panel: `http://localhost:3001/startups-dir`
2. Click "Edit" on any startup
3. Scroll to "FAQs" section
4. You should see 3-5 FAQs loaded!

---

## ✅ Done!

Your startups now have editable FAQs that can be managed through:
- Admin panel
- Founder portal
- Displayed on public pages

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

**Still stuck?**
- Check `FAQ_MIGRATION_READY.md` for detailed troubleshooting
- Check `FAQ_MIGRATION_COMPLETE.md` for full documentation
