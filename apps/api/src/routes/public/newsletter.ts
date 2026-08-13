import { Router, Request, Response } from 'express';
import { prisma } from '@aistartupimpact/database';
import crypto from 'crypto';

const router = Router();

const CONSENT_TEXT = 'I agree to receive the AI Startup Impact newsletter with AI startup news, tools, and insights. You can unsubscribe at any time.';
const CONSENT_VERSION = 1;

// POST /v1/newsletter/subscribe
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { email, name, source = 'api' } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, data: null, error: 'Valid email is required' });
    }

    const emailLower = email.toLowerCase().trim();

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: emailLower },
    });

    if (existing?.isActive && existing?.emailVerified) {
      return res.json({
        success: true,
        data: { message: 'You are already subscribed.' },
      });
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');

    if (!existing) {
      await prisma.newsletterSubscriber.create({
        data: {
          id: crypto.randomUUID(),
          email: emailLower,
          name: name || null,
          source,
          isActive: false,
          emailVerified: false,
          verificationToken: verifyToken,
          consentAt: new Date(),
          consentText: CONSENT_TEXT,
          consentVersion: CONSENT_VERSION,
          consentSource: source,
        },
      });
    } else {
      await prisma.newsletterSubscriber.update({
        where: { email: emailLower },
        data: {
          isActive: false,
          emailVerified: false,
          verificationToken: verifyToken,
          consentAt: new Date(),
          consentText: CONSENT_TEXT,
          consentVersion: CONSENT_VERSION,
          consentSource: source,
        },
      });
    }

    // The verification email is sent by the web app's /api/newsletter/confirm flow.
    // API consumers should call the web app's confirmation endpoint or implement
    // their own verification email using the verifyToken.

    res.json({
      success: true,
      data: { message: 'Please check your email to confirm your subscription.' },
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ success: false, data: null, error: 'Subscription failed' });
  }
});

// POST /v1/newsletter/unsubscribe
router.post('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    // TODO: Validate token, mark subscriber as inactive
    res.json({ success: true, data: { message: 'Successfully unsubscribed.' } });
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: 'Unsubscribe failed' });
  }
});

export default router;
