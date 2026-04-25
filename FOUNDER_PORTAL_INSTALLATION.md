# Founder Portal - Installation & Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# From project root
npm install

# Or specifically for web app
cd apps/web
npm install
```

### 2. Environment Variables

Make sure your `.env` file has these variables:

```env
# Database
DATABASE_URL="your-neon-postgres-url"
DIRECT_URL="your-neon-direct-url"

# Founder JWT Secret (min 32 characters)
FOUNDER_JWT_SECRET="your-secret-key-min-32-characters-long"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Blob Storage (Vercel Blob for Cloudflare R2)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

### 3. Database Migration

The founder portal tables are already in the schema. Just run:

```bash
cd packages/database
npx prisma db push
npx prisma generate
```

### 4. Start Development Server

```bash
# From project root
npm run dev

# Or from apps/web
cd apps/web
npm run dev
```

### 5. Access the Portal

- **Public Site:** http://localhost:3000
- **Founder Signup:** http://localhost:3000/auth/signup
- **Founder Login:** http://localhost:3000/auth/login
- **Founder Dashboard:** http://localhost:3000/founder/dashboard

---

## 📦 New Dependencies Added

### Required:
- `@vercel/blob` - For media uploads to Cloudflare R2
- `bcryptjs` - For password hashing (already installed)
- `jose` - For JWT tokens (already installed)
- `zod` - For validation (already installed)
- `resend` - For emails (already installed)

All dependencies are already in package.json and will be installed with `npm install`.

---

## 🗄️ Database Tables

### Already Created:
- `FounderUser` - Founder accounts
- `FounderSession` - JWT sessions
- `FounderAnalytics` - Analytics data
- `FounderNotification` - Notifications
- `Startup` - Startup listings (with ownerId)
- `AiTool` - Tool listings (with ownerId)
- `MediaAsset` - Uploaded media

### Schema Updates:
The schema already includes:
- `ownerId` field in Startup table
- `ownerId` field in AiTool table
- `claimStatus` field (UNCLAIMED, PENDING, CLAIMED, VERIFIED, REJECTED)
- All founder portal tables

---

## 🔑 Environment Setup

### 1. Generate JWT Secret

```bash
# Generate a secure random string (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env`:
```env
FOUNDER_JWT_SECRET="generated-secret-here"
```

### 2. Setup Resend (Email)

1. Sign up at https://resend.com
2. Get your API key
3. Verify your domain
4. Add to `.env`:

```env
RESEND_API_KEY="re_xxxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

### 3. Setup Vercel Blob (Media Storage)

1. Go to Vercel dashboard
2. Create a Blob store
3. Get your token
4. Add to `.env`:

```env
BLOB_READ_WRITE_TOKEN="vercel_blob_xxxxxxxxxxxxx"
```

---

## 🧪 Testing the Portal

### 1. Create a Founder Account

```bash
# Visit signup page
http://localhost:3000/auth/signup

# Fill in:
- Name: John Doe
- Email: john@example.com
- Password: SecurePass123!
- Company: My Startup
```

### 2. Verify Email

Check your terminal for the verification link (in development):
```
Verification link: http://localhost:3000/auth/verify?token=xxxxx
```

Click the link or copy to browser.

### 3. Login

```bash
http://localhost:3000/auth/login

# Use credentials:
- Email: john@example.com
- Password: SecurePass123!
```

### 4. Submit a Startup

```bash
# Navigate to:
http://localhost:3000/founder/startups/new

# Fill in the form and submit
```

### 5. Submit a Tool

```bash
# Navigate to:
http://localhost:3000/founder/tools/new

