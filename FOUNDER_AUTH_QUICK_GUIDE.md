# Founder Authentication - Quick Visual Guide

## 🚀 Complete User Journey

### 1️⃣ Sign Up (NEW!)

**URL:** `http://localhost:3000/auth/signup`

**What Founder Sees:**
```
┌─────────────────────────────────────┐
│     Create Your Account             │
│  Join AI Startup Impact Founder     │
│            Portal                    │
├─────────────────────────────────────┤
│                                     │
│  Full Name *                        │
│  [John Doe________________]         │
│                                     │
│  Email Address *                    │
│  [john@startup.com________]         │
│                                     │
│  Company Name (Optional)            │
│  [My Awesome Startup______]         │
│                                     │
│  Password *                         │
│  [••••••••________________] 👁      │
│  ████░░░░ Strong                    │
│  Use at least 8 characters...       │
│                                     │
│  ☑ I agree to Terms & Privacy       │
│                                     │
│  [    Create Account    ]           │
│                                     │
│  Already have an account? Sign in   │
└─────────────────────────────────────┘
```

**After Submit:**
```
┌─────────────────────────────────────┐
│           ✓                         │
│     Check Your Email!               │
│                                     │
│  We've sent a verification link to  │
│      john@startup.com               │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Please click the link in the  │ │
│  │ email to verify your account  │ │
│  └───────────────────────────────┘ │
│                                     │
│       Back to Login                 │
└─────────────────────────────────────┘
```

---

### 2️⃣ Email Verification

**Email Received:**
```
From: AI Startup Impact <admin@aistartupimpact.com>
Subject: Verify Your Email

Hi John Doe,

Welcome to AI Startup Impact Founder Portal!

Please verify your email address:

┌─────────────────────┐
│   Verify Email      │
└─────────────────────┘

This link will expire in 24 hours.

Best regards,
AI Startup Impact Team
```

**Click Link → Redirected to:**

**URL:** `http://localhost:3000/auth/verify?token=abc123xyz`

**What Founder Sees:**
```
┌─────────────────────────────────────┐
│           ⟳                         │
│   Verifying Your Email              │
│                                     │
│  Please wait while we verify your   │
│  email address...                   │
└─────────────────────────────────────┘

↓ (After 1 second)

┌─────────────────────────────────────┐
│           ✓                         │
│      Email Verified!                │
│                                     │
│  Email verified successfully!       │
│                                     │
│  Redirecting to login...            │
└─────────────────────────────────────┘

↓ (Auto-redirect after 2 seconds)
```

---

### 3️⃣ Login

**URL:** `http://localhost:3000/auth/login`

**What Founder Sees:**
```
┌─────────────────────────────────────┐
│       Welcome Back                  │
│  Sign in to manage your listings    │
├─────────────────────────────────────┤
│                                     │
│  Email Address                      │
│  [john@startup.com________]         │
│                                     │
│  Password          Forgot password? │
│  [••••••••________________] 👁      │
│                                     │
│  [      Sign In      ]              │
│                                     │
│  Don't have an account? Create one  │
└─────────────────────────────────────┘
```

**After Login → Auto-redirect to Dashboard**

---

### 4️⃣ Founder Dashboard

**URL:** `http://localhost:3000/founder/dashboard`

