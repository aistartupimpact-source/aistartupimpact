import express, { Request, Response } from 'express';
import Razorpay from 'razorpay';
import { prisma } from '@aistartupimpact/database';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_fallback',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'fallback_secret',
});

router.post('/create-order', async (req: Request, res: Response): Promise<any> => {
  try {
    const { toolId, tier } = req.body;

    if (!toolId || !tier) {
      return res.status(400).json({ error: 'Missing toolId or tier' });
    }

    if (tier !== 'PRIORITY' && tier !== 'FEATURED') {
      return res.status(400).json({ error: 'Invalid tier for payment' });
    }

    // Determine pricing (INR as default base)
    const amountInr = tier === 'FEATURED' ? 14999 : 4999;
    const amountPaise = amountInr * 100;

    const options = {
      amount: amountPaise,
      currency: 'INR',
      receipt: `receipt_${toolId}`,
    };

    const order = await razorpay.orders.create(options);

    // Secure race conditions: Map the pending tier and order ID
    await prisma.aiTool.update({
      where: { id: toolId },
      data: {
        pendingTier: tier as 'PRIORITY' | 'FEATURED',
        razorpayOrderId: order.id,
        paymentStatus: 'PENDING'
      }
    });

    return res.json({ success: true, orderId: order.id, amount: amountPaise, currency: 'INR' });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
