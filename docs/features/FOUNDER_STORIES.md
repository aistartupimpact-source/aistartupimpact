# Feature: Founder Stories

## Purpose
In-depth editorial profiles of AI startup founders — their journeys, decisions, and lessons.

## Architecture
- **Web app**: Stories listing (`/stories`), detail page (`/stories/[slug]`)
- **Admin app**: Article CRUD with rich text editor, co-authors, SEO fields

## Business Logic
- Stories are a subset of Articles with `type = 'STORY'`
- Workflow: DRAFT → IN_REVIEW → APPROVED → PUBLISHED
- Can be scheduled for future publication
- Rich text content stored as JSON (editor format)
- SEO: custom title, description, focus keyword, OG image
- Author attribution with co-author support
- Featured/pinned stories for homepage placement
- View count tracked per article

## Database
- `Article` — type=STORY, content (JSON), authorId, status, publishedAt
- `ArticleCoAuthor` — article ↔ user junction
- `ArticleTag` — article ↔ tag junction
- `ArticleVersion` — Edit history
- `Comment` — Reader comments

## Key Files
- `apps/web/app/(public)/stories/page.tsx` — Listing
- `apps/web/app/(public)/stories/[slug]/page.tsx` — Detail
- `apps/admin/app/(dashboard)/articles/` — Article management
