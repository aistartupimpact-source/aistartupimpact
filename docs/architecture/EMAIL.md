# Email Architecture

Transactional and newsletter email delivery using Resend.

---

## Provider

| Property | Value |
|----------|-------|
| Service | Resend |
| SDK | `resend` npm package |
| Templates | React Email (`@react-email/components`) |
| Location | `apps/api` (Express server) |

---

## Email Types

| Type | Trigger | From Address |
|------|---------|-------------|
| Tool Approved | Admin approves a tool | `RESEND_FROM_EMAIL` |
| Startup Claimed | Founder claims startup | `RESEND_FROM_EMAIL` |
| Event Registration | User registers for event | `RESEND_NEWSLETTER_EMAIL` |
| Verification OTP | Email verification | `RESEND_FROM_EMAIL` |
| Newsletter | Weekly scheduled send | `RESEND_NEWSLETTER_EMAIL` |
| Password Reset | User requests reset | `RESEND_FROM_EMAIL` |

---

## Configuration

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=no-reply@aistartupimpact.com
RESEND_FROM_NAME=AI Startup Impact
RESEND_NEWSLETTER_EMAIL=events@aistartupimpact.com
RESEND_NEWSLETTER_NAME=AI Startup Impact Events
RESEND_REPLY_TO=hello@aistartupimpact.com
```

---

## Sending Pattern

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
  to: recipient.email,
  subject: 'Your AI Tool has been approved!',
  html: renderEmailTemplate(data),
  replyTo: process.env.RESEND_REPLY_TO,
});
```

---

## Newsletter Delivery

1. Admin creates campaign in newsletter admin panel
2. Subscribers fetched: `WHERE isActive = true`
3. Emails sent in batches (respecting Resend rate limits)
4. Delivery tracked in `NewsletterDelivery` table
5. Unsubscribe link included in every email

### Unsubscribe
- One-click unsubscribe via `/api/newsletter/unsubscribe?token=...`
- Sets `isActive = false` on `NewsletterSubscriber`
- Token is signed to prevent unauthorized unsubscribes

---

## Error Handling

- Resend API failures are caught and logged
- Failed sends don't block the main operation (fire-and-forget for non-critical)
- Critical emails (OTP, verification) retry once on failure
- Delivery status tracked for newsletters

---

## Related Documents

- [Backend Overview](../backend/OVERVIEW.md) — Where email sending lives
- [Infrastructure: Resend](../infrastructure/RESEND.md) — Service configuration
