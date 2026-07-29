# Search API

Endpoints for full-text search and autocomplete.

---

## GET /api/search

Global search across tools, startups, and articles.

| Property | Value |
|----------|-------|
| Auth | None |
| Rate Limit | 30 per IP per minute |

**Query Parameters**:
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| q | string | Yes | Search query |
| limit | number | No | Max results per type (default 10) |

**Response (200)**:
```json
{
  "tools": [{ "id": "...", "name": "ChatGPT", "slug": "chatgpt", "tagline": "..." }],
  "startups": [{ "id": "...", "name": "Sarvam AI", "slug": "sarvam-ai", "tagline": "..." }],
  "articles": [{ "id": "...", "title": "Best AI Chatbots 2026", "slug": "..." }]
}
```

**Implementation**: PostgreSQL `tsvector @@ to_tsquery()` with `ts_rank()` ordering.

---

## GET /api/cities/search

City autocomplete for forms.

| Property | Value |
|----------|-------|
| Auth | None |

**Query**: `?q=Hyder`

**Response (200)**:
```json
[
  { "id": "...", "name": "Hyderabad", "state": "Telangana", "country": "India" }
]
```

**Implementation**: `ILIKE` prefix matching on City table, limited to 10 results.
