// Wrapper component to pass server data to the client component
import UsersPageClient from "./UsersPageClient";
import { getUsers } from "./actions";

export default async function UsersPage() {
  const users = await getUsers();
  return <UsersPageClient initialUsers={users} />;
}
