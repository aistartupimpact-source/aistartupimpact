import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

/**
 * GET /e/{shortCode}
 * Redirects short event links to the full SEO URL.
 * 301 permanent redirect for SEO pass-through.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = params.code.toUpperCase();

  try {
    const rows: any[] = await sql`
      SELECT slug, "deletedAt"
      FROM "Event"
      WHERE "shortCode" = ${code}
      LIMIT 1
    `;

    if (!rows.length) {
      return NextResponse.redirect(new URL("/events", request.url), 302);
    }

    if (rows[0].deletedAt) {
      // Soft-deleted: return 410 Gone
      return new NextResponse("This event has been removed.", { status: 410 });
    }

    // 301 permanent redirect to canonical URL
    return NextResponse.redirect(
      new URL(`/events/${rows[0].slug}`, request.url),
      301
    );
  } catch (error) {
    console.error("Short code redirect error:", error);
    return NextResponse.redirect(new URL("/events", request.url), 302);
  }
}
