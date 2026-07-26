import { Metadata } from "next";
import { Suspense } from "react";
import { sql } from "@/lib/db";
import EventSearch from "@/components/events/EventSearch";
import CreateEventButton from "@/components/events/CreateEventButton";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "AI Events — Conferences, Hackathons & Meetups",
  description:
    "Discover upcoming AI events, conferences, hackathons, workshops, and meetups. Find events near you and register for free.",
  alternates: { canonical: "https://aistartupimpact.com/events" },
  openGraph: {
    title: "AI Events — Conferences, Hackathons & Meetups",
    description:
      "Discover upcoming AI events near you. Register for free conferences, hackathons, workshops, and meetups.",
    type: "website",
    url: "https://aistartupimpact.com/events",
  },
};

async function getEvents(params: {
  q?: string;
  category?: string;
  format?: string;
  timeframe?: string;
}) {
  try {
    const now = new Date().toISOString();
    let rows: any[];

    if (params.q) {
      const terms = params.q
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w + ":*")
        .join(" & ");

      rows = await sql`
        SELECT 
          e.id, e.title, e.slug, e.subtitle, e.category, e.format,
          e."startAt"::text AS "startAt", e."endAt"::text AS "endAt",
          e."venueName", e.address, e.latitude, e.longitude,
          e."coverImageUrl", e."registrationCount", e.capacity,
          e.timezone, o.name AS "organizerName", o.avatar AS "organizerAvatar"
        FROM "Event" e
        LEFT JOIN "EventOrganizer" o ON o.id = e."organizerId"
        WHERE e.status = 'PUBLISHED'
          AND e."deletedAt" IS NULL
          AND e.visibility = 'PUBLIC'
          AND (
            to_tsvector('english', e.title || ' ' || COALESCE(e.subtitle, '') || ' ' || COALESCE(e."venueName", ''))
            @@ to_tsquery('english', ${terms})
          )
          ${params.category ? sql`AND e.category = ${params.category}::"EventCategory"` : sql``}
          ${params.format ? sql`AND e.format = ${params.format}::"EventFormat"` : sql``}
          ${params.timeframe === "upcoming" ? sql`AND e."startAt" >= ${now}::timestamp` : sql``}
          ${params.timeframe === "past" ? sql`AND e."endAt" < ${now}::timestamp` : sql``}
        ORDER BY e."startAt" ASC
        LIMIT 100
      `;
    } else {
      rows = await sql`
        SELECT 
          e.id, e.title, e.slug, e.subtitle, e.category, e.format,
          e."startAt"::text AS "startAt", e."endAt"::text AS "endAt",
          e."venueName", e.address, e.latitude, e.longitude,
          e."coverImageUrl", e."registrationCount", e.capacity,
          e.timezone, o.name AS "organizerName", o.avatar AS "organizerAvatar"
        FROM "Event" e
        LEFT JOIN "EventOrganizer" o ON o.id = e."organizerId"
        WHERE e.status = 'PUBLISHED'
          AND e."deletedAt" IS NULL
          AND e.visibility = 'PUBLIC'
          ${params.category ? sql`AND e.category = ${params.category}::"EventCategory"` : sql``}
          ${params.format ? sql`AND e.format = ${params.format}::"EventFormat"` : sql``}
          ${params.timeframe === "upcoming" ? sql`AND e."startAt" >= ${now}::timestamp` : sql``}
          ${params.timeframe === "past" ? sql`AND e."endAt" < ${now}::timestamp` : sql``}
        ORDER BY 
          CASE WHEN e."startAt" >= ${now}::timestamp THEN 0 ELSE 1 END ASC,
          e."startAt" ASC
        LIMIT 100
      `;
    }

    return rows;
  } catch (e) {
    console.error("getEvents error:", e);
    return [];
  }
}

async function getEventTags() {
  try {
    const rows = await sql`
      SELECT DISTINCT et.name, et."canonicalName", et.category
      FROM "EventTag" et
      JOIN "EventTagMapping" etm ON etm."tagId" = et.id
      ORDER BY et.category, et.name
    `;
    return rows;
  } catch {
    return [];
  }
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; format?: string; timeframe?: string };
}) {
  const [events, tags] = await Promise.all([
    getEvents(searchParams),
    getEventTags(),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] sm:text-[26px] font-bold text-gray-900 dark:text-white">Events</h1>
        <CreateEventButton />
      </div>

      <Suspense
        fallback={
          <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        }
      >
        <EventSearch initialEvents={events as any} />
      </Suspense>
    </div>
  );
}
