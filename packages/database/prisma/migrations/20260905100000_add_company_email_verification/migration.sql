-- AlterTable: Add company email verification fields to FounderUser
ALTER TABLE "FounderUser"
  ADD COLUMN "companyEmail" TEXT,
  ADD COLUMN "companyEmailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "companyEmailVerifiedAt" TIMESTAMP(3);

-- AlterTable: Add company email verification fields to EventOrganizer
ALTER TABLE "EventOrganizer"
  ADD COLUMN "companyDomain" TEXT,
  ADD COLUMN "companyEmail" TEXT,
  ADD COLUMN "companyEmailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "companyEmailVerifiedAt" TIMESTAMP(3);
