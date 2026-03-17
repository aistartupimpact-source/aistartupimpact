import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '../../lib/email';
import { OtpEmail } from '../../lib/emails/templates/OtpEmail';
import { rateLimit } from '../../lib/redis';

const router = express.Router();
const prisma = new PrismaClient();

// In a real application, you would store this in Redis with an expiration
// For this scaffolding, we simulate the OTP generation.
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Rate limit: 3 requests per 5 minutes (300 seconds)
router.post('/request-otp', rateLimit(3, 300), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Check if user exists, or create a placeholder for signups
    let user = await prisma.user.findUnique({
      where: { email },
    });

    const otp = generateOTP();

    // TODO: Save the OTP securely to Redis or Database paired with the email
    // Example: await redis.set(`otp:${email}`, otp, 'EX', 600); // 10 minutes

    // Send the OTP email using Resend
    const result = await sendEmail({
      to: email,
      subject: 'Your AIStartupImpact Login Code',
      react: OtpEmail({ otp, name: user?.name || 'there' }),
    });

    if (!result.success) {
      console.error('Failed to send OTP:', result.error);
      return res.status(500).json({ success: false, error: 'Failed to send verification email' });
    }

    return res.json({
      success: true,
      message: 'Verification code sent successfully',
    });
  } catch (error: any) {
    console.error('Error in request-otp:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
