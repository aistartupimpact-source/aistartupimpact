-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "FounderTeamRole" AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "FounderTeamMember" (
    "id" TEXT NOT NULL,
    "founderId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "FounderTeamRole" NOT NULL DEFAULT 'VIEWER',
    "status" "TeamMemberStatus" NOT NULL DEFAULT 'PENDING',
    "inviteToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "passwordHash" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FounderTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "FounderTeamMember_inviteToken_key" ON "FounderTeamMember"("inviteToken");
CREATE UNIQUE INDEX IF NOT EXISTS "FounderTeamMember_founderId_email_key" ON "FounderTeamMember"("founderId", "email");
CREATE INDEX IF NOT EXISTS "FounderTeamMember_email_idx" ON "FounderTeamMember"("email");
CREATE INDEX IF NOT EXISTS "FounderTeamMember_inviteToken_idx" ON "FounderTeamMember"("inviteToken");
CREATE INDEX IF NOT EXISTS "FounderTeamMember_founderId_idx" ON "FounderTeamMember"("founderId");

-- AddForeignKey
ALTER TABLE "FounderTeamMember" ADD CONSTRAINT "FounderTeamMember_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "FounderUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
