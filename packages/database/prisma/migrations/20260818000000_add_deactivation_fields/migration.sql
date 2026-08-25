-- AlterTable: Add deactivatedAt and deletedAt to FounderUser
ALTER TABLE "FounderUser" ADD COLUMN "deactivatedAt" TIMESTAMP(3);
ALTER TABLE "FounderUser" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "FounderUser_deactivatedAt_idx" ON "FounderUser"("deactivatedAt");

-- AlterTable: Add deactivatedAt and deletedAt to WebUser
ALTER TABLE "WebUser" ADD COLUMN "deactivatedAt" TIMESTAMP(3);
ALTER TABLE "WebUser" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "WebUser_deactivatedAt_idx" ON "WebUser"("deactivatedAt");

-- AlterTable: Add deactivatedAt and deletedAt to EventOrganizer
ALTER TABLE "EventOrganizer" ADD COLUMN "deactivatedAt" TIMESTAMP(3);
ALTER TABLE "EventOrganizer" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "EventOrganizer_deactivatedAt_idx" ON "EventOrganizer"("deactivatedAt");

-- AlterTable: Add deactivatedAt and deletedAt to JobBoardEmployer
ALTER TABLE "JobBoardEmployer" ADD COLUMN "deactivatedAt" TIMESTAMP(3);
ALTER TABLE "JobBoardEmployer" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "JobBoardEmployer_deactivatedAt_idx" ON "JobBoardEmployer"("deactivatedAt");
