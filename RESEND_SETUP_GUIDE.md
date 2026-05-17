# How to Add noreply@aistartupimpact.com to Resend

## Problem
Resend requires sender email addresses to be verified before they can send emails. Currently only `newsletter-noreply@aistartupimpact.com` is verified.

## Solution: Add noreply@ to Resend

### Step 1: Log in to Resend Dashboard
1. Go to https://resend.com/login
2. Log in with your account

### Step 2: Add New Sender Email
1. Click on **"Domains"** in the left sidebar
2. Click on your domain: **aistartupimpact.com**
3. Scroll down to **"Email Addresses"** section
4. Click **"Add Email Address"** button
5. Enter: `noreply@aistartupimpact.com`
6. Click **"Add"**

### Step 3: Verify the Email (if required)
Resend may send a verification email to `noreply@aistartupimpact.com`. If so:
1. Check the Zoho mailbox for `noreply@aistartupimpact.com`
2. Click the verification link in the email
3. Wait for Resend to confirm verification

### Step 4: Update Environment Variable
Once `noreply@` is verified in Resend, update `.env`:

```env
# Change from:
RESEND_FROM_EMAIL="newsletter-noreply@aistartupimpact.com"

# To:
RESEND_FROM_EMAIL="noreply@aistartupimpact.com"
```

### Step 5: Restart Development Server
```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

## Alternative: Use Domain-Level Verification

If you have domain-level verification set up in Resend (recommended), you can send from ANY email address at your domain without individual verification.

### Check if Domain is Verified:
1. Go to Resend Dashboard → Domains
2. Look for **aistartupimpact.com**
3. Check if it shows **"Verified"** status with a green checkmark

### If Domain is NOT Verified:
1. Click on your domain
2. Follow the DNS setup instructions
3. Add the required DNS records to your domain:
   - **SPF record** (TXT)
   - **DKIM records** (TXT)
   - **DMARC record** (TXT)
4. Wait for DNS propagation (can take up to 48 hours)
5. Click **"Verify Domain"** in Resend

### Benefits of Domain Verification:
- ✅ Send from ANY email at your domain
- ✅ No need to verify individual email addresses
- ✅ Better email deliverability
- ✅ Professional email authentication

## Current Temporary Setup

**Status**: Using `newsletter-noreply@` for ALL emails temporarily

```env
# Transactional emails (TEMPORARY)
RESEND_FROM_EMAIL="newsletter-noreply@aistartupimpact.com"
RESEND_FROM_NAME="AI Startup Impact"

# Newsletter emails
RESEND_NEWSLETTER_EMAIL="newsletter-noreply@aistartupimpact.com"
RESEND_NEWSLETTER_NAME="AI Startup Impact Weekly"
```

**What this means**:
- ✅ Verification emails will work (from newsletter-noreply@)
- ✅ Password reset emails will work (from newsletter-noreply@)
- ✅ Newsletter emails will work (from newsletter-noreply@)
- ⚠️ All emails come from same address (not ideal but functional)

## Recommended: Domain Verification

The best long-term solution is to verify your entire domain in Resend. This allows you to:
- Send from `noreply@aistartupimpact.com`
- Send from `newsletter-noreply@aistartupimpact.com`
- Send from `hello@aistartupimpact.com`
- Send from ANY email at your domain

### DNS Records Needed (Example):

**SPF Record**:
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

**DKIM Records** (Resend will provide these):
```
Type: TXT
Name: resend._domainkey
Value: [Resend will provide this value]
```

**DMARC Record**:
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:hello@aistartupimpact.com
```

## Testing After Setup

Once `noreply@` is added to Resend:

1. Update `.env` to use `noreply@aistartupimpact.com`
2. Restart server: `npm run dev`
3. Test founder signup
4. Check email comes from `noreply@aistartupimpact.com`
5. Test newsletter (should still come from `newsletter-noreply@`)

## Summary

**Current State**: ✅ Working (all emails from newsletter-noreply@)  
**Next Step**: Add `noreply@` to Resend or verify domain  
**Final State**: Separate emails for transactional vs newsletter

---

**Need Help?**
- Resend Documentation: https://resend.com/docs
- Resend Support: support@resend.com
- DNS Help: Contact your domain registrar
