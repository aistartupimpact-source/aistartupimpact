# Feature: Editor Collections

## Purpose
Curated lists of AI tools grouped by theme (e.g., "Best AI Writing Tools", "Top Coding Assistants") — managed by editors.

## Architecture
- **Admin app**: Collection CRUD at `/tools-dir/collections/`
- **Web app**: Collection display as "Editor's Picks" discovery section

## Business Logic
- Collections are manually curated by admin editors
- Each collection: title, description, slug, tools list (ordered)
- Collections appear in discovery sections and can have dedicated landing pages
- Tools in collections get a boost in visibility

## Database
- Collection metadata stored with tool references
- Cached in Redis: `tool:editors-picks`

## Key Files
- `apps/admin/app/(dashboard)/tools-dir/collections/`
- `apps/web/components/tools/DiscoverySections.tsx`
