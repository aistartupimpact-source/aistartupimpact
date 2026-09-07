-- Add terms version tracking for re-consent on policy changes
ALTER TABLE "WebUser" ADD COLUMN "termsVersion" TEXT;
