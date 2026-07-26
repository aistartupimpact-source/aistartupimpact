import { requireRole } from '@/lib/role-guard';
import ActivityDashboard from './ActivityDashboard';

export default async function ActivityPage() {
  await requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF']);
  return <ActivityDashboard />;
}
