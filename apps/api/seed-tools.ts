/**
 * Seed script: inserts all Indian AI tools + global tools into production DB
 * Run: npx dotenv-cli -e ../../.env -- npx tsx seed-tools.ts
 */
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Category IDs from production DB
const CAT = {
  assistant:   'ca201ba5-cf0c-4b0b-b752-5f00e7aa491b',
  dataOps:     'a1f205ab-ebae-4939-ad1b-8394e81f3f6e',
  design:      '99a12333-1112-4f0d-9ca0-797dc7bb9c0c',
  devTools:    'd7281d5e-0451-4d46-be7f-2f2ef3b72bb6',
  marketing:   'b4db1250-c8a6-4b82-8751-2c64ac23ddc2',
  media:       'd33cf91e-60e6-4b80-b991-c2a697a9053d',
  openSource:  '6a405d56-04de-485d-9237-f7d5466587e6',
  productivity:'60610919-3f53-4c7a-931f-7f7adbe859d2',
  research:    '3cc81569-e567-4946-8ac8-af37b1be9833',
  support:     'eb2069a9-7e7e-4378-844c-d80186889183',
  videoGen:    'cca3508f-9826-4883-a9d7-f31ad7d24833',
  writing:     'fddacb34-95e1-4fd8-9d99-1a809ae422c3',
};

const tools = [
  // ── FEATURED (shown in rotator) ──────────────────────────────
  {
    slug: 'krutrim',
    name: 'Krutrim AI',
    tagline: "India's own foundational AI assistant fluent in 22 official languages",
    description: "Krutrim is Ola's homegrown AI assistant built on a foundational LLM trained on Indic languages. It supports all 22 official Indian languages and is designed for voice-first, multilingual interactions at scale.",
    websiteUrl: 'https://krutrim.ai',
    logoUrl: 'https://ui-avatars.com/api/?name=Krutrim+AI&background=4F46E5&color=fff&size=150',
    categoryId: CAT.assistant,
    pricingModel: 'FREEMIUM',
    avgRating: 4.8,
    listingTier: 'FEATURED',
    status: 'APPROVED',
  },
  {
    slug: 'sarvam-ai',
    name: 'Sarvam AI',
    tagline: 'Foundation models built for Indic languages and voice-first interfaces',
    description: "Sarvam AI builds open-source foundational models for Indian languages. Their OpenHathi series and voice models power real-time translation, speech recognition, and generation across 10+ Indic languages.",
    websiteUrl: 'https://sarvam.ai',
    logoUrl: 'https://ui-avatars.com/api/?name=Sarvam+AI&background=D97706&color=fff&size=150',
    categoryId: CAT.assistant,
    pricingModel: 'FREE',
    avgRating: 4.7,
    listingTier: 'FEATURED',
    status: 'APPROVED',
  },
  {
    slug: 'karya',
    name: 'Karya',
    tagline: 'Ethical data platform paying rural Indians to train regional AI models',
    description: "Karya is a social enterprise that pays rural Indian workers fair wages to create high-quality training data for AI models in regional languages, bridging the digital divide while advancing Indic AI.",
    websiteUrl: 'https://karya.in',
    logoUrl: 'https://ui-avatars.com/api/?name=Karya&background=E11D48&color=fff&size=150',
    categoryId: CAT.dataOps,
    pricingModel: 'PAID',
    avgRating: 4.9,
    listingTier: 'FEATURED',
    status: 'APPROVED',
  },
  {
    slug: 'dubverse',
    name: 'Dubverse',
    tagline: 'AI-powered video dubbing tool supporting purely Indian languages natively',
    description: "Dubverse enables creators and enterprises to dub video content into 30+ languages including Hindi, Tamil, Telugu, and Kannada using AI voice cloning and lip-sync technology.",
    websiteUrl: 'https://dubverse.ai',
    logoUrl: 'https://ui-avatars.com/api/?name=Dubverse&background=059669&color=fff&size=150',
    categoryId: CAT.videoGen,
    pricingModel: 'FREEMIUM',
    avgRating: 4.6,
    listingTier: 'FEATURED',
    status: 'APPROVED',
  },
  // ── PRIORITY ─────────────────────────────────────────────────
  {
    slug: 'gnani-ai',
    name: 'Gnani.ai',
    tagline: 'Enterprise voice AI processing 10M+ calls daily across Indian enterprises',
    description: "Gnani.ai is an enterprise conversational AI platform built on 14 million hours of Indian speech data. It powers voice bots for Tata Group, Air India, and major Indian banks.",
    websiteUrl: 'https://gnani.ai',
    logoUrl: 'https://ui-avatars.com/api/?name=Gnani+AI&background=7C3AED&color=fff&size=150',
    categoryId: CAT.support,
    pricingModel: 'PAID',
    avgRating: 4.5,
    listingTier: 'PRIORITY',
    status: 'APPROVED',
  },
  {
    slug: 'murf-ai',
    name: 'Murf AI',
    tagline: 'Studio-quality AI voiceover in Hindi, Tamil, Telugu and 20+ languages',
    description: "Murf AI is a text-to-speech platform offering studio-quality AI voices in 20+ languages including major Indian languages. Used by educators, marketers, and content creators globally.",
    websiteUrl: 'https://murf.ai',
    logoUrl: 'https://ui-avatars.com/api/?name=Murf+AI&background=3B82F6&color=fff&size=150',
    categoryId: CAT.media,
    pricingModel: 'FREEMIUM',
    avgRating: 4.6,
    listingTier: 'PRIORITY',
    status: 'APPROVED',
  },
  {
    slug: 'bhashini',
    name: 'Bhashini AI',
    tagline: 'Open-source language AI models breaking language barriers across India',
    description: "Bhashini is India's national language translation mission, providing open-source AI models for translation, transcription, and TTS across all 22 scheduled Indian languages as a digital public good.",
    websiteUrl: 'https://bhashini.gov.in',
    logoUrl: 'https://ui-avatars.com/api/?name=Bhashini&background=0EA5E9&color=fff&size=150',
    categoryId: CAT.openSource,
    pricingModel: 'FREE',
    avgRating: 4.9,
    listingTier: 'PRIORITY',
    status: 'APPROVED',
  },
  {
    slug: 'kissanai',
    name: 'KissanAI',
    tagline: 'Multilingual generative AI voice advisor designed directly for Indian farmers',
    description: "KissanAI is a WhatsApp-based AI assistant for Indian farmers, providing crop advisory, weather alerts, and market prices in local languages via voice and text.",
    websiteUrl: 'https://kissanai.in',
    logoUrl: 'https://ui-avatars.com/api/?name=KissanAI&background=22C55E&color=fff&size=150',
    categoryId: CAT.assistant,
    pricingModel: 'FREE',
    avgRating: 4.8,
    listingTier: 'PRIORITY',
    status: 'APPROVED',
  },
  {
    slug: 'wadhwani-ai',
    name: 'Wadhwani AI',
    tagline: 'AI solutions for public health and agriculture across the global south',
    description: "Wadhwani AI is a non-profit building AI solutions for public health, agriculture, and livelihoods in India and the global south, with deployments across 15+ countries.",
    websiteUrl: 'https://wadhwaniai.org',
    logoUrl: 'https://ui-avatars.com/api/?name=Wadhwani&background=EF4444&color=fff&size=150',
    categoryId: CAT.research,
    pricingModel: 'FREE',
    avgRating: 4.8,
    listingTier: 'PRIORITY',
    status: 'APPROVED',
  },
  {
    slug: 'rephrase-ai',
    name: 'Rephrase.ai',
    tagline: 'Pioneering synthetic video generation platform for personalized marketing',
    description: "Rephrase.ai (acquired by Bharat) enables brands to create personalized AI video content at scale using digital human avatars, reducing video production costs by 90%.",
    websiteUrl: 'https://rephrase.ai',
    logoUrl: 'https://ui-avatars.com/api/?name=Rephrase&background=8B5CF6&color=fff&size=150',
    categoryId: CAT.videoGen,
    pricingModel: 'PAID',
    avgRating: 4.6,
    listingTier: 'PRIORITY',
    status: 'APPROVED',
  },
  {
    slug: 'corover-ai',
    name: 'CoRover.ai',
    tagline: 'Conversational AI powering IRCTC and large public sector platforms in India',
    description: "CoRover.ai powers AskDisha, the official IRCTC chatbot handling 1M+ queries daily. Their platform serves Indian Railways, BSNL, and multiple government portals.",
    websiteUrl: 'https://corover.ai',
    logoUrl: 'https://ui-avatars.com/api/?name=CoRover&background=EC4899&color=fff&size=150',
    categoryId: CAT.support,
    pricingModel: 'PAID',
    avgRating: 4.5,
    listingTier: 'PRIORITY',
    status: 'APPROVED',
  },
  {
    slug: 'jugalbandi',
    name: 'Jugalbandi',
    tagline: 'Open ecosystem providing AI-driven citizen services via WhatsApp',
    description: "Jugalbandi is an open-source platform by Microsoft and OpenNyAI that enables government schemes and citizen services to be accessed via WhatsApp in any Indian language.",
    websiteUrl: 'https://jugalbandi.ai',
    logoUrl: 'https://ui-avatars.com/api/?name=Jugalbandi&background=14B8A6&color=fff&size=150',
    categoryId: CAT.openSource,
    pricingModel: 'FREE',
    avgRating: 4.9,
    listingTier: 'PRIORITY',
    status: 'APPROVED',
  },
];

