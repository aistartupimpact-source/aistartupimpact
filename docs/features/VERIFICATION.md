# Feature: DNS Domain Verification

## Purpose
Allow founders to prove they own a startup/tool's domain by adding a DNS TXT record, earning a verified badge.

## Architecture
- **Founder dashboard**: Initiate verification, view token, check status
- **API**: Verification trigger endpoint
- **Public**: Verified badge displayed on profile

## Business Logic
1. Founder clicks "Verify Ownership" → system generates unique token
2. Token format: `aistartupimpact-verify={TOKEN}`
3. Founder adds TXT record to their domain's DNS
4. Founder clicks "Check Verification" → system queries DNS
5. If token found in TXT records → mark as verified
6. Verified badge appears on public profile immediately

## Verification Rules
- Token is unique per startup/tool
- DNS propagation may take up to 48 hours
- Verification is revoked if TXT record is removed (periodic check — future)
- One domain per entity

## Database
- `Startup.isVerified` / `AiTool.isUrlVerified` — Boolean flag
- `Startup.verificationToken` — Unique token
- `Startup.verifiedDomain` — Confirmed domain
- `StartupVerificationLog` — Audit trail (attempts, success/failure)

## API
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/founder/tools/[id]/verify` | Founder | Check DNS TXT record |

## Key Files
- `apps/web/app/api/founder/tools/[id]/verify/route.ts` — DNS check
- `apps/web/app/(public)/verification-policy/page.tsx` — Public policy
