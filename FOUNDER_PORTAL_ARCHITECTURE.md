# Founder Portal - Industry-Grade Architecture

## 🎯 OVERVIEW

A comprehensive self-service portal where founders can:
- Submit their startups and tools
- Manage their listings
- Track analytics and engagement
- Update information anytime
- Access their dashboard from the public website

---

## 🏗️ SYSTEM ARCHITECTURE

### 1. USER FLOW

```
Public Website (apps/web)
    ↓
Founder Signup/Login
    ↓
Founder Dashboard
    ↓
Manage Startups & Tools
    ↓
View Analytics & Insights
```

### 2. AUTHENTICATION SYSTEM

#### Two Separate Auth Systems

**Admin Portal** (`apps/admin`)
- NextAuth with role-based access
- Roles: SUPER_ADMIN, EDITOR_IN_CHIEF, SENIOR_WRITER, WRITER
- Access: Internal team only

**Founder Portal** (`apps/web/founder`)
- Separate NextAuth configuration
- Role: FOUNDER
- Access: Public founders/entrepreneurs

#### Why Separate?
- Different permission models
- Different UI/UX requirements
- Security isolation
- Independent scaling

---

## 📋 DATABASE SCHEMA

### New Tables Needed

#### 1. FounderUser Table
```prisma
model FounderUser {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  password      String   // Hashed with bcrypt
  company       String?
  role          String?  // CEO, CTO, Founder, etc.
  phone         String?
  avatar        String?
  bio           String?  @db.Text
  linkedin      String?
  twitter       String?
  website       String?
  
  emailVerified Boolean  @default(false)
  verifyToken   String?  @unique
  resetToken    String?  @unique
  resetExpiry   DateTime?
  
  status        String   @default("ACTIVE") // ACTIVE, SUSPENDED, PENDING
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastLoginAt   DateTime?
  
  // Relations
  startups      Startup[]
  tools         Tool[]
  sessions      FounderSession[]
  
  @@index([email])
  @@index([status])
}
```

#### 2. FounderSession Table
```prisma
model FounderSession {
  id           String      @id @default(cuid())
  userId       String
  user         FounderUser @relation(fields: [userId], references: [id], onDelete: Cascade)
  token        String      @unique
  expiresAt    DateTime
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime    @default(now())
  
  @@index([userId])
  @@index([token])
}
```

#### 3. Update Existing Tables

**Startup Table - Add Owner**
```prisma
model Startup {
  // ... existing fields
  
  ownerId       String?
  owner         FounderUser? @relation(fields: [ownerId], references: [id])
  
  claimStatus   String       @default("UNCLAIMED") // UNCLAIMED, CLAIMED, VERIFIED
  claimedAt     DateTime?
  
  @@index([ownerId])
  @@index([claimStatus])
}
```

**Tool Table - Add Owner**
```prisma
model Tool {
  // ... existing fields
  
  ownerId       String?
  owner         FounderUser? @relation(fields: [ownerId], references: [id])
  
  claimStatus   String       @default("UNCLAIMED") // UNCLAIMED, CLAIMED, VERIFIED
  claimedAt     DateTime?
  
  @@index([ownerId])
  @@index([claimStatus])
}
```

#### 4. FounderAnalytics Table
```prisma
model FounderAnalytics {
  id            String      @id @default(cuid())
  userId        String
  user          FounderUser @relation(fields: [userId], references: [id])
  
  entityType    String      // STARTUP, TOOL
  entityId      String
  
  date          DateTime    @default(now())
  views         Int         @default(0)
  clicks        Int         @default(0)
  inquiries     Int         @default(0)
  
  @@index([userId])
  @@index([entityType, entityId])
  @@index([date])
}
```

---

## 🎨 FRONTEND STRUCTURE

### Directory Structure

