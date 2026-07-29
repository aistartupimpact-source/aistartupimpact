# Scalability Plan

How the platform scales from current traffic to 10x growth.

---

## Current Capacity

| Metric | Current | Comfortable Limit |
|--------|---------|-------------------|
| Monthly visitors | ~50K | 200K |
| Database rows | ~50K total | 500K |
| Redis memory | ~50MB | 256MB (free plan) |
| Tools listed | 280+ | 5,000 |
| Startups listed | 280+ | 10,000 |
| Concurrent users | ~100 | 500 |

---

## Scaling Tiers

### Tier 1: 100K visitors/month (Current architecture handles fine)
- No changes needed
- Redis caching handles load efficiently
- Vercel auto-scales serverless functions
- Neon auto-scales compute

### Tier 2: 500K visitors/month
- Upgrade Upstash Redis plan (more memory)
- Add MeiliSearch for search (better autocomplete, typo tolerance)
- Optimize slow queries (EXPLAIN ANALYZE audit)
- Consider Vercel Pro for longer function timeouts

### Tier 3: 1M visitors/month
- Edge caching for popular pages (Vercel Edge Config)
- Database read replicas (Neon supports this)
- CDN caching for API responses (common queries)
- Background job processing for heavy operations

### Tier 4: 5M+ visitors/month
- Multi-region deployment consideration
- Upstash Global (read replicas in multiple regions)
- Dedicated compute for database
- Consider extracting heavy services (search, email) into microservices
- Rate limiting at CDN level (Cloudflare Workers)

---

## Bottleneck Analysis

| Component | Bottleneck At | Solution |
|-----------|--------------|----------|
| Database queries | 500K concurrent queries/month | Read replicas, query optimization |
| Redis memory | 256MB (free plan limit) | Upgrade plan, reduce TTLs |
| Search | Complex tsvector queries at scale | MeiliSearch (already in deps) |
| Directory pages | Large result sets (500+ tools) | Pagination, cursor-based |
| Image loading | Many logos on listing page | Lazy loading, CDN, AVIF |
| Serverless cold starts | First request after idle | Keep-alive pings, Vercel Pro |

---

## Cost Scaling

| Traffic | Vercel | Neon | Upstash | R2 | Total |
|---------|--------|------|---------|----|----|
| 50K/mo | $0 (Hobby) | $0 (Free) | $0 (Free) | $0 | ~$0 |
| 200K/mo | $20 (Pro) | $19 (Launch) | $10 | $1 | ~$50 |
| 500K/mo | $20 | $69 (Scale) | $30 | $5 | ~$125 |
| 1M/mo | $20 | $69 | $50 | $10 | ~$150 |

---

## Related Documents

- [System Overview](./SYSTEM_OVERVIEW.md) — Current architecture
- [Caching](./CACHING.md) — Redis scaling
- [Neon](../infrastructure/NEON.md) — Database scaling
