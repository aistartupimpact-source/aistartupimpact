import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SupportClient from "./SupportClient";

export default async function SupportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF"].includes(session.user.role)) redirect("/dashboard");

  return <SupportClient />;
}
