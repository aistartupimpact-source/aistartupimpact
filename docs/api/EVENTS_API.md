# Events API

Endpoints for event discovery and management.

---

## GET /api/events

List upcoming events.

| Property | Value |
|----------|-------|
| Auth | None |

---

## POST /api/events/[id]/register

Register for an event.

| Property | Value |
|----------|-------|
| Auth | Required (`user-token`) |

**Request**: `{ "name": "...", "email": "..." }`

**Response (200)**: `{ "success": true, "registrationId": "..." }`

---

## Organizer Endpoints

### POST /api/organizer/events
Create a new event.

| Property | Value |
|----------|-------|
| Auth | Required (`organizer_session`) |

### PUT /api/organizer/events/[id]
Update an event.

### POST /api/organizer/promote
Feature an event (LOCKED — returns 403).

---

## Event Fields

| Field | Type | Required |
|-------|------|----------|
| title | string | Yes |
| description | string | Yes |
| startDate | DateTime | Yes |
| endDate | DateTime | Yes |
| location | string | Yes |
| format | "online" \| "offline" \| "hybrid" | Yes |
| maxAttendees | number | No |
| price | number | No (0 = free) |
| agenda | JSON | No |
