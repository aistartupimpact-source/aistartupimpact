import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = (page - 1) * limit;

  try {
    // Build query based on filter
    let people: any[];
    let countResult: any[];

    if (search) {
      const searchPattern = `%${search}%`;

      if (filter === "founders") {
        countResult = await sql`SELECT COUNT(DISTINCT u.id)::int as total FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id WHERE f.id IS NOT NULL AND (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})`;
        people = await sql`SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace", f.id as "founderId", f.company as "founderCompany", f.status as "founderStatus", o.id as "organizerId", o.company as "organizerCompany", o.status as "organizerStatus", (SELECT COUNT(*)::int FROM "Startup" s WHERE s."ownerId" = f.id AND s."deletedAt" IS NULL) as "startupCount", (SELECT COUNT(*)::int FROM "AiTool" t WHERE t."ownerId" = f.id AND t."deletedAt" IS NULL) as "toolCount", (SELECT COUNT(*)::int FROM "Event" e WHERE e."organizerId" = o.id AND e."deletedAt" IS NULL) as "eventCount" FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE f.id IS NOT NULL AND (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern}) ORDER BY u."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      } else if (filter === "organizers") {
        countResult = await sql`SELECT COUNT(DISTINCT u.id)::int as total FROM "UnifiedUser" u LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE o.id IS NOT NULL AND (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})`;
        people = await sql`SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace", f.id as "founderId", f.company as "founderCompany", f.status as "founderStatus", o.id as "organizerId", o.company as "organizerCompany", o.status as "organizerStatus", (SELECT COUNT(*)::int FROM "Startup" s WHERE s."ownerId" = f.id AND s."deletedAt" IS NULL) as "startupCount", (SELECT COUNT(*)::int FROM "AiTool" t WHERE t."ownerId" = f.id AND t."deletedAt" IS NULL) as "toolCount", (SELECT COUNT(*)::int FROM "Event" e WHERE e."organizerId" = o.id AND e."deletedAt" IS NULL) as "eventCount" FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE o.id IS NOT NULL AND (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern}) ORDER BY u."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      } else if (filter === "community") {
        countResult = await sql`SELECT COUNT(DISTINCT u.id)::int as total FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE f.id IS NULL AND o.id IS NULL AND (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})`;
        people = await sql`SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace", f.id as "founderId", f.company as "founderCompany", f.status as "founderStatus", o.id as "organizerId", o.company as "organizerCompany", o.status as "organizerStatus", (SELECT COUNT(*)::int FROM "Startup" s WHERE s."ownerId" = f.id AND s."deletedAt" IS NULL) as "startupCount", (SELECT COUNT(*)::int FROM "AiTool" t WHERE t."ownerId" = f.id AND t."deletedAt" IS NULL) as "toolCount", (SELECT COUNT(*)::int FROM "Event" e WHERE e."organizerId" = o.id AND e."deletedAt" IS NULL) as "eventCount" FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE f.id IS NULL AND o.id IS NULL AND (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern}) ORDER BY u."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      } else {
        countResult = await sql`SELECT COUNT(*)::int as total FROM "UnifiedUser" u WHERE u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern}`;
        people = await sql`SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace", f.id as "founderId", f.company as "founderCompany", f.status as "founderStatus", o.id as "organizerId", o.company as "organizerCompany", o.status as "organizerStatus", (SELECT COUNT(*)::int FROM "Startup" s WHERE s."ownerId" = f.id AND s."deletedAt" IS NULL) as "startupCount", (SELECT COUNT(*)::int FROM "AiTool" t WHERE t."ownerId" = f.id AND t."deletedAt" IS NULL) as "toolCount", (SELECT COUNT(*)::int FROM "Event" e WHERE e."organizerId" = o.id AND e."deletedAt" IS NULL) as "eventCount" FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern} ORDER BY u."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      }
    } else {
      if (filter === "founders") {
        countResult = await sql`SELECT COUNT(DISTINCT u.id)::int as total FROM "UnifiedUser" u JOIN "FounderUser" f ON f."unifiedUserId" = u.id`;
        people = await sql`SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace", f.id as "founderId", f.company as "founderCompany", f.status as "founderStatus", o.id as "organizerId", o.company as "organizerCompany", o.status as "organizerStatus", (SELECT COUNT(*)::int FROM "Startup" s WHERE s."ownerId" = f.id AND s."deletedAt" IS NULL) as "startupCount", (SELECT COUNT(*)::int FROM "AiTool" t WHERE t."ownerId" = f.id AND t."deletedAt" IS NULL) as "toolCount", (SELECT COUNT(*)::int FROM "Event" e WHERE e."organizerId" = o.id AND e."deletedAt" IS NULL) as "eventCount" FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE f.id IS NOT NULL ORDER BY u."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      } else if (filter === "organizers") {
        countResult = await sql`SELECT COUNT(DISTINCT u.id)::int as total FROM "UnifiedUser" u JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id`;
        people = await sql`SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace", f.id as "founderId", f.company as "founderCompany", f.status as "founderStatus", o.id as "organizerId", o.company as "organizerCompany", o.status as "organizerStatus", (SELECT COUNT(*)::int FROM "Startup" s WHERE s."ownerId" = f.id AND s."deletedAt" IS NULL) as "startupCount", (SELECT COUNT(*)::int FROM "AiTool" t WHERE t."ownerId" = f.id AND t."deletedAt" IS NULL) as "toolCount", (SELECT COUNT(*)::int FROM "Event" e WHERE e."organizerId" = o.id AND e."deletedAt" IS NULL) as "eventCount" FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE o.id IS NOT NULL ORDER BY u."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      } else if (filter === "community") {
        countResult = await sql`SELECT COUNT(*)::int as total FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE f.id IS NULL AND o.id IS NULL`;
        people = await sql`SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace", f.id as "founderId", f.company as "founderCompany", f.status as "founderStatus", o.id as "organizerId", o.company as "organizerCompany", o.status as "organizerStatus", (SELECT COUNT(*)::int FROM "Startup" s WHERE s."ownerId" = f.id AND s."deletedAt" IS NULL) as "startupCount", (SELECT COUNT(*)::int FROM "AiTool" t WHERE t."ownerId" = f.id AND t."deletedAt" IS NULL) as "toolCount", (SELECT COUNT(*)::int FROM "Event" e WHERE e."organizerId" = o.id AND e."deletedAt" IS NULL) as "eventCount" FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE f.id IS NULL AND o.id IS NULL ORDER BY u."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      } else if (filter === "2fa") {
        countResult = await sql`SELECT COUNT(*)::int as total FROM "UnifiedUser" WHERE "twoFactorEnabled" = true`;
        people = await sql`SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace", f.id as "founderId", f.company as "founderCompany", f.status as "founderStatus", o.id as "organizerId", o.company as "organizerCompany", o.status as "organizerStatus", (SELECT COUNT(*)::int FROM "Startup" s WHERE s."ownerId" = f.id AND s."deletedAt" IS NULL) as "startupCount", (SELECT COUNT(*)::int FROM "AiTool" t WHERE t."ownerId" = f.id AND t."deletedAt" IS NULL) as "toolCount", (SELECT COUNT(*)::int FROM "Event" e WHERE e."organizerId" = o.id AND e."deletedAt" IS NULL) as "eventCount" FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE u."twoFactorEnabled" = true ORDER BY u."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      } else {
        countResult = await sql`SELECT COUNT(*)::int as total FROM "UnifiedUser"`;
        people = await sql`SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace", f.id as "founderId", f.company as "founderCompany", f.status as "founderStatus", o.id as "organizerId", o.company as "organizerCompany", o.status as "organizerStatus", (SELECT COUNT(*)::int FROM "Startup" s WHERE s."ownerId" = f.id AND s."deletedAt" IS NULL) as "startupCount", (SELECT COUNT(*)::int FROM "AiTool" t WHERE t."ownerId" = f.id AND t."deletedAt" IS NULL) as "toolCount", (SELECT COUNT(*)::int FROM "Event" e WHERE e."organizerId" = o.id AND e."deletedAt" IS NULL) as "eventCount" FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id ORDER BY u."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      }
    }

    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      success: true,
      people,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("People API error:", error);
    return NextResponse.json({ error: "Failed to fetch people" }, { status: 500 });
  }
}
