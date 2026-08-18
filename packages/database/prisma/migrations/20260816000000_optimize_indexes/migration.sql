-- ============================================================
-- DATABASE INDEX OPTIMIZATION
-- Adds missing indexes on hot paths, removes redundant indexes,
-- and creates partial indexes for high-traffic queries.
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- HIGH: Add missing composite/single indexes on hot query paths
-- ──────────────────────────────────────────────────────────────

-- Startup: main listing query filters deletedAt + isApproved + sorts by createdAt
CREATE INDEX IF NOT EXISTS "Startup_deletedAt_isApproved_createdAt_idx"
  ON "Startup" ("deletedAt", "isApproved", "createdAt" DESC);

-- Startup: city filter
CREATE INDEX IF NOT EXISTS "Startup_headquartersCity_idx"
  ON "Startup" ("headquartersCity");

-- Startup: status filter
CREATE INDEX IF NOT EXISTS "Startup_status_idx"
  ON "Startup" ("status");

-- Startup: businessType filter
CREATE INDEX IF NOT EXISTS "Startup_businessType_idx"
  ON "Startup" ("businessType");

-- Startup: employeeCount range filter
CREATE INDEX IF NOT EXISTS "Startup_employeeCount_idx"
  ON "Startup" ("employeeCount");

-- Startup: createdAt sort
CREATE INDEX IF NOT EXISTS "Startup_createdAt_idx"
  ON "Startup" ("createdAt");

-- AiTool: soft delete filter
CREATE INDEX IF NOT EXISTS "AiTool_deletedAt_idx"
  ON "AiTool" ("deletedAt");

-- AiTool: createdAt sort
CREATE INDEX IF NOT EXISTS "AiTool_createdAt_idx"
  ON "AiTool" ("createdAt");

-- Article: soft delete filter
CREATE INDEX IF NOT EXISTS "Article_deletedAt_idx"
  ON "Article" ("deletedAt");

-- JobBoardListing: soft delete filter
CREATE INDEX IF NOT EXISTS "JobBoardListing_deletedAt_idx"
  ON "JobBoardListing" ("deletedAt");

-- ──────────────────────────────────────────────────────────────
-- MEDIUM: Session tables — add expiresAt for cron cleanup
-- ──────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS "WebUserSession_expiresAt_idx"
  ON "WebUserSession" ("expiresAt");

CREATE INDEX IF NOT EXISTS "UserSession_expiresAt_idx"
  ON "UserSession" ("expiresAt");

-- ──────────────────────────────────────────────────────────────
-- MEDIUM: Missing FK indexes on join tables
-- ──────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS "ToolCon_toolId_idx"
  ON "ToolCon" ("toolId");

CREATE INDEX IF NOT EXISTS "ToolPro_toolId_idx"
  ON "ToolPro" ("toolId");

CREATE INDEX IF NOT EXISTS "ToolUseCase_toolId_idx"
  ON "ToolUseCase" ("toolId");

CREATE INDEX IF NOT EXISTS "Comment_userId_idx"
  ON "Comment" ("userId");

-- EmailLog: composite for admin dashboard queries
CREATE INDEX IF NOT EXISTS "EmailLog_type_sentAt_idx"
  ON "EmailLog" ("type", "sentAt");

-- ──────────────────────────────────────────────────────────────
-- STRUCTURAL: Partial index for the hottest query path
-- (Cannot be expressed in Prisma schema)
-- ──────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS "idx_startup_active_listing"
  ON "Startup" ("isFeatured" DESC, "createdAt" DESC)
  WHERE "deletedAt" IS NULL AND "isApproved" = true;

CREATE INDEX IF NOT EXISTS "idx_startup_active_search"
  ON "Startup" ("searchVector")
  WHERE "deletedAt" IS NULL AND "isApproved" = true;

CREATE INDEX IF NOT EXISTS "idx_aitool_active_listing"
  ON "AiTool" ("isFeatured" DESC, "createdAt" DESC)
  WHERE "deletedAt" IS NULL AND "status" = 'APPROVED';

