import { PrismaClient } from '@prisma/client';
import { resend, FROM_EMAIL } from '../lib/email';
import { NewsletterEmail } from '../lib/emails/templates/NewsletterEmail';
import * as React from 'react';

const prisma = new PrismaClient();

export async function sendNewsletterBatch(campaignId: string) {
  try {
    const campaign = await prisma.newsletterCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.status !== 'DRAFT') {
      throw new Error('Campaign not found or not in draft status');
    }

    // Mark as sending
    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: { status: 'SENDING' },
    });

    // Fetch active subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true, name: true },
    });

    if (subscribers.length === 0) {
      console.log('No active subscribers to send to.');
      await prisma.newsletterCampaign.update({
        where: { id: campaignId },
        data: { status: 'SENT', sentAt: new Date() },
      });
      return;
    }

    // Since campaign.contentJson contains articles array based on our schema
    const articles = campaign.contentJson as unknown as Array<{
      title: string;
      excerpt: string;
      url: string;
      imageUrl?: string;
    }>;

    // Build the payload for Resend Batch API
    // Resend allows sending up to 100 emails per batch request
    const batchPayload = subscribers.map((sub) => ({
      from: FROM_EMAIL,
      to: [sub.email],
      subject: campaign.subject,
      react: NewsletterEmail({
        subject: campaign.subject,
        previewText: campaign.previewText || '',
        articles: articles,
      }) as React.ReactElement,
    }));

    // Chunk into batches of 100 based on Resend limits
    const CHUNK_SIZE = 100;
    for (let i = 0; i < batchPayload.length; i += CHUNK_SIZE) {
      const chunk = batchPayload.slice(i, i + CHUNK_SIZE);
      const data = await resend.batch.send(chunk);
      console.log(`Sent batch ${i / CHUNK_SIZE + 1}`, data);
    }

    // Mark as completed
    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        totalSent: subscribers.length,
      },
    });

    console.log('Newsletter campaign sent successfully');
  } catch (error) {
    console.error('Failed to send newsletter batch:', error);
    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: { status: 'FAILED' },
    });
  }
}
