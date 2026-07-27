import { neon } from '@neondatabase/serverless';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL!);

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'APPROVE' | 'REJECT' | 'PUBLISH' | 'UNPUBLISH' | 'FEATURE' | 'UNFEATURE';

export type ResourceType = 
  | 'STARTUP' 
  | 'AI_TOOL' 
  | 'ARTICLE' 
  | 'EVENT' 
  | 'NEWSLETTER' 
  | 'USER' 
  | 'FUNDING_ROUND' 
  | 'TESTIMONIAL' 
  | 'HERO_SLOT' 
  | 'TICKER'
  | 'PLACEMENT'
  | 'SPONSOR'
  | 'CAMPAIGN';

interface AuditLogEntry {
  action: AuditAction;
  resourceType: ResourceType;
  resourceId?: string | null;
  resourceName?: string; // human-readable label for the dashboard
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
  ipAddress?: string | null;
}

/**
 * Log an admin action to the AuditLog table.
 * Automatically captures the current session user.
 * Call this AFTER the mutation succeeds to avoid logging failed attempts.
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const session: any = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      console.warn('[AuditLog] No session user found — skipping audit log');
      return;
    }

    const beforeJson = entry.before ? JSON.stringify(entry.before) : null;
    const afterJson = entry.after ? JSON.stringify(entry.after) : null;

    await sql`
      INSERT INTO "AuditLog" (id, "userId", action, "resourceType", "resourceId", before, after, "ipAddress", "createdAt")
      VALUES (
        gen_random_uuid(),
        ${userId},
        ${entry.action},
        ${entry.resourceType},
        ${entry.resourceId || null},
        ${beforeJson}::jsonb,
        ${afterJson}::jsonb,
        ${entry.ipAddress || null},
        NOW()
      )
    `;
  } catch (error) {
    // Never let audit logging break the main operation
    console.error('[AuditLog] Failed to write audit log:', error);
  }
}

/**
 * Helper to capture a snapshot of a record before mutation.
 * Pass a subset of fields you want tracked (don't log everything for privacy/size).
 */
export function snapshot(record: Record<string, any>, fields?: string[]): Record<string, any> {
  if (!record) return {};
  if (!fields) return { ...record };
  const result: Record<string, any> = {};
  for (const field of fields) {
    if (field in record) {
      result[field] = record[field];
    }
  }
  return result;
}

/**
 * Check if the current user has permission to delete.
 * SUPER_ADMIN always can. Others can only if they have been granted temporary access
 * via canDeleteUntil (time-limited delegation from a SUPER_ADMIN).
 */
export async function canDelete(): Promise<{ allowed: boolean; error?: string; session?: any }> {
  const session: any = await getServerSession(authOptions);
  if (!session?.user) {
    return { allowed: false, error: 'Unauthorized' };
  }

  // SUPER_ADMIN always has delete access
  if (session.user.role === 'SUPER_ADMIN') {
    return { allowed: true, session };
  }

  // Check for temporary delegated delete access
  try {
    const user = await sql`
      SELECT "canDeleteUntil" FROM "User" WHERE id = ${session.user.id} LIMIT 1
    `;

    if (user.length > 0 && user[0].canDeleteUntil) {
      const expiresAt = new Date(user[0].canDeleteUntil);
      if (expiresAt > new Date()) {
        return { allowed: true, session };
      }
    }
  } catch (e) {
    console.error('[canDelete] Error checking delegated permission:', e);
  }

  return {
    allowed: false,
    error: 'Delete access is restricted to Super Admins. If you need to delete a record, request temporary access from your Super Admin.',
    session,
  };
}
