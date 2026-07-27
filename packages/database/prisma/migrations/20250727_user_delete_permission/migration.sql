-- Add temporary delete permission field to User table
-- SUPER_ADMIN can grant time-limited delete access to other admins
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "canDeleteUntil" TIMESTAMP(3) DEFAULT NULL;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deleteGrantedBy" TEXT DEFAULT NULL;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deleteGrantedAt" TIMESTAMP(3) DEFAULT NULL;

CREATE INDEX IF NOT EXISTS "User_canDeleteUntil_idx" ON "User"("canDeleteUntil");