# Fill in the form and submit
```

---

## 🐛 Troubleshooting

### Issue: "Unauthorized - Please login"
**Solution:** Make sure you're logged in and the JWT token is valid.

### Issue: "Upload failed"
**Solution:** Check that BLOB_READ_WRITE_TOKEN is set correctly.

### Issue: "Email verification failed"
**Solution:** Check that RESEND_API_KEY is set and domain is verified.

### Issue: "Database error"
**Solution:** Run `npx prisma db push` and `npx prisma generate`.

### Issue: "Module not found"
**Solution:** Run `npm install` in the project root.

### Issue: "Port 3000 already in use"
**Solution:** Kill the process or use a different port:
```bash
npm run dev -- --port 3001
```

---

## 📁 File Structure

```
apps/web/
├── app/
│   ├── (founder)/                    # Protected founder routes
│   │   ├── layout.tsx               # Auth check + navigation
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Dashboard home
│   │   ├── startups/
│   │   │   ├── page.tsx             # List startups
│   │   │   ├── new/
│   │   │   │   └── page.tsx         # Submit startup
│   │   │   └── actions.ts           # Server actions
│   │   └── tools/
│   │       ├── page.tsx             # List tools
│   │       ├── new/
│   │       │   └── page.tsx         # Submit tool
│   │       └── actions.ts           # Server actions
│   │
│   ├── auth/                         # Authentication pages
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── verify/
│   │       └── page.tsx
│   │
│   └── api/
│       ├── founder/
│       │   └── auth/                # Auth API routes
│       │       ├── signup/
│       │       ├── login/
│       │       ├── logout/
│       │       └── verify/
│       └── media/
│           └── upload/              # Media upload API
│               └── route.ts
│
├── components/
│   └── founder/                      # Founder components
│       ├── FounderNav.tsx           # Top navigation
│       ├── FounderSidebar.tsx       # Side navigation
│       ├── StartupForm.tsx          # Startup form
│       ├── ToolForm.tsx             # Tool form
│       ├── StatCard.tsx             # Stats card
│       └── ListingCard.tsx          # Listing card
│
└── lib/
    ├── founder-auth.ts              # Auth utilities
    └── founder-email.ts             # Email utilities
```

---

## 🔒 Security Checklist

- [x] Passwords hashed with bcrypt (12 rounds)
- [x] JWT tokens with expiry (7 days)
- [x] HttpOnly cookies
- [x] Secure flag in production
- [x] SameSite cookies
- [x] Email verification required
- [x] Server-side validation
- [x] SQL injection prevention (Prisma)
- [x] XSS prevention (React)
- [x] File type validation
- [x] File size limits
- [x] Owner-based access control
- [ ] Rate limiting (to add)
- [ ] CSRF tokens (to add)

---

## 📊 Database Queries

### Check Founder Users
```sql
SELECT * FROM "FounderUser";
```

### Check Startups
```sql
SELECT * FROM "Startup" WHERE "ownerId" IS NOT NULL;
```

### Check Tools
```sql
SELECT * FROM "AiTool" WHERE "ownerId" IS NOT NULL;
```

### Check Media Assets
```sql
SELECT * FROM "MediaAsset" ORDER BY "createdAt" DESC;
```

---

## 🎯 Next Steps

After installation:

1. ✅ Test signup flow
2. ✅ Test login flow
3. ✅ Test startup submission
4. ✅ Test tool submission
5. ✅ Test media upload
6. ⏳ Add edit functionality
7. ⏳ Add analytics dashboard
8. ⏳ Add email notifications
9. ⏳ Add profile & settings

---

## 📚 Additional Resources

- [Architecture Document](./FOUNDER_PORTAL_ARCHITECTURE.md)
- [Status Report](./FOUNDER_PORTAL_STATUS.md)
- [Phase 3 Complete](./FOUNDER_PORTAL_PHASE3_COMPLETE.md)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Resend Docs](https://resend.com/docs)
- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)

---

## 💬 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the error messages in terminal
3. Check browser console for client errors
4. Verify environment variables are set
5. Ensure database is up to date
6. Check that all dependencies are installed

---

**Last Updated:** April 22, 2026  
**Version:** 1.0.0  
**Status:** Ready for Development

