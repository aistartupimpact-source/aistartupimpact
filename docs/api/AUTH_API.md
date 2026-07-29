# Auth API

Authentication endpoints for all user types.

---

## Public User Auth

### POST /api/user/auth/signup

Create a new public user account.

**Request**:
```json
{ "email": "user@example.com", "password": "securepass123", "name": "John Doe" }
```

**Response (201)**: `{ "success": true }`

**Errors**: 400 (validation), 409 (email exists)

---

### POST /api/user/auth/login

Login with email/password.

**Request**:
```json
{ "email": "user@example.com", "password": "securepass123" }
```

**Response (200)**: `{ "success": true }` + sets `user-token` cookie

**Errors**: 401 (invalid credentials), 429 (rate limited: 10/15min)

---

### GET /api/user/session

Check if user is authenticated.

**Response (200)**:
```json
{ "authenticated": true, "user": { "id": "...", "email": "...", "name": "..." } }
// or
{ "authenticated": false }
```

---

### POST /api/user/auth/logout

Clear session.

**Response (200)**: `{ "success": true }` + clears `user-token` cookie

---

## Founder Auth

### GET /api/founder/auth/google

Redirect to Google OAuth consent screen.

### GET /api/founder/auth/google/callback

OAuth callback — exchanges code, creates/finds founder, sets `founder-token` cookie, redirects to dashboard.

### POST /api/founder/auth/logout

Clear founder session.

---

## Organizer Auth

### POST /api/organizer/auth/login

**Request**: `{ "email": "...", "password": "..." }`

**Response**: Sets `organizer_session` cookie

### POST /api/organizer/auth/signup

**Request**: `{ "email": "...", "password": "...", "name": "...", "organizationName": "..." }`

---

## Cookie Summary

| User Type | Cookie | Duration | HttpOnly | Secure | SameSite |
|-----------|--------|----------|----------|--------|----------|
| Public | `user-token` | 30 days | ✓ | ✓ (prod) | Lax |
| Founder | `founder-token` | 30 days | ✓ | ✓ (prod) | Lax |
| Organizer | `organizer_session` | 30 days | ✓ | ✓ (prod) | Lax |
| Admin | `next-auth.session-token` | Session | ✓ | ✓ (prod) | Lax |
