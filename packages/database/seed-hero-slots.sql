-- Create 5 Hero Slots connected to existing stories
-- These will appear in the homepage carousel

-- Hero Slot 1: AI Innovation Story
INSERT INTO "HeroSlot" (
  id,
  title,
  excerpt,
  "coverImage",
  "ctaUrl",
  "ctaLabel",
  "badgeText",
  "authorName",
  "readTimeMinutes",
  "isActive",
  "sortOrder",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'India''s AI Revolution: How Startups Are Reshaping Technology',
  'From Bangalore to Mumbai, Indian AI startups are making global waves with innovative solutions in healthcare, finance, and education.',
  NULL,
  '/news',
  'Read Full Story',
  'Featured · AI Innovation',
  'Editorial Team',
  8,
  true,
  1,
  NOW(),
  NOW()
);

-- Hero Slot 2: Funding News
INSERT INTO "HeroSlot" (
  id,
  title,
  excerpt,
  "coverImage",
  "ctaUrl",
  "ctaLabel",
  "badgeText",
  "authorName",
  "readTimeMinutes",
  "isActive",
  "sortOrder",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Record-Breaking Week: Indian AI Startups Raise $250M in Funding',
  'A surge in investor confidence sees multiple AI companies securing major funding rounds, signaling strong growth in the sector.',
  NULL,
  '/funding',
  'View Funding Digest',
  'Breaking · Funding',
  'Business Desk',
  5,
  true,
  2,
  NOW(),
  NOW()
);

-- Hero Slot 3: Founder Spotlight
INSERT INTO "HeroSlot" (
  id,
  title,
  excerpt,
  "coverImage",
  "ctaUrl",
  "ctaLabel",
  "badgeText",
  "authorName",
  "readTimeMinutes",
  "isActive",
  "sortOrder",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Building the Future: Meet the Founders Transforming Indian AI',
  'Exclusive interviews with visionary entrepreneurs who are putting India on the global AI map with groundbreaking innovations.',
  NULL,
  '/stories',
  'Read Founder Stories',
  'Exclusive · Founders',
  'Features Team',
  12,
  true,
  3,
  NOW(),
  NOW()
);

-- Hero Slot 4: AI Tools
INSERT INTO "HeroSlot" (
  id,
  title,
  excerpt,
  "coverImage",
  "ctaUrl",
  "ctaLabel",
  "badgeText",
  "authorName",
  "readTimeMinutes",
  "isActive",
  "sortOrder",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Top 10 AI Tools Every Indian Startup Should Know About',
  'Discover the most powerful AI tools and platforms that are helping Indian startups scale faster and compete globally.',
  NULL,
  '/tools',
  'Explore AI Tools',
  'Editor''s Pick · Tools',
  'Tech Reviews',
  10,
  true,
  4,
  NOW(),
  NOW()
);

-- Hero Slot 5: Ecosystem
INSERT INTO "HeroSlot" (
  id,
  title,
  excerpt,
  "coverImage",
  "ctaUrl",
  "ctaLabel",
  "badgeText",
  "authorName",
  "readTimeMinutes",
  "isActive",
  "sortOrder",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'IndiaAI Mission: Government Invests ₹10,372 Crore in AI Infrastructure',
  'A comprehensive look at how government initiatives are accelerating AI adoption and creating opportunities for startups across India.',
  NULL,
  '/news',
  'Read Analysis',
  'Policy · Government',
  'Policy Desk',
  15,
  true,
  5,
  NOW(),
  NOW()
);

-- Verify the hero slots were created
SELECT 
  id,
  title,
  "ctaUrl",
  "badgeText",
  "isActive",
  "sortOrder"
FROM "HeroSlot"
ORDER BY "sortOrder" ASC;
