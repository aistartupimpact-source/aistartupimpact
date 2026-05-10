import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { generateToken } from '@/lib/founder-auth';
import { sendVerificationEmail } from '@/lib/founder-email';
import { z } from 'zod';

const sql = neon(process.env.DATABASE_URL!);

const resendSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = resendSchema.parse(body);
    
    // Find user
    const users = await sql`
      SELECT id, email, name, "emailVerified", status
      FROM "FounderUser"
      WHERE email = ${validated.email.toLowerCase()}
      LIMIT 1
    `;
    
    if (users.length === 0) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent.'
      });
    }
    
    const user = users[0];
    
    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'This email is already verified. You can login now.'
      });
    }
    
    // Generate new verification token
    const verifyToken = generateToken();
    
    // Update user with new token
    await sql`
      UPDATE "FounderUser"
      SET "verifyToken" = ${verifyToken}, "updatedAt" = NOW()
      WHERE id = ${user.id}
    `;
    
    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verifyToken);
      console.log('✅ Verification email resent to:', user.email);
    } catch (emailError) {
      console.error('❌ Failed to resend verification email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    });
    
  } catch (error: any) {
    console.error('Resend verification error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Invalid email address' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to resend verification email. Please try again.' },
      { status: 500 }
    );
  }
}
