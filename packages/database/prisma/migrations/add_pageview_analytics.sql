-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "referrer" TEXT,
    "source" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "sessionHash" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "duration" INTEGER,
    "bounced" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_pathname_createdAt_idx" ON "PageView"("pathname", "createdAt");

-- CreateIndex
CREATE INDEX "PageView_sessionHash_createdAt_idx" ON "PageView"("sessionHash", "createdAt");

-- CreateIndex
CREATE INDEX "PageView_source_createdAt_idx" ON "PageView"("source", "createdAt");

-- CreateIndex
CREATE INDEX "PageView_device_createdAt_idx" ON "PageView"("device", "createdAt");

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");
