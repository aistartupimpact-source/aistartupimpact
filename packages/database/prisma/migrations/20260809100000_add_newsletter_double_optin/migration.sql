-- AlterTable: add double opt-in fields to NewsletterSubscriber
ALTER TABLE "NewsletterSubscriber" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "NewsletterSubscriber" ADD COLUMN IF NOT EXISTS "verificationToken" TEXT;

-- Mark all existing active subscribers as verified (they opted in before double opt-in was introduced)
UPDATE "NewsletterSubscriber" SET "emailVerified" = true WHERE "isActive" = true;