**What Founder Sees:**
```
┌────────────────────────────────────────────────────────────┐
│  AI Startup Impact | Founder Portal          John Doe ▼    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Welcome back, John Doe!                                   │
│  Here's what's happening with your listings                │
│                                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ 🚀       │ │ 🔧       │ │ 👁       │ │ 🖱       │    │
│  │ Startups │ │ Tools    │ │ Total    │ │ Click    │    │
│  │    2     │ │    3     │ │ Views    │ │ Rate     │    │
│  │          │ │          │ │  1,234   │ │  3.5%    │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│                                                            │
│  ┌─────────────────────────┐ ┌─────────────────────────┐ │
│  │ + Submit Your Startup   │ │ + Submit Your Tool      │ │
│  │                         │ │                         │ │
│  │ Get your startup        │ │ Showcase your AI tool   │ │
│  │ featured on AI Startup  │ │ to thousands of users   │ │
│  │ Impact                  │ │                         │ │
│  └─────────────────────────┘ └─────────────────────────┘ │
│                                                            │
│  Recent Startups              Recent Tools                │
│  ┌─────────────────────┐    ┌─────────────────────┐     │
│  │ 🏢 My Startup       │    │ 🔧 My AI Tool       │     │
│  │ AI-powered solution │    │ Automation platform │     │
│  │ Status: PENDING     │    │ Status: APPROVED    │     │
│  └─────────────────────┘    └─────────────────────┘     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### 5️⃣ Submit Startup

**URL:** `http://localhost:3000/founder/startups/new`

**What Founder Sees:**
```
┌────────────────────────────────────────────────────────────┐
│  Submit Your Startup                                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Basic Information                                         │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Startup Name *                                       │ │
│  │ [My Awesome Startup_____________________________]    │ │
│  │                                                      │ │
│  │ Tagline *                                            │ │
│  │ [AI-powered solution for...___________________]      │ │
│  │                                                      │ │
│  │ Description *                                        │ │
│  │ [Tell us about your startup...                   ]   │ │
│  │ [                                                ]   │ │
│  │                                                      │ │
│  │ Website URL *                                        │ │
│  │ [https://mystartup.com_______________________]       │ │
│  │                                                      │ │
│  │ Logo                                                 │ │
│  │ [📁 Upload Logo]                                     │ │
│  │                                                      │ │
│  │ Stage *                                              │ │
│  │ [Seed ▼]                                             │ │
│  │                                                      │ │
│  │ Founded Year                                         │ │
│  │ [2024_____]                                          │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [Cancel]  [Submit for Review]                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**After Submit:**
```
┌─────────────────────────────────────┐
│           ✓                         │
│   Startup Submitted!                │
│                                     │
│  Your startup has been submitted    │
│  for review. We'll notify you once  │
│  it's approved.                     │
│                                     │
│  [View My Startups]                 │
└─────────────────────────────────────┘
```

---

### 6️⃣ Manage Listings

**URL:** `http://localhost:3000/founder/startups`

**What Founder Sees:**
```
┌────────────────────────────────────────────────────────────┐
│  My Startups                          [+ Submit New]        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🏢 My Awesome Startup                    [Edit] [•••] │ │
│  │ AI-powered solution for businesses                   │ │
│  │ Status: ⏳ PENDING    Views: 234    Clicks: 12       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🏢 Another Startup                       [Edit] [•••] │ │
│  │ Revolutionary AI platform                            │ │
│  │ Status: ✓ APPROVED    Views: 1,234    Clicks: 89    │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### 7️⃣ Logout

**Click Logout Button:**

```
User clicks "Logout" in nav
↓
POST /api/founder/auth/logout
↓
Cookie "founder-token" cleared
↓
Redirect to homepage
↓
Session ended
```

**Try to access dashboard:**
```
Visit /founder/dashboard
↓
No cookie found
↓
Redirect to /auth/login
```

---

## 🔐 Behind the Scenes

### Authentication Flow

```
┌─────────────┐
│   SIGNUP    │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────┐
│ 1. Validate input               │
│ 2. Check email not exists       │
│ 3. Hash password (bcrypt)       │
│ 4. Generate verify token        │
│ 5. Create user (PENDING)        │
│ 6. Send verification email      │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────┐
│   EMAIL     │
│ VERIFICATION│
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────┐
│ 1. Find user by token           │
│ 2. Set emailVerified = true     │
│ 3. Set status = ACTIVE          │
│ 4. Clear verify token           │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────┐
│    LOGIN    │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────┐
│ 1. Find user by email           │
│ 2. Verify password (bcrypt)     │
│ 3. Check email verified         │
│ 4. Check account active         │
│ 5. Create JWT token (7 days)    │
│ 6. Set httpOnly cookie          │
│ 7. Update lastLoginAt           │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────┐
│  DASHBOARD  │
│   ACCESS    │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────┐
│ 1. Read "founder-token" cookie  │
│ 2. Verify JWT signature         │
│ 3. Check user still active      │
│ 4. Load user data               │
│ 5. Render dashboard             │
└─────────────────────────────────┘
```

---

## 📁 File Locations

### Pages (Frontend)
```
apps/web/app/auth/
├── signup/page.tsx       ✅ NEW - Just created!
├── login/page.tsx        ✅ Exists
└── verify/page.tsx       ✅ Exists

