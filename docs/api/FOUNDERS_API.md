# Founders API

Endpoints for founder self-service operations.

---

## Authentication

All founder endpoints require `founder-token` cookie (JWT via Google OAuth).

---

## GET /api/founder/tools

List tools owned by the authenticated founder.

**Response (200)**:
```json
[{ "id": "...", "name": "...", "slug": "...", "status": "APPROVED", "upvoteCount": 12 }]
```

---

## POST /api/founder/tools

Submit a new tool for review.

**Request**:
```json
{
  "name": "My AI Tool",
  "tagline": "Short description",
  "description": "Full description...",
  "websiteUrl": "https://example.com",
  "categoryId": "category-id",
  "pricingModel": "FREEMIUM"
}
```

**Response (201)**: `{ "success": true, "slug": "my-ai-tool" }`

Tool enters as status=PENDING. Admin must approve.

---

## PUT /api/founder/tools/[id]

Update an owned tool.

**Ownership check**: `tool.ownerId === session.userId`

---

## GET /api/founder/startups

List startups owned by the authenticated founder.

---

## PUT /api/founder/startups/[id]

Update an owned startup.

---

## POST /api/founder/tools/[id]/verify

DNS domain verification. See [Verification feature](../features/VERIFICATION.md).

---

## GET /api/founder/tools/[slug]/analytics

Get analytics for an owned tool (clicks, bookmarks, reviews, upvotes, daily chart).

**Response (200)**:
```json
{
  "totalClicks": 1542,
  "totalBookmarks": 89,
  "totalReviews": 12,
  "totalUpvotes": 45,
  "dailyData": [{ "date": "2025-07-01", "clicks": 42, "upvotes": 3 }]
}
```