```
apps/web/
├── app/
│   ├── (public)/              # Public pages
│   │   ├── page.tsx
│   │   ├── startups/
│   │   └── tools/
│   │
│   ├── (founder)/             # Founder portal (protected)
│   │   ├── layout.tsx         # Founder auth layout
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Main dashboard
│   │   ├── startups/
│   │   │   ├── page.tsx       # List my startups
│   │   │   ├── new/
│   │   │   │   └── page.tsx   # Submit new startup
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # Edit startup
│   │   │       └── analytics/
│   │   │           └── page.tsx # Startup analytics
│   │   ├── tools/
│   │   │   ├── page.tsx       # List my tools
│   │   │   ├── new/
│   │   │   │   └── page.tsx   # Submit new tool
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # Edit tool
│   │   │       └── analytics/
│   │   │           └── page.tsx # Tool analytics
│   │   ├── profile/
│   │   │   └── page.tsx       # Edit profile
│   │   └── settings/
│   │       └── page.tsx       # Account settings
│   │
│   ├── auth/                  # Founder authentication
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── verify/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   │
│   └── api/
│       └── founder/           # Founder API routes
│           ├── auth/
│           │   ├── signup/
│           │   ├── login/
│           │   ├── logout/
│           │   └── verify/
│           ├── startups/
│           ├── tools/
│           └── analytics/
│
├── components/
│   └── founder/               # Founder-specific components
│       ├── FounderNav.tsx
│       ├── FounderSidebar.tsx
│       ├── StartupForm.tsx
│       ├── ToolForm.tsx
│       └── AnalyticsChart.tsx
│
└── lib/
    └── founder-auth.ts        # Founder auth utilities
```

---

## 🔐 AUTHENTICATION FLOW

### 1. Signup Process

```
Step 1: Founder visits /auth/signup
    ↓
Step 2: Fill form (name, email, password, company)
    ↓
Step 3: Submit → Create FounderUser (emailVerified: false)
    ↓
Step 4: Send verification email with token
    ↓
Step 5: Founder clicks link → /auth/verify?token=xxx
    ↓
Step 6: Verify token → Set emailVerified: true
    ↓
Step 7: Redirect to /founder/dashboard
```

### 2. Login Process

```
Step 1: Founder visits /auth/login
    ↓
Step 2: Enter email & password
    ↓
Step 3: Verify credentials (bcrypt compare)
    ↓
Step 4: Check emailVerified === true
    ↓
Step 5: Create session (JWT or database session)
    ↓
Step 6: Redirect to /founder/dashboard
```

### 3. Session Management

**Option A: JWT Tokens (Recommended)**
```typescript
// Stored in httpOnly cookie
{
  userId: "founder_123",
  email: "founder@startup.com",
  role: "FOUNDER",
  exp: 1234567890
}
```

**Option B: Database Sessions**
```typescript
// FounderSession table
{
  id: "session_123",
  userId: "founder_123",
  token: "random_secure_token",
  expiresAt: "2026-05-01",
  ipAddress: "1.2.3.4",
  userAgent: "Mozilla/5.0..."
}
```

---

## 📝 SUBMISSION WORKFLOW

### Startup Submission

#### Step 1: Submit Form
```
Founder Dashboard → "Submit Startup" Button
    ↓
Form Fields:
- Company Name *
- Tagline *
- Description *
- Logo Upload
- Website URL *
- Category *
- Founded Year
- Team Size
- Funding Stage
- Location
- Social Links
- Contact Email *
```

#### Step 2: Admin Review
```
Status: PENDING_REVIEW
    ↓
Admin receives notification
    ↓
Admin reviews in /admin/startups-dir
    ↓
Admin can:
- APPROVE → Status: PUBLISHED
- REJECT → Status: REJECTED (with reason)
- REQUEST_CHANGES → Status: NEEDS_REVISION
```

#### Step 3: Founder Notification
```
Email sent to founder:
- APPROVED: "Your startup is now live!"
- REJECTED: "Please review feedback"
- NEEDS_REVISION: "Please update your submission"
```

### Tool Submission

