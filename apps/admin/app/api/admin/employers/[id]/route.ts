import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// PUT: Update employer (verify, suspend, change plan)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { id } = params;

    if (body.isVerified !== undefined) {
      await sql`UPDATE "JobBoardEmployer" SET "isVerified" = ${body.isVerified}, "updatedAt" = NOW() WHERE id = ${id}`;
    }
    if (body.isActive !== undefined) {
      await sql`UPDATE "JobBoardEmployer" SET "isActive" = ${body.isActive}, "updatedAt" = NOW() WHERE id = ${id}`;
    }
    if (body.plan) {
      const maxJobs = body.plan === 'PREMIUM' ? 999 : body.plan === 'FEATURED' ? 5 : 1;
      await sql`UPDATE "JobBoardEmployer" SET plan = ${body.plan}::"JobBoardPlan", "maxActiveJobs" = ${maxJobs}, "updatedAt" = NOW() WHERE id = ${id}`;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Admin Employers PUT]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
