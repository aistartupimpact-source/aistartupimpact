-- Enable PostgreSQL extensions for geo-targeting
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "earthdistance";

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('CONFERENCE', 'HACKATHON', 'SUMMIT', 'WORKSHOP', 'MEETUP', 'DEMO_DAY', 'WEBINAR', 'NETWORKING');

-- CreateEnum
CREATE TYPE "EventFormat" AS ENUM ('IN_PERSON', 'VIRTUAL', 'HYBRID');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EventVisibility" AS ENUM ('PUBLIC', 'UNLISTED', 'INVITE_ONLY');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('CONFIRMED', 'PENDING_PAYMENT', 'WAITLISTED', 'CANCELLED', 'CHECKED_IN');

-- CreateEnum
CREATE TYPE "TicketTierType" AS ENUM ('EARLY_BIRD', 'REGULAR', 'VIP');

-- CreateEnum
CREATE TYPE "EventCustomQuestionType" AS ENUM ('TEXT', 'SELECT', 'CHECKBOX');

-- CreateEnum
CREATE TYPE "EventCampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'EVENT_ORGANIZER';

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "category" "EventCategory" NOT NULL,
    "format" "EventFormat" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "venueName" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "meetingLink" TEXT,
    "revealLinkAfterRegistration" BOOLEAN NOT NULL DEFAULT false,
    "coverImageUrl" TEXT,
    "galleryImageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" JSONB,
    "capacity" INTEGER,
    "registrationCount" INTEGER NOT NULL DEFAULT 0,
    "visibility" "EventVisibility" NOT NULL DEFAULT 'PUBLIC',
    "registrationDeadline" TIMESTAMP(3),
    "approvalRequired" BOOLEAN NOT NULL DEFAULT false,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "socialImageUrl" TEXT,
    "publishAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSpeaker" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "company" TEXT,
    "headshotUrl" TEXT,
    "bio" TEXT,
    "talkTitle" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSpeaker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAgendaItem" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "eventId" TEXT NOT NULL,
    "speakerId" TEXT,
    "dayNumber" INTEGER NOT NULL DEFAULT 1,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventAgendaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTicketTier" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "quantity" INTEGER,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "saleStart" TIMESTAMP(3),
    "saleEnd" TIMESTAMP(3),
    "tierType" "TicketTierType" NOT NULL DEFAULT 'REGULAR',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventTicketTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCustomQuestion" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "eventId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" "EventCustomQuestionType" NOT NULL DEFAULT 'TEXT',
    "options" JSONB,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventCustomQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "ticketTierId" TEXT,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "guestCompany" TEXT,
    "guestRole" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'CONFIRMED',
    "qrToken" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "razorpayOrderId" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistrationAnswer" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "registrationId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,

    CONSTRAINT "EventRegistrationAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTag" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "canonicalName" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTagMapping" (
    "eventId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "EventTagMapping_pkey" PRIMARY KEY ("eventId","tagId")
);

-- CreateTable
CREATE TABLE "EventSubscriber" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT,
    "locationCity" TEXT,
    "locationLat" DOUBLE PRECISION,
    "locationLng" DOUBLE PRECISION,
    "locationCountryCode" TEXT,
    "locationRegion" TEXT,
    "subscribed" BOOLEAN NOT NULL DEFAULT true,
    "consentAt" TIMESTAMP(3),
    "consentSource" TEXT,
    "consentText" TEXT,
    "consentVersion" INTEGER NOT NULL DEFAULT 1,
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSubscriberInterest" (
    "subscriberId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "EventSubscriberInterest_pkey" PRIMARY KEY ("subscriberId","tagId")
);

-- CreateTable
CREATE TABLE "EventEmailCampaign" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "eventId" TEXT,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "bodyJson" JSONB,
    "audienceQuery" JSONB,
    "status" "EventCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventEmailCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCampaignRecipient" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "campaignId" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),

    CONSTRAINT "EventCampaignRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_slug_idx" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_status_visibility_idx" ON "Event"("status", "visibility");

-- CreateIndex
CREATE INDEX "Event_startAt_idx" ON "Event"("startAt");

-- CreateIndex
CREATE INDEX "Event_organizerId_idx" ON "Event"("organizerId");

-- CreateIndex
CREATE INDEX "Event_category_idx" ON "Event"("category");

-- CreateIndex
CREATE INDEX "Event_format_idx" ON "Event"("format");

-- CreateIndex
CREATE INDEX "Event_latitude_longitude_idx" ON "Event"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Event_deletedAt_idx" ON "Event"("deletedAt");

-- CreateIndex
CREATE INDEX "EventSpeaker_eventId_idx" ON "EventSpeaker"("eventId");

-- CreateIndex
CREATE INDEX "EventAgendaItem_eventId_dayNumber_idx" ON "EventAgendaItem"("eventId", "dayNumber");

-- CreateIndex
CREATE INDEX "EventTicketTier_eventId_idx" ON "EventTicketTier"("eventId");

-- CreateIndex
CREATE INDEX "EventCustomQuestion_eventId_idx" ON "EventCustomQuestion"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_qrToken_key" ON "EventRegistration"("qrToken");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_idx" ON "EventRegistration"("eventId");

-- CreateIndex
CREATE INDEX "EventRegistration_userId_idx" ON "EventRegistration"("userId");

-- CreateIndex
CREATE INDEX "EventRegistration_qrToken_idx" ON "EventRegistration"("qrToken");

-- CreateIndex
CREATE INDEX "EventRegistration_status_idx" ON "EventRegistration"("status");