Same workflow as startup submission with tool-specific fields:
- Tool Name
- Description
- Pricing Model
- Features
- Screenshots
- Demo URL
- Documentation URL

---

## 🎛️ FOUNDER DASHBOARD

### Dashboard Layout

```
┌─────────────────────────────────────────────────┐
│  Header: Logo | Dashboard | Startups | Tools   │
│         Profile Icon ▼                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  Welcome back, [Founder Name]!                 │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Startups │  │  Tools   │  │  Views   │    │
│  │    2     │  │    3     │  │  1,234   │    │
│  └──────────┘  └──────────┘  └──────────┘    │
│                                                 │
│  Recent Activity                                │
│  ┌───────────────────────────────────────┐    │
│  │ ✓ Startup "AI Tool" approved          │    │
│  │ ⏳ Tool "ML Platform" pending review   │    │
│  │ 📊 Your startup got 45 views today    │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  Quick Actions                                  │
│  [+ Submit Startup]  [+ Submit Tool]          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Dashboard Features

#### 1. Overview Cards
- Total Startups (with status breakdown)
- Total Tools (with status breakdown)
- Total Views (last 30 days)
- Total Clicks (last 30 days)

#### 2. Recent Activity Feed
- Submission status changes
- Admin comments/feedback
- Analytics milestones
- System notifications

#### 3. Quick Actions
- Submit new startup
- Submit new tool
- Edit profile
- View analytics

#### 4. Listings Table
```
┌────────────────────────────────────────────────┐
│ Name          | Type    | Status   | Actions  │
├────────────────────────────────────────────────┤
│ AI Startup    | Startup | Live     | Edit     │
│ ML Tool       | Tool    | Pending  | Edit     │
│ SaaS Platform | Startup | Rejected | Resubmit │
└────────────────────────────────────────────────┘
```

---

## ✏️ EDIT FUNCTIONALITY

### Edit Workflow

#### For PUBLISHED Listings
```
Founder clicks "Edit"
    ↓
Form pre-filled with current data
    ↓
Founder makes changes
    ↓
Submit → Status changes to "PENDING_UPDATE"
    ↓
Admin reviews changes
    ↓
Approve → Changes go live
Reject → Reverts to previous version
```

#### For PENDING/REJECTED Listings
```
Founder clicks "Edit"
    ↓
Form pre-filled with submitted data
    ↓
Founder makes changes
    ↓
Submit → Status changes to "PENDING_REVIEW"
    ↓
Admin reviews again
```

### Version Control

**Option 1: Simple (Recommended for MVP)**
- Store current version in main table
- Store pending changes in separate fields
- On approval, overwrite main fields

**Option 2: Full Version History**
```prisma
model StartupVersion {
  id          String   @id @default(cuid())
  startupId   String
  startup     Startup  @relation(fields: [startupId], references: [id])
  
  version     Int
  data        Json     // Full snapshot of data
  status      String   // DRAFT, PENDING, APPROVED, REJECTED
  
  createdBy   String
  createdAt   DateTime @default(now())
  reviewedBy  String?
  reviewedAt  DateTime?
  
  @@index([startupId])
}
```

---

## 📊 ANALYTICS DASHBOARD

### Metrics Tracked

#### 1. View Analytics
```
┌─────────────────────────────────────┐
│  Views Over Time                    │
│                                     │
│  [Line Chart: Last 30 days]        │
│                                     │
│  Total Views: 1,234                 │
│  Avg Daily: 41                      │
│  Peak Day: 89 (Apr 15)             │
└─────────────────────────────────────┘
```

#### 2. Click Analytics
```
┌─────────────────────────────────────┐
│  Click-Through Rate                 │
│                                     │
│  Website Clicks: 234                │
│  Social Clicks: 45                  │
│  Contact Clicks: 12                 │
│                                     │
│  CTR: 23.5%                         │
└─────────────────────────────────────┘
```

#### 3. Engagement Metrics
```
┌─────────────────────────────────────┐
│  Engagement                         │
│                                     │
│  Favorites: 45                      │
│  Shares: 12                         │
│  Comments: 8                        │
│  Inquiries: 3                       │
└─────────────────────────────────────┘
```

#### 4. Traffic Sources
```
┌─────────────────────────────────────┐
│  Traffic Sources                    │
│                                     │
│  [Pie Chart]                        │
│  - Direct: 45%                      │
│  - Search: 30%                      │
│  - Social: 15%                      │
│  - Referral: 10%                    │
└─────────────────────────────────────┘
```

### Analytics Implementation

```typescript
// Track page view
async function trackView(entityType: 'STARTUP' | 'TOOL', entityId: string) {
  await prisma.founderAnalytics.create({
    data: {
      userId: entity.ownerId,
      entityType,
      entityId,
      date: new Date(),
      views: 1,
    }
  });
}

