import { Router, Request, Response } from 'express';
import { prisma } from '@aistartupimpact/database';

const router = Router();

// POST /v1/newsletter/subscribe
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { email, name, source = 'website' } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, data: null, error: 'Valid email is required' });
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email: email.toLowerCase() },
      update: {
        isActive: true,
        source: source
      },
      create: {
        email: email.toLowerCase(),
        name,
        source
      }
    });

    res.json({
      success: true,
      data: { message: 'Successfully subscribed! Check your inbox for confirmation.' },
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
