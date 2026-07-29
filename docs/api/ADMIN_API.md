# Admin API

Server actions and API routes for admin operations.

---

## Authentication

Admin operations use NextAuth session (`getServerSession(authOptions)`). All require a valid session with an appropriate role.

---

## Tool Management (Server Actions)

Located in `apps/admin/app/(dashboard)/tools-dir/actions.ts`:

### getToolsAction()
Fetch all tools with category and owner info. Sorted: pending first, then by tier.

### approveToolAction(id)
Approve a tool. Sets status=APPROVED, sends email notification to founder.

### deleteToolAction(id)
Soft-delete a tool. Requires SUPER_ADMIN or delegated delete access.

### bulkApproveAction(ids)
Approve multiple tools at once.

### bulkDeleteAction(ids)
Soft-delete multiple tools. Requires SUPER_ADMIN.

---

## Startup Management

Located in `apps/admin/app/(dashboard)/startups-dir/manage/`:

- List all startups (with approval status)
- Approve/reject startups
- Bulk approve/delete
- Edit startup details
- Manage funding rounds

---

## Common Patterns

All admin actions:
1. Check session and role
2. Perform operation
3. Log to AuditLog (`logAuditEvent()`)
4. Invalidate cache (`invalidateToolCache()`, `invalidateStartupCache()`)
5. Revalidate ISR (`revalidatePath()`)
6. Return `{ success, error? }`

---

## Permission Checks

```typescript
import { canDelete } from '@/lib/audit-log';

// Before any delete operation:
const hasAccess = await canDelete(session);
if (!hasAccess) {
  return { success: false, error: 'Permission denied' };
}
```

---

## Audit Logging

```typescript
await logAuditEvent({
  userId: session.user.id,
  action: 'DELETE_TOOL',
  resourceType: 'tool',
  resourceId: toolId,
  before: existingData, // JSON snapshot
  after: null,
});
```

---

## Cache Invalidation

```typescript
import { invalidateToolCache, invalidateTaxonomyCache } from '@/lib/cache-invalidate';

// After any tool mutation:
await invalidateToolCache();

// After category/tag changes:
await invalidateTaxonomyCache();
```
