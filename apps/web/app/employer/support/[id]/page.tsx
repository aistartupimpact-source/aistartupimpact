import SupportTicketDetail from '@/components/support/SupportTicketDetail';

export default function EmployerTicketPage({ params }: { params: { id: string } }) {
  return <SupportTicketDetail apiBasePath="/api/employer/support" portalPath="/employer" ticketId={params.id} />;
}
