import { NextRequest, NextResponse } from 'next/server';
import { getFounderSession } from '@/lib/founder-auth';
import { db } from '@/lib/db';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const faqs = await db.query(
      `SELECT id, "toolId", question, answer, "order", "createdAt", "updatedAt"
       FROM "ToolFAQ"
       WHERE "toolId" = $1
       ORDER BY "order" ASC`,
      [params.id]
    );

    return NextResponse.json({ success: true, faqs: faqs.rows });
  } catch (error) {
    console.error('Error fetching tool FAQs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getFounderSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const tool = await sql`
      SELECT id, "ownerId" FROM "AiTool" WHERE id = ${params.id} AND "deletedAt" IS NULL LIMIT 1
    `;
    if (!tool.length || tool[0].ownerId !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to modify this tool' },
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
      `INSERT INTO "ToolFAQ" ("id", "toolId", "question", "answer", "order", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [params.id, question, answer, order || 0]
    );

    return NextResponse.json({ success: true, faq: result.rows[0] });
  } catch (error) {
    console.error('Error creating tool FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}
