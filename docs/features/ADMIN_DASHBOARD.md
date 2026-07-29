# Feature: Admin Dashboard

## Purpose
Internal dashboard for content management, moderation, analytics, and platform administration.

## Architecture
- **App**: `apps/admin` (Next.js, port 3001)
- **Auth**: NextAuth with Google OAuth (only pre-registered users)
- **Roles**: 7 roles with RBAC permissions

## Key Features
- **Content Management**: Articles, stories, news (rich text editor)
- **Directory Management**: Startups + Tools CRUD with approval queues
- **Bulk Actions**: Approve/reject/delete multiple items at once
- **Tag & Category Management**: Tool tags (12 groups, 254 tags), categories
- **Event Management**: Event oversight
- **Funding Rounds**: Add/edit funding data
- **User Management**: Admin user roles, delegated delete access
- **Media Library**: Upload/manage images
- **Newsletter**: Campaign creation, subscriber management
- **Analytics**: Platform metrics, traffic
- **Activity Log**: Team activity with IST timestamps
- **Hero Slots**: Homepage hero section management
- **Duplicate Detection**: Find duplicate startups/tools

## Security
- Delete restricted to SUPER_ADMIN (with delegated grants)
- All destructive actions require typing "DELETE" to confirm
- All actions logged in AuditLog table
- Permission denied modal shown for unauthorized actions

## Key Files
- `apps/admin/app/(dashboard)/` — All admin pages (32 route folders)
- `apps/admin/lib/auth.ts` — NextAuth configuration
- `apps/admin/lib/audit-log.ts` — Audit logging + permission helpers
- `apps/admin/lib/cache-invalidate.ts` — Redis cache invalidation
- `apps/admin/components/layout/` — Sidebar, Header
