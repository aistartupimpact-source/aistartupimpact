import { getOrganizerSession } from "@/lib/organizer-auth";
import OrganizerEventForm from "./OrganizerEventForm";
export const dynamic = "force-dynamic";
export default async function CreateEventPage() {
  const session = await getOrganizerSession();
  if (!session) return null;
  return <OrganizerEventForm organizerId={session.id} />;
}
