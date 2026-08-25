-- Enums
DO $$ BEGIN CREATE TYPE "ModerationStatus" AS ENUM ('NONE', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "MilestoneType" AS ENUM ('FUNDING', 'LAUNCH', 'PARTNERSHIP', 'ACQUISITION', 'AWARD', 'HIRING', 'REVENUE', 'USER_MILESTONE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "MilestoneSource" AS ENUM ('FOUNDER_SUBMITTED', 'ADMIN_CREATED', 'IMPORTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "VerificationStatus" AS ENUM ('FOUNDER_REPORTED', 'PLATFORM_VERIFIED', 'DISPUTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ContentAction" AS ENUM ('CREATED', 'EDITED', 'SUBMITTED_FOR_REVIEW', 'REVISION_REQUESTED', 'RESUBMITTED', 'APPROVED', 'REJECTED', 'PUBLISHED', 'UNPUBLISHED', 'DELETED', 'RESTORED', 'AUTHOR_CHANGED', 'MILESTONE_VERIFIED', 'MILESTONE_UNVERIFIED', 'MERGED_DUPLICATE', 'REPORTED', 'REPORT_REVIEWED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'MISLEADING', 'INAPPROPRIATE', 'COPYRIGHT', 'OTHER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add new ArticleType values
ALTER TYPE "ArticleType" ADD VALUE IF NOT EXISTS 'FOUNDER_STORY';
ALTER TYPE "ArticleType" ADD VALUE IF NOT EXISTS 'STARTUP_UPDATE';

-- Add founder content fields to Article
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "submittedById" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "founderAuthorId" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "moderationNote" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "moderatedBy" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "moderatedAt" TIMESTAMP(3);
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "lastSavedAt" TIMESTAMP(3);
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "autoSaved" BOOLEAN NOT NULL DEFAULT false;

-- Article indexes
CREATE INDEX IF NOT EXISTS "Article_submittedById_idx" ON "Article"("submittedById");
CREATE INDEX IF NOT EXISTS "Article_founderAuthorId_idx" ON "Article"("founderAuthorId");
CREATE INDEX IF NOT EXISTS "Article_moderationStatus_idx" ON "Article"("moderationStatus");
CREATE INDEX IF NOT EXISTS "Article_type_moderationStatus_status_idx" ON "Article"("type", "moderationStatus", "status");

-- Article foreign keys
ALTER TABLE "Article" ADD CONSTRAINT "Article_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "FounderUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Article" ADD CONSTRAINT "Article_founderAuthorId_fkey" FOREIGN KEY ("founderAuthorId") REFERENCES "FounderUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Extend ArticleVersion
ALTER TABLE "ArticleVersion" ADD COLUMN IF NOT EXISTS "versionNumber" INT NOT NULL DEFAULT 1;
ALTER TABLE "ArticleVersion" ADD COLUMN IF NOT EXISTS "excerpt" TEXT;
ALTER TABLE "ArticleVersion" ADD COLUMN IF NOT EXISTS "coverImage" TEXT;
ALTER TABLE "ArticleVersion" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
ALTER TABLE "ArticleVersion" ADD COLUMN IF NOT EXISTS "changeNote" TEXT;
CREATE INDEX IF NOT EXISTS "ArticleVersion_articleId_versionNumber_idx" ON "ArticleVersion"("articleId", "versionNumber");

-- FounderMilestone
CREATE TABLE IF NOT EXISTS "FounderMilestone" (
    "id" TEXT NOT NULL,
    "founderId" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "type" "MilestoneType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(65,30),
    "currency" TEXT DEFAULT 'INR',
    "date" TIMESTAMP(3) NOT NULL,
    "source" "MilestoneSource" NOT NULL DEFAULT 'FOUNDER_SUBMITTED',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'FOUNDER_REPORTED',
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verificationNote" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FounderMilestone_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "FounderMilestone_startupId_type_idx" ON "FounderMilestone"("startupId", "type");
CREATE INDEX IF NOT EXISTS "FounderMilestone_startupId_date_idx" ON "FounderMilestone"("startupId", "date");
CREATE INDEX IF NOT EXISTS "FounderMilestone_founderId_idx" ON "FounderMilestone"("founderId");
CREATE INDEX IF NOT EXISTS "FounderMilestone_verificationStatus_idx" ON "FounderMilestone"("verificationStatus");
CREATE INDEX IF NOT EXISTS "FounderMilestone_status_isPublic_idx" ON "FounderMilestone"("status", "isPublic");
ALTER TABLE "FounderMilestone" ADD CONSTRAINT "FounderMilestone_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "FounderUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FounderMilestone" ADD CONSTRAINT "FounderMilestone_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ContentActivityLog
CREATE TABLE IF NOT EXISTS "ContentActivityLog" (
    "id" TEXT NOT NULL,
    "contentId" TEXT,
    "milestoneId" TEXT,
    "startupId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorType" TEXT NOT NULL DEFAULT 'FOUNDER',
    "action" "ContentAction" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentActivityLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ContentActivityLog_contentId_createdAt_idx" ON "ContentActivityLog"("contentId", "createdAt");
CREATE INDEX IF NOT EXISTS "ContentActivityLog_milestoneId_createdAt_idx" ON "ContentActivityLog"("milestoneId", "createdAt");
CREATE INDEX IF NOT EXISTS "ContentActivityLog_startupId_createdAt_idx" ON "ContentActivityLog"("startupId", "createdAt");
CREATE INDEX IF NOT EXISTS "ContentActivityLog_actorId_createdAt_idx" ON "ContentActivityLog"("actorId", "createdAt");
ALTER TABLE "ContentActivityLog" ADD CONSTRAINT "ContentActivityLog_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContentActivityLog" ADD CONSTRAINT "ContentActivityLog_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "FounderMilestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContentActivityLog" ADD CONSTRAINT "ContentActivityLog_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentActivityLog" ADD CONSTRAINT "ContentActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "FounderUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ContentMedia
CREATE TABLE IF NOT EXISTS "ContentMedia" (
    "id" TEXT NOT NULL,
    "contentId" TEXT,
    "milestoneId" TEXT,
    "startupId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'IMAGE',
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "fileName" TEXT NOT NULL,
    "fileSize" INT NOT NULL DEFAULT 0,
    "mimeType" TEXT NOT NULL,
    "alt" TEXT,
    "caption" TEXT,
    "sortOrder" INT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentMedia_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ContentMedia_contentId_idx" ON "ContentMedia"("contentId");
CREATE INDEX IF NOT EXISTS "ContentMedia_milestoneId_idx" ON "ContentMedia"("milestoneId");
CREATE INDEX IF NOT EXISTS "ContentMedia_startupId_idx" ON "ContentMedia"("startupId");
ALTER TABLE "ContentMedia" ADD CONSTRAINT "ContentMedia_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContentMedia" ADD CONSTRAINT "ContentMedia_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "FounderMilestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContentMedia" ADD CONSTRAINT "ContentMedia_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- FounderContentReport
CREATE TABLE IF NOT EXISTS "FounderContentReport" (
    "id" TEXT NOT NULL,
    "contentId" TEXT,
    "milestoneId" TEXT,
    "reporterType" TEXT NOT NULL DEFAULT 'ANONYMOUS',
    "reporterId" TEXT,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FounderContentReport_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "FounderContentReport_contentId_idx" ON "FounderContentReport"("contentId");
CREATE INDEX IF NOT EXISTS "FounderContentReport_milestoneId_idx" ON "FounderContentReport"("milestoneId");
CREATE INDEX IF NOT EXISTS "FounderContentReport_status_idx" ON "FounderContentReport"("status");
ALTER TABLE "FounderContentReport" ADD CONSTRAINT "FounderContentReport_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FounderContentReport" ADD CONSTRAINT "FounderContentReport_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "FounderMilestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
