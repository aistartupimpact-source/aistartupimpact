# Cloudflare R2

S3-compatible object storage for media files.

---

## Configuration

| Property | Value |
|----------|-------|
| Protocol | S3-compatible (AWS SDK v3) |
| Endpoint | `https://{ACCOUNT_ID}.r2.cloudflarestorage.com` |
| Bucket | `R2_BUCKET_NAME` env var |
| Public URL | `R2_PUBLIC_URL` (CDN-served, read-only) |
| Egress | Free (no data transfer charges) |
| Storage | ~$0.015/GB/month |

---

## Environment Variables

```env
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=aistartupimpact-media
R2_PUBLIC_URL=https://media.aistartupimpact.com
```

---

## File Organization

```
bucket/
├── startups/{id}/logo.{ext}
├── tools/{id}/logo.{ext}
├── tools/{id}/screenshots/{n}.{ext}
├── events/{id}/banner.{ext}
├── founders/{id}/photo.{ext}
├── articles/{id}/{filename}
└── media/{timestamp}-{filename}
```

---

## Access Control

- **Write**: Server-side only (via S3 API with access key)
- **Read**: Public via `R2_PUBLIC_URL` (no auth needed)
- **CORS**: Configured for `aistartupimpact.com` origin
- **No directory listing**: bucket is not publicly listable

---

## Upload Limits

| Constraint | Value |
|-----------|-------|
| Max file size | 5MB (application-enforced) |
| Allowed types | image/jpeg, image/png, image/webp, image/svg+xml |
| Naming | Server-generated (timestamp + sanitized name) |

---

## Related Documents

- [Storage Architecture](../architecture/STORAGE.md) — Upload flow
- [Media API](../api/MEDIA_API.md) — Upload endpoints
