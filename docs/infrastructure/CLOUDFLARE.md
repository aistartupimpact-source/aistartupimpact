# Cloudflare Configuration

CDN, DNS, and security layer.

---

## Services Used

| Service | Purpose |
|---------|---------|
| DNS | Domain management, routing |
| CDN | Static asset caching, global edge |
| WAF | Web Application Firewall |
| DDoS Protection | Automatic mitigation |
| SSL/TLS | Encryption (Full Strict mode) |
| Page Rules | Caching and redirect rules |

---

## DNS Records

| Type | Name | Value | Proxied |
|------|------|-------|---------|
| CNAME | `@` | `cname.vercel-dns.com` | ✓ (orange) |
| CNAME | `www` | `cname.vercel-dns.com` | ✓ (orange) |
| TXT | `@` | Verification records | — |
| MX | `@` | Email routing | — |

---

## SSL/TLS

- Mode: **Full (Strict)**
- Edge certificates: Universal (auto-managed)
- Origin: Vercel-managed certificate
- Minimum TLS: 1.2
- Always Use HTTPS: Enabled

---

## Caching

- Static assets (JS, CSS, images): cached at edge
- HTML pages: not cached at Cloudflare (handled by Vercel ISR)
- Cache-Control set by Vercel based on ISR configuration

---

## Security Settings

| Setting | Value |
|---------|-------|
| Security Level | Medium |
| Bot Fight Mode | Enabled |
| Browser Integrity Check | Enabled |
| Challenge Passage | 30 minutes |
| Under Attack Mode | Off (enable during DDoS) |

---

## Related Documents

- [Cloudflare R2](./CLOUDFLARE_R2.md) — Object storage
- [Security Headers](../security/HEADERS.md) — CSP configuration
- [System Overview](../architecture/SYSTEM_OVERVIEW.md) — Architecture
