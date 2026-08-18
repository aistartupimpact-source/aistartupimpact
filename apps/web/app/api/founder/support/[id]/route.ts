import { NextRequest, NextResponse } from 'next/server';
import { requireFounderAuth } from '@/lib/founder-auth';
import { getTicketDetail } from '@/lib/support-tickets';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireFounderAuth();
    const ticket = await getTicketDetail(params.id, 'FOUNDER', session.userId);
    if (!ticket) return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    if (error?.message === 'Unauthorized') return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch ticket' }, { status: 500 });
  }
}
