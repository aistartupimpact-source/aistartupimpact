import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/startups/[id]/faqs - Get all FAQs for a startup
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const faqs = await db.query(
      `SELECT id, "startupId", question, answer, "order", "createdAt", "updatedAt"
       FROM "StartupFAQ"
       WHERE "startupId" = $1
       ORDER BY "order" ASC`,
      [params.id]
    );

    return NextResponse.json({ success: true, faqs: faqs.rows });
  } catch (error: any) {
    console.error('Error fetching startup FAQs:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/startups/[id]/faqs - Create a new FAQ
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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
      `INSERT INTO "StartupFAQ" ("id", "startupId", "question", "answer", "order", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [params.id, question, answer, order || 0]
    );

    return NextResponse.json({ success: true, faq: result.rows[0] });
  } catch (error: any) {
    console.error('Error creating startup FAQ:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
