import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// PUT: Update job (activate/deactivate/feature)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { id } = params;

    if (body.isActive !== undefined) {
      await sql`UPDATE "JobBoardListing" SET "isActive" = ${body.isActive}, "updatedAt" = NOW() WHERE id = ${id}`;
    }
    if (body.isFeatured !== undefined) {
      await sql`UPDATE "JobBoardListing" SET "isFeatured" = ${body.isFeatured}, "updatedAt" = NOW() WHERE id = ${id}`;
    }
    if (body.listingTier) {
      await sql`UPDATE "JobBoardListing" SET "listingTier" = ${body.listingTier}::"JobBoardTier", "updatedAt" = NOW() WHERE id = ${id}`;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Admin Jobs Board PUT]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// DELETE: Soft-delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check for SUPER_ADMIN role
  if ((session.user as any).role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Only SUPER_ADMIN can delete' }, { status: 403 });
  }

  try {
    await sql`UPDATE "JobBoardListing" SET "deletedAt" = NOW(), "isActive" = false WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Admin Jobs Board DELETE]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
