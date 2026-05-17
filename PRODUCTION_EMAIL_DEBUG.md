# Production Email Debugging Guide

## Issue: Emails not working in production but working locally

---

## Step 1: Verify Environment Variables Are Set

### Check in Your Hosting Platform

**Vercel:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Verify these exist:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `RESEND_FROM_NAME`
   - `RESEND_NEWSLETTER_EMAIL`
   - `RESEND_NEWSLETTER_NAME`
   - `RESEND_REPLY_TO`

**Railway/Render:**
1. Go to your project dashboard
2. Check Environment Variables section
3. Verify all 6 variables are present

### Important: Check for Typos
- Variable names are case-sensitive
- No extra spaces before or after values
- No quotes around values (unless your platform requires them)

---

## Step 2: Check Server Logs

### Where to Find Logs

**Vercel:**
1. Go to your project
2. Click on latest deployment
3. Click "View Function Logs"
4. Look for email-related logs

**Railway/Render:**
1. Go to your project
2. Click "Logs" or "View Logs"
3. Filter for recent activity

### What to Look For

Look for these log messages:
```
📧 Attempting to send verification email...
   From: AI Startup Impact <no-reply@aistartupimpact.com>
   To: user@example.com
✅ Email sent successfully!
```

Or error messages:
```
❌ Failed to send verification email:
   Error message: [error details]
```

---

## Step 3: Common Issues & Solutions

### Issue 1: Environment Variables Not Loading

**Symptoms:**
- No email logs in server logs
- Silent failure
- No error messages

**Solution:**
1. Verify variables are set in hosting platform
2. Redeploy application (variables only load on startup)
3. Check variable names match exactly (case-sensitive)

### Issue 2: RESEND_FROM_EMAIL is undefined

**Symptoms:**
- Error: "RESEND_FROM_EMAIL is undefined"
- Email function fails silently

**Solution:**
```bash
# In your hosting platform, ensure this is set:
RESEND_FROM_EMAIL=no-reply@aistartupimpact.com
```

### Issue 3: Resend API Key Invalid

**Symptoms:**
- Error: "Invalid API key"
- 401 Unauthorized error

**Solution:**
1. Log in to https://resend.com
2. Go to API Keys
3. Verify your API key is active
4. Copy the correct key
5. Update in hosting platform

### Issue 4: Domain Not Verified

**Symptoms:**
- Error: "Domain not verified"
- Email rejected by Resend

**Solution:**
1. Log in to https://resend.com
2. Go to Domains → aistartupimpact.com
3. Check status is "Verified"
4. If not, re-verify domain

---

## Step 4: Test Email Sending Manually

### Create a Test API Route

Add this file to test email sending directly:

**File:** `apps/web/app/api/test-email/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  try {
    // Log environment variables (without exposing full API key)
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const fromName = process.env.RESEND_FROM_NAME;
    
    console.log('🔍 Environment Check:');
    console.log('   RESEND_API_KEY:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');
    console.log('   RESEND_FROM_EMAIL:', fromEmail || 'NOT SET');
    console.log('   RESEND_FROM_NAME:', fromName || 'NOT SET');
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY not set',
        env: process.env.NODE_ENV 
      }, { status: 500 });
    }
    
    if (!fromEmail) {
      return NextResponse.json({ 
        error: 'RESEND_FROM_EMAIL not set',
        env: process.env.NODE_ENV 
      }, { status: 500 });
    }
    
    const resend = new Resend(apiKey);
    
    console.log('📧 Attempting to send test email...');
    console.log('   From:', `${fromName} <${fromEmail}>`);
    
    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: 'venkatesh@tinyslash.com', // Change to your email
      subject: 'Production Email Test',
      html: `
        <h1>Production Email Test</h1>
        <p>This is a test email from production.</p>
        <p>Environment: ${process.env.NODE_ENV}</p>
        <p>From: ${fromEmail}</p>
        <p>Time: ${new Date().toISOString()}</p>
      `
    });
    
    console.log('✅ Email sent successfully!', result);
    
    return NextResponse.json({ 
      success: true,
      result,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        fromEmail,
        fromName
      }
    });
    
  } catch (error: any) {
    console.error('❌ Test email failed:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error,
      env: process.env.NODE_ENV
    }, { status: 500 });
  }
}
```

