import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@aistartupimpact/database";
import EventCreateForm from "./EventCreateForm";

const EVENT_ROLES = ["SUPER_ADMIN", "EDITOR_IN_CHIEF", "EVENT_ORGANIZER"];

export default async function CreateEventPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !EVENT_ROLES.includes(session.user.role)) {
    redirect("/dashboard");
  }

  // Fetch tags for the tag selector
  const tags = await prisma.eventTag.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return <EventCreateForm tags={tags} />;
}
