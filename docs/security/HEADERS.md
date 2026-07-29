# Security Headers

HTTP security headers configured in `apps/web/next.config.js`.

---

## Active Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | See below | Prevent XSS, injection |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-DNS-Prefetch-Control` | `on` | Speed up external lookups |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation()` | Disable unused APIs |

---

## Content Security Policy (CSP)

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: blob: https:;
connect-src 'self' https://aistartupimpact.com https://www.google-analytics.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
```

### Directives Explained

| Directive | Allows | Blocks |
|-----------|--------|--------|
| `default-src 'self'` | Same-origin resources | All external by default |
| `script-src` | Self + GTM + GA + inline | Unknown script sources |
| `style-src` | Self + inline + Google Fonts | External stylesheets |
| `img-src` | Self + data URIs + any HTTPS | HTTP images |
| `frame-ancestors 'none'` | Nothing | Embedding in iframes |
| `object-src 'none'` | Nothing | Flash, Java applets |

---

## Implementation

```javascript
// apps/web/next.config.js
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation()' },
      { key: 'Content-Security-Policy', value: csp },
    ],
  }];
}
```

---

## Cloudflare Additional Headers

Cloudflare adds at the edge:
- `CF-Ray` — Request ID for debugging
- `CF-Cache-Status` — HIT/MISS/DYNAMIC
- SSL/TLS headers (Full Strict mode)

---

## Testing Headers

```bash
# Check headers for any page
curl -I https://aistartupimpact.com

# Or use securityheaders.com for a full audit
```

---

## Related Documents

- [Security Overview](./OVERVIEW.md) — Full security posture
- [System Overview](../architecture/SYSTEM_OVERVIEW.md) — Architecture
