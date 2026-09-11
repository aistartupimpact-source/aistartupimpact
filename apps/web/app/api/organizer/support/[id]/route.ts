import { NextRequest, NextResponse } from 'next/server';
import { getOrganizerSession } from '@/lib/organizer-auth';
import { getTicketDetail } from '@/lib/support-tickets';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getOrganizerSession();
    if (!session) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const ticket = await getTicketDetail(params.id, 'ORGANIZER', session.id);
    if (!ticket) return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch ticket' }, { status: 500 });
  }
}
