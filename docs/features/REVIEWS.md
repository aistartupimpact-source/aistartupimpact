# Feature: Tool Reviews & Responses

## Purpose
Community reviews on AI tools with rating, title, body — plus founder ability to respond.

## Architecture
- **Web app**: Review submission on tool detail page, display under tool
- **Founder dashboard**: View reviews, respond to them
- **Admin app**: Review moderation, spam flagging

## Business Logic
- One review per user per tool (unique constraint)
- Rating: 1–5 stars (integer)
- Status: PENDING → APPROVED (or REJECTED/FLAGGED)
- AI spam scoring: `aiSpamScore` field for automated detection
- Founders can respond once per review (`ToolReviewResponse`)
- Average rating recalculated and stored on `AiTool.avgRating`
- Review count on `AiTool.reviewCount` (denormalized)

## Database
- `ToolReview` — id, toolId, userId, rating, title, body, status, aiSpamScore
- `ToolReviewResponse` — id, reviewId, founderId, body, createdAt

## Permissions
| Role | Submit | View | Respond | Moderate |
|------|--------|------|---------|----------|
| Public User | ✓ (one per tool) | ✓ | ✗ | ✗ |
| Founder | ✗ | ✓ | Own tools | ✗ |
| Admin | ✗ | ✓ | ✗ | ✓ |

## Key Files
- `apps/web/app/api/tools/[id]/reviews/route.ts` — Submit/get reviews
- `apps/admin/components/shared/ProsConsManager.tsx` — Admin review of pros/cons
- `apps/web/app/founder/tools/[slug]/` — Founder view + respond
