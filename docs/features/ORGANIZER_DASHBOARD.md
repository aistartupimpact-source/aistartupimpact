# Feature: Organizer Dashboard

## Purpose
Dashboard for event organizers to create events, manage registrations, and build their organization profile.

## Architecture
- **Web app**: `/organizer/*` route group (protected by organizer_session)
- **Auth**: Email/password login → JWT in `organizer_session` cookie

## Key Features
- **Event Creation**: Create events with full details (date, location, agenda)
- **Registration Management**: View attendees, export lists
- **Organization Profile**: Company name, logo, description
- **Team Management**: Add/remove team members
- **On-Site Tools**: QR check-in for attendees (future)
- **Promote**: Feature event (currently locked — returns 403, future Pro)
- **Settings**: Account settings

## Security Audit
- All API routes have auth checks
- Promote API returns 403 (locked)
- Sidebar shows "Promote" with "Pro" badge (no action)
- Organizer can only access own events and organization

## Key Files
- `apps/web/app/organizer/` — All organizer pages
- `apps/web/lib/organizer-auth/index.ts` — Auth helpers
- `apps/web/components/organizer/OrganizerSidebar.tsx`
- `apps/web/app/api/organizer/promote/route.ts` — Locked (403)
