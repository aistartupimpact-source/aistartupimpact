# Incident Response

How to handle production issues.

---

## Severity Levels

| Level | Definition | Response Time | Examples |
|-------|-----------|---------------|----------|
| **P1** | Site down, data loss | < 15 minutes | Homepage 500, DB unreachable, auth broken |
| **P2** | Major feature broken | < 1 hour | Search broken, tools not loading, upvotes failing |
| **P3** | Minor feature broken | < 4 hours | Newsletter not sending, single page error |
| **P4** | Cosmetic / minor | < 24 hours | Typo, styling glitch, non-critical UI bug |

---

## Response Procedure

### P1 — Critical

1. **Acknowledge** (< 5 min): Confirm you're investigating
2. **Assess**: Check Vercel status, Sentry errors, Neon status
3. **Rollback decision**: If obvious bad deploy → rollback immediately
4. **Communicate**: Notify team on Slack
5. **Fix or Rollback**: Apply fix or promote previous deployment
6. **Verify**: Confirm site is back up
7. **Post-mortem**: Write within 24 hours

### P2 — Major

1. **Acknowledge** (< 15 min)
2. **Investigate**: Check error logs, reproduce locally if possible
3. **Hotfix**: Create `hotfix/` branch → minimal fix → expedited review → deploy
4. **Verify**: Confirm feature working
5. **Post-mortem**: Write within 48 hours

### P3/P4 — Minor

1. Standard PR process
2. Fix in next planned deploy

---

## Diagnostics Checklist

When investigating an incident:

| Check | How |
|-------|-----|
| Vercel deployment status | Vercel Dashboard → Deployments |
| Error logs | Sentry → Issues (filter by last hour) |
| Database connectivity | `SELECT 1` via Prisma Studio or psql |
| Redis connectivity | Upstash Dashboard → check latency |
| DNS/CDN | Cloudflare Dashboard → Analytics |
| Recent deploys | Vercel → was there a deploy in the last hour? |
| Environment variables | Vercel → Settings → Env vars (anything missing?) |

---

## Rollback Decision Tree

```
Site is broken
  │
  ├─ Was there a deploy in the last hour?
  │    ├─ Yes → Rollback to previous deployment
  │    └─ No → Check external services (Neon, Upstash, Cloudflare)
  │
  ├─ Is it a single page/feature?
  │    ├─ Yes → Hotfix the specific issue
  │    └─ No → Rollback entire deployment
  │
  └─ Is the database the issue?
       ├─ Migration broke something → Reverse migration manually
       └─ Neon outage → Wait for Neon status, site degrades gracefully
```

---

## Post-Mortem Template

```markdown
# Incident Post-Mortem: [Title]

## Summary
One-sentence description.

## Timeline (IST)
- HH:MM — Issue detected
- HH:MM — Investigation started
- HH:MM — Root cause identified
- HH:MM — Fix deployed
- HH:MM — Verified resolved

## Root Cause
What actually went wrong and why.

## Impact
- Duration: X minutes/hours
- Users affected: estimated number
- Data impact: none / partial / significant

## Resolution
What was done to fix it.

## Prevention
What will prevent this from happening again:
- [ ] Action item 1
- [ ] Action item 2
```

---

## Communication

| Audience | Channel | When |
|----------|---------|------|
| Team | Slack #incidents | Immediately on P1/P2 |
| Stakeholders | Email/Slack | After resolution with summary |
| Public | Status page (future) | Only for extended outages (> 30min) |

---

## Related Documents

- [Deployment](./DEPLOYMENT.md) — How to rollback
- [Runbooks](./RUNBOOKS.md) — Step-by-step procedures
- [Health Checks](./HEALTH_CHECKS.md) — Monitoring endpoints
