import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/user-session';
import { sql } from '@/lib/db';
import { CURRENT_TERMS_VERSION } from '@/lib/terms-version';

export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession();

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await sql`
      UPDATE "WebUser"
      SET "termsAcceptedAt" = NOW(), "termsVersion" = ${CURRENT_TERMS_VERSION}
      WHERE id = ${session.id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Terms accepted successfully'
    });
  } catch (error) {
    console.error('[accept-terms] Error:', error);
    return NextResponse.json({
      error: 'Failed to accept terms'
    }, { status: 500 });
  }
}
