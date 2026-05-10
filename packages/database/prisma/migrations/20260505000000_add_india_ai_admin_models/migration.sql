-- CreateTable
CREATE TABLE "GovernmentScheme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "fundingAmount" TEXT NOT NULL,
    "eligibility" TEXT[],
    "applicationDeadline" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "applyLink" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "benefits" TEXT[],
    "category" TEXT NOT NULL,
    "state" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernmentScheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyUpdate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "excerpt" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "impact" TEXT NOT NULL DEFAULT 'Medium',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolicyUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIResearcher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "photoUrl" TEXT,
    "bio" TEXT NOT NULL,
    "researchAreas" TEXT[],
    "notablePapers" TEXT[],
    "linkedinUrl" TEXT,
    "googleScholarUrl" TEXT,
    "citations" INTEGER NOT NULL DEFAULT 0,
    "hIndex" INTEGER NOT NULL DEFAULT 0,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIResearcher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndianAITool" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT,
    "websiteUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "foundedYear" INTEGER,
    "fundingStatus" TEXT,
    "totalFunding" TEXT,
    "headquarters" TEXT,
    "teamSize" TEXT,
    "features" TEXT[],
    "useCases" TEXT[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndianAITool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturedFounder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startupName" TEXT NOT NULL,
    "startupSlug" TEXT,
    "photoUrl" TEXT,
    "bio" TEXT NOT NULL,
    "achievement" TEXT NOT NULL,
    "fundingRaised" TEXT,
    "category" TEXT NOT NULL,
    "linkedinUrl" TEXT,
    "twitterUrl" TEXT,
    "storyUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturedFounder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GovernmentScheme_category_idx" ON "GovernmentScheme"("category");

-- CreateIndex
CREATE INDEX "GovernmentScheme_status_idx" ON "GovernmentScheme"("status");

-- CreateIndex
CREATE INDEX "GovernmentScheme_isActive_idx" ON "GovernmentScheme"("isActive");

-- CreateIndex
CREATE INDEX "GovernmentScheme_displayOrder_idx" ON "GovernmentScheme"("displayOrder");

-- CreateIndex
CREATE INDEX "PolicyUpdate_source_idx" ON "PolicyUpdate"("source");

-- CreateIndex
CREATE INDEX "PolicyUpdate_category_idx" ON "PolicyUpdate"("category");

-- CreateIndex
CREATE INDEX "PolicyUpdate_impact_idx" ON "PolicyUpdate"("impact");

-- CreateIndex
CREATE INDEX "PolicyUpdate_date_idx" ON "PolicyUpdate"("date");

-- CreateIndex
CREATE INDEX "PolicyUpdate_isActive_idx" ON "PolicyUpdate"("isActive");

-- CreateIndex
CREATE INDEX "PolicyUpdate_displayOrder_idx" ON "PolicyUpdate"("displayOrder");

-- CreateIndex
CREATE INDEX "AIResearcher_university_idx" ON "AIResearcher"("university");

-- CreateIndex
CREATE INDEX "AIResearcher_isActive_idx" ON "AIResearcher"("isActive");

-- CreateIndex
CREATE INDEX "AIResearcher_displayOrder_idx" ON "AIResearcher"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "IndianAITool_slug_key" ON "IndianAITool"("slug");

-- CreateIndex
CREATE INDEX "IndianAITool_category_idx" ON "IndianAITool"("category");

-- CreateIndex
CREATE INDEX "IndianAITool_isFeatured_idx" ON "IndianAITool"("isFeatured");

-- CreateIndex
CREATE INDEX "IndianAITool_isActive_idx" ON "IndianAITool"("isActive");

-- CreateIndex
CREATE INDEX "IndianAITool_displayOrder_idx" ON "IndianAITool"("displayOrder");

-- CreateIndex
CREATE INDEX "IndianAITool_slug_idx" ON "IndianAITool"("slug");

-- CreateIndex
CREATE INDEX "FeaturedFounder_category_idx" ON "FeaturedFounder"("category");

-- CreateIndex
CREATE INDEX "FeaturedFounder_isActive_idx" ON "FeaturedFounder"("isActive");

-- CreateIndex
CREATE INDEX "FeaturedFounder_displayOrder_idx" ON "FeaturedFounder"("displayOrder");
