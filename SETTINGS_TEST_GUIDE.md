# 🧪 Settings Page - Quick Test Guide

## How to Test Settings Page

### 1. Start the Admin App
```bash
cd apps/admin
npm run dev
```
Visit: http://localhost:3001

### 2. Login
- Click "Sign in with Google"
- Use an account that exists in your User table
- Must have role: SUPER_ADMIN, EDITOR_IN_CHIEF, or AD_MANAGER

### 3. Navigate to Settings
- Click "Settings" in the sidebar
- Or visit: http://localhost:3001/settings

---

## ✅ What to Test

### General Settings Tab
1. **Site Title**
   - Type a new title
   - Click "Save Changes"
   - Refresh page - should persist

2. **Tagline**
   - Update the tagline
   - Save and verify

3. **Contact Email**
   - Enter valid email
   - Try invalid email (should show HTML5 validation)

4. **Social Links**
   - Update Twitter URL
   - Update LinkedIn URL
   - Update Instagram URL
   - Update Facebook URL
   - Save and verify all persist

### SEO Defaults Tab
1. **Meta Title**
   - Update default meta title
   - Save and verify

2. **Meta Description**
   - Update description (multi-line)
   - Save and verify

3. **OG Image URL**
   - Enter image URL
   - Save and verify

4. **Auto-generate Sitemap**
   - Toggle ON/OFF
   - Save and verify state persists

### Brand & Design Tab
1. **Brand Color**
   - Click color picker
   - Choose a color
   - Verify text input updates
   - Type hex code manually
   - Verify color picker updates
   - Save and verify

2. **Dark Mode Default**
   - Toggle ON/OFF
   - Save and verify

### Notifications Tab
1. **All Toggles**
   - Toggle each notification setting
   - Save
   - Refresh page
   - Verify all states persist

### Security Tab
1. **Require 2FA**
   - Toggle ON/OFF
   - Save and verify

2. **Session Timeout**
   - Change number (e.g., 30, 60, 120)
   - Save and verify

3. **API Key**
   - Verify it's masked
   - Verify it's read-only

### System Info Tab
1. **Real-Time Stats**
   - Check Total Articles count
   - Check Active Users count
   - Check Newsletter Subscribers count
   - Check Ad Campaigns count
   - All should show real numbers from database

2. **Database Status**
   - Should show green dot
   - Should say "Connected to Neon PostgreSQL"

3. **Version Info**
   - Should show Next.js 14.2
   - Should show PostgreSQL 16
   - Should show your Node.js version

---

## 🔍 What to Look For

### ✅ Success Indicators
- Loading spinner appears initially
- Data loads from database
- All fields are editable
- Save button works
- "Saved!" message appears for 2 seconds
- Data persists after page refresh
- System stats show real numbers
- No console errors

### ❌ Error Indicators
- "Failed to load settings" message
- "Unauthorized" error
- Console errors
- Data doesn't persist
- Save button doesn't work
- Stats show 0 or wrong numbers

---

## 🧪 Database Verification

### Check Settings in Database
```sql
-- View all settings
SELECT * FROM "SiteSetting" ORDER BY "updatedAt" DESC;

-- Check specific setting
SELECT * FROM "SiteSetting" WHERE key = 'siteTitle';

-- Count settings
SELECT COUNT(*) FROM "SiteSetting";
```

### Check System Stats
```sql
-- Articles count
SELECT COUNT(*) FROM "Article" WHERE "deletedAt" IS NULL;

-- Active users count
SELECT COUNT(*) FROM "User" WHERE "isActive" = true;

-- Subscribers count
SELECT COUNT(*) FROM "NewsletterSubscriber" WHERE "isActive" = true;

-- Campaigns count
SELECT COUNT(*) FROM "AdCampaign";
```

---

## 🐛 Troubleshooting

### Settings Don't Load
**Problem:** Page shows "Failed to load settings"

**Solutions:**
1. Check database connection
2. Verify user is logged in
3. Check user role (must be SUPER_ADMIN, EDITOR_IN_CHIEF, or AD_MANAGER)
4. Check browser console for errors
5. Check server logs

### Settings Don't Save
**Problem:** Save button doesn't work or data doesn't persist

**Solutions:**
1. Check network tab for API errors
2. Verify database connection
3. Check user permissions
4. Look for console errors
5. Verify SiteSetting table exists

### System Stats Show 0
**Problem:** All stats show 0 or wrong numbers

**Solutions:**
1. Check if tables have data
2. Run SQL queries manually to verify
3. Check database connection
4. Verify Prisma schema is up to date
5. Run `npx prisma generate`

### Unauthorized Error
**Problem:** "Unauthorized" message appears

**Solutions:**
1. Verify you're logged in
2. Check your user role in database:
   ```sql
   SELECT email, role FROM "User" WHERE email = 'your@email.com';
   ```
3. Update role if needed:
   ```sql
   UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'your@email.com';
   ```

---

## 📊 Expected Results

### After First Load
```
✅ All default values displayed
✅ System stats show real numbers
✅ No errors in console
✅ All tabs accessible
✅ All fields editable
```

### After Saving
```
✅ "Saved!" message appears
✅ Button shows checkmark
✅ Message disappears after 2 seconds
✅ No errors in console
```

### After Page Refresh
```
✅ All saved values persist
✅ System stats update
✅ No data loss
✅ Same state as before refresh
```

---

## 🎯 Quick Verification Script

Run this in your browser console on the Settings page:

```javascript
// Check if settings loaded
console.log('Settings loaded:', !!document.querySelector('input[type="text"]'));

// Check if system stats loaded
console.log('Stats loaded:', !!document.querySelector('.text-2xl'));

// Check if save button exists
console.log('Save button:', !!document.querySelector('button:has(svg)'));

// Check for errors
console.log('No errors:', !document.querySelector('.text-red-500'));
```

Expected output:
```
Settings loaded: true
Stats loaded: true
Save button: true
No errors: true
```

---

## ✅ Verification Checklist

### Before Testing
- [ ] Admin app running on port 3001
- [ ] Database connection working
- [ ] User account exists with proper role
- [ ] Logged in successfully

### During Testing
- [ ] All 6 tabs accessible
- [ ] All fields editable
- [ ] Toggles work smoothly
- [ ] Color picker functional
- [ ] Save button works
- [ ] Success message appears
- [ ] No console errors

### After Testing
- [ ] Data persists after refresh
- [ ] System stats accurate
- [ ] Database updated correctly
- [ ] No data corruption
- [ ] Performance acceptable

---

## 🎉 Success Criteria

**Settings page is working if:**
1. ✅ All tabs load without errors
2. ✅ All fields are editable
3. ✅ Save button works
4. ✅ Data persists after refresh
5. ✅ System stats show real numbers
6. ✅ No console errors
7. ✅ Smooth user experience

**If all criteria met: Settings page is FULLY FUNCTIONAL** ✅

---

**Test Date:** April 22, 2026  
**Status:** Ready for Testing  
**Expected Result:** ALL PASS ✅
