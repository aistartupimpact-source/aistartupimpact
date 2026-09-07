-- Add GDPR consent fields to NewsletterSubscriber
ALTER TABLE "NewsletterSubscriber" ADD COLUMN "consentAt" TIMESTAMP(3);
ALTER TABLE "NewsletterSubscriber" ADD COLUMN "consentText" TEXT;
ALTER TABLE "NewsletterSubscriber" ADD COLUMN "consentVersion" INTEGER;
ALTER TABLE "NewsletterSubscriber" ADD COLUMN "consentSource" TEXT;
