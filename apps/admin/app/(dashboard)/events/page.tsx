import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@aistartupimpact/database";
import { redirect } from "next/navigation";
import EventsMonitorTabs from "./EventsMonitorTabs";

const ADMIN_ROLES = ["SUPER_ADMIN", "EDITOR_IN_CHIEF"];

export default async function EventsMonitorPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) redirect("/dashboard");

  const [events, organizers, registrations, stats] = await Promise.all([
    prisma.event.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, slug: true, status: true, category: true,
        format: true, startAt: true, registrationCount: true,
        organizer: { select: { name: true, email: true } },
      },
      take: 100,
    }),
    prisma.eventOrganizer.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, company: true, status: true, createdAt: true,
        _count: { select: { events: true } },
      },
      take: 100,
    }),
    prisma.eventRegistration.findMany({
      where: { deletedAt: null },
      orderBy: { registeredAt: "desc" },
      select: {
        id: true, guestName: true, guestEmail: true, guestPhone: true,
        guestOccupation: true, status: true, registeredAt: true, whatsappConsent: true,
        event: { select: { title: true } },
      },
      take: 200,
    }),
    Promise.all([
      prisma.event.count({ where: { deletedAt: null } }),
      prisma.eventOrganizer.count(),
      prisma.eventRegistration.count({ where: { deletedAt: null } }),
    ]),
  ]);

  // Fetch city mapping from EventSubscriber
  const subscriberCities = await prisma.eventSubscriber.findMany({
    where: { email: { in: registrations.map(r => r.guestEmail!).filter(Boolean) } },
    select: { email: true, locationCity: true },
  });
  const cityMap = new Map(subscriberCities.map(s => [s.email, s.locationCity || ""]));

  const serialized = {
    events: events.map(e => ({ ...e, startAt: e.startAt.toISOString() })),
    organizers: organizers.map(o => ({ ...o, createdAt: o.createdAt.toISOString(), eventCount: o._count.events })),
    registrations: registrations.map(r => ({ ...r, registeredAt: r.registeredAt.toISOString(), eventTitle: r.event.title, city: cityMap.get(r.guestEmail || "") || "" })),
    stats: { events: stats[0], organizers: stats[1], registrations: stats[2] },
  };

  return <EventsMonitorTabs data={serialized} />;
}