-- CreateIndex
CREATE INDEX "EventRegistration_deletedAt_idx" ON "EventRegistration"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_eventId_guestEmail_key" ON "EventRegistration"("eventId", "guestEmail");

-- CreateIndex
CREATE INDEX "EventRegistrationAnswer_registrationId_idx" ON "EventRegistrationAnswer"("registrationId");

-- CreateIndex
CREATE INDEX "EventRegistrationAnswer_questionId_idx" ON "EventRegistrationAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "EventTag_name_key" ON "EventTag"("name");

-- CreateIndex
CREATE INDEX "EventTag_canonicalName_idx" ON "EventTag"("canonicalName");

-- CreateIndex
CREATE INDEX "EventTag_category_idx" ON "EventTag"("category");

-- CreateIndex
CREATE UNIQUE INDEX "EventSubscriber_email_key" ON "EventSubscriber"("email");

-- CreateIndex
CREATE INDEX "EventSubscriber_email_idx" ON "EventSubscriber"("email");

-- CreateIndex
CREATE INDEX "EventSubscriber_subscribed_idx" ON "EventSubscriber"("subscribed");

-- CreateIndex
CREATE INDEX "EventSubscriber_locationLat_locationLng_idx" ON "EventSubscriber"("locationLat", "locationLng");

-- CreateIndex
CREATE INDEX "EventSubscriber_locationCountryCode_idx" ON "EventSubscriber"("locationCountryCode");

-- CreateIndex
CREATE INDEX "EventEmailCampaign_eventId_idx" ON "EventEmailCampaign"("eventId");

-- CreateIndex
CREATE INDEX "EventEmailCampaign_status_idx" ON "EventEmailCampaign"("status");

-- CreateIndex
CREATE INDEX "EventEmailCampaign_scheduledAt_idx" ON "EventEmailCampaign"("scheduledAt");

-- CreateIndex
CREATE INDEX "EventCampaignRecipient_campaignId_idx" ON "EventCampaignRecipient"("campaignId");

-- CreateIndex
CREATE INDEX "EventCampaignRecipient_subscriberId_idx" ON "EventCampaignRecipient"("subscriberId");

-- CreateIndex
CREATE UNIQUE INDEX "EventCampaignRecipient_campaignId_subscriberId_key" ON "EventCampaignRecipient"("campaignId", "subscriberId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSpeaker" ADD CONSTRAINT "EventSpeaker_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAgendaItem" ADD CONSTRAINT "EventAgendaItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAgendaItem" ADD CONSTRAINT "EventAgendaItem_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "EventSpeaker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicketTier" ADD CONSTRAINT "EventTicketTier_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCustomQuestion" ADD CONSTRAINT "EventCustomQuestion_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_ticketTierId_fkey" FOREIGN KEY ("ticketTierId") REFERENCES "EventTicketTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistrationAnswer" ADD CONSTRAINT "EventRegistrationAnswer_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "EventRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistrationAnswer" ADD CONSTRAINT "EventRegistrationAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "EventCustomQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTagMapping" ADD CONSTRAINT "EventTagMapping_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTagMapping" ADD CONSTRAINT "EventTagMapping_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "EventTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSubscriberInterest" ADD CONSTRAINT "EventSubscriberInterest_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "EventSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSubscriberInterest" ADD CONSTRAINT "EventSubscriberInterest_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "EventTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventEmailCampaign" ADD CONSTRAINT "EventEmailCampaign_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCampaignRecipient" ADD CONSTRAINT "EventCampaignRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "EventEmailCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCampaignRecipient" ADD CONSTRAINT "EventCampaignRecipient_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "EventSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- ============================================================
-- Registration count trigger (auto-maintains Event.registrationCount)
-- ============================================================

CREATE OR REPLACE FUNCTION update_event_registration_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IN ('CONFIRMED', 'CHECKED_IN') AND NEW."deletedAt" IS NULL THEN
      UPDATE "Event" SET "registrationCount" = "registrationCount" + 1 WHERE id = NEW."eventId";
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Status changed TO a counted status
    IF OLD.status NOT IN ('CONFIRMED', 'CHECKED_IN') AND NEW.status IN ('CONFIRMED', 'CHECKED_IN') AND NEW."deletedAt" IS NULL THEN
      UPDATE "Event" SET "registrationCount" = "registrationCount" + 1 WHERE id = NEW."eventId";
    -- Status changed FROM a counted status
    ELSIF OLD.status IN ('CONFIRMED', 'CHECKED_IN') AND (NEW.status NOT IN ('CONFIRMED', 'CHECKED_IN') OR NEW."deletedAt" IS NOT NULL) THEN
      UPDATE "Event" SET "registrationCount" = "registrationCount" - 1 WHERE id = NEW."eventId";
    -- Soft delete applied
    ELSIF OLD."deletedAt" IS NULL AND NEW."deletedAt" IS NOT NULL AND NEW.status IN ('CONFIRMED', 'CHECKED_IN') THEN
      UPDATE "Event" SET "registrationCount" = "registrationCount" - 1 WHERE id = NEW."eventId";
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('CONFIRMED', 'CHECKED_IN') AND OLD."deletedAt" IS NULL THEN
      UPDATE "Event" SET "registrationCount" = "registrationCount" - 1 WHERE id = OLD."eventId";
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_event_registration_count
  AFTER INSERT OR UPDATE OR DELETE ON "EventRegistration"
  FOR EACH ROW
  EXECUTE FUNCTION update_event_registration_count();
