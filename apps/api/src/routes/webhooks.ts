import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// In production, you would verify the Resend Webhook signature here
// using `resend.webhooks.verify`
router.post('/resend', async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    if (!type || !data || !data.to) {
      return res.status(400).send('Invalid webhook payload');
    }

    const email = data.to[0];

    // If a user complains (marks as spam) or bounces (hard bounce), instantly deactivate them
    if (type === 'email.bounced' || type === 'email.complained') {
      console.log(`Resend Webhook: Setting subscriber ${email} as inactive due to ${type}`);

      await prisma.newsletterSubscriber.updateMany({
        where: { email },
        data: { isActive: false, unsubscribedAt: new Date() },
      });

      // Also deactivate the main User account if it's the same email
      await prisma.user.updateMany({
        where: { email },
        data: { isActive: false },
      });
    }

    // You can handle `email.opened` or `email.clicked` here later to update metrics

    return res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).send('Internal Server Error');
  }
});

export default router;
