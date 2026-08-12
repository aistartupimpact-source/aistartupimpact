import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { paymentSuccessHtml } from '@aistartupimpact/utils';
import { sendEmailFireAndForget } from '../lib/email-send';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/resend', async (req: Request, res: Response) => {
  try {
    // Verify Resend webhook signature via Svix
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (webhookSecret) {
      try {
        const { Webhook } = await import('svix');
        const wh = new Webhook(webhookSecret);
        wh.verify(JSON.stringify(req.body), {
          'svix-id': req.headers['svix-id'] as string,
          'svix-timestamp': req.headers['svix-timestamp'] as string,
          'svix-signature': req.headers['svix-signature'] as string,
        });
      } catch (verifyErr) {
        console.error('Resend webhook signature verification failed:', verifyErr);
        return res.status(401).send('Invalid webhook signature');
      }
    } else {
      console.warn('RESEND_WEBHOOK_SECRET not set — skipping signature verification');
    }

    const { type, data } = req.body;

    if (!type || !data || !data.to) {
      return res.status(400).send('Invalid webhook payload');
    }

    const email = data.to[0];

    // If a user complains (marks as spam) or bounces (hard bounce), instantly deactivate them
    if (type === 'email.bounced' || type === 'email.complained') {
      console.log(`Resend Webhook: deactivating subscriber due to ${type}`);

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
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured');
      return res.status(500).send('Webhook secret not configured');
    }

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

      // Send payment success email to tool owner
      if (tool.ownerId) {
        try {
          const owner = await prisma.founderUser.findUnique({
            where: { id: tool.ownerId },
            select: { email: true, name: true },
          });
          if (owner?.email) {
            sendEmailFireAndForget({
              to: owner.email,
              subject: `Payment confirmed — ${tool.name} upgraded to ${tool.pendingTier || 'Premium'}`,
              html: paymentSuccessHtml(tool.name, owner.name || 'there', tool.pendingTier || 'Premium'),
              type: 'payment_success',
            });
          }
        } catch (emailErr) {
          console.error('Failed to send payment success email:', emailErr);
        }
      }
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
