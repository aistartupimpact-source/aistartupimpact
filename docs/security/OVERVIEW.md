# Security Overview

Security posture and defense layers for AI Startup Impact.

---

## Security Layers

```
┌─────────────────────────────────────────────┐
│ Layer 1: Edge (Cloudflare)                  │
│   • DDoS protection                         │
│   • WAF rules                                │
│   • Bot detection                            │
│   • SSL/TLS termination                      │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│ Layer 2: Transport                          │
│   • HTTPS everywhere (HSTS)                  │
│   • Strict CSP headers                       │
│   • X-Frame-Options: DENY                    │
│   • Referrer-Policy: strict-origin           │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│ Layer 3: Application                        │
│   • JWT auth (HttpOnly, Secure, SameSite)    │
│   • Rate limiting (Upstash)                  │
│   • Input validation (Zod + manual)          │
│   • SQL parameterization                     │
│   • XSS sanitization (sanitize-html)         │
│   • CSRF protection (SameSite cookies)       │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│ Layer 4: Data                               │
│   • Encrypted at rest (Neon managed)         │
│   • Encrypted in transit (SSL)               │
│   • Soft deletes (audit trail)               │
│   • Audit logging (AuditLog table)           │
│   • Secrets in env vars only                 │
└─────────────────────────────────────────────┘
```

---

## Authentication Security

| Mechanism | Protection |
|-----------|-----------|
| JWT cookies | `HttpOnly` (no JS access), `Secure` (HTTPS only), `SameSite=Lax` |
| Password storage | bcrypt with salt rounds |
| OAuth | Server-side code exchange (never expose client secret) |
| Session expiry | 30-day TTL on all tokens |
| Admin access | Google OAuth + must be pre-registered in DB |

---

## Security Headers

Configured in `apps/web/next.config.js`:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' googletagmanager.com google-analytics.com;
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com;
  img-src 'self' data: blob: https:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  object-src 'none';

X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation()
```

---

## Input Validation

| Attack | Prevention |
|--------|-----------|
| SQL Injection | Parameterized queries (tagged templates) — never string concat |
| XSS | `sanitize-html` for user content, React auto-escapes in JSX |
| CSRF | `SameSite=Lax` cookies, no GET mutations |
| Path traversal | No user-controlled file paths |
| Mass assignment | Explicit field selection in all queries |

---

## Rate Limiting

| Endpoint | Limit | Method |
|----------|-------|--------|
| Login | 10 attempts / 15 min | Per IP |
| Signup | 5 / hour | Per IP |
| Upvote | 20 / day | Per user |
| Newsletter subscribe | 5 / hour | Per IP |
| Search | 30 / minute | Per IP |
| File upload | 10 / hour | Per user |

Implementation: `@upstash/ratelimit` with sliding window algorithm.

---

## File Upload Security

- **Type whitelist**: Only `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`
- **Size limit**: 5MB maximum
- **No executable uploads**: No `.js`, `.php`, `.exe`, `.sh`
- **Storage isolation**: R2 bucket with no directory listing
- **Naming**: Server-generated filenames (no user-controlled paths)

---

## Secret Management

| Where | What |
|-------|------|
| `.env` (local) | Development secrets |
| Vercel Dashboard | Production secrets |
| Never in code | No hardcoded keys, tokens, or passwords |
| Never in git | `.env` is in `.gitignore` |
| `.env.example` | Template with placeholder values only |

---

## Audit Trail

All admin actions logged in `AuditLog`:
- Who (userId)
- What (action: CREATE, UPDATE, DELETE, APPROVE, etc.)
- Which resource (resourceType + resourceId)
- Before/after state (JSON snapshots)
- When (createdAt)
- From where (ipAddress)

---

## Anti-Gaming

| Protection | Implementation |
|-----------|---------------|
| Upvote spam | 24h account age + 20/day cap + unique constraint |
| Review spam | One review per tool per user + spam scoring |
| Bot signups | Email verification OTP |
| Scraping | Rate limiting + Cloudflare bot detection |
| Fake listings | Manual approval queue (PENDING → APPROVED) |

---

## OWASP Top 10 Status

| # | Vulnerability | Status |
|---|--------------|--------|
| A01 | Broken Access Control | ✓ RBAC, per-route auth, resource ownership checks |
| A02 | Cryptographic Failures | ✓ HTTPS, bcrypt, secure JWT |
| A03 | Injection | ✓ Parameterized queries, no string interpolation |
| A04 | Insecure Design | ✓ Defense in depth, principle of least privilege |
| A05 | Security Misconfiguration | ✓ CSP, security headers, no debug in prod |
| A06 | Vulnerable Components | ⚠️ Regular `npm audit`, Dependabot |
| A07 | Auth Failures | ✓ Rate limiting, session management, MFA (future) |
| A08 | Data Integrity | ✓ Soft deletes, audit logs, input validation |
| A09 | Logging Failures | ✓ Sentry, audit logs, structured error logging |
| A10 | SSRF | ✓ No user-controlled outbound requests |

---

## Related Documents

- [Authentication](../architecture/AUTHENTICATION.md) — Auth mechanisms
- [Authorization](../architecture/AUTHORIZATION.md) — RBAC + permissions
- [Rate Limiting](./RATE_LIMITING.md) — Anti-abuse details
- [Validation](../backend/VALIDATION.md) — Input validation
