# Founder Portal - Complete Implementation Guide

## 🎯 IMPLEMENTATION STATUS

**Database Schema:** ✅ Updated (needs migration)
**Authentication:** ⏳ Next
**Frontend Pages:** ⏳ Pending
**API Routes:** ⏳ Pending

---

## 📋 STEP-BY-STEP IMPLEMENTATION

### STEP 1: Apply Database Migration ⚠️

**Important:** The Prisma schema has been updated with founder portal tables. You need to apply the migration when ready.

#### Option A: Fresh Database (Development)
```bash
cd packages/database
npx prisma migrate reset
npx prisma migrate dev --name add_founder_portal
npx prisma generate
```

#### Option B: Production Database (Preserve Data)
```bash
cd packages/database
npx prisma db push
npx prisma generate
```

#### New Tables Added:
1. ✅ `FounderUser` - Founder accounts
2. ✅ `FounderSession` - Founder sessions
3. ✅ `FounderAnalytics` - Analytics tracking
4. ✅ `FounderNotification` - In-app notifications

#### Updated Tables:
1. ✅ `Startup` - Added `ownerId`, `claimStatus`, `claimedAt`, `submittedBy`
2. ✅ `AiTool` - Added `ownerId`, `claimStatus`, `claimedAt`

#### New Enums:
1. ✅ `FounderUserStatus` - ACTIVE, SUSPENDED, PENDING_VERIFICATION
2. ✅ `ClaimStatus` - UNCLAIMED, PENDING, CLAIMED, VERIFIED, REJECTED

---

### STEP 2: Create Founder Authentication Library

Create `apps/web/lib/founder-auth.ts`:

```typescript
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from '@aistartupimpact/database';

const JWT_SECRET = new TextEncoder().encode(
  process.env.FOUNDER_JWT_SECRET || 'founder-secret-change-in-production'
);

export interface FounderSession {
  userId: string;
  email: string;
  name: string;
}

// Create JWT token
export async function createFounderToken(userId: string, email: string, name: string) {
  const token = await new SignJWT({ userId, email, name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  
  return token;
}

// Verify JWT token
export async function verifyFounderToken(token: string): Promise<FounderSession | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as FounderSession;
  } catch (error) {
    return null;
  }
}

// Get current founder session
export async function getFounderSession(): Promise<FounderSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('founder-token')?.value;
  
  if (!token) return null;
  
  return await verifyFounderToken(token);
}

// Set founder session cookie
export async function setFounderSession(userId: string, email: string, name: string) {
  const token = await createFounderToken(userId, email, name);
  const cookieStore = cookies();
  
  cookieStore.set('founder-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Clear founder session
export async function clearFounderSession() {
  const cookieStore = cookies();
  cookieStore.delete('founder-token');
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Require founder authentication (use in server actions)
export async function requireFounderAuth(): Promise<FounderSession> {
  const session = await getFounderSession();
  
  if (!session) {
    throw new Error('Unauthorized - Please login');
  }
  
  // Verify user still exists and is active
  const user = await prisma.founderUser.findUnique({
    where: { id: session.userId },
    select: { status: true, emailVerified: true }
  });
  
  if (!user || user.status !== 'ACTIVE' || !user.emailVerified) {
    throw new Error('Account not active or verified');
  }
  
  return session;
}

// Generate verification token
export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
```

---

### STEP 3: Create Email Service for Founders

