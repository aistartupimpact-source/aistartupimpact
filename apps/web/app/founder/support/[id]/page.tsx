import { requireFounderAuth } from '@/lib/founder-auth';
import SupportTicketDetail from '@/components/support/SupportTicketDetail';

export default async function FounderTicketPage({ params }: { params: { id: string } }) {
  await requireFounderAuth();
  return <SupportTicketDetail apiBasePath="/api/founder/support" portalPath="/founder" ticketId={params.id} />;
}
