-- Opinion overhaul: add opinion-specific fields to Article
ALTER TABLE "Article" ADD COLUMN "keyTakeaways" JSONB;
ALTER TABLE "Article" ADD COLUMN "agreeCount" INT NOT NULL DEFAULT 0;
ALTER TABLE "Article" ADD COLUMN "disagreeCount" INT NOT NULL DEFAULT 0;
ALTER TABLE "Article" ADD COLUMN "primaryTagId" TEXT;

-- Foreign key + index for primaryTagId
ALTER TABLE "Article" ADD CONSTRAINT "Article_primaryTagId_fkey" FOREIGN KEY ("primaryTagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Article_primaryTagId_idx" ON "Article"("primaryTagId");

-- Seed 6 core opinion topic tags
INSERT INTO "Tag" (id, name, slug, "createdAt") VALUES
  (gen_random_uuid()::text, 'AI Startups', 'ai-startups', NOW()),
  (gen_random_uuid()::text, 'Funding & VC', 'funding-vc', NOW()),
  (gen_random_uuid()::text, 'AI India', 'ai-india', NOW()),
  (gen_random_uuid()::text, 'AI Policy', 'ai-policy', NOW()),
  (gen_random_uuid()::text, 'Open Source AI', 'open-source-ai', NOW()),
  (gen_random_uuid()::text, 'AI Agents', 'ai-agents', NOW())
ON CONFLICT (name) DO NOTHING;

-- Tag existing opinion articles with primaryTagId + secondary tags
-- Article 1: IndiaAI Mission GPU → primary: AI Policy
UPDATE "Article" SET "primaryTagId" = (SELECT id FROM "Tag" WHERE slug = 'ai-policy')
WHERE slug = 'indiaai-mission-gpu-sovereignty-vs-subsidized-cloud-2026';

-- Article 2: AI Funding Billion → primary: Funding & VC
UPDATE "Article" SET "primaryTagId" = (SELECT id FROM "Tag" WHERE slug = 'funding-vc')
WHERE slug = 'india-ai-funding-billion-dollar-concentration-risk-2026';

-- Article 3: AI Talent Brain Drain → primary: AI India
UPDATE "Article" SET "primaryTagId" = (SELECT id FROM "Tag" WHERE slug = 'ai-india')
WHERE slug = 'india-ai-talent-brain-drain-retention-crisis-2026';

-- Article 4: Sarvam Open Source → primary: Open Source AI
UPDATE "Article" SET "primaryTagId" = (SELECT id FROM "Tag" WHERE slug = 'open-source-ai')
WHERE slug = 'sarvam-bharatgen-open-source-ai-india-sovereignty-2026';

-- Article 5: Healthcare Agriculture Fintech → primary: AI India
UPDATE "Article" SET "primaryTagId" = (SELECT id FROM "Tag" WHERE slug = 'ai-india')
WHERE slug = 'ai-healthcare-agriculture-fintech-india-real-impact-2026';

-- Article 6: India Not Racing → primary: AI India
UPDATE "Article" SET "primaryTagId" = (SELECT id FROM "Tag" WHERE slug = 'ai-india')
WHERE slug = 'india-ai-strategy-not-racing-china-us-different-game-2026';

-- Article 7: Light Touch Regulation → primary: AI Policy
UPDATE "Article" SET "primaryTagId" = (SELECT id FROM "Tag" WHERE slug = 'ai-policy')
WHERE slug = 'india-ai-regulation-dpdp-act-light-touch-risks-2026';

-- Article 8: On-Device Edge AI → primary: AI Startups
UPDATE "Article" SET "primaryTagId" = (SELECT id FROM "Tag" WHERE slug = 'ai-startups')
WHERE slug = 'on-device-edge-ai-india-next-billion-users-2026';

-- Secondary tags via ArticleTag
-- Article 1 (GPU Sovereignty): + AI India, AI Startups
INSERT INTO "ArticleTag" ("articleId", "tagId")
SELECT a.id, t.id FROM "Article" a, "Tag" t
WHERE a.slug = 'indiaai-mission-gpu-sovereignty-vs-subsidized-cloud-2026'
  AND t.slug IN ('ai-india', 'ai-startups')
ON CONFLICT DO NOTHING;

-- Article 2 (Funding): + AI Startups, AI India
INSERT INTO "ArticleTag" ("articleId", "tagId")
SELECT a.id, t.id FROM "Article" a, "Tag" t
WHERE a.slug = 'india-ai-funding-billion-dollar-concentration-risk-2026'
  AND t.slug IN ('ai-startups', 'ai-india')
ON CONFLICT DO NOTHING;

-- Article 3 (Talent): + AI Startups
INSERT INTO "ArticleTag" ("articleId", "tagId")
SELECT a.id, t.id FROM "Article" a, "Tag" t
WHERE a.slug = 'india-ai-talent-brain-drain-retention-crisis-2026'
  AND t.slug = 'ai-startups'
ON CONFLICT DO NOTHING;

-- Article 4 (Open Source): + AI India, AI Startups
INSERT INTO "ArticleTag" ("articleId", "tagId")
SELECT a.id, t.id FROM "Article" a, "Tag" t
WHERE a.slug = 'sarvam-bharatgen-open-source-ai-india-sovereignty-2026'
  AND t.slug IN ('ai-india', 'ai-startups')
ON CONFLICT DO NOTHING;

-- Article 5 (Healthcare etc): + AI Startups
INSERT INTO "ArticleTag" ("articleId", "tagId")
SELECT a.id, t.id FROM "Article" a, "Tag" t
WHERE a.slug = 'ai-healthcare-agriculture-fintech-india-real-impact-2026'
  AND t.slug = 'ai-startups'
ON CONFLICT DO NOTHING;

-- Article 6 (Not Racing): + AI Policy, Open Source AI
INSERT INTO "ArticleTag" ("articleId", "tagId")
SELECT a.id, t.id FROM "Article" a, "Tag" t
WHERE a.slug = 'india-ai-strategy-not-racing-china-us-different-game-2026'
  AND t.slug IN ('ai-policy', 'open-source-ai')
ON CONFLICT DO NOTHING;

-- Article 7 (Regulation): + AI India, AI Agents
INSERT INTO "ArticleTag" ("articleId", "tagId")
SELECT a.id, t.id FROM "Article" a, "Tag" t
WHERE a.slug = 'india-ai-regulation-dpdp-act-light-touch-risks-2026'
  AND t.slug IN ('ai-india', 'ai-agents')
ON CONFLICT DO NOTHING;

-- Article 8 (Edge AI): + AI India
INSERT INTO "ArticleTag" ("articleId", "tagId")
SELECT a.id, t.id FROM "Article" a, "Tag" t
WHERE a.slug = 'on-device-edge-ai-india-next-billion-users-2026'
  AND t.slug = 'ai-india'
ON CONFLICT DO NOTHING;

-- Add key takeaways to all 8 opinion articles
UPDATE "Article" SET "keyTakeaways" = '["India''s IndiaAI Mission has deployed 38,000 GPUs at ₹65/hr, targeting 100,000 by year-end","DPDP Act enforcement infrastructure is still assembling — 83% of firms haven''t begun compliance","Compute infrastructure is outrunning data governance, creating regulatory risk","Sovereignty requires governance tied to compute access, not just hardware"]'::jsonb
WHERE slug = 'indiaai-mission-gpu-sovereignty-vs-subsidized-cloud-2026';

UPDATE "Article" SET "keyTakeaways" = '["Indian AI startups raised over $1B in H1 2026, a 4x YoY increase","Two infrastructure deals (Neysa, Sarvam) account for most of the total","The application layer — $20-50M Series A/B rounds — is conspicuously empty","India needs domain-specific AI funds and stronger domestic institutional investors"]'::jsonb
WHERE slug = 'india-ai-funding-billion-dollar-concentration-risk-2026';

UPDATE "Article" SET "keyTakeaways" = '["India is the largest source of AI engineering talent outside the US","GCCs extract top talent with 2x salary premiums over domestic startups","IndiaAI FutureSkills addresses volume but not the critical top 2%","Tax incentives, research grants, and equity culture reform are needed for retention"]'::jsonb
WHERE slug = 'india-ai-talent-brain-drain-retention-crisis-2026';

UPDATE "Article" SET "keyTakeaways" = '["Sarvam-105B and BharatGen Param2 are both open-source and outperform Gemini Flash on Indic languages","BharatGen received ~₹1,000 crore — 4x the next-highest funded sovereign AI project","Open-source is industrial policy, not charity — it builds ecosystem gravity","The strategy bets that ecosystem stickiness beats proprietary lock-in"]'::jsonb
WHERE slug = 'sarvam-bharatgen-open-source-ai-india-sovereignty-2026';

UPDATE "Article" SET "keyTakeaways" = '["AI diagnostic tools are screening for TB, diabetic retinopathy, and cancer in tier-2 hospitals","Agricultural AI delivers 15-25% yield improvements via WhatsApp and voice interfaces","AI underwriting approves first-time borrowers at 3-4% default rates","Trust and local-language explainability are the key adoption barriers"]'::jsonb
WHERE slug = 'ai-healthcare-agriculture-fintech-india-real-impact-2026';

UPDATE "Article" SET "keyTakeaways" = '["India cannot match US/China on compute or frontier models","India''s strategy focuses on applied deployment, Indic language AI, and governance as soft power","Open-source infrastructure is the hedge that makes the different-game thesis viable","The risk is permanent dependency if the strategy shifts to proprietary API reliance"]'::jsonb
WHERE slug = 'india-ai-strategy-not-racing-china-us-different-game-2026';

UPDATE "Article" SET "keyTakeaways" = '["India has no standalone AI law — DPDP Act is the de facto guardrail","Agentic AI raises liability questions existing Indian law doesn''t answer","DPDP addresses data inputs but not model outputs or autonomous decisions","India needs a liability framework, incident reporting, and algorithmic audits for high-stakes AI"]'::jsonb
WHERE slug = 'india-ai-regulation-dpdp-act-light-touch-risks-2026';

UPDATE "Article" SET "keyTakeaways" = '["Cloud LLMs don''t work for 400M Indians on devices with ≤4GB RAM and metered data","Purpose-built 1-3B parameter Indic SLMs outperform general models on specific tasks","On-device AI offers privacy by architecture — no data leaves the device","India''s semiconductor push needs to prioritize edge inference chip design"]'::jsonb
WHERE slug = 'on-device-edge-ai-india-next-billion-users-2026';
