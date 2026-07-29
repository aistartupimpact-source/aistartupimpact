# Feature: Tool Comparison

## Purpose
Side-by-side comparison of AI tools to help users make informed decisions.

## Architecture
- **Web app**: Comparison page at `/tools/compare/[slugs]` (comma-separated slugs)
- **Directory**: "Compare" label on tool cards to add to comparison

## Business Logic
- Compare 2–4 tools simultaneously
- Displays: pricing, features, ratings, pros/cons, categories, tags
- URL-based state (shareable comparison links)
- SEO page generated per comparison pair
- Only approved tools can be compared

## Database
- No dedicated table — comparison reads from `AiTool` + related tables
- `ToolAlternative` — Pre-linked alternatives shown as suggestions

## Key Files
- `apps/web/app/(public)/tools/compare/[slugs]/page.tsx`
- `apps/web/components/ToolsListWithComparison.tsx` — Compare label on cards
