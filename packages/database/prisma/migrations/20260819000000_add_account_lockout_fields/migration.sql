-- AlterTable: Add account lockout fields to FounderUser
ALTER TABLE "FounderUser" ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "FounderUser" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3);

-- AlterTable: Add account lockout fields to EventOrganizer
ALTER TABLE "EventOrganizer" ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "EventOrganizer" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3);

-- AlterTable: Add account lockout fields to WebUser
ALTER TABLE "WebUser" ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "WebUser" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3);

-- AlterTable: Add account lockout fields to JobBoardEmployer
ALTER TABLE "JobBoardEmployer" ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "JobBoardEmployer" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3);

-- AlterTable: Add account lockout fields to User (legacy admin)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3);
