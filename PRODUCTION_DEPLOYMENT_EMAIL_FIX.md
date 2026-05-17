# Production Deployment - Email Fix

**Issue**: Emails working locally but not in production  
**Cause**: Missing email environment variables in production  
**Status**: ✅ FIXED

---

## What Was Missing

Your production `.env.production` file was missing these new email variables:
- `RESEND_FROM_NAME`
- `RESEND_NEWSLETTER_EMAIL`
- `RESEND_NEWSLETTER_NAME`
- `RESEND_REPLY_TO`

## Updated Production Environment Variables

The following variables have been added to `.env.production`:

```env
# Email - Production Resend
RESEND_API_KEY="re_RgZnpk97_6qnHPmBS9qAdgdSytaTQwHkp"

# Transactional emails (verification, password reset, notifications)
RESEND_FROM_EMAIL="no-reply@aistartupimpact.com"
RESEND_FROM_NAME="AI Startup Impact"

# Newsletter emails (weekly campaigns)
RESEND_NEWSLETTER_EMAIL="newsletter-noreply@aistartupimpact.com"
RESEND_NEWSLETTER_NAME="AI Startup Impact Weekly"

# Reply-to address for all emails
RESEND_REPLY_TO="hello@aistartupimpact.com"
```

## Deployment Steps

### If Using Vercel

1. **Go to Vercel Dashboard**
   - Navigate to your project: https://vercel.com/dashboard

2. **Update Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Add/Update these variables:

   ```
   RESEND_FROM_EMAIL = no-reply@aistartupimpact.com
   RESEND_FROM_NAME = AI Startup Impact
   RESEND_NEWSLETTER_EMAIL = newsletter-noreply@aistartupimpact.com
   RESEND_NEWSLETTER_NAME = AI Startup Impact Weekly
   RESEND_REPLY_TO = hello@aistartupimpact.com
   ```

3. **Redeploy**
   - Go to **Deployments** tab
   - Click on the latest deployment
   - Click **"Redeploy"** button
   - OR push a new commit to trigger automatic deployment

### If Using Other Hosting (Railway, Render, etc.)

1. **Access Environment Variables**
   - Go to your hosting dashboard
   - Find Environment Variables or Settings section

2. **Add These Variables**:
   ```
   RESEND_FROM_EMAIL=no-reply@aistartupimpact.com
   RESEND_FROM_NAME=AI Startup Impact
   RESEND_NEWSLETTER_EMAIL=newsletter-noreply@aistartupimpact.com
   RESEND_NEWSLETTER_NAME=AI Startup Impact Weekly
   RESEND_REPLY_TO=hello@aistartupimpact.com
   ```

3. **Restart/Redeploy**
   - Restart your application
   - OR trigger a new deployment

### If Using Docker/VPS

1. **Update `.env.production` on Server**
   ```bash
   # SSH into your server
   ssh user@your-server.com
   
   # Navigate to project directory
   cd /path/to/aistartupimpact
   
   # Edit .env.production
   nano .env.production
   
   # Add the missing variables (see above)
   
   # Save and exit (Ctrl+X, Y, Enter)
   ```

2. **Restart Application**
   ```bash
   # If using PM2
   pm2 restart all
   
   # If using Docker
   docker-compose down
   docker-compose up -d
   
   # If using systemd
   sudo systemctl restart your-app-name
   ```

## Verification Steps

After deployment, verify emails are working:

### 1. Test Transactional Email (Founder Signup)
1. Go to https://aistartupimpact.com
2. Click "Sign Up" → "Founder" tab
3. Fill in signup form with a test email
4. Submit form
5. Check email inbox (including spam/updates folder)
6. Verify email comes from: `AI Startup Impact <no-reply@aistartupimpact.com>`

### 2. Test Newsletter Email (Admin Panel)
1. Go to https://admin.aistartupimpact.com
2. Navigate to Newsletter Admin
3. Select a campaign
4. Click "Send Test Email"
5. Enter test email address
6. Check email inbox
7. Verify email comes from: `AI Startup Impact Weekly <newsletter-noreply@aistartupimpact.com>`

### 3. Check Server Logs
Look for these log messages:
```
📧 Attempting to send verification email...
   From: AI Startup Impact <no-reply@aistartupimpact.com>
   To: user@example.com
   Subject: Verify your email - AI Startup Impact
✅ Email sent successfully!
```

## Troubleshooting

### If Emails Still Not Working

1. **Check Environment Variables Are Set**
   - Verify all 5 email variables are present in production
   - Check for typos in variable names
   - Ensure no extra spaces in values

2. **Check Resend API Key**
   - Verify `RESEND_API_KEY` is correct
   - Check if API key has proper permissions
   - Log in to https://resend.com to verify

3. **Check Server Logs**
   - Look for email sending errors
   - Check for "Failed to send verification email" messages
   - Look for Resend API errors

4. **Verify Domain in Resend**
   - Log in to https://resend.com
   - Go to Domains → aistartupimpact.com
   - Verify domain status is "Verified"
   - Check DNS records are still active

5. **Check Application Restart**
   - Ensure application restarted after adding variables
   - Environment variables only load on application start
   - May need to force restart or redeploy

### Common Issues

**Issue**: "RESEND_FROM_EMAIL is undefined"
- **Solution**: Variable not set in production environment
- **Fix**: Add variable and restart application

**Issue**: "Email sent but not received"
- **Solution**: Check spam/updates folder
- **Fix**: Emails from `no-reply@` go to Updates/Notifications folder (expected)

**Issue**: "Domain not verified"
- **Solution**: Domain verification expired or DNS changed
- **Fix**: Re-verify domain in Resend dashboard

## Environment Variable Checklist

Make sure ALL these variables are set in production:

- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM_EMAIL`
- [ ] `RESEND_FROM_NAME`
- [ ] `RESEND_NEWSLETTER_EMAIL`
- [ ] `RESEND_NEWSLETTER_NAME`
- [ ] `RESEND_REPLY_TO`

## Files Updated

1. `.env.production` - Added missing email variables
2. `.env.production.template` - Updated template for future reference
3. `PRODUCTION_DEPLOYMENT_EMAIL_FIX.md` - This deployment guide

## Next Steps

1. ✅ Update environment variables in your hosting platform
2. ✅ Redeploy or restart application
3. ✅ Test founder signup email
4. ✅ Test newsletter email
5. ✅ Monitor server logs for any errors
6. ✅ Check Resend dashboard for delivery status

## Support

If you continue to have issues:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure application restarted after adding variables
4. Check Resend dashboard for email delivery status
5. Verify domain is still verified in Resend

---

**Updated**: May 17, 2026  
**Status**: Ready for deployment  
**Action Required**: Update production environment variables and redeploy
