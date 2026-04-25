import { NextRequest, NextResponse } from 'next/server';
import { clearFounderSession } from '@/lib/founder-auth';

export async function POST(request: NextRequest) {
  try {
    await clearFounderSession();
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
