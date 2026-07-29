# Tools API

Endpoints for AI tool interactions.

---

## POST /api/tools/[slug]/upvote

Toggle upvote on an AI tool.

| Property | Value |
|----------|-------|
| Auth | Required (`user-token` cookie) |
| Rate Limit | 20/user/day |
| Idempotent | Yes (toggle: call twice = undo) |

**Request**: No body required.

**Response (200)**:
```json
{ "upvoted": true, "count": 42 }
// or
{ "upvoted": false, "count": 41 }
```

**Errors**:
| Status | Error | Condition |
|--------|-------|-----------|
| 401 | "Login required to upvote" | No valid token |
| 403 | "Account must be at least 24 hours old" | New account |
| 429 | "Daily limit reached (20/day)" | Cap exceeded |
| 404 | "Tool not found" | Invalid slug or not approved |

---

## GET /api/tools/[slug]/upvote

Get upvote status and count.

| Property | Value |
|----------|-------|
| Auth | Optional (returns `upvoted` status if logged in) |

**Response (200)**:
```json
{ "upvoted": false, "count": 42 }
```

---

## POST /api/tools/[id]/click

Track outbound click to tool website.

| Property | Value |
|----------|-------|
| Auth | None |

**Request**:
```json
{ "source": "TOOL_DETAIL" }
```

Source values: `TOOL_DETAIL`, `DIRECTORY`, `HOMEPAGE`, `SEARCH`, `RELATED`, `COMPARISON`

---

## GET /api/tools/[id]/reviews

Get reviews for a tool.

| Property | Value |
|----------|-------|
| Auth | None |

**Response (200)**:
```json
{
  "reviews": [
    {
      "id": "...",
      "rating": 5,
      "title": "Great tool",
      "body": "...",
      "userName": "John D.",
      "createdAt": "2025-01-15T10:30:00Z",
      "response": { "body": "Thanks!", "createdAt": "..." }
    }
  ]
}
```

---

## POST /api/tools/[id]/reviews

Submit a review.

| Property | Value |
|----------|-------|
| Auth | Required (`user-token`) |
| Limit | One per user per tool |

**Request**:
```json
{
  "rating": 5,
  "title": "Excellent AI tool",
  "body": "Detailed review text..."
}
```

**Errors**:
| Status | Error | Condition |
|--------|-------|-----------|
| 401 | Unauthorized | Not logged in |
| 400 | Validation | Missing fields or invalid rating |
| 409 | Already reviewed | Duplicate review |

---

## POST /api/founder/tools/[id]/verify

DNS domain verification for tool ownership.

| Property | Value |
|----------|-------|
| Auth | Required (`founder-token`) |
| Ownership | Must be tool owner |

**Flow**: System checks DNS TXT records for `aistartupimpact-verify={token}`

**Response (200)**:
```json
{ "verified": true, "domain": "example.com" }
// or
{ "verified": false, "error": "TXT record not found" }
```
