import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@aistartupimpact/database";
import { redirect } from "next/navigation";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF"].includes(session.user.role)) redirect("/dashboard");

  const reports = await prisma.contentReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const stats = {
    pending: reports.filter(r => r.status === "PENDING").length,
    reviewing: reports.filter(r => r.status === "REVIEWING").length,
    resolved: reports.filter(r => r.status === "RESOLVED").length,
    total: reports.length,
  };

  return <ReportsClient reports={reports.map(r => ({ ...r, createdAt: r.createdAt.toISOString(), resolvedAt: r.resolvedAt?.toISOString() || null }))} stats={stats} />;
}