async function seed() {
  console.log(`Seeding ${tools.length} tools...`);
  let inserted = 0;
  let skipped = 0;

  for (const tool of tools) {
    try {
      // Check if slug already exists
      const existing = await sql`SELECT id FROM "AiTool" WHERE slug = ${tool.slug} LIMIT 1`;
      if (existing.length > 0) {
        // Update listingTier and status in case it changed
        await sql`
          UPDATE "AiTool"
          SET "listingTier" = ${tool.listingTier}::"ListingTier",
              status = ${tool.status}::"ToolApprovalStatus",
              "updatedAt" = NOW()
          WHERE slug = ${tool.slug}
        `;
        console.log(`  ↻ Updated: ${tool.name}`);
        skipped++;
        continue;
      }

      await sql`
        INSERT INTO "AiTool" (
          id, name, slug, tagline, description, "websiteUrl", "logoUrl",
          "categoryId", "pricingModel", "avgRating", "listingTier", status,
          "founderNames", "screenshotUrls", "aiSuggestedEdits",
          "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(),
          ${tool.name},
          ${tool.slug},
          ${tool.tagline},
          ${tool.description},
          ${tool.websiteUrl},
          ${tool.logoUrl},
          ${tool.categoryId},
          ${tool.pricingModel}::"PricingModel",
          ${tool.avgRating},
          ${tool.listingTier}::"ListingTier",
          ${tool.status}::"ToolApprovalStatus",
          ARRAY[]::text[],
          ARRAY[]::text[],
          ARRAY[]::text[],
          NOW(),
          NOW()
        )
      `;
      console.log(`  ✓ Inserted: ${tool.name} [${tool.listingTier}]`);
      inserted++;
    } catch (e: any) {
      console.error(`  ✗ Failed: ${tool.name} — ${e.message}`);
    }
  }

  console.log(`\nDone. Inserted: ${inserted}, Updated: ${skipped}`);
}

seed().catch(console.error);
