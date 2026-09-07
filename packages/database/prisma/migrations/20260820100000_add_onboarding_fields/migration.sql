-- Add onboarding fields to EventOrganizer
ALTER TABLE "EventOrganizer" ADD COLUMN "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "EventOrganizer" ADD COLUMN "onboardingStep" INTEGER NOT NULL DEFAULT 0;

-- Add onboarding fields to JobBoardEmployer
ALTER TABLE "JobBoardEmployer" ADD COLUMN "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "JobBoardEmployer" ADD COLUMN "onboardingStep" INTEGER NOT NULL DEFAULT 0;

-- Backfill: existing active users should skip onboarding
UPDATE "EventOrganizer" SET "onboardingCompleted" = true WHERE "status" = 'ACTIVE';
UPDATE "JobBoardEmployer" SET "onboardingCompleted" = true WHERE "isActive" = true;
