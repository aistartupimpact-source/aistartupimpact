-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('CUSTOM', 'STARTUP', 'FUNDING', 'EVENT', 'JOB', 'TOOL');

-- CreateTable
CREATE TABLE "SiteAnnouncement" (
    "id" TEXT NOT NULL,
    "type" "AnnouncementType" NOT NULL DEFAULT 'CUSTOM',
    "text" TEXT NOT NULL,
    "mobileText" TEXT,
    "emoji" TEXT NOT NULL DEFAULT '📢',
    "link" TEXT NOT NULL,
    "startupId" TEXT,
    "fundingRoundId" TEXT,
    "eventId" TEXT,
    "jobListingId" TEXT,
    "toolId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteAnnouncement_isActive_sortOrder_idx" ON "SiteAnnouncement"("isActive", "sortOrder");

-- AddForeignKey
ALTER TABLE "SiteAnnouncement" ADD CONSTRAINT "SiteAnnouncement_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SiteAnnouncement" ADD CONSTRAINT "SiteAnnouncement_fundingRoundId_fkey" FOREIGN KEY ("fundingRoundId") REFERENCES "FundingRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SiteAnnouncement" ADD CONSTRAINT "SiteAnnouncement_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SiteAnnouncement" ADD CONSTRAINT "SiteAnnouncement_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobBoardListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SiteAnnouncement" ADD CONSTRAINT "SiteAnnouncement_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "AiTool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed with existing hardcoded announcements
INSERT INTO "SiteAnnouncement" ("id", "type", "text", "mobileText", "emoji", "link", "isActive", "sortOrder", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'CUSTOM', 'Submit your AI startup — Get discovered by VCs & buyers', 'Submit your AI startup', '🚀', '/submit-startup', true, 0, NOW()),
  (gen_random_uuid()::text, 'CUSTOM', 'List your AI tool — Reach 5,000+ professionals', 'List your AI tool', '🛠️', '/submit-tool', true, 1, NOW()),
  (gen_random_uuid()::text, 'CUSTOM', 'Post a job — Hire top AI talent in India', 'Post a job — Hire AI talent', '📢', '/employer/signup', true, 2, NOW()),
  (gen_random_uuid()::text, 'CUSTOM', 'Upcoming AI events — Register now', 'AI events — Register now', '🎯', '/events', true, 3, NOW());