Create `apps/web/lib/founder-email.ts`:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@aistartupimpact.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${SITE_URL}/auth/verify?token=${token}`;
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Verify your email - AI Startup Impact',
    html: `
      <h2>Welcome to AI Startup Impact, ${name}!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verifyUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a></p>
      <p>Or copy this link: ${verifyUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    `
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${SITE_URL}/auth/reset-password?token=${token}`;
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Reset your password - AI Startup Impact',
    html: `
      <h2>Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
      <p>Or copy this link: ${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  });
}

export async function sendSubmissionReceivedEmail(
  email: string,
  name: string,
  entityType: 'startup' | 'tool',
  entityName: string
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `We received your ${entityType} submission!`,
    html: `
      <h2>Submission Received</h2>
      <p>Hi ${name},</p>
      <p>Thank you for submitting "${entityName}" to AI Startup Impact.</p>
      <p>Our team will review your submission within 2-3 business days.</p>
      <p><strong>Status:</strong> Pending Review</p>
      <p><a href="${SITE_URL}/founder/dashboard">View in Dashboard</a></p>
      <p>Best regards,<br>AI Startup Impact Team</p>
    `
  });
}

export async function sendApprovalEmail(
  email: string,
  name: string,
  entityType: 'startup' | 'tool',
  entityName: string,
  entitySlug: string
) {
  const liveUrl = `${SITE_URL}/${entityType === 'startup' ? 'startups' : 'tools'}/${entitySlug}`;
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `🎉 Your ${entityType} is now live!`,
    html: `
      <h2>Congratulations!</h2>
      <p>Hi ${name},</p>
      <p>Great news! "${entityName}" has been approved and is now live on AI Startup Impact.</p>
      <p><a href="${liveUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Live Listing</a></p>
      <p><a href="${SITE_URL}/founder/dashboard">View Analytics</a></p>
      <p>Start sharing your listing to get more visibility!</p>
      <p>Best regards,<br>AI Startup Impact Team</p>
    `
  });
}

export async function sendRevisionRequestEmail(
  email: string,
  name: string,
  entityType: 'startup' | 'tool',
  entityName: string,
  feedback: string
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Action Required: Update your ${entityType} submission`,
    html: `
      <h2>Revision Requested</h2>
      <p>Hi ${name},</p>
      <p>Our team reviewed "${entityName}" and has some feedback:</p>
      <blockquote style="border-left: 4px solid #6366f1; padding-left: 16px; margin: 16px 0;">
        ${feedback}
      </blockquote>
      <p><a href="${SITE_URL}/founder/dashboard" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Edit Submission</a></p>
      <p>Best regards,<br>AI Startup Impact Team</p>
    `
  });
}

export async function sendWeeklyAnalyticsEmail(
  email: string,
  name: string,
  analytics: {
    startups: Array<{ name: string; views: number; clicks: number; ctr: number }>;
    tools: Array<{ name: string; views: number; clicks: number; ctr: number }>;
  }
) {
  const startupRows = analytics.startups.map(s => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${s.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${s.views}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${s.clicks}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${s.ctr.toFixed(1)}%</td>
    </tr>
  `).join('');
  
  const toolRows = analytics.tools.map(t => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${t.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${t.views}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${t.clicks}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${t.ctr.toFixed(1)}%</td>
    </tr>
  `).join('');
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Your weekly performance report',
    html: `
      <h2>Weekly Performance Report</h2>
      <p>Hi ${name},</p>
      <p>Here's how your listings performed this week:</p>
      
      ${analytics.startups.length > 0 ? `
        <h3>Startups</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 8px; text-align: left;">Name</th>
              <th style="padding: 8px; text-align: left;">Views</th>
              <th style="padding: 8px; text-align: left;">Clicks</th>
              <th style="padding: 8px; text-align: left;">CTR</th>
            </tr>
          </thead>
          <tbody>
            ${startupRows}
          </tbody>
        </table>
      ` : ''}
      
      ${analytics.tools.length > 0 ? `
        <h3>Tools</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 8px; text-align: left;">Name</th>
              <th style="padding: 8px; text-align: left;">Views</th>
              <th style="padding: 8px; text-align: left;">Clicks</th>
              <th style="padding: 8px; text-align: left;">CTR</th>
            </tr>
          </thead>
          <tbody>
            ${toolRows}
          </tbody>
        </table>
      ` : ''}
      
      <p><a href="${SITE_URL}/founder/dashboard">View Full Analytics</a></p>
      <p>Best regards,<br>AI Startup Impact Team</p>
    `
  });
}
```

---

### STEP 4: Create Signup Page

Create `apps/web/app/auth/signup/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/founder/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check Your Email!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We've sent a verification link to <strong>{formData.email}</strong>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Click the link in the email to verify your account and get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Your Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Join AI Startup Impact and showcase your startup or tool</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="john@startup.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Your Startup Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-12"
                  placeholder="••••••••"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Minimum 8 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### STEP 5: Create Signup API Route

