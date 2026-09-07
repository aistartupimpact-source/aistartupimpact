import { NextResponse } from 'next/server';
import { clearEmployerSession } from '@/lib/employer-auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await clearEmployerSession();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[POST /api/employer/auth/logout]', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
