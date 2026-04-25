import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { z } from 'zod';

const verifySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = verifySchema.parse(body);
    
    // Find user with this verification token
    const user = await prisma.founderUser.findUnique({
      where: { verifyToken: validated.token }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification link' },
        { status: 400 }
      );
    }
    
    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email already verified. You can now login.' },
        { status: 200 }
      );
    }
    
    // Update user - verify email and activate account
    await prisma.founderUser.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verifyToken: null, // Clear the token
        status: 'ACTIVE', // Activate the account
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now login.'
    });
    
  } catch (error: any) {
    console.error('Verification error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