// Track click
async function trackClick(entityType: 'STARTUP' | 'TOOL', entityId: string) {
  await prisma.founderAnalytics.update({
    where: { /* today's record */ },
    data: {
      clicks: { increment: 1 }
    }
  });
}
```

---

## 🔔 NOTIFICATION SYSTEM

### Email Notifications

#### 1. Submission Received
```
Subject: We received your submission!

Hi [Founder Name],

Thank you for submitting "[Startup/Tool Name]" to AI Startup Impact.

Our team will review your submission within 2-3 business days.

Status: Pending Review
Submitted: Apr 22, 2026

[View Submission]

Best regards,
AI Startup Impact Team
```

#### 2. Approved
```
Subject: 🎉 Your submission is now live!

Hi [Founder Name],

Great news! "[Startup/Tool Name]" has been approved and is now live on AI Startup Impact.

[View Live Listing]
[View Analytics]

Start sharing your listing to get more visibility!

Best regards,
AI Startup Impact Team
```

#### 3. Needs Revision
```
Subject: Action Required: Update your submission

Hi [Founder Name],

Our team reviewed "[Startup/Tool Name]" and has some feedback:

Feedback from admin:
"Please add more details about your pricing model and include at least 2 screenshots."

[Edit Submission]

Best regards,
AI Startup Impact Team
```

#### 4. Weekly Analytics Report
```
Subject: Your weekly performance report

Hi [Founder Name],

Here's how your listings performed this week:

AI Startup:
- Views: 234 (+12%)
- Clicks: 45 (+8%)
- CTR: 19.2%

ML Tool:
- Views: 156 (+5%)
- Clicks: 23 (-3%)
- CTR: 14.7%

[View Full Analytics]

Best regards,
AI Startup Impact Team
```

### In-App Notifications

```typescript
model Notification {
  id          String      @id @default(cuid())
  userId      String
  user        FounderUser @relation(fields: [userId], references: [id])
  
  type        String      // SUBMISSION, APPROVAL, REJECTION, ANALYTICS
  title       String
  message     String      @db.Text
  link        String?
  
  read        Boolean     @default(false)
  createdAt   DateTime    @default(now())
  
  @@index([userId, read])
}
```

---

## 🎨 UI/UX DESIGN PRINCIPLES

### 1. Founder Dashboard Theme

**Color Scheme:**
- Primary: Brand color (same as main site)
- Secondary: Complementary color
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Info: Blue (#3B82F6)

**Typography:**
- Headings: Sora (bold, extrabold)
- Body: Jakarta (regular, medium)
- Monospace: For codes/IDs

### 2. Status Badges

```typescript
const statusConfig = {
  PENDING_REVIEW: {
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
    label: 'Pending Review'
  },
  PUBLISHED: {
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
    label: 'Live'
  },
  REJECTED: {
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
    label: 'Rejected'
  },
  NEEDS_REVISION: {
    color: 'bg-orange-100 text-orange-700',
    icon: AlertCircle,
    label: 'Needs Update'
  },
  DRAFT: {
    color: 'bg-gray-100 text-gray-700',
    icon: Edit,
    label: 'Draft'
  }
};
```

### 3. Responsive Design

**Mobile First:**
- Dashboard cards stack vertically
- Sidebar becomes hamburger menu
- Tables become cards on mobile
- Forms are single column

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## 🔒 SECURITY CONSIDERATIONS

### 1. Authentication Security

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

**Password Hashing:**
```typescript
import bcrypt from 'bcryptjs';

