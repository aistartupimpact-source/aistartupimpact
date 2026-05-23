import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// PUT /api/tools/[id]/faqs/[faqId] - Update an FAQ
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; faqId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
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
      `UPDATE "ToolFAQ"
       SET "question" = $1, "answer" = $2, "order" = $3, "updatedAt" = NOW()
       WHERE "id" = $4 AND "toolId" = $5
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
  } catch (error: any) {
    console.error('Error updating tool FAQ:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/tools/[id]/faqs/[faqId] - Delete an FAQ
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; faqId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await db.query(
      `DELETE FROM "ToolFAQ"
       WHERE "id" = $1 AND "toolId" = $2
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
  } catch (error: any) {
    console.error('Error deleting tool FAQ:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
