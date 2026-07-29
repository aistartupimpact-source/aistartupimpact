# Feature: AI Tool Directory

## Purpose
A curated directory of AI tools with search, filters, categories, tags, reviews, upvotes, and comparison — helping users discover the right AI tools for their needs.

## Architecture
- **Web app**: Public listing (`/tools`), detail pages (`/tools/[slug]`), comparison (`/tools/compare/[slugs]`)
- **Admin app**: Tool CRUD, approval queue, bulk actions, tag/category management
- **Founder dashboard**: Submit tool, edit owned tools, view analytics, respond to reviews

## Business Logic
- Tools start as `PENDING` → admin approves → `APPROVED` (visible publicly)
- Listing tiers: FREE, PRIORITY (boosted sort), FEATURED (highlighted)
- Pricing models: FREE, FREEMIUM, PAID, ENTERPRISE, OPEN_SOURCE
- Upvote threshold: count hidden below 5 upvotes
- DNS verification: founders prove tool ownership via TXT record

## Data Flow
1. Founder submits tool → status=PENDING
2. Admin reviews and approves → status=APPROVED, email sent to founder
3. Tool appears in public directory
4. Users can upvote, review, bookmark, compare
5. Founder sees analytics (clicks, bookmarks, reviews, upvotes)

## Database
- `AiTool` — Core listing (80+ columns)
- `ToolCategory` — Hierarchical categories (21 parents, 306 subcategories)
- `ToolTagGroup` — 12 tag groups
- `ToolSystemTag` — 254 tags
- `ToolSystemTagMapping` — Tool ↔ Tag junction
- `ToolReview` + `ToolReviewResponse`
- `ToolUpvote`, `ToolPro`, `ToolCon`, `ToolUseCase`
- `ToolAlternative` — Bidirectional alternatives
- `AffiliateClick`, `ToolTraffic`, `SavedTool`

## Permissions
| Role | View | Create | Edit | Delete | Approve |
|------|------|--------|------|--------|---------|
| Public | ✓ (approved) | ✗ | ✗ | ✗ | ✗ |
| Founder | ✓ | ✓ (submit) | Own | ✗ | ✗ |
| Admin | ✓ (all) | ✓ | ✓ | SUPER_ADMIN | ✓ |

## Key Files
- `apps/web/app/(public)/tools/page.tsx` — Listing page
- `apps/web/app/(public)/tools/[slug]/page.tsx` — Detail page
- `apps/web/components/ToolsListWithComparison.tsx` — Directory UI
- `apps/web/components/tools/UpvoteButton.tsx` — Upvote component
- `apps/web/app/api/tools/[id]/upvote/route.ts` — Upvote API
- `apps/admin/app/(dashboard)/tools-dir/` — Admin management
- `apps/admin/app/(dashboard)/tools-dir/tags/` — Tag CRUD
- `apps/admin/app/(dashboard)/tools-dir/categories/` — Category CRUD