apps/web/app/(founder)/
├── layout.tsx            ✅ Auth guard
├── dashboard/page.tsx    ✅ Main dashboard
├── startups/
│   ├── page.tsx          ✅ List
│   ├── new/page.tsx      ✅ Submit
│   └── [id]/page.tsx     ✅ Edit
└── tools/
    ├── page.tsx          ✅ List
    ├── new/page.tsx      ✅ Submit
    └── [id]/page.tsx     ✅ Edit
```

### API Endpoints (Backend)
```
apps/web/app/api/founder/auth/
├── signup/route.ts       ✅ POST - Create account
├── login/route.ts        ✅ POST - Login
├── logout/route.ts       ✅ POST - Logout
└── verify/route.ts       ✅ POST - Verify email
```

### Libraries
```
apps/web/lib/
├── founder-auth.ts       ✅ JWT, sessions, auth guards
└── founder-email.ts      ✅ Email sending
```

---

## 🎯 Quick Test Steps

### 1. Sign Up
```bash
# Visit
http://localhost:3000/auth/signup

# Fill form:
Name: Test Founder
Email: test@example.com
Password: SecurePass123
Company: Test Startup
☑ Agree to terms

# Click "Create Account"
# Should see: "Check Your Email!"
```

### 2. Verify Email
```bash
# Check database for token:
SELECT "verifyToken" FROM "FounderUser" WHERE email = 'test@example.com';

# Visit verification URL:
http://localhost:3000/auth/verify?token=YOUR_TOKEN_HERE

# Should see: "Email Verified!"
# Auto-redirect to login
```

### 3. Login
```bash
# Visit
http://localhost:3000/auth/login

# Enter:
Email: test@example.com
Password: SecurePass123

# Click "Sign In"
# Should redirect to: /founder/dashboard
```

### 4. Access Dashboard
```bash
# Should see:
- Welcome message
- Stats cards
- Quick actions
- Recent listings

# Cookie set:
founder-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Submit Startup
```bash
# Click "Submit Your Startup"
# Fill form
# Submit
# Should see success message
```

### 6. Logout
```bash
# Click logout button
# Cookie cleared
# Redirect to homepage
# Try accessing /founder/dashboard
# Should redirect to /auth/login
```

---

## ✅ Status

**Complete Authentication System:**
- ✅ Signup page (NEW!)
- ✅ Email verification
- ✅ Login page
- ✅ Protected dashboard
- ✅ JWT authentication
- ✅ httpOnly cookies
- ✅ Password hashing
- ✅ Session management
- ✅ Logout functionality

**Ready to use!** 🎉

---

## 🔗 Quick Links

**For Founders:**
- Signup: `http://localhost:3000/auth/signup`
- Login: `http://localhost:3000/auth/login`
- Dashboard: `http://localhost:3000/founder/dashboard`

**For Admins:**
- Admin Login: `http://localhost:3001/login`
- Admin Dashboard: `http://localhost:3001/dashboard`

---

**Last Updated:** April 22, 2026  
**Status:** ✅ Complete and Ready to Use