-- ──────────────────────────────────────────────────────────────
-- LOW: Remove redundant indexes (unique constraints auto-create indexes)
-- ──────────────────────────────────────────────────────────────

-- Startup.slug — @unique already creates index
DROP INDEX IF EXISTS "Startup_slug_idx";

-- AiTool.slug — @unique
DROP INDEX IF EXISTS "AiTool_slug_idx";

-- Article.slug — @unique
DROP INDEX IF EXISTS "Article_slug_idx";

-- FounderUser: email, googleId, verifyToken, resetToken, unifiedUserId — all @unique
DROP INDEX IF EXISTS "FounderUser_email_idx";
DROP INDEX IF EXISTS "FounderUser_googleId_idx";
DROP INDEX IF EXISTS "FounderUser_verifyToken_idx";
DROP INDEX IF EXISTS "FounderUser_resetToken_idx";
DROP INDEX IF EXISTS "FounderUser_unifiedUserId_idx";

-- WebUser: email, slug — @unique
DROP INDEX IF EXISTS "WebUser_email_idx";
DROP INDEX IF EXISTS "WebUser_slug_idx";

-- User: email, slug — @unique
DROP INDEX IF EXISTS "User_email_idx";
DROP INDEX IF EXISTS "User_slug_idx";

-- Session tokens — @unique
DROP INDEX IF EXISTS "FounderSession_token_idx";
DROP INDEX IF EXISTS "WebUserSession_refreshToken_idx";
DROP INDEX IF EXISTS "UserSession_refreshToken_idx";
DROP INDEX IF EXISTS "UnifiedSession_token_idx";
DROP INDEX IF EXISTS "EventOrganizerSession_token_idx";

-- UnifiedUser: email, googleId — @unique
DROP INDEX IF EXISTS "UnifiedUser_email_idx";
DROP INDEX IF EXISTS "UnifiedUser_googleId_idx";

-- EventOrganizer: email, googleId, unifiedUserId — @unique
DROP INDEX IF EXISTS "EventOrganizer_email_idx";
DROP INDEX IF EXISTS "EventOrganizer_googleId_idx";
DROP INDEX IF EXISTS "EventOrganizer_unifiedUserId_idx";

-- Other slug/unique redundancies
DROP INDEX IF EXISTS "Redirect_fromPath_idx";
DROP INDEX IF EXISTS "GlossaryTerm_slug_idx";
DROP INDEX IF EXISTS "Investor_slug_idx";
DROP INDEX IF EXISTS "IndianAITool_slug_idx";
DROP INDEX IF EXISTS "Tag_slug_idx";
DROP INDEX IF EXISTS "Category_slug_idx";
DROP INDEX IF EXISTS "NewsletterSubscriber_email_idx";
DROP INDEX IF EXISTS "ToolCategory_slug_idx";
DROP INDEX IF EXISTS "ToolSystemTag_slug_idx";
DROP INDEX IF EXISTS "ToolSystemTagMapping_toolId_tagId_idx";
DROP INDEX IF EXISTS "ToolReviewResponse_reviewId_idx";
DROP INDEX IF EXISTS "ToolTagGroup_slug_idx";
DROP INDEX IF EXISTS "JobBoardListing_slug_idx";
DROP INDEX IF EXISTS "JobBoardEmployer_slug_idx";
DROP INDEX IF EXISTS "JobBoardEmployer_email_idx";
DROP INDEX IF EXISTS "City_slug_idx";
DROP INDEX IF EXISTS "Event_slug_idx";
DROP INDEX IF EXISTS "Event_shortCode_idx";
DROP INDEX IF EXISTS "EventSlugHistory_oldSlug_idx";
DROP INDEX IF EXISTS "EventSubscriber_email_idx";

-- EmailLog: replace single-column type index with composite
DROP INDEX IF EXISTS "EmailLog_type_idx";
