# Feature: AI Events Platform

## Purpose
A platform for discovering, creating, and managing AI events — conferences, hackathons, meetups, and workshops.

## Architecture
- **Web app**: Event listing (`/events`), detail page (`/events/[slug]`), registration
- **Organizer dashboard**: Create/edit events, manage registrations, team
- **Admin app**: Event oversight, approval

## Business Logic
- Organizers create events with date, location, agenda, pricing
- Events can be free or paid (pricing info displayed)
- Users register via authenticated flow
- Registration tracked in `EventRegistration` table
- Events have: date range, location (city), format (online/offline/hybrid)
- Organizer has organization profile + team members
- Promote feature is locked (returns 403 — future Pro feature)

## Data Flow
1. Organizer signs up → creates organization profile
2. Creates event with details (title, date, location, description, agenda)
3. Event appears in public listing
4. Users browse/search events → register
5. Organizer sees registrations, manages attendees

## Database
- `Event` — Core event listing
- `EventRegistration` — User registrations
- `EventOrganizer` — Organizer accounts
- `OrganizationProfile` — Organization details
- `City` — Event location

## Permissions
| Role | View | Create | Edit | Delete |
|------|------|--------|------|--------|
| Public | ✓ | ✗ | ✗ | ✗ |
| User | ✓ | ✗ (register) | ✗ | ✗ |
| Organizer | ✓ | ✓ | Own | ✗ |
| Admin | ✓ | ✓ | ✓ | SUPER_ADMIN |

## Key Files
- `apps/web/app/(public)/events/page.tsx` — Listing
- `apps/web/app/(public)/events/[slug]/page.tsx` — Detail
- `apps/web/app/(public)/events/[slug]/EventDetailClient.tsx` — Client interactions
- `apps/web/app/organizer/` — Organizer dashboard
- `apps/web/lib/organizer-auth/` — Organizer auth
- `docs/EVENT_PLATFORM.md` — Extended event documentation
