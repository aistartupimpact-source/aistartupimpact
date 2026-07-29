# Feature: AI Startup Directory

## Purpose
A structured, searchable directory of AI startups with profiles, funding data, verification, and categories — giving promising startups visibility.

## Architecture
- **Web app**: Listing (`/startups`), detail (`/startups/[slug]`), submit (`/startups/submit`)
- **Admin app**: Startup CRUD, approval, bulk actions, city/category management
- **Founder dashboard**: Claim startup, edit profile, DNS verification

## Business Logic
- Startups require `isApproved = true` to appear publicly
- Soft deleted via `deletedAt` (not permanently removed)
- 32 business sectors + 10 business types
- Stages: BOOTSTRAPPED → IDEA → PRE_SEED → SEED → SERIES_A → ... → PUBLIC
- Status: ACTIVE, PUBLIC, ACQUIRED, INACTIVE
- Claim flow: founder claims → admin verifies → CLAIMED status
- DNS verification: TXT record proves domain ownership → verified badge

## Data Flow
1. Startup submitted (by founder or admin)
2. Admin approves (`isApproved = true`)
3. Public listing shows startup with funding, stage, team info
4. Founder can claim → edit profile → verify domain
5. Users can bookmark, review, discover via search/filters

## Database
- `Startup` — Core profile (50+ columns including searchVector)
- `FundingRound` — Investment history (amount, round type, investors)
- `StartupBusinessCategory` — 32 sector reference
- `StartupBusinessType` — 10 type reference
- `StartupReview`, `StartupFAQ`, `SavedStartup`
- `StartupVerificationLog` — DNS verification audit
- `City` — Location reference (linked via cityId)
- `FeaturedCampaign` — Promoted listings

## Permissions
| Role | View | Create | Edit | Delete | Approve |
|------|------|--------|------|--------|---------|
| Public | ✓ (approved) | Submit | ✗ | ✗ | ✗ |
| Founder | ✓ | ✓ | Own (claimed) | ✗ | ✗ |
| Admin | ✓ (all) | ✓ | ✓ | SUPER_ADMIN | ✓ |

## Key Files
- `apps/web/app/(public)/startups/page.tsx` — Listing with filters
- `apps/web/app/(public)/startups/[slug]/page.tsx` — Detail page
- `apps/web/components/StartupSearch.tsx` — Search/filter UI
- `apps/admin/app/(dashboard)/startups-dir/manage/` — Admin management
- `apps/web/app/founder/startups/` — Founder dashboard
- `apps/web/lib/categories.ts` — Category data helpers
