# Founder Login/Signup Entry Points

Complete guide to all entry points for founder authentication across the web application.

## Entry Points Summary

### 1. Navigation Bar (Desktop & Mobile)
**Location**: `apps/web/components/layout/Navbar.tsx`

**Desktop**:
- "For Founders" dropdown button in header (brand color)
- Contains 4 options:
  - Founder Login (with Users icon)
  - Create Account (with Star icon)
  - Submit AI Tool
  - List Your Startup

**Mobile**:
- Hamburger menu with prominent CTAs:
  - Founder Login (brand button)
  - Create Account (brand outline button)
  - Submit AI Tool
  - List Your Startup
  - Newsletter

**Visibility**: Always visible on all pages

---

### 2. Home Page CTA Section
**Location**: `apps/web/app/(public)/page.tsx`

**Features**:
- Dedicated "For Founders" section with gradient background
- Headline: "Amplify Your AI Startup's Reach"
- 3 benefit cards:
  - Real-Time Analytics
  - Premium Visibility
  - Easy Management
- Two prominent CTAs:
  - Create Free Account (brand button with Star icon)
  - Founder Login (brand outline button with Users icon)
- Trust badge: "Trusted by 500+ AI founders across India"

**Visibility**: Visible on homepage, positioned before footer

---

### 3. Footer
**Location**: `apps/web/components/layout/Footer.tsx`

**Features**:
- "For Founders" section in footer links
- Highlighted links in brand color with semibold font:
  - Founder Login
  - Create Account
- Additional links:
  - Submit Tool
  - List Startup
  - Dashboard

**Visibility**: Always visible on all pages

---

## User Journey

### New Founder (First Time)
1. **Discovery**: See "For Founders" in navbar or home page CTA section
2. **Click**: "Create Account" button
3. **Signup**: Fill form at `/auth/signup`
4. **Verify**: Email verification (auto-verified in dev mode)
5. **Access**: Redirected to founder dashboard

### Returning Founder
1. **Click**: "Founder Login" from navbar, home page, or footer
2. **Login**: Enter credentials at `/auth/login`
3. **Access**: Redirected to founder dashboard

### Founder Wanting to Submit
1. **Click**: "Submit Tool" or "List Startup" from navbar or footer
2. **Auth Check**: If not logged in, redirected to login
3. **Form**: After login, redirected to submission form
4. **Submit**: Form submitted and visible in dashboard

---

## Design Principles

### Visibility
- Multiple entry points ensure founders can always find login/signup
- Navbar dropdown provides quick access without cluttering header
- Home page CTA section provides context and benefits
- Footer links serve as fallback for users scrolling to bottom

### Hierarchy
1. **Primary**: Navbar "For Founders" dropdown (always visible)
2. **Secondary**: Home page CTA section (conversion-focused)
3. **Tertiary**: Footer links (fallback)

### Consistency
- Brand color (#EF4444) used for all founder-related CTAs
- Icons used consistently:
  - Users icon for login
  - Star icon for signup
  - TrendingUp for analytics
  - Sparkles for visibility
  - Zap for management

### Mobile-First
- Mobile hamburger menu prioritizes founder CTAs at top
- Home page CTA section fully responsive
- Footer links stack properly on mobile

---

## Technical Implementation

### Authentication Flow
- JWT-based authentication with httpOnly cookies
- 7-day session expiry
- Secure password hashing with bcrypt
- Email verification system
- Protected routes under `/founder/*`

### Session Management
- `founder-auth.ts` library handles all auth operations
- `requireFounderAuth()` middleware for protected routes
- Session-only checks (no database lookups for performance)

### Security Features
- CSRF protection
- XSS protection
- Company email validation (no Gmail, Yahoo, etc.)
- Rate limiting on auth endpoints

---

## Analytics & Tracking

Founders can track:
- Views on their listings
- Clicks on their links
- Engagement metrics
- Month-over-month growth
- Top performing listings

All accessible from `/founder/analytics`

---

## Related Files

### Authentication
- `apps/web/app/auth/signup/page.tsx` - Signup page
- `apps/web/app/auth/login/page.tsx` - Login page
- `apps/web/app/auth/verify/page.tsx` - Email verification
- `apps/web/lib/founder-auth.ts` - Auth library

### API Routes
- `apps/web/app/api/founder/auth/signup/route.ts`
- `apps/web/app/api/founder/auth/login/route.ts`
- `apps/web/app/api/founder/auth/logout/route.ts`
- `apps/web/app/api/founder/auth/verify/route.ts`

### Founder Portal
- `apps/web/app/founder/dashboard/page.tsx` - Main dashboard
- `apps/web/app/founder/analytics/page.tsx` - Analytics
- `apps/web/app/founder/profile/page.tsx` - Profile settings
- `apps/web/app/founder/settings/page.tsx` - Account settings

---

## Future Enhancements

### Potential Additions
1. Google OAuth integration (already configured in `.env`)
2. LinkedIn OAuth for professional verification
3. Onboarding wizard for new founders
4. Referral program for founder acquisition
5. Premium tier with enhanced features

### A/B Testing Opportunities
1. CTA button text variations
2. Home page section positioning
3. Benefit messaging
4. Trust badge numbers
5. Icon choices

---

Last Updated: April 24, 2026
Status: Production Ready ✅
