# Event Platform — Architecture & Implementation Guide

## Overview

The Event Platform is a growth engine for AI Startup Impact. Every event registration feeds the newsletter, every attendee's location becomes a targeting signal, and every interaction deepens relationships with the AI community.

## Three Growth Loops

1. **Events attract registrations** — public discovery + SEO + geo-targeted emails
2. **Registrations grow subscribers** — consent-first newsletter opt-in at registration
3. **Subscribers drive attendance** — geo-targeted event announcements to nearby interested people

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | Neon PostgreSQL + Prisma ORM |
| Auth | NextAuth v4 (Google OAuth, JWT strategy) |
| Email | Resend + React Email |
| File Storage | Cloudflare R2 (presigned URLs) |
| Rate Limiting | Upstash Redis (@upstash/ratelimit) |
| Geo Queries | PostgreSQL `earthdistance` + `cube` extensions |
| Search | PostgreSQL full-text search (GIN index) |
| Error Tracking | Sentry |
| Analytics | PostHog + Vercel Analytics |
| Maps | Leaflet + OpenStreetMap (free) |
| Location Dropdown | Existing Mapbox city autocomplete |
| Payments | Stub only (Razorpay/Stripe) — all events are free |

## Key Architectural Decisions

### Registration Count — PostgreSQL Trigger
The `registration_count` on the events table is maintained by a database trigger, not application code. This prevents drift if the app crashes between inserting a registration and updating the count.

### Soft Deletes
All major tables use `deleted_at` columns. Queries filter `WHERE deleted_at IS NULL`. This preserves audit trails and analytics data.

### Normalized Tag Taxonomy
A `tags` reference table with canonical names prevents duplicate/near-duplicate interests on subscribers (e.g., "LLM" and "GenAI" both map to canonical "Large Language Models").

### Registration Answers — Separate Table
Custom question answers are stored in a `registration_answers` table (not JSONB) for queryable analytics across events.

### QR Tokens — Short Base62
QR tokens are 16 characters base62 (not 64 hex from randomBytes(32)) for compact, scannable QR codes on phone screens.

### Capacity Race Condition
Registration uses `SELECT ... FOR UPDATE` on the event row within a transaction to prevent overselling the last spot.

### Newsletter Consent
- Stores exact checkbox copy + version number
- Respects prior unsubscribes (never re-subscribes)
- GDPR-aware: unchecked default for EU visitors
- One-click unsubscribe via signed token (no login required)

### Rate Limiting
- Registration: 10 req/15 min per IP
- Search: 60 req/min per IP
- Newsletter subscribe: 5 req/hour per IP
- Event creation: 10/hour per user
- Campaign sending: 5/day per organizer

## Environment Variables (Events-specific)

```bash
# Already configured
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
RESEND_API_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=

# New for events
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

## Database Extensions Required

```sql
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "earthdistance";
```

These are supported on Neon and enable `earth_distance()` + `ll_to_earth()` for radius queries on subscriber locations.

## Phase Implementation Order

0. ✅ Infrastructure (CI/CD, Sentry, rate limiting)
1. Database schema + auth roles for events
2. Event creation (multi-step form)
3. Event listing & discovery (grid + filters)
4. Event detail page
5. Registration + newsletter capture
6. Newsletter geo-targeting + campaigns
7. Organizer dashboard
8. Attendee features
9. Testing & hardening

## Payments Note

Stripe/Razorpay integration is stubbed — all events are free. The `ticket_tiers` table exists but payment flow is not implemented. When paid events are needed, add Stripe Checkout + webhook handler.
