# Setup Checklist - Founder Onboarding System

## ✅ Completed (Already Done)

- [x] Database schema updated with OAuth fields
- [x] Google OAuth library installed (`google-auth-library`)
- [x] Company email validation implemented
- [x] Onboarding flow created
- [x] Admin founders dashboard created
- [x] Signup page updated with Google button
- [x] API routes for OAuth created
- [x] Security features implemented

## 🔧 Required Setup (You Need to Do)

### 1. Google OAuth Configuration (REQUIRED)

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project or select existing
3. Enable **Google+ API**
4. Create **OAuth 2.0 Client ID**:
   - Application type: Web application
   - Authorized redirect URIs:
     - Development: `http://localhost:3000/api/founder/auth/google/callback`
     - Production: `https://yourdomain.com/api/founder/auth/google/callback`
5. Copy credentials

**Add to `apps/web/.env`:**
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/founder/auth/google/callback
```

### 2. Test the Flow

**Test Google OAuth:**
```bash
# Start web server
cd apps/web
npm run dev

# Visit: http://localhost:3000/auth/signup
# Click "Continue with Google"
# Use company email (not Gmail)
# Complete onboarding
# Should reach dashboard
```

**Test Admin View:**
```bash
# Start admin server
cd apps/admin
npm run dev

# Visit: http://localhost:3001/founders
# Should see all registered founders
```

### 3. Verify Email Validation

**Test these scenarios:**
- ❌ `test@gmail.com` → Should be rejected
- ❌ `user@yahoo.com` → Should be rejected
- ✅ `john@yotta.com` → Should work
- ✅ `founder@startup.ai` → Should work

## 📋 Optional Enhancements

### Add Custom Email Domains to Block List

Edit `apps/web/lib/google-oauth.ts`:
```typescript
const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  // Add more domains here
  'yourdomain.com', // If you want to block specific domains
];
```

### Customize Onboarding Fields

Edit `apps/web/app/founder/onboarding/OnboardingClient.tsx` to:
- Add more fields
- Change required fields
- Modify role options
- Add custom validation

### Add Founder Detail Page

Create `apps/admin/app/(dashboard)/founders/[id]/page.tsx` to show:
- Complete profile
- All submissions
- Activity timeline
- Analytics

## 🧪 Testing Checklist

### Google OAuth Flow
- [ ] Click "Continue with Google" button
- [ ] Redirects to Google login
- [ ] Login with company email
- [ ] Redirects back to site
- [ ] Shows onboarding page
- [ ] Email is pre-filled and verified
- [ ] Company name is auto-suggested

### Email Validation
- [ ] Try Gmail → Shows error
- [ ] Try Yahoo → Shows error
- [ ] Try company email → Works
- [ ] Error message is clear

### Onboarding
- [ ] All fields display correctly
- [ ] Company name is required
- [ ] Role is required
- [ ] Optional fields work
- [ ] Submit button works
- [ ] Redirects to dashboard

### Admin Dashboard
- [ ] Founders list loads
- [ ] Search works
- [ ] Status filter works
- [ ] Stats cards show correct numbers
- [ ] Google badge shows for OAuth users
- [ ] Email verified icon shows
- [ ] Submission counts are correct

## 🚀 Production Deployment

### Before Going Live:

1. **Update Environment Variables:**
```env
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/founder/auth/google/callback
NEXT_PUBLIC_WEB_URL=https://yourdomain.com
```

2. **Update Google Console:**
- Add production redirect URI
- Verify domain ownership

3. **Test on Staging:**
- Test complete OAuth flow
- Test email validation
- Test onboarding
- Test admin dashboard

4. **Security Checklist:**
- [ ] HTTPS enabled
- [ ] JWT secrets are strong and unique
- [ ] Database credentials are secure
- [ ] CORS configured correctly
- [ ] Rate limiting enabled

## 📊 Monitoring

### Track These Metrics:
- Founder signups (Google vs Email)
- Onboarding completion rate
- Company email rejection rate
- Time to complete onboarding
- Submissions per founder

### Admin Dashboard Shows:
- Total founders
- Active vs pending
- Founders with submissions
- Recent signups
- Authentication methods

## 🆘 Support

### Common Issues:

**"OAuth failed" error:**
- Check Google credentials in `.env`
- Verify redirect URI matches
- Check Google Console settings

**"Personal email not allowed":**
- This is expected for Gmail, Yahoo, etc.
- Use company email instead
- Contact admin if company domain is blocked

**Onboarding not showing:**
- Clear browser cache
- Check if already completed
- Verify session is active

## ✨ What's Next?

After setup is complete, founders can:
1. Sign up with Google (company email)
2. Complete onboarding profile
3. Access founder dashboard
4. Submit startups and tools
5. View analytics
6. Manage submissions

Admins can:
1. View all founders
2. See submission counts
3. Track authentication methods
4. Monitor onboarding completion
5. Filter and search founders
6. View detailed founder profiles

---

**Status**: System is ready! Just need to configure Google OAuth credentials.

**Time to Complete**: ~10 minutes (mostly Google Console setup)

**Difficulty**: Easy (just copy-paste credentials)
