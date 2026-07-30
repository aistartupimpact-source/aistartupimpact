-- AI Job Board Platform
-- Separate from /careers (internal hiring) and legacy Job model

-- Enums
CREATE TYPE "JobBoardWorkType" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');
CREATE TYPE "JobBoardCategory" AS ENUM ('AI_ENGINEER', 'ML_ENGINEER', 'LLM_ENGINEER', 'AI_RESEARCH_SCIENTIST', 'DATA_SCIENTIST', 'DATA_ENGINEER', 'PROMPT_ENGINEER', 'AI_PRODUCT_MANAGER', 'AI_DESIGNER', 'AI_SALES', 'AI_MARKETING', 'AI_DEVREL', 'AI_SOLUTIONS_ARCHITECT', 'AI_ETHICS', 'ROBOTICS_ENGINEER', 'COMPUTER_VISION', 'NLP_ENGINEER', 'AI_INFRASTRUCTURE', 'OTHER');
CREATE TYPE "JobBoardTier" AS ENUM ('FREE', 'FEATURED', 'PREMIUM');
CREATE TYPE "JobBoardApplyType" AS ENUM ('INTERNAL', 'EXTERNAL');
CREATE TYPE "JobBoardAppStatus" AS ENUM ('APPLIED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED');
CREATE TYPE "JobBoardPlan" AS ENUM ('FREE', 'FEATURED', 'PREMIUM');

-- Employer accounts
CREATE TABLE "JobBoardEmployer" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "companyName" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "logoUrl" TEXT,
  "websiteUrl" TEXT,
  "description" TEXT,
  "industry" TEXT,
  "companySize" TEXT,
  "location" TEXT,
  "country" TEXT,
  "linkedinUrl" TEXT,
  "twitterUrl" TEXT,
  "startupId" TEXT,
  "plan" "JobBoardPlan" NOT NULL DEFAULT 'FREE',
  "planExpiresAt" TIMESTAMP(3),
  "maxActiveJobs" INTEGER NOT NULL DEFAULT 1,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "JobBoardEmployer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JobBoardEmployer_slug_key" ON "JobBoardEmployer"("slug");
CREATE UNIQUE INDEX "JobBoardEmployer_email_key" ON "JobBoardEmployer"("email");
CREATE UNIQUE INDEX "JobBoardEmployer_startupId_key" ON "JobBoardEmployer"("startupId");
CREATE INDEX "idx_jobboard_employer_slug" ON "JobBoardEmployer"("slug");
CREATE INDEX "idx_jobboard_employer_startup" ON "JobBoardEmployer"("startupId");
CREATE INDEX "idx_jobboard_employer_active" ON "JobBoardEmployer"("isActive");
CREATE INDEX "idx_jobboard_employer_plan" ON "JobBoardEmployer"("plan");
CREATE INDEX "idx_jobboard_employer_email" ON "JobBoardEmployer"("email");

-- Job listings
CREATE TABLE "JobBoardListing" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "shortDescription" TEXT,
  "location" TEXT,
  "city" TEXT,
  "country" TEXT,
  "workType" "JobBoardWorkType" NOT NULL DEFAULT 'REMOTE',
  "visaSponsorship" BOOLEAN NOT NULL DEFAULT false,
  "salaryMin" INTEGER,
  "salaryMax" INTEGER,
  "salaryCurrency" TEXT NOT NULL DEFAULT 'USD',
  "salaryPeriod" TEXT NOT NULL DEFAULT 'yearly',
  "showSalary" BOOLEAN NOT NULL DEFAULT true,
  "equity" TEXT,
  "category" "JobBoardCategory" NOT NULL DEFAULT 'AI_ENGINEER',
  "experienceMin" INTEGER,
  "experienceMax" INTEGER,
  "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "department" TEXT,
  "listingTier" "JobBoardTier" NOT NULL DEFAULT 'FREE',
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "featuredUntil" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "expiresAt" TIMESTAMP(3),
  "applicationUrl" TEXT,
  "applicationEmail" TEXT,
  "applicationType" "JobBoardApplyType" NOT NULL DEFAULT 'INTERNAL',
  "applicationsCount" INTEGER NOT NULL DEFAULT 0,
  "viewsCount" INTEGER NOT NULL DEFAULT 0,
  "clicksCount" INTEGER NOT NULL DEFAULT 0,
  "savedCount" INTEGER NOT NULL DEFAULT 0,
  "employerId" TEXT NOT NULL,
  "startupId" TEXT,
  "searchVector" tsvector,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),

  CONSTRAINT "JobBoardListing_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JobBoardListing_slug_key" ON "JobBoardListing"("slug");
