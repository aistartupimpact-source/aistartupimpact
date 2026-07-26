-- CreateTable: ToolTagGroup (12 tag groups)
CREATE TABLE "ToolTagGroup" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "displayMode" TEXT NOT NULL DEFAULT 'expandable',
    "maxVisibleDefault" INTEGER NOT NULL DEFAULT 6,
    "isAdminOnly" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolTagGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ToolSystemTag (224 tags)
CREATE TABLE "ToolSystemTag" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "emoji" TEXT,
    "groupId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tagCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolSystemTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ToolSystemTagMapping (junction table)
CREATE TABLE "ToolSystemTagMapping" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "toolId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolSystemTagMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: ToolTagGroup
CREATE UNIQUE INDEX "ToolTagGroup_name_key" ON "ToolTagGroup"("name");
CREATE UNIQUE INDEX "ToolTagGroup_slug_key" ON "ToolTagGroup"("slug");
CREATE INDEX "ToolTagGroup_sortOrder_idx" ON "ToolTagGroup"("sortOrder");
CREATE INDEX "ToolTagGroup_slug_idx" ON "ToolTagGroup"("slug");

-- CreateIndex: ToolSystemTag
CREATE UNIQUE INDEX "ToolSystemTag_slug_key" ON "ToolSystemTag"("slug");
CREATE UNIQUE INDEX "ToolSystemTag_groupId_slug_key" ON "ToolSystemTag"("groupId", "slug");
CREATE INDEX "ToolSystemTag_groupId_sortOrder_idx" ON "ToolSystemTag"("groupId", "sortOrder");
CREATE INDEX "ToolSystemTag_slug_idx" ON "ToolSystemTag"("slug");
CREATE INDEX "ToolSystemTag_tagCount_idx" ON "ToolSystemTag"("tagCount" DESC);

-- CreateIndex: ToolSystemTagMapping
CREATE UNIQUE INDEX "ToolSystemTagMapping_toolId_tagId_key" ON "ToolSystemTagMapping"("toolId", "tagId");
CREATE INDEX "ToolSystemTagMapping_tagId_toolId_idx" ON "ToolSystemTagMapping"("tagId", "toolId");
CREATE INDEX "ToolSystemTagMapping_toolId_tagId_idx" ON "ToolSystemTagMapping"("toolId", "tagId");

-- AddForeignKey
ALTER TABLE "ToolSystemTag" ADD CONSTRAINT "ToolSystemTag_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ToolTagGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolSystemTagMapping" ADD CONSTRAINT "ToolSystemTagMapping_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "AiTool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolSystemTagMapping" ADD CONSTRAINT "ToolSystemTagMapping_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ToolSystemTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
