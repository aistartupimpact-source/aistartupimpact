-- ============================================================
-- MISSING INDEXES — Database Performance Optimization
-- Adds indexes to tables that are frequently queried but lack them
-- ============================================================

-- ToolTraffic: queried for trending calculations and analytics
CREATE INDEX IF NOT EXISTS "ToolTraffic_toolId_idx" ON "ToolTraffic"("toolId");
CREATE INDEX IF NOT EXISTS "ToolTraffic_toolId_createdAt_idx" ON "ToolTraffic"("toolId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "ToolTraffic_createdAt_idx" ON "ToolTraffic"("createdAt" DESC);

-- AffiliateClick: queried for click analytics, trending, founder dashboard
CREATE INDEX IF NOT EXISTS "AffiliateClick_toolId_idx" ON "AffiliateClick"("toolId");
CREATE INDEX IF NOT EXISTS "AffiliateClick_toolId_createdAt_idx" ON "AffiliateClick"("toolId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "AffiliateClick_createdAt_idx" ON "AffiliateClick"("createdAt" DESC);

-- SavedTool: queried for bookmark counts on detail pages
CREATE INDEX IF NOT EXISTS "SavedTool_toolSlug_idx" ON "SavedTool"("toolSlug");
CREATE INDEX IF NOT EXISTS "SavedTool_userId_idx" ON "SavedTool"("userId");

-- ToolPro: queried by toolId on every tool detail page
CREATE INDEX IF NOT EXISTS "ToolPro_toolId_idx" ON "ToolPro"("toolId");

-- ToolCon: queried by toolId on every tool detail page
CREATE INDEX IF NOT EXISTS "ToolCon_toolId_idx" ON "ToolCon"("toolId");

-- ToolUseCase: queried by toolId on detail pages
CREATE INDEX IF NOT EXISTS "ToolUseCase_toolId_idx" ON "ToolUseCase"("toolId");

-- ToolReviewResponse: queried by reviewId on detail pages
CREATE INDEX IF NOT EXISTS "ToolReviewResponse_reviewId_idx" ON "ToolReviewResponse"("reviewId");

-- ToolAlternative: ensure both directions are fast
CREATE INDEX IF NOT EXISTS "ToolAlternative_toolId_idx" ON "ToolAlternative"("toolId");
CREATE INDEX IF NOT EXISTS "ToolAlternative_alternativeId_idx" ON "ToolAlternative"("alternativeId");

-- StartupFAQ: queried by startupId
CREATE INDEX IF NOT EXISTS "StartupFAQ_startupId_idx" ON "StartupFAQ"("startupId");

-- StartupReview: queried by startupId
CREATE INDEX IF NOT EXISTS "StartupReview_startupId_idx" ON "StartupReview"("startupId");

-- FundingRound: queried by startupId + ordering
CREATE INDEX IF NOT EXISTS "FundingRound_startupId_idx" ON "FundingRound"("startupId");
CREATE INDEX IF NOT EXISTS "FundingRound_announcedAt_idx" ON "FundingRound"("announcedAt" DESC);

-- FounderNotification: queried by userId
CREATE INDEX IF NOT EXISTS "FounderNotification_userId_idx" ON "FounderNotification"("userId");
CREATE INDEX IF NOT EXISTS "FounderNotification_userId_createdAt_idx" ON "FounderNotification"("userId", "createdAt" DESC);

-- ToolFeaturedCampaign: queried for active campaigns
CREATE INDEX IF NOT EXISTS "ToolFeaturedCampaign_toolId_idx" ON "ToolFeaturedCampaign"("toolId");
CREATE INDEX IF NOT EXISTS "ToolFeaturedCampaign_startDate_endDate_idx" ON "ToolFeaturedCampaign"("startDate", "endDate");

-- FeaturedCampaign (startups): same pattern
CREATE INDEX IF NOT EXISTS "FeaturedCampaign_startupId_idx" ON "FeaturedCampaign"("startupId");

-- Article: ensure authorId + status composite for dashboard queries
CREATE INDEX IF NOT EXISTS "Article_authorId_status_idx" ON "Article"("authorId", "status");
CREATE INDEX IF NOT EXISTS "Article_publishedAt_idx" ON "Article"("publishedAt" DESC);

-- EventRegistration: queried heavily during check-in and attendee lists
CREATE INDEX IF NOT EXISTS "EventRegistration_eventId_status_idx" ON "EventRegistration"("eventId", "status");
CREATE INDEX IF NOT EXISTS "EventRegistration_guestEmail_idx" ON "EventRegistration"("guestEmail");
CREATE INDEX IF NOT EXISTS "EventRegistration_qrToken_idx" ON "EventRegistration"("qrToken");
CREATE INDEX IF NOT EXISTS "EventRegistration_registeredAt_idx" ON "EventRegistration"("registeredAt" DESC);

-- EventOrganizer: login queries
CREATE INDEX IF NOT EXISTS "EventOrganizer_email_idx" ON "EventOrganizer"("email");
CREATE INDEX IF NOT EXISTS "EventOrganizer_googleId_idx" ON "EventOrganizer"("googleId");

-- EventOrganizerSession: session lookup
CREATE INDEX IF NOT EXISTS "EventOrganizerSession_token_idx" ON "EventOrganizerSession"("token");
CREATE INDEX IF NOT EXISTS "EventOrganizerSession_organizerId_idx" ON "EventOrganizerSession"("organizerId");

-- EventTeamMember: team management queries
CREATE INDEX IF NOT EXISTS "EventTeamMember_organizerId_idx" ON "EventTeamMember"("organizerId");
CREATE INDEX IF NOT EXISTS "EventTeamMember_email_idx" ON "EventTeamMember"("email");
CREATE INDEX IF NOT EXISTS "EventTeamMember_inviteToken_idx" ON "EventTeamMember"("inviteToken");

-- WebUser: login and session queries
CREATE INDEX IF NOT EXISTS "WebUser_email_idx" ON "WebUser"("email");

-- FounderUser: login queries
CREATE INDEX IF NOT EXISTS "FounderUser_email_idx" ON "FounderUser"("email");

-- FounderSession: session lookup
CREATE INDEX IF NOT EXISTS "FounderSession_token_idx" ON "FounderSession"("token");
CREATE INDEX IF NOT EXISTS "FounderSession_userId_idx" ON "FounderSession"("userId");

-- AuditLog: queried for team activity page with filters
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "AuditLog_resourceType_idx" ON "AuditLog"("resourceType");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");

-- Newsletter subscribers
CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_email_idx" ON "NewsletterSubscriber"("email");
CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_subscribedAt_idx" ON "NewsletterSubscriber"("subscribedAt" DESC);
