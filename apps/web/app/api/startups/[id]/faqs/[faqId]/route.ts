import { NextRequest, NextResponse } from 'next/server';
import { getFounderSession } from '@/lib/founder-auth';
import { db } from '@/lib/db';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; faqId: string } }
) {
  try {
    const session = await getFounderSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const startup = await sql`
      SELECT id, "ownerId" FROM "Startup" WHERE id = ${params.id} AND "deletedAt" IS NULL LIMIT 1
    `;
    if (!startup.length || startup[0].ownerId !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to modify this startup' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { question, answer, order } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const result = await db.query(
      `UPDATE "StartupFAQ"
       SET "question" = $1, "answer" = $2, "order" = $3, "updatedAt" = NOW()
       WHERE "id" = $4 AND "startupId" = $5
       RETURNING *`,
      [question, answer, order || 0, params.faqId, params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, faq: result.rows[0] });
  } catch (error) {
    console.error('Error updating startup FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; faqId: string } }
) {
  try {
    const session = await getFounderSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const startup = await sql`
      SELECT id, "ownerId" FROM "Startup" WHERE id = ${params.id} AND "deletedAt" IS NULL LIMIT 1
    `;
    if (!startup.length || startup[0].ownerId !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to modify this startup' },
        { status: 403 }
      );
    }

    const result = await db.query(
      `DELETE FROM "StartupFAQ"
       WHERE "id" = $1 AND "startupId" = $2
       RETURNING *`,
      [params.faqId, params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting startup FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}
