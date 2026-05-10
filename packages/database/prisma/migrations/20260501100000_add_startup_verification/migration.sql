-- Add Startup Verification & Claim Features
-- This migration adds domain verification for startups

-- ════════════════════════════════════════════
-- UPDATE STARTUP TABLE
-- ════════════════════════════════════════════

-- Add verification fields to Startup table
ALTER TABLE "Startup" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Startup" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);
ALTER TABLE "Startup" ADD COLUMN IF NOT EXISTS "verificationToken" TEXT;
ALTER TABLE "Startup" ADD COLUMN IF NOT EXISTS "verifiedDomain" TEXT;
ALTER TABLE "Startup" ADD COLUMN IF NOT EXISTS "claimedBy" TEXT;
ALTER TABLE "Startup" ADD COLUMN IF NOT EXISTS "claimedAt" TIMESTAMP(3);

-- Create unique index on verification token
CREATE UNIQUE INDEX IF NOT EXISTS "Startup_verificationToken_key" ON "Startup"("verificationToken");

-- Create index on claimedBy for faster lookups
CREATE INDEX IF NOT EXISTS "Startup_claimedBy_idx" ON "Startup"("claimedBy");

-- Create index on isVerified for filtering
CREATE INDEX IF NOT EXISTS "Startup_isVerified_idx" ON "Startup"("isVerified");

-- Add foreign key constraint for claimedBy
ALTER TABLE "Startup" ADD CONSTRAINT "Startup_claimedBy_fkey" 
  FOREIGN KEY ("claimedBy") REFERENCES "FounderUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ════════════════════════════════════════════
-- VERIFICATION LOG TABLE
-- ════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "StartupVerificationLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "startupId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "method" TEXT NOT NULL DEFAULT 'DNS',
  "token" TEXT,
  "dnsRecord" TEXT,
  "success" BOOLEAN NOT NULL DEFAULT false,
  "errorMessage" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "StartupVerificationLog_startupId_fkey" 
    FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StartupVerificationLog_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "FounderUser"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for verification logs
CREATE INDEX IF NOT EXISTS "StartupVerificationLog_startupId_createdAt_idx" 
  ON "StartupVerificationLog"("startupId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "StartupVerificationLog_userId_idx" 
  ON "StartupVerificationLog"("userId");
CREATE INDEX IF NOT EXISTS "StartupVerificationLog_action_idx" 
  ON "StartupVerificationLog"("action");
