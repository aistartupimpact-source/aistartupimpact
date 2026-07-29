# Feature: Newsletter

## Purpose
Weekly AI ecosystem newsletter delivered to 5,000+ subscribers with funding rounds, founder stories, and tool releases.

## Architecture
- **Web app**: Subscribe form (footer, dedicated page, popup)
- **API**: Subscribe/unsubscribe endpoints
- **Admin**: Campaign creation, subscriber management, delivery
- **Express API**: Batch sending via Resend

## Business Logic
- Subscribe: email validated, stored with source attribution
- Double opt-in: not currently enforced (single opt-in)
- Unsubscribe: one-click link in every email, sets `isActive = false`
- Delivery: batch sending respecting Resend rate limits
- Sources tracked: footer, popup, dedicated page, event registration

## Database
- `NewsletterSubscriber` — email, isActive, source, createdAt
- `NewsletterCampaign` — subject, content, status, scheduledAt
- `NewsletterDelivery` — campaign ↔ subscriber delivery status

## API
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/newsletter/subscribe` | None | Subscribe email |
| GET | `/api/newsletter/unsubscribe?token=...` | Token | Unsubscribe |

## Rate Limiting
- Subscribe: 5 per IP per hour

## Key Files
- `apps/web/app/api/newsletter/subscribe/route.ts`
- `apps/web/components/SubscribeForm.tsx`
- `apps/web/components/layout/Footer.tsx` — Footer subscribe
- `apps/admin/app/(dashboard)/newsletter-admin/`
