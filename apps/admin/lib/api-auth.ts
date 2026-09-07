import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

const ADMIN_ROLES = ["SUPER_ADMIN", "EDITOR_IN_CHIEF", "SENIOR_WRITER"];
const ALL_ROLES = ["SUPER_ADMIN", "EDITOR_IN_CHIEF", "SENIOR_WRITER", "WRITER"];

export async function requireApiAuth(allowedRoles: string[] = ADMIN_ROLES) {
  const session: any = await getServerSession(authOptions);

  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const userRole = session.user.role;
  if (!allowedRoles.includes(userRole)) {
    return { session: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { session, error: null };
}

export async function requireActionAuth(allowedRoles: string[] = ADMIN_ROLES) {
  const session: any = await getServerSession(authOptions);

  if (!session?.user) {
    return { session: null, error: "Unauthorized" };
  }

  const userRole = session.user.role;
  if (!allowedRoles.includes(userRole)) {
    return { session: null, error: "Forbidden: insufficient permissions" };
  }

  return { session, error: null };
}

export { ADMIN_ROLES, ALL_ROLES };
