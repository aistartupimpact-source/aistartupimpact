# API Routes Catalog

Complete listing of all API endpoints organized by domain.

---

## Tools API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/tools/[id]/upvote` | Optional (user-token) | Get upvote status + count |
| POST | `/api/tools/[id]/upvote` | Required (user-token) | Toggle upvote |
| GET | `/api/tools/[id]/reviews` | None | Get tool reviews |
| POST | `/api/tools/[id]/reviews` | Required (user-token) | Submit review |
| POST | `/api/tools/[id]/click` | None | Track outbound click |
| GET | `/api/tools/compare` | None | Get comparison data |
| POST | `/api/founder/tools/[id]/verify` | Founder | DNS domain verification |

---

## Startups API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/startups` | None | Search/filter startups |
| POST | `/api/startups/[id]/save` | Required (user-token) | Bookmark startup |
| POST | `/api/startups/submit` | Founder | Submit new startup |

---

## Events API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/events` | None | List events |
| POST | `/api/events/[id]/register` | Required (user-token) | Register for event |
| POST | `/api/organizer/events` | Organizer | Create event |
| PUT | `/api/organizer/events/[id]` | Organizer | Update event |

---

## Founder API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/founder/auth/google` | None | Initiate Google OAuth |
| GET | `/api/founder/auth/google/callback` | None | OAuth callback |
| POST | `/api/founder/auth/logout` | Founder | Clear session |
| GET | `/api/founder/tools` | Founder | List owned tools |
| POST | `/api/founder/tools` | Founder | Submit new tool |
| PUT | `/api/founder/tools/[id]` | Founder | Update owned tool |
| GET | `/api/founder/startups` | Founder | List owned startups |
| PUT | `/api/founder/startups/[id]` | Founder | Update owned startup |

---

## User API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/user/auth/signup` | None | Create account |
| POST | `/api/user/auth/login` | None | Email/password login |
| GET | `/api/user/auth/google` | None | Google OAuth flow |
| GET | `/api/user/session` | Optional | Check session status |
| POST | `/api/user/auth/logout` | User | Clear session |

---

## Organizer API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/organizer/auth/login` | None | Organizer login |
| POST | `/api/organizer/auth/signup` | None | Organizer signup |
| GET | `/api/organizer/events` | Organizer | List own events |
| POST | `/api/organizer/promote` | Organizer | Promote event (locked - 403) |

---

## Newsletter API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/newsletter/subscribe` | None | Subscribe email |
| GET | `/api/newsletter/unsubscribe` | Token | Unsubscribe |

---

## Media API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/media/upload` | Founder/Admin | Upload file to R2 |
| DELETE | `/api/media/[key]` | Admin | Delete file from R2 |

---

## Search API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/search?q=query` | None | Global search |
| GET | `/api/cities/search?q=query` | None | City autocomplete |

---

## Authentication Summary

| Cookie | User Type | Verified By |
|--------|-----------|-------------|
| `user-token` | Public user | `jwtVerify()` with `USER_JWT_SECRET` |
| `founder-token` | Founder | `jwtVerify()` with `FOUNDER_JWT_SECRET` |
| `organizer_session` | Organizer | `jwtVerify()` with `USER_JWT_SECRET` |
| `next-auth.session-token` | Admin | `getServerSession(authOptions)` |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/tools/[id]/upvote` | 20/user | 24 hours |
| `/api/newsletter/subscribe` | 5/IP | 1 hour |
| `/api/user/auth/login` | 10/IP | 15 minutes |
| `/api/search` | 30/IP | 1 minute |

---

## Error Response Format

All endpoints return errors as:
```json
{ "error": "Human-readable message" }
```

With appropriate HTTP status codes (400, 401, 403, 404, 429, 500).

---

## Related Documents

- [Backend Overview](./OVERVIEW.md)
- [Authentication](../architecture/AUTHENTICATION.md)
- [Validation](./VALIDATION.md)
