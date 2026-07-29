# Media API

Endpoints for file upload and management.

---

## POST /api/media/upload

Upload a file to Cloudflare R2.

| Property | Value |
|----------|-------|
| Auth | Required (Founder or Admin) |
| Rate Limit | 10 per user per hour |
| Max Size | 5MB |

**Request**: `multipart/form-data` with file field

**Allowed Types**: `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`

**Response (200)**:
```json
{ "url": "https://media.aistartupimpact.com/media/1706123456-logo.png", "key": "media/1706123456-logo.png" }
```

**Errors**:
| Status | Error |
|--------|-------|
| 400 | "File type not allowed" |
| 400 | "File too large (max 5MB)" |
| 401 | "Unauthorized" |
| 500 | "Upload failed" |

---

## DELETE /api/media/[key]

Delete a file from R2.

| Property | Value |
|----------|-------|
| Auth | Admin only (SUPER_ADMIN) |

**Response (200)**: `{ "success": true }`
