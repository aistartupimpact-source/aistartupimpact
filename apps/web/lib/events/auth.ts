import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";

/**
 * Roles that can create and manage events.
 */
const EVENT_MANAGEMENT_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "EDITOR_IN_CHIEF",
  "EVENT_ORGANIZER",
];

/**
 * Roles that can manage ALL events (not just their own).
 */
const EVENT_ADMIN_ROLES: UserRole[] = ["SUPER_ADMIN", "EDITOR_IN_CHIEF"];

export interface EventSession {
  userId: string;
  role: UserRole;
  slug: string;
}

/**
 * Get the current session and verify the user can manage events.
 * Returns null if not authenticated or insufficient permissions.
 */
export async function getEventSession(): Promise<EventSession | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session?.user?.role) {
    return null;
  }

  const role = session.user.role as UserRole;

  if (!EVENT_MANAGEMENT_ROLES.includes(role)) {
    return null;
  }

  return {
    userId: session.user.id,
    role,
    slug: session.user.slug || "",
  };
}

/**
 * Check if a user can manage a specific event.
 * Admins can manage all events; organizers can only manage their own.
 */
export function canManageEvent(
  session: EventSession,
  eventOrganizerId: string
): boolean {
  if (EVENT_ADMIN_ROLES.includes(session.role)) {
    return true;
  }
  return session.userId === eventOrganizerId;
}

/**
 * Check if the user is an event admin (can manage all events).
 */
export function isEventAdmin(session: EventSession): boolean {
  return EVENT_ADMIN_ROLES.includes(session.role);
}
