import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

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

// Razorpay Idempotent Webhook
router.post('/razorpay', async (req: Request, res: Response): Promise<any> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'fallback_secret';

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      return res.status(400).send('Invalid signature');
    }

    const { event, payload } = req.body;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      // 1. Idempotency Check
      const existingPayment = await prisma.aiTool.findUnique({
        where: { razorpayPaymentId: paymentId }
      });
      if (existingPayment) {
        return res.status(200).send('Already processed (Idempotency Hit)');
      }

      // 2. Fetch Tool
      const tool = await prisma.aiTool.findUnique({
        where: { razorpayOrderId: orderId }
      });

      if (!tool) {
        return res.status(404).send('Tool mapping not found for order');
      }

      // 3. Upgrade Listing Tier to pendingTier
      await prisma.aiTool.update({
        where: { id: tool.id },
        data: {
          razorpayPaymentId: paymentId,
          paymentStatus: 'SUCCESS',
          listingTier: tool.pendingTier || 'FREE'
        }
      });

      // 4. In a real system, trigger workers/transactional.ts to send "Payment Success" email here.
      console.log(`Razorpay success! Activated Premium for tool: ${tool.name}`);
    }

    if (event === 'payment.failed') {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;

      await prisma.aiTool.updateMany({
        where: { razorpayOrderId: orderId },
        data: { paymentStatus: 'FAILED' }
      });
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    return res.status(500).send('Internal Server Error');
  }
});

export default router;
