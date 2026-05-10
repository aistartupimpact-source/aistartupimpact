import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';

// TEST ENDPOINT - NO AUTH REQUIRED
export async function GET(request: NextRequest) {
  console.log('🧪 TEST ENDPOINT: Fetching web users WITHOUT auth check...');
  
  try {
    const users = await prisma.webUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        slug: true,
        avatar: true,
        bio: true,
        twitter: true,
        linkedin: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            WebUserSession: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`✅ TEST: Found ${users.length} web users`);
    
    return NextResponse.json({ 
      success: true,
      count: users.length,
      users,
      message: 'This is a test endpoint without authentication'
    });
  } catch (error) {
    console.error('❌ TEST: Error fetching web users:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
