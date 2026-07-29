# Authorization Model

Role-Based Access Control (RBAC) for the admin dashboard and permission restrictions across all user types.

---

## Admin Roles

| Role | Level | Purpose |
|------|-------|---------|
| `SUPER_ADMIN` | Highest | Full platform control, user management, delete access |
| `EDITOR_IN_CHIEF` | High | Content oversight, publish authority, editorial decisions |
| `SENIOR_WRITER` | Medium | Write + edit all content, manage articles |
| `WRITER` | Medium | Write content, limited edit |
| `AD_MANAGER` | Medium | Advertising campaign management |
| `CONTRIBUTOR` | Low | Submit content for review |
| `EVENT_ORGANIZER` | Low | Event management only |

---

## Permission Matrix (Admin Dashboard)

| Action | SUPER_ADMIN | EDITOR_IN_CHIEF | SENIOR_WRITER | WRITER | AD_MANAGER |
|--------|:-----------:|:---------------:|:-------------:|:------:|:----------:|
| View all content | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create articles | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit any article | ✓ | ✓ | ✓ | Own | ✗ |
| Publish articles | ✓ | ✓ | ✗ | ✗ | ✗ |
| Manage startups | ✓ | ✓ | ✓ | ✗ | ✗ |
| Manage tools | ✓ | ✓ | ✓ | ✗ | ✗ |
| Approve tools | ✓ | ✓ | ✓ | ✗ | ✗ |
| Manage events | ✓ | ✓ | ✓ | ✗ | ✗ |
| Manage ads | ✓ | ✗ | ✗ | ✗ | ✓ |
| Manage users | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Delete anything** | **✓** | ✗ | ✗ | ✗ | ✗ |
| Bulk actions | ✓ | ✓ | ✗ | ✗ | ✗ |
| View analytics | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage newsletter | ✓ | ✓ | ✗ | ✗ | ✗ |

---

## Delete Access Control

**Delete is restricted to SUPER_ADMIN only.**

### Delegated Delete Access
- SUPER_ADMIN can grant time-limited delete access to other admins
- Grant includes: start time, end time, resource scope
- Revocable at any time
- Audit logged when granted and when used

### Delete Confirmation
All delete operations (single and bulk) require typing "DELETE" to confirm:
```typescript
// UI pattern
const [confirmText, setConfirmText] = useState('');
const canProceed = confirmText === 'DELETE';
```

### Permission Check (Server)
```typescript
// apps/admin/lib/audit-log.ts
export async function canDelete(session: AdminSession): Promise<boolean> {
  if (session.user.role === 'SUPER_ADMIN') return true;
  // Check for delegated access grant
  const grant = await checkDelegatedAccess(session.user.id, 'DELETE');
  return grant?.isValid ?? false;
}
```

---

## Founder Access

| Resource | Can View | Can Create | Can Edit | Can Delete |
|----------|----------|------------|----------|------------|
| Own startups | ✓ | ✓ | ✓ | ✗ (request removal) |
| Own tools | ✓ | ✓ | ✓ | ✗ (request removal) |
| Own analytics | ✓ | — | — | — |
| Other's startups | Public only | ✗ | ✗ | ✗ |
| Reviews on own tools | ✓ | ✗ | ✗ | ✗ |
| Respond to reviews | ✓ | ✓ | ✓ | ✓ (own response) |

---

## Organizer Access

| Resource | Can View | Can Create | Can Edit | Can Delete |
|----------|----------|------------|----------|------------|
| Own events | ✓ | ✓ | ✓ | ✗ |
| Own registrations | ✓ | — | — | — |
| Organization profile | ✓ | — | ✓ | ✗ |
| Team members | ✓ | ✓ | — | ✓ (remove) |
| Promote (locked) | ✓ (403) | ✗ | ✗ | ✗ |

---

## Public User Access

| Action | Requirement |
|--------|------------|
| View all public content | None |
| Upvote tools | Logged in + account 24h+ old |
| Write reviews | Logged in + account 24h+ old |
| Bookmark startups/tools | Logged in |
| Register for events | Logged in |
| Submit startup | Logged in (creates founder profile) |
| Submit tool | Logged in (creates founder profile) |

---

## Implementation Pattern

### In API Routes
```typescript
// Check admin role
const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
if (!['SUPER_ADMIN', 'EDITOR_IN_CHIEF'].includes(session.user.role)) {
  return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
}
```

### In Server Actions
```typescript
// Check founder owns the resource
const session = await requireFounderAuth();
const tool = await sql`SELECT "ownerId" FROM "AiTool" WHERE id = ${toolId}`;
if (tool[0]?.ownerId !== session.userId) {
  return { success: false, error: 'Not authorized' };
}
```

---

## Audit Trail

All admin actions are logged in the `AuditLog` table:
```typescript
await logAuditEvent({
  userId: session.user.id,
  action: 'DELETE_TOOL',
  resourceType: 'tool',
  resourceId: toolId,
  before: existingData,
  after: null,
});
```

Fields: userId, action, resourceType, resourceId, before (JSON), after (JSON), ipAddress, createdAt

---

## Related Documents

- [Authentication](./AUTHENTICATION.md) — How users are identified
- [Security Overview](../security/OVERVIEW.md) — Full security posture
- [Backend Routes](../backend/ROUTES.md) — Which routes need which auth
