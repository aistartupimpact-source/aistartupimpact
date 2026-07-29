# Resend

Email delivery service for transactional and newsletter emails.

---

## Configuration

| Property | Value |
|----------|-------|
| Provider | Resend |
| SDK | `resend` npm package |
| Templates | React Email (`@react-email/components`) |
| Location | `apps/api` (Express) + admin actions |

---

## Environment Variables

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=no-reply@aistartupimpact.com
RESEND_FROM_NAME=AI Startup Impact
RESEND_NEWSLETTER_EMAIL=events@aistartupimpact.com
RESEND_NEWSLETTER_NAME=AI Startup Impact Events
RESEND_REPLY_TO=hello@aistartupimpact.com
```

---

## Email Types

| Email | From | Trigger |
|-------|------|---------|
| Tool approved | RESEND_FROM_EMAIL | Admin approves tool |
| Verification OTP | RESEND_FROM_EMAIL | Email verification |
| Event registration | RESEND_NEWSLETTER_EMAIL | User registers |
| Newsletter | RESEND_NEWSLETTER_EMAIL | Scheduled send |
| Password reset | RESEND_FROM_EMAIL | User request |

---

## Domains

Configured in Resend Dashboard:
- `aistartupimpact.com` — verified sending domain
- SPF, DKIM, DMARC records configured in Cloudflare DNS

---

## Rate Limits

| Plan | Emails/day | Emails/second |
|------|-----------|---------------|
| Free | 100 | 1 |
| Pro | 50,000 | 10 |

Newsletter sends are batched to respect rate limits.

---

## Related Documents

- [Email Architecture](../architecture/EMAIL.md) — System design
- [Newsletter Feature](../features/NEWSLETTER.md) — Subscription flow
