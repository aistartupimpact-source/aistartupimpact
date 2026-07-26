-- Canonical list of startup business categories (managed from admin)
CREATE TABLE IF NOT EXISTS "StartupBusinessCategory" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL UNIQUE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StartupBusinessCategory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StartupBusinessCategory_sortOrder_idx" ON "StartupBusinessCategory"("sortOrder");
CREATE INDEX "StartupBusinessCategory_isActive_idx" ON "StartupBusinessCategory"("isActive");

-- Canonical list of startup business types (managed from admin)
CREATE TABLE IF NOT EXISTS "StartupBusinessType" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL UNIQUE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StartupBusinessType_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StartupBusinessType_sortOrder_idx" ON "StartupBusinessType"("sortOrder");
CREATE INDEX "StartupBusinessType_isActive_idx" ON "StartupBusinessType"("isActive");

-- Seed existing categories from Startup table
INSERT INTO "StartupBusinessCategory" (id, name, "sortOrder", "isActive", "createdAt")
SELECT gen_random_uuid(), category, ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC, category ASC), true, NOW()
FROM "Startup"
WHERE category IS NOT NULL AND "deletedAt" IS NULL
GROUP BY category
ON CONFLICT (name) DO NOTHING;

-- Seed existing business types from Startup table
INSERT INTO "StartupBusinessType" (id, name, "sortOrder", "isActive", "createdAt")
SELECT gen_random_uuid(), "businessType", ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC, "businessType" ASC), true, NOW()
FROM "Startup"
WHERE "businessType" IS NOT NULL AND "deletedAt" IS NULL
GROUP BY "businessType"
ON CONFLICT (name) DO NOTHING;
