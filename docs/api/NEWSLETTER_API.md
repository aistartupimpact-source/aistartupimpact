# Newsletter API

Endpoints for newsletter subscription management.

---

## POST /api/newsletter/subscribe

Subscribe an email address to the newsletter.

| Property | Value |
|----------|-------|
| Auth | None |
| Rate Limit | 5 per IP per hour |

**Request**:
```json
{ "email": "user@example.com", "source": "footer" }
```

Source values: `footer`, `popup`, `page`, `event`

**Response (200)**: `{ "success": true }`

**Errors**:
| Status | Error |
|--------|-------|
| 400 | "Invalid email" |
| 409 | "Already subscribed" |
| 429 | "Rate limited" |

---

## GET /api/newsletter/unsubscribe

One-click unsubscribe via signed token.

| Property | Value |
|----------|-------|
| Auth | Signed token in query |

**Query**: `?token=signed-token-here`

**Response**: Redirect to unsubscribe confirmation page, sets `isActive = false`.
