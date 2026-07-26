import { getOrganizerSession } from "@/lib/organizer-auth";
import { prisma } from "@aistartupimpact/database";
import { BarChart3, Users, TrendingUp } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function AnalyticsPage() {
  const session = await getOrganizerSession();
  if (!session) return null;
  const events = await prisma.event.findMany({ where: { organizerId: session.id, deletedAt: null }, select: { id: true, title: true, registrationCount: true, startAt: true } });
  const totalRegs = events.reduce((s, e) => s + e.registrationCount, 0);
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="font-sora font-extrabold text-xl text-navy dark:text-white">Analytics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-sora font-extrabold text-navy dark:text-white">{events.length}</p><p className="text-xs text-gray-500 font-jakarta">Events</p></div></div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><Users className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-sora font-extrabold text-brand">{totalRegs}</p><p className="text-xs text-gray-500 font-jakarta">Total Registrations</p></div></div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-purple-600" /></div><div><p className="text-2xl font-sora font-extrabold text-purple-600">{events.length > 0 ? Math.round(totalRegs / events.length) : 0}</p><p className="text-xs text-gray-500 font-jakarta">Avg per Event</p></div></div>
      </div>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <h2 className="text-sm font-sora font-semibold text-navy dark:text-white mb-4">Event Performance</h2>
        <div className="space-y-2">{events.map(e => <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"><div><p className="text-sm text-gray-700 dark:text-gray-200 font-jakarta">{e.title}</p><p className="text-[10px] text-gray-400">{new Date(e.startAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</p></div><span className="text-sm font-bold text-navy dark:text-white font-sora">{e.registrationCount}</span></div>)}</div>
      </div>
    </div>
  );
}
