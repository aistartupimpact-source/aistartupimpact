# Feature: Founder Dashboard

## Purpose
Self-service dashboard for founders to manage their startups, tools, analytics, and profile.

## Architecture
- **Web app**: `/founder/*` route group (protected by founder-token)
- **Auth**: Google OAuth → JWT in `founder-token` cookie
- **Middleware**: Onboarding enforcement (redirect if not completed)

## Key Features
- **Onboarding**: Multi-step profile setup on first login
- **Startup Management**: Edit owned startups, claim unclaimed ones
- **Tool Management**: Submit tools, edit, view status, DNS verification
- **Analytics**: Per-tool metrics (clicks, bookmarks, reviews, upvotes, daily chart)
- **Review Responses**: View and respond to community reviews
- **Profile**: Edit founder profile
- **Settings**: Account settings

## Business Logic
- Founder can only edit resources they own (`ownerId` check)
- Tool submission: enters as PENDING, requires admin approval
- DNS verification: proves domain ownership → verified badge
- Analytics show last 30 days with daily granularity

## Auth Flow
1. Founder clicks "Sign in with Google"
2. OAuth flow → JWT created with userId, email, onboardingCompleted
3. Cookie set: `founder-token` (HttpOnly, 30 days)
4. Middleware checks `onboardingCompleted` → redirect if false
5. Dashboard accessible after onboarding

## Key Files
- `apps/web/app/founder/` — All founder pages
- `apps/web/app/founder/tools/[slug]/analytics/page.tsx` — Tool analytics
- `apps/web/lib/founder-auth.ts` — Auth helpers
- `apps/web/middleware.ts` — Onboarding enforcement
- `apps/web/components/founder/` — Founder UI components
