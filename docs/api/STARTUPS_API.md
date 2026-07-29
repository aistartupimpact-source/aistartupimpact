# Startups API

Endpoints for startup directory interactions.

---

## GET /api/startups

Search and filter startups.

| Property | Value |
|----------|-------|
| Auth | None |

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| q | string | Search query (full-text) |
| category | string | Business sector filter |
| businessType | string | Business type filter |
| stage | StartupStage | Funding stage filter |
| status | CompanyStatus | Company status filter |
| city | string | Headquarters city |
| country | "India" \| "International" | Country filter |
| employeeRange | string | "1-10", "11-50", "51-200", "201-500", "500+" |

**Response (200)**:
```json
{
  "startups": [{ "id": "...", "name": "...", "slug": "...", "tagline": "...", ... }],
  "total": 278
}
```

---

## POST /api/startups/[id]/save

Bookmark a startup.

| Property | Value |
|----------|-------|
| Auth | Required (`user-token`) |

**Response (200)**: `{ "saved": true }` or `{ "saved": false }` (toggle)

---

## POST /api/startups/submit

Submit a new startup for listing.

| Property | Value |
|----------|-------|
| Auth | Required (creates founder profile) |

**Request**:
```json
{
  "name": "AI Company",
  "tagline": "Building the future of AI",
  "description": "...",
  "websiteUrl": "https://aicompany.com",
  "headquartersCity": "Bengaluru",
  "stage": "SEED",
  "category": "Healthcare"
}
```

**Response (201)**: `{ "success": true, "slug": "ai-company" }`

Startup enters as `isApproved = false` (pending admin review).

---

## Founder Startup Endpoints

### GET /api/founder/startups
List startups owned by the authenticated founder.

### PUT /api/founder/startups/[id]
Update owned startup details.

| Property | Value |
|----------|-------|
| Auth | Required (`founder-token`) |
| Ownership | Must be startup owner |