Create `apps/web/app/api/founder/auth/signup/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { hashPassword, generateToken } from '@/lib/founder-auth';
import { sendVerificationEmail } from '@/lib/founder-email';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  company: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validated = signupSchema.parse(body);
    
    // Check if email already exists
    const existing = await prisma.founderUser.findUnique({
      where: { email: validated.email.toLowerCase() }
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }
    
    // Hash password
    const passwordHash = await hashPassword(validated.password);
    
    // Generate verification token
    const verifyToken = generateToken();
    
    // Create user
    const user = await prisma.founderUser.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase(),
        passwordHash,
        company: validated.company,
        verifyToken,
        status: 'PENDING_VERIFICATION',
      }
    });
    
    // Send verification email
    await sendVerificationEmail(user.email, user.name, verifyToken);
    
    return NextResponse.json({
      success: true,
      message: 'Account created! Please check your email to verify.'
    });
    
  } catch (error: any) {
    console.error('Signup error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
```

---

## 📦 COMPLETE FILE STRUCTURE

```
apps/web/
├── app/
│   ├── auth/
│   │   ├── signup/
│   │   │   └── page.tsx                    ✅ Created above
│   │   ├── login/
│   │   │   └── page.tsx                    ⏳ Next
│   │   ├── verify/
│   │   │   └── page.tsx                    ⏳ Next
│   │   ├── forgot-password/
│   │   │   └── page.tsx                    ⏳ Next
│   │   └── reset-password/
│   │       └── page.tsx                    ⏳ Next
│   │
│   ├── (founder)/
│   │   ├── layout.tsx                      ⏳ Next
│   │   ├── dashboard/
│   │   │   └── page.tsx                    ⏳ Next
│   │   ├── startups/
│   │   │   ├── page.tsx                    ⏳ Next
│   │   │   ├── new/
│   │   │   │   └── page.tsx                ⏳ Next
│   │   │   └── [id]/
│   │   │       ├── page.tsx                ⏳ Next
│   │   │       └── analytics/
│   │   │           └── page.tsx            ⏳ Next
│   │   ├── tools/
│   │   │   ├── page.tsx                    ⏳ Next
│   │   │   ├── new/
│   │   │   │   └── page.tsx                ⏳ Next
│   │   │   └── [id]/
│   │   │       ├── page.tsx                ⏳ Next
│   │   │       └── analytics/
│   │   │           └── page.tsx            ⏳ Next
│   │   ├── profile/
│   │   │   └── page.tsx                    ⏳ Next
│   │   └── settings/
│   │       └── page.tsx                    ⏳ Next
│   │
│   └── api/
│       └── founder/
│           ├── auth/
│           │   ├── signup/
│           │   │   └── route.ts            ✅ Created above
│           │   ├── login/
│           │   │   └── route.ts            ⏳ Next
│           │   ├── logout/
│           │   │   └── route.ts            ⏳ Next
│           │   └── verify/
│           │       └── route.ts            ⏳ Next
│           ├── startups/
│           │   └── route.ts                ⏳ Next
│           ├── tools/
│           │   └── route.ts                ⏳ Next
│           └── analytics/
│               └── route.ts                ⏳ Next
│
├── lib/
│   ├── founder-auth.ts                     ✅ Created above
│   └── founder-email.ts                    ✅ Created above
│
└── components/
    └── founder/
        ├── FounderNav.tsx                  ⏳ Next
        ├── FounderSidebar.tsx              ⏳ Next
        ├── StartupForm.tsx                 ⏳ Next
        ├── ToolForm.tsx                    ⏳ Next
        └── AnalyticsChart.tsx              ⏳ Next
```

---

## 🔄 NEXT STEPS

### Immediate (Continue Implementation):

1. **Login Page & API** - Allow founders to sign in
2. **Email Verification** - Verify email addresses
3. **Founder Dashboard** - Main dashboard with overview
4. **Startup Submission** - Form to submit startups
5. **Tool Submission** - Form to submit tools

### Would you like me to continue with:
- A) Login page and API
- B) Founder dashboard
- C) Startup submission form
- D) All of the above in sequence

---

## 📝 ENVIRONMENT VARIABLES NEEDED

Add to `.env`:

```env
# Founder Portal
FOUNDER_JWT_SECRET="founder-jwt-secret-change-in-production-min-32-chars"
```

---

## 🎯 CURRENT PROGRESS

- ✅ Database schema updated
- ✅ Authentication library created
- ✅ Email service created
- ✅ Signup page created
- ✅ Signup API created
- ⏳ Login (next)
- ⏳ Dashboard (next)
- ⏳ Submission forms (next)

**Ready to continue? Let me know which part to implement next!**
