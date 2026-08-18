import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SupportDetailClient from "./SupportDetailClient";

export default async function SupportDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF"].includes(session.user.role)) redirect("/dashboard");

  return <SupportDetailClient ticketId={params.id} adminId={session.user.id} adminName={session.user.name || "Admin"} />;
}
