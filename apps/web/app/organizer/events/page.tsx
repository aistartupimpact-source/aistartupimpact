import { getOrganizerSession } from "@/lib/organizer-auth";
import { prisma } from "@aistartupimpact/database";
import Image from "next/image";
import Link from "next/link";
import { Plus, Calendar, Users, MapPin } from "lucide-react";
import EventActions from "./EventActions";

export const dynamic = "force-dynamic";

export default async function OrganizerEventsPage() {
  const session = await getOrganizerSession();
  if (!session) return null;

  const events = await prisma.event.findMany({
    where: { organizerId: session.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, slug: true, shortCode: true, status: true, category: true,
      format: true, startAt: true, registrationCount: true, capacity: true,
      coverImageUrl: true, venueName: true,
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-sora font-extrabold text-xl text-navy dark:text-white">My Events</h1>
        <Link href="/organizer/events/create" className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand hover:bg-brand-600 text-white text-sm font-bold font-jakarta rounded-lg">
          <Plus className="w-4 h-4" /> Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-jakarta mb-4">No events yet.</p>
          <Link href="/organizer/events/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white font-bold font-jakarta text-sm rounded-xl">
            <Plus className="w-4 h-4" /> Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-brand/20 transition-all">
              <div className="flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0" style={{ aspectRatio: "16/9" }}>
                  {event.coverImageUrl ? (
                    <Image src={event.coverImageUrl} alt="" width={80} height={48} sizes="80px" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Calendar className="w-4 h-4 text-gray-300" /></div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-sora font-bold text-sm text-navy dark:text-white truncate">{event.title}</h3>
                    <span className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded ${event.status === "PUBLISHED" ? "bg-green-100 text-green-700" : event.status === "CANCELLED" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-jakarta">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(event.startAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    {event.venueName && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venueName}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />{event.registrationCount}{event.capacity && ` / ${event.capacity}`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <EventActions eventId={event.id} eventSlug={event.slug} eventTitle={event.title} shortCode={event.shortCode} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
