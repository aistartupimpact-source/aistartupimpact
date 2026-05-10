import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isActive } = await request.json();

    // Use raw SQL to avoid Prisma DateTime serialization issues
    const result = await sql`
      UPDATE "WebUser"
      SET "isActive" = ${isActive}
      WHERE id = ${params.id}
      RETURNING id, email, name, "isActive"
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: result[0] });
  } catch (error) {
    console.error('Error updating web user:', error);
    return NextResponse.json(
      { error: 'Failed to update web user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete user sessions first (manual cascade since we're using raw SQL)
    await sql`
      DELETE FROM "WebUserSession"
      WHERE "webUserId" = ${params.id}
    `;

    // Delete user
    await sql`
      DELETE FROM "WebUser"
      WHERE id = ${params.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting web user:', error);
    return NextResponse.json(
      { error: 'Failed to delete web user' },
      { status: 500 }
    );
  }
}
