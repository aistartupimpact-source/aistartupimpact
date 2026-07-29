# Storage Architecture

Media and file storage using Cloudflare R2.

---

## Overview

| Property | Value |
|----------|-------|
| Provider | Cloudflare R2 (S3-compatible) |
| Access | AWS SDK v3 (`@aws-sdk/client-s3`) |
| Public URL | `R2_PUBLIC_URL` (CDN-served) |
| Egress | Free (R2 has no egress charges) |
| Max file size | 5MB (application-enforced) |

---

## Use Cases

| Content Type | Stored As | Example |
|-------------|-----------|---------|
| Startup logos | `/startups/{id}/logo.{ext}` | Company logo (PNG, WebP) |
| Tool logos | `/tools/{id}/logo.{ext}` | Tool icon/logo |
| Tool screenshots | `/tools/{id}/screenshots/{n}.{ext}` | Product screenshots |
| Event banners | `/events/{id}/banner.{ext}` | Event cover image |
| Founder photos | `/founders/{id}/photo.{ext}` | Profile photo |
| Article images | `/articles/{id}/{filename}` | Cover + inline images |
| Media library | `/media/{timestamp}-{name}` | General uploads |

---

## Upload Flow

```
Client (form) → POST /api/media/upload
  │
  ├─ Validate file type (whitelist)
  ├─ Validate file size (< 5MB)
  │
  ▼
  Generate key: media/{timestamp}-{sanitizedName}
  │
  ▼
  S3 PutObject → Cloudflare R2 bucket
  │
  ▼
  Return public URL: {R2_PUBLIC_URL}/{key}
```

---

## Configuration

```env
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=aistartupimpact-media
R2_PUBLIC_URL=https://media.aistartupimpact.com
```

---

## File Validation

```typescript
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
];

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
```

Rejected files return `400` with descriptive error.

---

## S3 Client Setup

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

---

## Security

- Bucket is private (no public listing)
- Objects served via public URL (read-only CDN)
- Write access only via API key (server-side)
- No executable file types allowed
- CORS configured for `aistartupimpact.com` origin only
- Files are not virus-scanned (future improvement)

---

## Cost

R2 pricing advantage:
- **No egress fees** (vs S3's $0.09/GB)
- Storage: ~$0.015/GB/month
- Operations: $0.36 per million Class A (writes)

---

## Related Documents

- [System Overview](./SYSTEM_OVERVIEW.md) — Where storage fits
- [Backend Overview](../backend/OVERVIEW.md) — Upload API route
- [Infrastructure: R2](../infrastructure/CLOUDFLARE_R2.md) — Service details
