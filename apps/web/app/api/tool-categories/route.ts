import { NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';

export async function GET() {
  try {
    // Use raw SQL to avoid date validation issues
    const categories = await prisma.$queryRaw<any[]>`
      SELECT id, name, slug
      FROM "ToolCategory"
      ORDER BY "sortOrder" ASC, name ASC
    `;

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    console.error('Error fetching tool categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch categories',
        categories: [],
      },
      { status: 500 }
    );
  }
}
