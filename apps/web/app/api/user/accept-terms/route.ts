import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/user-session';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log('[accept-terms] Starting...');
    const session = await getUserSession();
    console.log('[accept-terms] Session:', session ? `User ${session.id}` : 'null');
    
    if (!session?.id) {
      console.log('[accept-terms] No session found, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[accept-terms] Updating termsAcceptedAt for user:', session.id);
    
    // Update user's termsAcceptedAt timestamp
    await sql`
      UPDATE "WebUser"
      SET "termsAcceptedAt" = NOW()
      WHERE id = ${session.id}
    `;

    console.log('[accept-terms] Successfully updated');

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
