import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireApiAuth } from '@/lib/api-auth';

const sql = neon(process.env.DATABASE_URL!);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  try {
    const { isActive } = await request.json();

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
  const { error } = await requireApiAuth(['SUPER_ADMIN']);
  if (error) return error;

  try {
    await sql`DELETE FROM "WebUserSession" WHERE "webUserId" = ${params.id}`;
    await sql`DELETE FROM "WebUser" WHERE id = ${params.id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting web user:', error);
    return NextResponse.json(
      { error: 'Failed to delete web user' },
      { status: 500 }
    );
  }
}
