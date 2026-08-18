import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";
import { logAuditEvent } from "@/lib/audit-log";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const people = await sql`
      SELECT 
        u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt",
        u."emailVerified", u."twoFactorEnabled", u."twoFactorInherited", u."lastWorkspace",
        u."googleId",
        f.id as "founderId", f.company as "founderCompany", f.status as "founderStatus",
        f."createdAt"::text as "founderJoined",
        o.id as "organizerId", o.company as "organizerCompany", o.status as "organizerStatus",
        o."createdAt"::text as "organizerJoined"
      FROM "UnifiedUser" u
      LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id
      LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id
      WHERE u.id = ${params.id}
      LIMIT 1
    `;

    if (people.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const person = people[0];

    // Get additional stats
    let startups: any[] = [];
    let events: any[] = [];

    if (person.founderId) {
      startups = await sql`
        SELECT id, name, slug, "isVerified", "claimStatus"
        FROM "Startup" WHERE "ownerId" = ${person.founderId} AND "deletedAt" IS NULL
        ORDER BY "createdAt" DESC LIMIT 10
      `;
    }

    if (person.organizerId) {
      events = await sql`
        SELECT id, title, slug, status, "startAt"::text as "startAt", "registrationCount"
        FROM "Event" WHERE "organizerId" = ${person.organizerId} AND "deletedAt" IS NULL
        ORDER BY "createdAt" DESC LIMIT 10
      `;
    }

    logAuditEvent({ action: 'ACCESS', resourceType: 'USER', resourceId: params.id, resourceName: person.name || person.email });

    return NextResponse.json({ success: true, person, startups, events });
  } catch (error) {
    console.error("People detail error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await request.json();

  try {
    switch (action) {
      case "suspend": {
        await sql`UPDATE "FounderUser" SET status = 'SUSPENDED' WHERE "unifiedUserId" = ${params.id}`;
        await sql`UPDATE "EventOrganizer" SET status = 'SUSPENDED' WHERE "unifiedUserId" = ${params.id}`;
        logAuditEvent({ action: 'SUSPEND', resourceType: 'USER', resourceId: params.id });
        return NextResponse.json({ success: true, message: "Account suspended" });
      }
      case "unsuspend": {
        await sql`UPDATE "FounderUser" SET status = 'ACTIVE' WHERE "unifiedUserId" = ${params.id}`;
        await sql`UPDATE "EventOrganizer" SET status = 'ACTIVE' WHERE "unifiedUserId" = ${params.id}`;
        logAuditEvent({ action: 'UNSUSPEND', resourceType: 'USER', resourceId: params.id });
        return NextResponse.json({ success: true, message: "Account unsuspended" });
      }
      case "unlink_founder": {
        await sql`UPDATE "FounderUser" SET "unifiedUserId" = NULL WHERE "unifiedUserId" = ${params.id}`;
        logAuditEvent({ action: 'UPDATE', resourceType: 'USER', resourceId: params.id, after: { action: 'unlink_founder' } });
        return NextResponse.json({ success: true, message: "Founder workspace unlinked" });
      }
      case "unlink_organizer": {
        await sql`UPDATE "EventOrganizer" SET "unifiedUserId" = NULL WHERE "unifiedUserId" = ${params.id}`;
        logAuditEvent({ action: 'UPDATE', resourceType: 'USER', resourceId: params.id, after: { action: 'unlink_organizer' } });
        return NextResponse.json({ success: true, message: "Organizer workspace unlinked" });
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("People action error:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
