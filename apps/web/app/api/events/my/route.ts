import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { apiRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/my?email=user@example.com
 * Returns all event registrations for a given email address.
 */
export async function GET(request: NextRequest) {
  // Rate limit
  const identifier = getClientIdentifier(request);
  const { success } = await checkRateLimit(apiRateLimit, identifier);
  if (!success) {
    return NextResponse.json(
      { success: false, error: "Too many requests." },
      { status: 429 }
    );
  }

  const email = request.nextUrl.searchParams.get("email");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { success: false, error: "Valid email is required." },
      { status: 400 }
    );
  }

  try {
    const rows = await sql`
      SELECT
        r.id,
        r.status,
        r."qrToken",
        r."registeredAt"::text AS "registeredAt",
        r."checkedInAt"::text AS "checkedInAt",
        e.title AS "eventTitle",
        e.slug AS "eventSlug",
        e.category AS "eventCategory",
        e.format AS "eventFormat",
        e."startAt"::text AS "eventStartAt",
        e."endAt"::text AS "eventEndAt",
        e.timezone AS "eventTimezone",
        e."venueName" AS "eventVenueName",
        e."coverImageUrl" AS "eventCoverImageUrl"
      FROM "EventRegistration" r
      JOIN "Event" e ON e.id = r."eventId"
      WHERE r."guestEmail" = ${email}
        AND r."deletedAt" IS NULL
        AND e."deletedAt" IS NULL
        AND e.status = 'PUBLISHED'
      ORDER BY e."startAt" DESC
    `;

    return NextResponse.json({ success: true, registrations: rows });
  } catch (error) {
    console.error("My events API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch registrations." },
      { status: 500 }
    );
  }
}
