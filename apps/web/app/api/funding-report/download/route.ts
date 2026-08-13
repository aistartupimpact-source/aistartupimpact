import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email, subscribeNewsletter } = await req.json();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: false, error: 'Valid email required' }, { status: 400 });
    }

    const emailLower = email.toLowerCase();

    if (subscribeNewsletter) {
      const consentText = 'I agree to receive the AI Startup Impact newsletter along with the funding report.';
      await prisma.$executeRaw`
        INSERT INTO "NewsletterSubscriber" (id, email, "subscribedAt", source, "isActive", "consentAt", "consentText", "consentVersion", "consentSource")
        VALUES (gen_random_uuid(), ${emailLower}, NOW(), 'funding_report', true, NOW(), ${consentText}, '1.0', 'funding_report_download')
        ON CONFLICT (email)
        DO UPDATE SET "isActive" = true, "subscribedAt" = NOW(), "consentAt" = NOW(), "consentText" = ${consentText}, "consentVersion" = '1.0', "consentSource" = 'funding_report_download'
      `;
    }

    // TODO: Integrate with your email service to send the PDF
    // For now, return success and let the frontend handle the download

    return NextResponse.json({ 
      success: true, 
      data: { 
        message: 'Email registered! Download will start shortly.',
        downloadUrl: '/funding-report-q1-2026.pdf' // This should be generated dynamically
      } 
    });
  } catch (error) {
    console.error('Funding report download error:', error);
    return NextResponse.json({ success: false, error: 'Download failed' }, { status: 500 });
  }
}
