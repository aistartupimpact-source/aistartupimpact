-- CreateEnum
CREATE TYPE "AdvPackageTier" AS ENUM ('FREE', 'STARTER', 'GROWTH', 'PREMIUM');
CREATE TYPE "AdvPackageStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'UPGRADED', 'CANCELLED');
CREATE TYPE "AdvZoneTier" AS ENUM ('TIER_1', 'TIER_2', 'TIER_3');
CREATE TYPE "AdvZoneSlot" AS ENUM (
  'PROMO_BADGE_HEADER', 'HOMEPAGE_HERO', 'POWERED_BY_SECTION',
  'FOUNDER_SPOTLIGHT', 'FEATURED_PARTNER', 'WEBSITE_NEWSLETTER_FEATURED', 'LINKEDIN_NEWSLETTER_FEATURED',
  'LATEST_STORIES_CARD_1', 'AI_TOOL_PICKS', 'STORIES_PAGE_FEATURED', 'AI_TOOLS_PAGE_FEATURED', 'STARTUP_DIRECTORY_FEATURED'
);
CREATE TYPE "AdvActivationStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE "AdvSocialPostType" AS ENUM ('LINKEDIN', 'INSTAGRAM', 'BUNDLE');
CREATE TYPE "AdvSocialPostStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'SCHEDULED', 'PUBLISHED', 'CANCELLED');
CREATE TYPE "AdvPaymentPurpose" AS ENUM ('PACKAGE_PURCHASE', 'PACKAGE_UPGRADE', 'ZONE_EXTENSION', 'SOCIAL_POST');

-- CreateTable: AdvPackage
CREATE TABLE "AdvPackage" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "founderId" TEXT NOT NULL,
    "tier" "AdvPackageTier" NOT NULL,
    "status" "AdvPackageStatus" NOT NULL DEFAULT 'ACTIVE',
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "upgradedFromId" TEXT,
    "upgradedToId" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdvPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AdvZoneActivation
CREATE TABLE "AdvZoneActivation" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "packageId" TEXT NOT NULL,
    "zone" "AdvZoneSlot" NOT NULL,
    "zoneTier" "AdvZoneTier" NOT NULL,
    "status" "AdvActivationStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "freeDaysUsed" INTEGER NOT NULL DEFAULT 3,
    "extensionDays" INTEGER NOT NULL DEFAULT 0,
    "extensionRate" INTEGER NOT NULL DEFAULT 0,
    "extensionTotal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdvZoneActivation_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AdvSocialPostOrder
CREATE TABLE "AdvSocialPostOrder" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "packageId" TEXT NOT NULL,
    "postType" "AdvSocialPostType" NOT NULL,
    "status" "AdvSocialPostStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "contentBrief" TEXT,
    "publishedUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "amountPaise" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdvSocialPostOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AdvPayment
CREATE TABLE "AdvPayment" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "founderId" TEXT NOT NULL,
    "packageId" TEXT,
    "zoneActivationId" TEXT,
    "socialPostOrderId" TEXT,
    "purpose" "AdvPaymentPurpose" NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "gstPaise" INTEGER NOT NULL,
    "totalPaise" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "refundAmountPaise" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdvPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdvPackage_founderId_status_idx" ON "AdvPackage"("founderId", "status");
CREATE INDEX "AdvPackage_expiresAt_idx" ON "AdvPackage"("expiresAt");
CREATE INDEX "AdvPackage_tier_status_idx" ON "AdvPackage"("tier", "status");
CREATE UNIQUE INDEX "AdvPackage_upgradedFromId_key" ON "AdvPackage"("upgradedFromId");

CREATE UNIQUE INDEX "AdvZoneActivation_packageId_zone_key" ON "AdvZoneActivation"("packageId", "zone");
CREATE INDEX "AdvZoneActivation_zone_status_startsAt_endsAt_idx" ON "AdvZoneActivation"("zone", "status", "startsAt", "endsAt");
CREATE INDEX "AdvZoneActivation_status_endsAt_idx" ON "AdvZoneActivation"("status", "endsAt");

CREATE INDEX "AdvSocialPostOrder_packageId_status_idx" ON "AdvSocialPostOrder"("packageId", "status");
CREATE INDEX "AdvSocialPostOrder_postType_status_idx" ON "AdvSocialPostOrder"("postType", "status");

CREATE UNIQUE INDEX "AdvPayment_razorpayOrderId_key" ON "AdvPayment"("razorpayOrderId");
CREATE UNIQUE INDEX "AdvPayment_razorpayPaymentId_key" ON "AdvPayment"("razorpayPaymentId");
CREATE INDEX "AdvPayment_founderId_status_idx" ON "AdvPayment"("founderId", "status");
CREATE INDEX "AdvPayment_razorpayOrderId_idx" ON "AdvPayment"("razorpayOrderId");
CREATE INDEX "AdvPayment_status_createdAt_idx" ON "AdvPayment"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "AdvPackage" ADD CONSTRAINT "AdvPackage_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "FounderUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdvPackage" ADD CONSTRAINT "AdvPackage_upgradedFromId_fkey" FOREIGN KEY ("upgradedFromId") REFERENCES "AdvPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AdvZoneActivation" ADD CONSTRAINT "AdvZoneActivation_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "AdvPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AdvSocialPostOrder" ADD CONSTRAINT "AdvSocialPostOrder_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "AdvPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AdvPayment" ADD CONSTRAINT "AdvPayment_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "FounderUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdvPayment" ADD CONSTRAINT "AdvPayment_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "AdvPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdvPayment" ADD CONSTRAINT "AdvPayment_zoneActivationId_fkey" FOREIGN KEY ("zoneActivationId") REFERENCES "AdvZoneActivation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdvPayment" ADD CONSTRAINT "AdvPayment_socialPostOrderId_fkey" FOREIGN KEY ("socialPostOrderId") REFERENCES "AdvSocialPostOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