// Hash password
const hashedPassword = await bcrypt.hash(password, 12);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

**Session Security:**
- HttpOnly cookies (prevent XSS)
- Secure flag (HTTPS only)
- SameSite=Strict (prevent CSRF)
- Short expiry (7 days)
- Refresh token rotation

### 2. Data Access Control

**Row-Level Security:**
```typescript
// Founders can only access their own data
async function getStartups(founderId: string) {
  return await prisma.startup.findMany({
    where: {
      ownerId: founderId // Critical: Always filter by owner
    }
  });
}
```

**API Route Protection:**
```typescript
// Middleware to verify founder session
export async function requireFounderAuth(req: Request) {
  const session = await getFounderSession(req);
  
  if (!session || !session.userId) {
    throw new Error('Unauthorized');
  }
  
  return session;
}
```

### 3. Input Validation

**Server-Side Validation:**
```typescript
import { z } from 'zod';

const startupSchema = z.object({
  name: z.string().min(2).max(100),
  tagline: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  website: z.string().url(),
  email: z.string().email(),
  category: z.enum(['AI', 'ML', 'SaaS', 'FinTech', 'HealthTech']),
  // ... more fields
});
```

**XSS Prevention:**
- Sanitize all user inputs
- Use React's built-in XSS protection
- Escape HTML in descriptions
- Validate URLs before rendering

**SQL Injection Prevention:**
- Use Prisma ORM (parameterized queries)
- Never concatenate SQL strings
- Validate all inputs

### 4. Rate Limiting

```typescript
// Limit submissions per founder
const SUBMISSION_LIMIT = {
  startups: 5,  // Max 5 startups per founder
  tools: 10,    // Max 10 tools per founder
  editsPerDay: 10 // Max 10 edits per day
};

// Rate limit API endpoints
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Max 100 requests per window
});
```

---

## 🚀 IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1-2)
- [ ] Create database schema
- [ ] Set up founder authentication
- [ ] Build signup/login pages
- [ ] Email verification system
- [ ] Basic dashboard layout

### Phase 2: Submission System (Week 3-4)
- [ ] Startup submission form
- [ ] Tool submission form
- [ ] File upload (logos, screenshots)
- [ ] Admin review workflow
- [ ] Status management

### Phase 3: Management Features (Week 5-6)
- [ ] Edit functionality
- [ ] Version control
- [ ] Delete/archive listings
- [ ] Profile management
- [ ] Settings page

### Phase 4: Analytics (Week 7-8)
- [ ] View tracking
- [ ] Click tracking
- [ ] Analytics dashboard
- [ ] Charts and graphs
- [ ] Export reports

### Phase 5: Notifications (Week 9-10)
- [ ] Email notification system
- [ ] In-app notifications
- [ ] Notification preferences
- [ ] Weekly reports
- [ ] Real-time updates

### Phase 6: Polish & Launch (Week 11-12)
- [ ] UI/UX refinements
- [ ] Mobile optimization
- [ ] Performance optimization
- [ ] Security audit
- [ ] Beta testing
- [ ] Production launch

---

## 📱 MOBILE APP CONSIDERATIONS

### Future: Native Mobile App

**React Native App:**
- Same backend API
- Native UI components
- Push notifications
- Offline mode
- Camera integration for uploads

**Progressive Web App (PWA):**
- Install on home screen
- Offline functionality
- Push notifications
- Fast loading

---

## 🎯 SUCCESS METRICS

### KPIs to Track

