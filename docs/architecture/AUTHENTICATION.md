# Authentication Architecture

The platform uses 4 separate authentication mechanisms, each tailored to its user type's security needs.

---

## Overview

| User Type | Mechanism | Cookie Name | Helper Function | File |
|-----------|-----------|-------------|-----------------|------|
| Public User | JWT | `user-token` | `verifyToken()` | `apps/web/lib/unified-auth/index.ts` |
| Founder | JWT | `founder-token` | `requireFounderAuth()` | `apps/web/lib/founder-auth.ts` |
| Organizer | JWT | `organizer_session` | `getOrganizerSession()` | `apps/web/lib/organizer-auth/index.ts` |
| Admin | NextAuth (Google OAuth) | `next-auth.session-token` | `getServerSession(authOptions)` | `apps/admin/lib/auth.ts` |

---

## 1. Public User Authentication

**Flow**: Email signup/login → JWT issued → stored in `user-token` cookie

```
User submits email + password
  → API validates credentials (bcrypt compare)
  → JWT created with { userId, email }
  → Set HttpOnly cookie: user-token (30 days)
  → Subsequent requests: read cookie → verify JWT → attach user to request
```

**Token structure**:
```typescript
{
  userId: string;
  email: string;
  iat: number;
  exp: number; // 30 days
}
```

**Security**:
- Cookie: `HttpOnly`, `Secure` (production), `SameSite=Lax`
- Secret: `USER_JWT_SECRET` env var
- Library: `jose` (edge-compatible JWT)

**Anti-gaming rules**:
- Account must be 24+ hours old to upvote
- Maximum 20 upvotes per user per day

---

## 2. Founder Authentication

**Flow**: Google OAuth → JWT issued → stored in `founder-token` cookie

```
Founder clicks "Sign in with Google"
  → Redirect to Google OAuth consent
  → Google callback with auth code
  → Exchange code for Google profile
  → Find/create Founder record in DB
  → JWT created with { userId, email, name, onboardingCompleted }
  → Set HttpOnly cookie: founder-token (30 days)
```

**Token structure**:
```typescript
{
  userId: string;
  email: string;
  name: string;
  onboardingCompleted: boolean;
  iat: number;
  exp: number;
}
```

**Middleware** (`apps/web/middleware.ts`):
- Intercepts `/founder/*` routes (except `/founder/onboarding`)
- If `onboardingCompleted === false` → redirect to onboarding

**Key functions** (`apps/web/lib/founder-auth.ts`):
- `getFounderSession()` — Read and verify cookie
- `requireFounderAuth()` — Throws if not authenticated
- `setFounderSession()` — Create and set cookie
- `clearFounderSession()` — Delete cookie

**Security**:
- Secret: `FOUNDER_JWT_SECRET` env var
- Cookie: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`
- Google OAuth: `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`

---

## 3. Organizer Authentication

**Flow**: Email/password login → JWT issued → stored in `organizer_session` cookie

```
Organizer submits credentials
  → API validates against EventOrganizer table
  → JWT created with { organizerId, email, name }
  → Set HttpOnly cookie: organizer_session (30 days)
```

**Key functions** (`apps/web/lib/organizer-auth/index.ts`):
- `getOrganizerSession()` — Read and verify cookie
- `getOrganizerSessionFromUserToken()` — Fallback unified auth
- `setOrganizerSession()` — Create and set cookie
- `clearOrganizerSession()` — Delete cookie

**Security**:
- Secret: `USER_JWT_SECRET` env var
- Cookie: `HttpOnly`, `Secure`, `SameSite=Lax`
- All organizer API routes check session before processing

---

## 4. Admin Authentication

**Flow**: Google OAuth via NextAuth → session JWT in `next-auth.session-token`

```
Admin clicks "Sign in with Google"
  → NextAuth redirects to Google
  → Google callback
  → signIn callback: check if email exists in User table
  → If not in DB → reject (only pre-registered admins can sign in)
  → jwt callback: attach role from DB (SUPER_ADMIN, EDITOR_IN_CHIEF, etc.)
  → Session created with { id, email, role, slug }
```

**Configuration** (`apps/admin/lib/auth.ts`):
```typescript
providers: [GoogleProvider({ clientId, clientSecret })]
callbacks: { signIn, jwt, session }
session: { strategy: "jwt" }
pages: { signIn: "/login" }
```

**Roles** (from `UserRole` enum):
- `SUPER_ADMIN` — Full access, delete permissions, user management
- `EDITOR_IN_CHIEF` — Content management, publish authority
- `SENIOR_WRITER` — Write + edit content
- `WRITER` — Write content
- `AD_MANAGER` — Advertising management
- `CONTRIBUTOR` — Limited content contribution
- `EVENT_ORGANIZER` — Event management only

**Usage in API routes**:
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
if (session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

---

## Unified Auth (Migration)

A unified auth system is being introduced at `apps/web/lib/unified-auth/index.ts`:
- Provides a single `getSession()` function that checks all cookie types
- Migrates old `founder_session` / `organizer_session` cookies to unified format
- Fallback chain: unified cookie → organizer cookie → founder cookie

---

## Security Considerations

| Concern | Mitigation |
|---------|-----------|
| Token theft (XSS) | `HttpOnly` cookies prevent JS access |
| CSRF | `SameSite=Lax` blocks cross-origin requests |
| Token replay | Short-lived tokens (30 days), rotation on sensitive actions |
| Brute force | Rate limiting on login endpoints |
| Privilege escalation | Role checked on every API call, not just login |
| Session fixation | New token issued on every login |

---

## Timezone Handling

> ⚠️ Database timestamps are stored in UTC without 'Z' suffix.
> When parsing, append 'Z' before `new Date()` to avoid local timezone interpretation:
> ```typescript
> new Date(dbTimestamp + 'Z')
> ```
> Display with IST: `{ timeZone: 'Asia/Kolkata' }`

---

## Related Documents

- [Authorization (RBAC)](./AUTHORIZATION.md) — Role permissions matrix
- [Security Overview](../security/OVERVIEW.md) — Full security posture
- [Rate Limiting](../security/RATE_LIMITING.md) — Anti-abuse protections