### How to Use Test Route

1. Deploy the test route to production
2. Visit: `https://aistartupimpact.com/api/test-email`
3. Check the response in browser
4. Check server logs for detailed output

### Expected Response (Success)

```json
{
  "success": true,
  "result": {
    "id": "email-id-here",
    "from": "no-reply@aistartupimpact.com",
    "to": "venkatesh@tinyslash.com"
  },
  "env": {
    "NODE_ENV": "production",
    "fromEmail": "no-reply@aistartupimpact.com",
    "fromName": "AI Startup Impact"
  }
}
```

### Expected Response (Failure)

```json
{
  "error": "RESEND_FROM_EMAIL not set",
  "env": "production"
}
```

---

## Step 5: Check Resend Dashboard

1. Log in to https://resend.com
2. Go to "Emails" section
3. Check recent email attempts
4. Look for:
   - ✅ Delivered
   - ⏳ Queued
   - ❌ Failed
   - 🚫 Bounced

If emails show as "Delivered" in Resend but not received:
- Check spam/junk folder
- Check Updates/Notifications folder (Gmail)
- Check email filters

---

## Step 6: Verify Code is Using Environment Variables

Check that `founder-email.ts` is reading from environment variables:

```typescript
// Should be:
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'no-reply@aistartupimpact.com';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'AI Startup Impact';

// NOT hardcoded:
const FROM_EMAIL = 'newsletter-noreply@aistartupimpact.com'; // ❌ Wrong
```

---

## Step 7: Check Build Logs

Sometimes environment variables are not available during build time.

**Vercel:**
1. Go to deployment
2. Check "Build Logs"
3. Look for any environment variable warnings

**Solution:**
- Ensure variables are set for "Production" environment
- Not just "Preview" or "Development"

---

## Step 8: Force Redeploy

Sometimes a simple redeploy fixes the issue:

**Vercel:**
1. Go to Deployments
2. Click on latest deployment
3. Click "..." menu
4. Click "Redeploy"
5. Select "Use existing Build Cache: No"

**Railway/Render:**
1. Click "Deploy" or "Redeploy"
2. Wait for deployment to complete

---

## Debugging Checklist

- [ ] All 6 email environment variables are set in hosting platform
- [ ] Variables are set for "Production" environment (not just Preview)
- [ ] Application has been redeployed after adding variables
- [ ] Server logs show email sending attempts
- [ ] No error messages in server logs
- [ ] Resend API key is valid and active
- [ ] Domain is verified in Resend dashboard
- [ ] Test API route returns success
- [ ] Resend dashboard shows email as delivered
- [ ] Checked spam/junk/updates folders

---

## Quick Test Commands

### Test 1: Check if variables are set
Visit: `https://aistartupimpact.com/api/test-email`

### Test 2: Check Resend API directly
```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "no-reply@aistartupimpact.com",
    "to": "your-email@example.com",
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'
```

---

## Still Not Working?

If you've tried everything above and emails still don't work:

1. **Share server logs** - Copy the exact error message
2. **Check Resend dashboard** - Screenshot the email status
3. **Verify environment variables** - Screenshot from hosting platform
4. **Test API route response** - Share the JSON response

---

## Contact Support

**Resend Support:**
- Email: support@resend.com
- Dashboard: https://resend.com/support

**Hosting Support:**
- Vercel: https://vercel.com/support
- Railway: https://railway.app/help
- Render: https://render.com/docs/support

---

**Last Updated:** May 17, 2026
