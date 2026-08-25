import { redirect } from "next/navigation";
import { getOrganizerSession } from "@/lib/organizer-auth";
import { prisma } from "@aistartupimpact/database";
import Link from "next/link";
import { CalendarDays, Users, TrendingUp, Plus, ArrowRight, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrganizerDashboard() {
  const session = await getOrganizerSession();
  if (!session) return null;

  if (!session.onboardingCompleted) {
    redirect('/organizer/onboarding');
  }

  const [events, recentRegs] = await Promise.all([
    prisma.event.findMany({ where: { organizerId: session.id, deletedAt: null }, orderBy: { createdAt: "desc" }, select: { id: true, title: true, slug: true, status: true, startAt: true, registrationCount: true }, take: 5 }),
    prisma.eventRegistration.findMany({ where: { event: { organizerId: session.id }, deletedAt: null }, orderBy: { registeredAt: "desc" }, select: { id: true, guestName: true, guestEmail: true, registeredAt: true, status: true, event: { select: { title: true } } }, take: 8 }),
  ]);

  const totalRegs = events.reduce((s, e) => s + e.registrationCount, 0);
  const checkedIn = (await prisma.eventRegistration.count({ where: { event: { organizerId: session.id }, status: "CHECKED_IN", deletedAt: null } }));
  const waitlisted = (await prisma.eventRegistration.count({ where: { event: { organizerId: session.id }, status: "WAITLISTED", deletedAt: null } }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Welcome, {session.name.split(" ")[0]}</h1>
          <p className="text-sm text-gray-500 font-jakarta mt-0.5">Here&apos;s what&apos;s happening with your events</p>
        </div>
        <Link href="/organizer/events/create" className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-600 text-white text-sm font-bold font-jakarta rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Create Event
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={CalendarDays} color="blue" value={events.length} label="Events" />
        <StatCard icon={Users} color="green" value={totalRegs} label="Registrations" />
        <StatCard icon={CheckCircle2} color="purple" value={checkedIn} label="Checked In" />
        <StatCard icon={TrendingUp} color="yellow" value={waitlisted} label="Waitlisted" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ListCard title="Recent Events" linkHref="/organizer/events" linkText="View all" items={events} renderItem={(e: any) => (
          <Link key={e.id} href={`/organizer/events/${e.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30">
            <div><p className="text-sm font-medium text-gray-700 dark:text-gray-200 font-jakarta">{e.title}</p><p className="text-xs text-gray-400">{new Date(e.startAt).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</p></div>
            <p className="text-xs font-semibold text-navy dark:text-white">{e.registrationCount}</p>
          </Link>
        )} />
        <ListCard title="Recent Registrations" linkHref="/organizer/attendees" linkText="View all" items={recentRegs} renderItem={(r: any) => (
          <div key={r.id} className="px-5 py-3 flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-700 dark:text-gray-200 font-jakarta">{r.guestName}</p><p className="text-xs text-gray-400">{r.guestEmail}</p></div>
            <div className="text-right"><p className="text-xs text-gray-500 font-jakarta">{r.event.title}</p></div>
          </div>
        )} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, color, value, label }: any) {
  const colors: Record<string, string> = { blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600", green: "bg-green-50 dark:bg-green-900/20 text-green-600", purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600", yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600" };
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}><Icon className="w-5 h-5" /></div>
      <div><p className="text-2xl font-sora font-extrabold text-navy dark:text-white">{value}</p><p className="text-xs text-gray-500 font-jakarta">{label}</p></div>
    </div>
  );
}

function ListCard({ title, linkHref, linkText, items, renderItem }: any) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-sm font-sora font-semibold text-navy dark:text-white">{title}</h2>
        <Link href={linkHref} className="text-xs text-brand font-semibold font-jakarta hover:underline flex items-center gap-0.5">{linkText}<ArrowRight className="w-3 h-3" /></Link>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {items.length === 0 ? <p className="p-6 text-sm text-gray-400 font-jakarta text-center">Nothing yet</p> : items.map(renderItem)}
      </div>
    </div>
  );
}
