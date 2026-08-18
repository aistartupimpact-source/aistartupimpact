import { NextRequest, NextResponse } from 'next/server';
import { getEmployerSession } from '@/lib/employer-auth';
import { getTicketDetail } from '@/lib/support-tickets';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getEmployerSession();
    if (!session) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const ticket = await getTicketDetail(params.id, 'EMPLOYER', session.id);
    if (!ticket) return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch ticket' }, { status: 500 });
  }
}
