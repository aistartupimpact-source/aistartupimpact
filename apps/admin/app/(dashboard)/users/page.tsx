// Wrapper component to pass server data to the client component
import UsersPageClient from "./UsersPageClient";
import { getUsers } from "./actions";
import { requireRole } from "@/lib/role-guard";

export default async function UsersPage() {
  await requireRole(['SUPER_ADMIN']);
  const users = await getUsers();
  return <UsersPageClient initialUsers={users} />;
}
