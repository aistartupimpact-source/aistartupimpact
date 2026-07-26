import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { eventSearchRateLimit } from "@/lib/event-rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const { success } = await checkRateLimit(eventSearchRateLimit, identifier);
  if (!success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const format = searchParams.get("format") || "";
  const timeframe = searchParams.get("timeframe") || "";

  try {
    const now = new Date().toISOString();
    let rows: any[];

    if (q) {
      const terms = q.split(/\s+/).filter(Boolean).map((w) => w + ":*").join(" & ");
      rows = await sql`
        SELECT 
          e.id, e.title, e.slug, e.subtitle, e.category, e.format,
          e."startAt"::text AS "startAt", e."endAt"::text AS "endAt",
          e."venueName", e.address, e."coverImageUrl", e."registrationCount", e.capacity, e.timezone,
          o.name AS "organizerName", o.avatar AS "organizerAvatar"
        FROM "Event" e
        LEFT JOIN "EventOrganizer" o ON o.id = e."organizerId"
        WHERE e.status = 'PUBLISHED' AND e."deletedAt" IS NULL AND e.visibility = 'PUBLIC'
          AND (to_tsvector('english', e.title || ' ' || COALESCE(e.subtitle, '') || ' ' || COALESCE(e."venueName", '')) @@ to_tsquery('english', ${terms}))
          ${category ? sql`AND e.category = ${category}::"EventCategory"` : sql``}
          ${format ? sql`AND e.format = ${format}::"EventFormat"` : sql``}
          ${timeframe === "upcoming" ? sql`AND e."startAt" >= ${now}::timestamp` : sql``}
          ${timeframe === "past" ? sql`AND e."endAt" < ${now}::timestamp` : sql``}
          ${timeframe === "this_week" ? sql`AND e."startAt" >= ${now}::timestamp AND e."startAt" < (${now}::timestamp + interval '7 days')` : sql``}
          ${timeframe === "today" ? sql`AND DATE(e."startAt") = DATE(${now}::timestamp)` : sql``}
        ORDER BY e."startAt" ASC
        LIMIT 100
      `;
    } else {
      rows = await sql`
        SELECT 
          e.id, e.title, e.slug, e.subtitle, e.category, e.format,
          e."startAt"::text AS "startAt", e."endAt"::text AS "endAt",
          e."venueName", e.address, e."coverImageUrl", e."registrationCount", e.capacity, e.timezone,
          o.name AS "organizerName", o.avatar AS "organizerAvatar"
        FROM "Event" e
        LEFT JOIN "EventOrganizer" o ON o.id = e."organizerId"
        WHERE e.status = 'PUBLISHED' AND e."deletedAt" IS NULL AND e.visibility = 'PUBLIC'
          ${category ? sql`AND e.category = ${category}::"EventCategory"` : sql``}
          ${format ? sql`AND e.format = ${format}::"EventFormat"` : sql``}
          ${timeframe === "upcoming" ? sql`AND e."startAt" >= ${now}::timestamp` : sql``}
          ${timeframe === "past" ? sql`AND e."endAt" < ${now}::timestamp` : sql``}
          ${timeframe === "this_week" ? sql`AND e."startAt" >= ${now}::timestamp AND e."startAt" < (${now}::timestamp + interval '7 days')` : sql``}
          ${timeframe === "today" ? sql`AND DATE(e."startAt") = DATE(${now}::timestamp)` : sql``}
        ORDER BY 
          CASE WHEN e."startAt" >= ${now}::timestamp THEN 0 ELSE 1 END ASC,
          e."startAt" ASC
        LIMIT 100
      `;
    }

    return NextResponse.json({ events: rows }, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Event search API error:", error);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}