CREATE INDEX "idx_jobboard_listing_active_category" ON "JobBoardListing"("isActive", "category");
CREATE INDEX "idx_jobboard_listing_active_worktype" ON "JobBoardListing"("isActive", "workType");
CREATE INDEX "idx_jobboard_listing_active_tier" ON "JobBoardListing"("isActive", "listingTier");
CREATE INDEX "idx_jobboard_listing_employer" ON "JobBoardListing"("employerId");
CREATE INDEX "idx_jobboard_listing_startup" ON "JobBoardListing"("startupId");
CREATE INDEX "idx_jobboard_listing_slug" ON "JobBoardListing"("slug");
CREATE INDEX "idx_jobboard_listing_published" ON "JobBoardListing"("publishedAt");
CREATE INDEX "idx_jobboard_listing_expires" ON "JobBoardListing"("expiresAt");
CREATE INDEX "idx_jobboard_listing_search" ON "JobBoardListing" USING GIN ("searchVector");

-- Applications
CREATE TABLE "JobBoardApplication" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "listingId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "linkedinUrl" TEXT,
  "portfolioUrl" TEXT,
  "githubUrl" TEXT,
  "resumeUrl" TEXT NOT NULL,
  "coverLetter" TEXT,
  "status" "JobBoardAppStatus" NOT NULL DEFAULT 'APPLIED',
  "notes" TEXT,
  "rating" INTEGER,
  "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  "statusChangedAt" TIMESTAMP(3),

  CONSTRAINT "JobBoardApplication_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JobBoardApplication_listing_email" ON "JobBoardApplication"("listingId", "email");
CREATE INDEX "idx_jobboard_app_listing_status" ON "JobBoardApplication"("listingId", "status");
CREATE INDEX "idx_jobboard_app_email" ON "JobBoardApplication"("email");
CREATE INDEX "idx_jobboard_app_applied" ON "JobBoardApplication"("appliedAt");
CREATE INDEX "idx_jobboard_app_status" ON "JobBoardApplication"("status");

-- Saved/bookmarked jobs
CREATE TABLE "JobBoardSaved" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "listingId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "JobBoardSaved_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JobBoardSaved_listing_user" ON "JobBoardSaved"("listingId", "userId");
CREATE INDEX "idx_jobboard_saved_user" ON "JobBoardSaved"("userId");
CREATE INDEX "idx_jobboard_saved_listing" ON "JobBoardSaved"("listingId");

-- Foreign keys
ALTER TABLE "JobBoardEmployer" ADD CONSTRAINT "JobBoardEmployer_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobBoardListing" ADD CONSTRAINT "JobBoardListing_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "JobBoardEmployer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobBoardListing" ADD CONSTRAINT "JobBoardListing_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobBoardApplication" ADD CONSTRAINT "JobBoardApplication_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "JobBoardListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobBoardSaved" ADD CONSTRAINT "JobBoardSaved_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "JobBoardListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobBoardSaved" ADD CONSTRAINT "JobBoardSaved_userId_fkey" FOREIGN KEY ("userId") REFERENCES "WebUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Full-text search trigger for job listings
CREATE OR REPLACE FUNCTION jobboard_listing_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW."shortDescription", '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobboard_listing_search_update
  BEFORE INSERT OR UPDATE ON "JobBoardListing"
  FOR EACH ROW EXECUTE FUNCTION jobboard_listing_search_trigger();
