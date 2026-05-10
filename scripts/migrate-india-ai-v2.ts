import { neon } from '@neondatabase/serverless';

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  
  console.log('Starting India AI database migration v2...\n');
  
  try {
    // Create tables one by one
    console.log('Creating IndiaAIStats table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "IndiaAIStats" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "metricKey" TEXT NOT NULL UNIQUE,
        "metricLabel" TEXT NOT NULL,
        "metricValue" TEXT NOT NULL,
        "metricChange" TEXT,
        "metricIcon" TEXT,
        "displayOrder" INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "lastUpdated" TIMESTAMP DEFAULT NOW(),
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating IndiaAICity table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "IndiaAICity" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "cityName" TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        state TEXT,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        "totalStartups" INTEGER DEFAULT 0,
        "totalFunding" BIGINT DEFAULT 0,
        "topSectors" TEXT[],
        "recentFundings" JSONB,
        "keyAccelerators" TEXT[],
        "notableCompanies" TEXT[],
        "averageTeamSize" INTEGER,
        "averageFunding" BIGINT,
        description TEXT,
        "featuredImage" TEXT,
        "isFeatured" BOOLEAN DEFAULT false,
        "premiumPlacement" BOOLEAN DEFAULT false,
        "premiumUntil" TIMESTAMP,
        "displayOrder" INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating IndiaAIFundingHighlight table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "IndiaAIFundingHighlight" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "fundingRoundId" UUID,
        "startupId" UUID,
        "isFeatured" BOOLEAN DEFAULT false,
        "featuredUntil" TIMESTAMP,
        "displayOrder" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating GovernmentScheme table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "GovernmentScheme" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "schemeName" TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        ministry TEXT,
        description TEXT,
        "longDescription" TEXT,
        "fundingAmount" TEXT,
        "fundingAmountInr" BIGINT,
        eligibility TEXT,
        "eligibilityCriteria" TEXT[],
        "applicationDeadline" TIMESTAMP,
        "applyLink" TEXT,
        "helpServicePrice" INTEGER,
        category TEXT,
        "schemeType" TEXT,
        "targetAudience" TEXT[],
        "applicationStatus" TEXT,
        "totalBudget" BIGINT,
        "disbursedAmount" BIGINT,
        "beneficiaries" INTEGER,
        "successStories" TEXT[],
        "isFeatured" BOOLEAN DEFAULT false,
        "displayOrder" INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating IndiaAIMissionTracker table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "IndiaAIMissionTracker" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        component TEXT NOT NULL,
        "budgetAllocated" BIGINT NOT NULL,
        "budgetDisbursed" BIGINT DEFAULT 0,
        description TEXT,
        "keyInitiatives" TEXT[],
        "displayOrder" INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating PolicyUpdate table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "PolicyUpdate" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        headline TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        summary TEXT,
        "fullContent" TEXT,
        source TEXT,
        "sourceUrl" TEXT,
        category TEXT[],
        "publishedAt" TIMESTAMP DEFAULT NOW(),
        "isFeatured" BOOLEAN DEFAULT false,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating CityDeepDive table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "CityDeepDive" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "cityId" UUID,
        "cityName" TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        tagline TEXT,
        "longDescription" TEXT,
        "totalStartups" INTEGER DEFAULT 0,
        "totalFunding" BIGINT DEFAULT 0,
        "mlEngineers" INTEGER,
        "averageSalary" BIGINT,
        "topStartups" JSONB,
        "keyAccelerators" JSONB,
        "majorCompanies" TEXT[],
        "topUniversities" TEXT[],
        "coworkingSpaces" TEXT[],
        "majorEvents" TEXT[],
        "reportPrice" INTEGER DEFAULT 299900,
        "reportUrl" TEXT,
        "featuredPlacementPrice" INTEGER DEFAULT 1500000,
        "isFeatured" BOOLEAN DEFAULT false,
        "displayOrder" INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating TalentStats table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "TalentStats" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        city TEXT NOT NULL,
        "totalEngineers" INTEGER NOT NULL,
        "averageSalary" BIGINT,
        "salaryByExperience" JSONB,
        "yoyGrowth" DECIMAL(5, 2),
        "remotePercentage" DECIMAL(5, 2),
        "onsitePercentage" DECIMAL(5, 2),
        "topSkills" TEXT[],
        "hiringTrends" TEXT,
        year INTEGER NOT NULL,
        quarter INTEGER,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        UNIQUE(city, year, quarter)
      )
    `;

    console.log('Creating ResearchHub table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "ResearchHub" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        type TEXT,
        city TEXT,
        description TEXT,
        "focusAreas" TEXT[],
        "phdPrograms" INTEGER,
        "researchPapers" INTEGER,
        "notableProjects" TEXT[],
        website TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        "displayOrder" INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating AIResearcher table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "AIResearcher" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        "profileImage" TEXT,
        university TEXT,
        "researchHub" TEXT,
        "researchAreas" TEXT[],
        bio TEXT,
        "hIndex" INTEGER,
        "citationCount" INTEGER,
        "notablePapers" JSONB,
        "linkedinUrl" TEXT,
        "googleScholarUrl" TEXT,
        "twitterUrl" TEXT,
        "isSpotlight" BOOLEAN DEFAULT false,
        "spotlightUntil" TIMESTAMP,
        "displayOrder" INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating IndianAITool table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "IndianAITool" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "toolName" TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        "companyName" TEXT,
        "startupId" UUID,
        "logoUrl" TEXT,
        tagline TEXT,
        description TEXT,
        category TEXT,
        "subCategory" TEXT,
        "websiteUrl" TEXT,
        "usedBy" TEXT,
        "keyFeatures" TEXT[],
        "pricingModel" TEXT,
        "isPremiumListing" BOOLEAN DEFAULT false,
        "premiumPrice" INTEGER DEFAULT 500000,
        "premiumUntil" TIMESTAMP,
        "displayOrder" INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('\nCreating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_indiaai_city_active ON "IndiaAICity"("isActive", "displayOrder")`;
    await sql`CREATE INDEX IF NOT EXISTS idx_indiaai_city_location ON "IndiaAICity"(latitude, longitude)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_govt_scheme_active ON "GovernmentScheme"("isActive", "displayOrder")`;
    await sql`CREATE INDEX IF NOT EXISTS idx_govt_scheme_deadline ON "GovernmentScheme"("applicationDeadline")`;
    await sql`CREATE INDEX IF NOT EXISTS idx_policy_update_published ON "PolicyUpdate"("publishedAt" DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_talent_stats_city_year ON "TalentStats"(city, year, quarter)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_researcher_spotlight ON "AIResearcher"("isSpotlight", "displayOrder")`;
    await sql`CREATE INDEX IF NOT EXISTS idx_indian_tool_category ON "IndianAITool"(category, "isActive")`;

    console.log('\nInserting seed data...');
    
    // Insert stats
    await sql`
      INSERT INTO "IndiaAIStats" ("metricKey", "metricLabel", "metricValue", "metricChange", "metricIcon", "displayOrder") VALUES
      ('total_startups', 'Active AI Startups', '3,247', '+47 this month', 'rocket', 1),
      ('total_funding', 'Total Funding Tracked', '₹28,470 Cr', '+₹890Cr this month', 'currency', 2),
      ('ai_engineers', 'AI Engineers in India', '1.2M+', 'across India', 'users', 3),
      ('global_rank', 'Global AI Ecosystem Rank', '#3', 'worldwide', 'trophy', 4)
      ON CONFLICT ("metricKey") DO NOTHING
    `;

    // Insert cities
    await sql`
      INSERT INTO "IndiaAICity" ("cityName", slug, state, latitude, longitude, "totalStartups", "totalFunding", "topSectors", "displayOrder") VALUES
      ('Bangalore', 'bangalore', 'Karnataka', 12.9716, 77.5946, 1400, 1420000000000, ARRAY['SaaS', 'DevTools', 'B2B AI'], 1),
      ('Mumbai', 'mumbai', 'Maharashtra', 19.0760, 72.8777, 580, 650000000000, ARRAY['FinTech', 'Enterprise AI'], 2),
      ('Hyderabad', 'hyderabad', 'Telangana', 17.3850, 78.4867, 385, 420000000000, ARRAY['Healthcare AI', 'Deep Tech'], 3),
      ('Delhi NCR', 'delhi-ncr', 'Delhi', 28.7041, 77.1025, 490, 580000000000, ARRAY['B2B AI', 'GovTech'], 4),
      ('Chennai', 'chennai', 'Tamil Nadu', 13.0827, 80.2707, 240, 280000000000, ARRAY['Deep Tech', 'Robotics'], 5),
      ('Pune', 'pune', 'Maharashtra', 18.5204, 73.8567, 320, 350000000000, ARRAY['Enterprise SaaS', 'AI'], 6)
      ON CONFLICT (slug) DO NOTHING
    `;

    // Insert mission tracker
    await sql`
      INSERT INTO "IndiaAIMissionTracker" (component, "budgetAllocated", "budgetDisbursed", description, "displayOrder") VALUES
      ('Compute Infrastructure', 456400000000, 120000000000, 'AI compute infrastructure and GPU access for startups and researchers', 1),
      ('Innovation & Startups', 200000000000, 45000000000, 'Startup funding, innovation grants, and accelerator programs', 2),
      ('Datasets & Applications', 120000000000, 30000000000, 'Public datasets, data infrastructure, and AI applications', 3),
      ('Skilling & Education', 260800000000, 85000000000, 'AI education, workforce development, and training programs', 4)
    `;

    // Insert research hubs
    await sql`
      INSERT INTO "ResearchHub" (name, slug, type, city, "focusAreas", "phdPrograms", "displayOrder") VALUES
      ('IISc Bangalore', 'iisc-bangalore', 'University', 'Bangalore', ARRAY['Machine Learning', 'Computer Vision', 'NLP'], 50, 1),
      ('IIT Bombay', 'iit-bombay', 'University', 'Mumbai', ARRAY['AI', 'Robotics', 'Data Science'], 45, 2),
      ('IIT Madras', 'iit-madras', 'University', 'Chennai', ARRAY['Deep Learning', 'AI Safety'], 40, 3),
      ('IIIT Hyderabad', 'iiit-hyderabad', 'University', 'Hyderabad', ARRAY['NLP', 'Computer Vision'], 35, 4),
      ('IIT Delhi', 'iit-delhi', 'University', 'Delhi NCR', ARRAY['AI', 'Machine Learning'], 38, 5)
      ON CONFLICT (slug) DO NOTHING
    `;

    console.log('\n✅ Migration completed successfully!');
    console.log('\nTables created:');
    console.log('  ✓ IndiaAIStats (4 stats seeded)');
    console.log('  ✓ IndiaAICity (6 cities seeded)');
    console.log('  ✓ IndiaAIFundingHighlight');
    console.log('  ✓ GovernmentScheme');
    console.log('  ✓ IndiaAIMissionTracker (4 components seeded)');
    console.log('  ✓ PolicyUpdate');
    console.log('  ✓ CityDeepDive');
    console.log('  ✓ TalentStats');
    console.log('  ✓ ResearchHub (5 hubs seeded)');
    console.log('  ✓ AIResearcher');
    console.log('  ✓ IndianAITool');
    console.log('\n✓ All indexes created');
    console.log('✓ Seed data inserted');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