**Founder Engagement:**
- Number of registered founders
- Active founders (logged in last 30 days)
- Submissions per founder
- Edit frequency
- Dashboard visits

**Submission Quality:**
- Approval rate
- Time to approval
- Rejection reasons
- Revision requests

**Platform Growth:**
- New founder signups per week
- Total startups listed
- Total tools listed
- Claimed vs unclaimed listings

**Founder Satisfaction:**
- Net Promoter Score (NPS)
- Support ticket volume
- Feature requests
- Churn rate

---

## 💡 ADVANCED FEATURES (Future)

### 1. Claiming Existing Listings
```
Founder finds their startup (added by admin)
    ↓
Click "Claim This Startup"
    ↓
Verify ownership (email domain match or manual verification)
    ↓
Admin approves claim
    ↓
Founder gains edit access
```

### 2. Team Management
```
Founder invites team members
    ↓
Team members get limited access
    ↓
Roles: Owner, Editor, Viewer
    ↓
Audit log of all changes
```

### 3. Premium Features
```
Free Tier:
- List 2 startups
- List 5 tools
- Basic analytics

Pro Tier ($29/month):
- Unlimited listings
- Advanced analytics
- Priority review
- Featured placement
- API access
```

### 4. API Access
```
Founders can access their data via API
    ↓
Generate API key in settings
    ↓
Use REST API to:
- Get listings
- Update listings
- Get analytics
- Manage profile
```

### 5. Integration Marketplace
```
Connect with:
- Google Analytics
- Slack (notifications)
- Zapier (automation)
- CRM systems
- Email marketing tools
```

---

## 📚 TECHNICAL STACK

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Components:** Radix UI, Headless UI
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts or Chart.js
- **State:** React Context or Zustand

### Backend
- **API:** Next.js API Routes (Server Actions)
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Auth:** NextAuth.js
- **Email:** Resend
- **Storage:** Cloudflare R2

### DevOps
- **Hosting:** Vercel
- **Database:** Neon (PostgreSQL)
- **CDN:** Cloudflare
- **Monitoring:** Sentry
- **Analytics:** Plausible or PostHog

---

## 🎓 BEST PRACTICES

### 1. Code Organization
```
apps/web/
├── app/(founder)/
│   └── [feature]/
│       ├── page.tsx          # UI
│       ├── actions.ts        # Server actions
│       ├── components/       # Feature components
│       └── types.ts          # TypeScript types
```

### 2. Error Handling
```typescript
try {
  const result = await submitStartup(data);
  
  if (!result.success) {
    toast.error(result.error);
    return;
  }
  
  toast.success('Startup submitted!');
  router.push('/founder/dashboard');
  
} catch (error) {
  console.error('Submission error:', error);
  toast.error('Something went wrong. Please try again.');
}
```

### 3. Loading States
```typescript
const [loading, setLoading] = useState(false);

async function handleSubmit() {
  setLoading(true);
  try {
    await submitStartup(data);
  } finally {
    setLoading(false);
  }
}

return (
  <button disabled={loading}>
    {loading ? 'Submitting...' : 'Submit'}
  </button>
);
```

### 4. Optimistic Updates
```typescript
// Update UI immediately, rollback on error
const optimisticUpdate = async () => {
  const previousData = data;
  
  // Update UI
  setData(newData);
  
  try {
    await updateStartup(newData);
  } catch (error) {
    // Rollback on error
    setData(previousData);
    toast.error('Update failed');
  }
};
```

---

## 🎉 CONCLUSION

This architecture provides:
- ✅ Secure founder authentication
- ✅ Self-service submission system
- ✅ Comprehensive dashboard
- ✅ Real-time analytics
- ✅ Admin review workflow
- ✅ Scalable infrastructure
- ✅ Industry-grade security
- ✅ Excellent UX

**Ready for production with room to grow!**

---

**Document Version:** 1.0.0  
**Last Updated:** April 22, 2026  
**Status:** Architecture Complete - Ready for Implementation
