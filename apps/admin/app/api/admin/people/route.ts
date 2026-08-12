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
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "50")));
  const offset = (page - 1) * limit;

  try {
    let people: any[];
    let countResult: any[];
    const searchPattern = search ? `%${search}%` : "";

    if (filter === "web_users") {
      // Web users only (not linked to UnifiedUser)
      if (search) {
        countResult = await sql`SELECT COUNT(*)::int as total FROM "WebUser" w WHERE NOT EXISTS (SELECT 1 FROM "UnifiedUser" u WHERE u.email = w.email) AND (w.name ILIKE ${searchPattern} OR w.email ILIKE ${searchPattern})`;
        people = await sql`
          SELECT w.id, w.email, w.name, w.avatar, w."createdAt"::text as "createdAt",
            true as "emailVerified", false as "twoFactorEnabled", 'COMMUNITY' as "lastWorkspace",
            NULL as "founderId", NULL as "founderCompany", NULL as "founderStatus",
            NULL as "organizerId", NULL as "organizerCompany", NULL as "organizerStatus",
            0 as "startupCount", 0 as "toolCount", 0 as "eventCount",
            (SELECT COUNT(*)::int FROM "StartupReview" sr WHERE sr."userId" = w.id) + (SELECT COUNT(*)::int FROM "ToolReview" tr WHERE tr."userId" = w.id) as "reviewCount",
            'web_user' as "userSource"
          FROM "WebUser" w
          WHERE NOT EXISTS (SELECT 1 FROM "UnifiedUser" u WHERE u.email = w.email)
            AND (w.name ILIKE ${searchPattern} OR w.email ILIKE ${searchPattern})
          ORDER BY w."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      } else {
        countResult = await sql`SELECT COUNT(*)::int as total FROM "WebUser" w WHERE NOT EXISTS (SELECT 1 FROM "UnifiedUser" u WHERE u.email = w.email)`;
        people = await sql`
          SELECT w.id, w.email, w.name, w.avatar, w."createdAt"::text as "createdAt",
            true as "emailVerified", false as "twoFactorEnabled", 'COMMUNITY' as "lastWorkspace",
            NULL as "founderId", NULL as "founderCompany", NULL as "founderStatus",
            NULL as "organizerId", NULL as "organizerCompany", NULL as "organizerStatus",
            0 as "startupCount", 0 as "toolCount", 0 as "eventCount",
            (SELECT COUNT(*)::int FROM "StartupReview" sr WHERE sr."userId" = w.id) + (SELECT COUNT(*)::int FROM "ToolReview" tr WHERE tr."userId" = w.id) as "reviewCount",
            'web_user' as "userSource"
          FROM "WebUser" w
          WHERE NOT EXISTS (SELECT 1 FROM "UnifiedUser" u WHERE u.email = w.email)
          ORDER BY w."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      }
    } else if (filter === "founders") {
      if (search) {
        countResult = await sql`SELECT COUNT(DISTINCT u.id)::int as total FROM "UnifiedUser" u JOIN "FounderUser" f ON f."unifiedUserId" = u.id WHERE (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})`;
        people = await sql`SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace", f.id as "founderId", f.company as "founderCompany", f.status as "founderStatus", o.id as "organizerId", o.company as "organizerCompany", o.status as "organizerStatus", (SELECT COUNT(*)::int FROM "Startup" s WHERE s."ownerId" = f.id AND s."deletedAt" IS NULL) as "startupCount", (SELECT COUNT(*)::int FROM "AiTool" t WHERE t."ownerId" = f.id AND t."deletedAt" IS NULL) as "toolCount", (SELECT COUNT(*)::int FROM "Event" e WHERE e."organizerId" = o.id AND e."deletedAt" IS NULL) as "eventCount", 'unified' as "userSource" FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE f.id IS NOT NULL AND (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern}) ORDER BY u."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      } else {
        countResult = await sql`SELECT COUNT(DISTINCT u.id)::int as total FROM "UnifiedUser" u JOIN "FounderUser" f ON f."unifiedUserId" = u.id`;
        people = await sql`SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace", f.id as "founderId", f.company as "founderCompany", f.status as "founderStatus", o.id as "organizerId", o.company as "organizerCompany", o.status as "organizerStatus", (SELECT COUNT(*)::int FROM "Startup" s WHERE s."ownerId" = f.id AND s."deletedAt" IS NULL) as "startupCount", (SELECT COUNT(*)::int FROM "AiTool" t WHERE t."ownerId" = f.id AND t."deletedAt" IS NULL) as "toolCount", (SELECT COUNT(*)::int FROM "Event" e WHERE e."organizerId" = o.id AND e."deletedAt" IS NULL) as "eventCount", 'unified' as "userSource" FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE f.id IS NOT NULL ORDER BY u."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      }
    } else if (filter === "organizers") {
      if (search) {
        countResult = await sql`SELECT COUNT(DISTINCT u.id)::int as total FROM "UnifiedUser" u JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})`;
        people = await sql`SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace", f.id as "founderId", f.company as "founderCompany", f.status as "founderStatus", o.id as "organizerId", o.company as "organizerCompany", o.status as "organizerStatus", (SELECT COUNT(*)::int FROM "Startup" s WHERE s."ownerId" = f.id AND s."deletedAt" IS NULL) as "startupCount", (SELECT COUNT(*)::int FROM "AiTool" t WHERE t."ownerId" = f.id AND t."deletedAt" IS NULL) as "toolCount", (SELECT COUNT(*)::int FROM "Event" e WHERE e."organizerId" = o.id AND e."deletedAt" IS NULL) as "eventCount", 'unified' as "userSource" FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE o.id IS NOT NULL AND (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern}) ORDER BY u."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      } else {
        countResult = await sql`SELECT COUNT(DISTINCT u.id)::int as total FROM "UnifiedUser" u JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id`;
        people = await sql`SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace", f.id as "founderId", f.company as "founderCompany", f.status as "founderStatus", o.id as "organizerId", o.company as "organizerCompany", o.status as "organizerStatus", (SELECT COUNT(*)::int FROM "Startup" s WHERE s."ownerId" = f.id AND s."deletedAt" IS NULL) as "startupCount", (SELECT COUNT(*)::int FROM "AiTool" t WHERE t."ownerId" = f.id AND t."deletedAt" IS NULL) as "toolCount", (SELECT COUNT(*)::int FROM "Event" e WHERE e."organizerId" = o.id AND e."deletedAt" IS NULL) as "eventCount", 'unified' as "userSource" FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE o.id IS NOT NULL ORDER BY u."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      }
    } else if (filter === "community") {
      // Community = UnifiedUser without founder/organizer + WebUser not linked to UnifiedUser
      if (search) {
        countResult = await sql`
          SELECT (
            (SELECT COUNT(*)::int FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE f.id IS NULL AND o.id IS NULL AND (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern}))
            +
            (SELECT COUNT(*)::int FROM "WebUser" w WHERE NOT EXISTS (SELECT 1 FROM "UnifiedUser" u WHERE u.email = w.email) AND (w.name ILIKE ${searchPattern} OR w.email ILIKE ${searchPattern}))
          ) as total`;
        people = await sql`
          SELECT * FROM (
            SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace"::text as "lastWorkspace",
              NULL::text as "founderId", NULL::text as "founderCompany", NULL::text as "founderStatus",
              NULL::text as "organizerId", NULL::text as "organizerCompany", NULL::text as "organizerStatus",
              0 as "startupCount", 0 as "toolCount", 0 as "eventCount", 'unified' as "userSource"
            FROM "UnifiedUser" u
            LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id
            LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id
            WHERE f.id IS NULL AND o.id IS NULL AND (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})
            UNION ALL
            SELECT w.id, w.email, w.name, w.avatar, w."createdAt"::text as "createdAt",
              true as "emailVerified", false as "twoFactorEnabled", 'COMMUNITY' as "lastWorkspace",
              NULL::text, NULL::text, NULL::text, NULL::text, NULL::text, NULL::text,
              0, 0, 0, 'web_user' as "userSource"
            FROM "WebUser" w
            WHERE NOT EXISTS (SELECT 1 FROM "UnifiedUser" u WHERE u.email = w.email)
              AND (w.name ILIKE ${searchPattern} OR w.email ILIKE ${searchPattern})
          ) combined
          ORDER BY "createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      } else {
        countResult = await sql`
          SELECT (
            (SELECT COUNT(*)::int FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE f.id IS NULL AND o.id IS NULL)
            +
            (SELECT COUNT(*)::int FROM "WebUser" w WHERE NOT EXISTS (SELECT 1 FROM "UnifiedUser" u WHERE u.email = w.email))
          ) as total`;
        people = await sql`
          SELECT * FROM (
            SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace"::text as "lastWorkspace",
              NULL::text as "founderId", NULL::text as "founderCompany", NULL::text as "founderStatus",
              NULL::text as "organizerId", NULL::text as "organizerCompany", NULL::text as "organizerStatus",
              0 as "startupCount", 0 as "toolCount", 0 as "eventCount", 'unified' as "userSource"
            FROM "UnifiedUser" u
            LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id
            LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id
            WHERE f.id IS NULL AND o.id IS NULL
            UNION ALL
            SELECT w.id, w.email, w.name, w.avatar, w."createdAt"::text as "createdAt",
              true as "emailVerified", false as "twoFactorEnabled", 'COMMUNITY' as "lastWorkspace",
              NULL::text, NULL::text, NULL::text, NULL::text, NULL::text, NULL::text,
              0, 0, 0, 'web_user' as "userSource"
            FROM "WebUser" w
            WHERE NOT EXISTS (SELECT 1 FROM "UnifiedUser" u WHERE u.email = w.email)
          ) combined
          ORDER BY "createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      }
    } else if (filter === "2fa") {
      countResult = await sql`SELECT COUNT(*)::int as total FROM "UnifiedUser" WHERE "twoFactorEnabled" = true`;
      people = await sql`SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace", f.id as "founderId", f.company as "founderCompany", f.status as "founderStatus", o.id as "organizerId", o.company as "organizerCompany", o.status as "organizerStatus", (SELECT COUNT(*)::int FROM "Startup" s WHERE s."ownerId" = f.id AND s."deletedAt" IS NULL) as "startupCount", (SELECT COUNT(*)::int FROM "AiTool" t WHERE t."ownerId" = f.id AND t."deletedAt" IS NULL) as "toolCount", (SELECT COUNT(*)::int FROM "Event" e WHERE e."organizerId" = o.id AND e."deletedAt" IS NULL) as "eventCount", 'unified' as "userSource" FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE u."twoFactorEnabled" = true ORDER BY u."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
    } else if (filter === "suspended") {
      if (search) {
        countResult = await sql`SELECT COUNT(DISTINCT u.id)::int as total FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE (f.status = 'SUSPENDED' OR o.status = 'SUSPENDED') AND (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})`;
        people = await sql`SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace", f.id as "founderId", f.company as "founderCompany", f.status as "founderStatus", o.id as "organizerId", o.company as "organizerCompany", o.status as "organizerStatus", (SELECT COUNT(*)::int FROM "Startup" s WHERE s."ownerId" = f.id AND s."deletedAt" IS NULL) as "startupCount", (SELECT COUNT(*)::int FROM "AiTool" t WHERE t."ownerId" = f.id AND t."deletedAt" IS NULL) as "toolCount", (SELECT COUNT(*)::int FROM "Event" e WHERE e."organizerId" = o.id AND e."deletedAt" IS NULL) as "eventCount", 'unified' as "userSource" FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE (f.status = 'SUSPENDED' OR o.status = 'SUSPENDED') AND (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern}) ORDER BY u."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      } else {
        countResult = await sql`SELECT COUNT(DISTINCT u.id)::int as total FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE f.status = 'SUSPENDED' OR o.status = 'SUSPENDED'`;
        people = await sql`SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace", f.id as "founderId", f.company as "founderCompany", f.status as "founderStatus", o.id as "organizerId", o.company as "organizerCompany", o.status as "organizerStatus", (SELECT COUNT(*)::int FROM "Startup" s WHERE s."ownerId" = f.id AND s."deletedAt" IS NULL) as "startupCount", (SELECT COUNT(*)::int FROM "AiTool" t WHERE t."ownerId" = f.id AND t."deletedAt" IS NULL) as "toolCount", (SELECT COUNT(*)::int FROM "Event" e WHERE e."organizerId" = o.id AND e."deletedAt" IS NULL) as "eventCount", 'unified' as "userSource" FROM "UnifiedUser" u LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id WHERE f.status = 'SUSPENDED' OR o.status = 'SUSPENDED' ORDER BY u."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      }
    } else {
      // "all" — UnifiedUser + WebUser (excluding WebUsers that share email with UnifiedUser)
      if (search) {
        countResult = await sql`
          SELECT (
            (SELECT COUNT(*)::int FROM "UnifiedUser" u WHERE u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})
            +
            (SELECT COUNT(*)::int FROM "WebUser" w WHERE NOT EXISTS (SELECT 1 FROM "UnifiedUser" u WHERE u.email = w.email) AND (w.name ILIKE ${searchPattern} OR w.email ILIKE ${searchPattern}))
          ) as total`;
        people = await sql`
          SELECT * FROM (
            SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace"::text as "lastWorkspace",
              f.id as "founderId", f.company as "founderCompany", f.status::text as "founderStatus",
              o.id as "organizerId", o.company as "organizerCompany", o.status::text as "organizerStatus",
              (SELECT COUNT(*)::int FROM "Startup" s WHERE s."ownerId" = f.id AND s."deletedAt" IS NULL) as "startupCount",
              (SELECT COUNT(*)::int FROM "AiTool" t WHERE t."ownerId" = f.id AND t."deletedAt" IS NULL) as "toolCount",
              (SELECT COUNT(*)::int FROM "Event" e WHERE e."organizerId" = o.id AND e."deletedAt" IS NULL) as "eventCount",
              'unified' as "userSource"
            FROM "UnifiedUser" u
            LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id
            LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id
            WHERE u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern}
            UNION ALL
            SELECT w.id, w.email, w.name, w.avatar, w."createdAt"::text as "createdAt",
              true as "emailVerified", false as "twoFactorEnabled", 'COMMUNITY' as "lastWorkspace",
              NULL::text, NULL::text, NULL::text, NULL::text, NULL::text, NULL::text,
              0, 0, 0, 'web_user' as "userSource"
            FROM "WebUser" w
            WHERE NOT EXISTS (SELECT 1 FROM "UnifiedUser" u WHERE u.email = w.email)
              AND (w.name ILIKE ${searchPattern} OR w.email ILIKE ${searchPattern})
          ) combined
          ORDER BY "createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
      } else {
        countResult = await sql`
          SELECT (
            (SELECT COUNT(*)::int FROM "UnifiedUser")
            +
            (SELECT COUNT(*)::int FROM "WebUser" w WHERE NOT EXISTS (SELECT 1 FROM "UnifiedUser" u WHERE u.email = w.email))
          ) as total`;
        people = await sql`
          SELECT * FROM (
            SELECT u.id, u.email, u.name, u.avatar, u."createdAt"::text as "createdAt", u."emailVerified", u."twoFactorEnabled", u."lastWorkspace"::text as "lastWorkspace",
              f.id as "founderId", f.company as "founderCompany", f.status::text as "founderStatus",
              o.id as "organizerId", o.company as "organizerCompany", o.status::text as "organizerStatus",
              (SELECT COUNT(*)::int FROM "Startup" s WHERE s."ownerId" = f.id AND s."deletedAt" IS NULL) as "startupCount",
              (SELECT COUNT(*)::int FROM "AiTool" t WHERE t."ownerId" = f.id AND t."deletedAt" IS NULL) as "toolCount",
              (SELECT COUNT(*)::int FROM "Event" e WHERE e."organizerId" = o.id AND e."deletedAt" IS NULL) as "eventCount",
              'unified' as "userSource"
            FROM "UnifiedUser" u
            LEFT JOIN "FounderUser" f ON f."unifiedUserId" = u.id
            LEFT JOIN "EventOrganizer" o ON o."unifiedUserId" = u.id
            UNION ALL
            SELECT w.id, w.email, w.name, w.avatar, w."createdAt"::text as "createdAt",
              true as "emailVerified", false as "twoFactorEnabled", 'COMMUNITY' as "lastWorkspace",
              NULL::text, NULL::text, NULL::text, NULL::text, NULL::text, NULL::text,
              0, 0, 0, 'web_user' as "userSource"
            FROM "WebUser" w
            WHERE NOT EXISTS (SELECT 1 FROM "UnifiedUser" u WHERE u.email = w.email)
          ) combined
          ORDER BY "createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
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
