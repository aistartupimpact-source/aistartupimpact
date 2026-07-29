# Feature: Community Upvotes

## Purpose
Allow authenticated users to upvote AI tools, providing a community signal for tool quality and popularity.

## Architecture
- **API**: `POST /api/tools/[id]/upvote` (toggle), `GET /api/tools/[id]/upvote` (status)
- **Component**: `UpvoteButton` (client component with optimistic UI)
- **Discovery**: "Most Upvoted" section on tools directory

## Business Logic
- Toggle behavior: upvote again = remove upvote (idempotent)
- Anti-gaming: account must be 24+ hours old
- Daily cap: maximum 20 upvotes per user per day
- Threshold: upvote count hidden below 5 (reduces gaming incentive)
- Denormalized: `AiTool.upvoteCount` updated on every toggle for sort performance
- Only approved tools can be upvoted

## Data Flow
1. User clicks upvote button
2. Client sends `POST /api/tools/{slug}/upvote`
3. Server verifies JWT from `user-token` cookie
4. Checks: account age ≥ 24h, daily count < 20
5. Toggle: INSERT or DELETE from `ToolUpvote`
6. Update `AiTool.upvoteCount` (increment/decrement)
7. Return `{ upvoted: boolean, count: number }`
8. UI updates optimistically

## Database
- `ToolUpvote` — Junction table (toolId, userId, createdAt)
- `AiTool.upvoteCount` — Denormalized count for sorting
- Unique constraint: `@@unique([toolId, userId])`

## API
| Method | Path | Auth | Response |
|--------|------|------|----------|
| POST | `/api/tools/[slug]/upvote` | user-token | `{ upvoted, count }` |
| GET | `/api/tools/[slug]/upvote` | Optional | `{ upvoted, count }` |

## Errors
| Status | Condition |
|--------|-----------|
| 401 | Not logged in |
| 403 | Account < 24 hours old |
| 429 | Daily limit (20) exceeded |
| 404 | Tool not found or not approved |

## Key Files
- `apps/web/app/api/tools/[id]/upvote/route.ts` — API route
- `apps/web/components/tools/UpvoteButton.tsx` — UI component
- `apps/web/components/tools/DiscoverySections.tsx` — "Most Upvoted" section
