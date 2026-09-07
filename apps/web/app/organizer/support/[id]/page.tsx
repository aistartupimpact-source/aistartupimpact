import SupportTicketDetail from '@/components/support/SupportTicketDetail';

export default function OrganizerTicketPage({ params }: { params: { id: string } }) {
  return <SupportTicketDetail apiBasePath="/api/organizer/support" portalPath="/organizer" ticketId={params.id} />;
}
