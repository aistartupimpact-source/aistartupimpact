/**
 * Seed: 2026 Indian AI Funding Rounds (Jan–Apr 2026)
 * Run: npx dotenv-cli -e ../../.env -- npx tsx seed-funding-2026.ts
 */
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  // Step 1: Insert missing startups
  const newStartups = [
    { name: 'Neysa',      city: 'Mumbai',     stage: 'SERIES_B', tagline: 'AI infrastructure & GPU cloud computing' },
    { name: 'Deccan AI',  city: 'Bengaluru',  stage: 'SERIES_A', tagline: 'AI post-training data and evaluation' },
    { name: 'Portkey',    city: 'Bengaluru',  stage: 'SERIES_A', tagline: 'LLMOps unified control plane for AI' },
    { name: 'Loop AI',    city: 'India',      stage: 'SERIES_A', tagline: 'AI-powered restaurant financial management' },
    { name: 'OrbitShift', city: 'Bengaluru',  stage: 'SEED',     tagline: 'AI sales intelligence SaaS' },
  ];

  const ids: Record<string, string> = {};

  const existing = await sql`SELECT id, name FROM "Startup" WHERE "deletedAt" IS NULL`;
  existing.forEach((s: any) => { ids[s.name] = s.id; });

  for (const s of newStartups) {
    if (ids[s.name]) { console.log('exists:', s.name); continue; }
    const res = await sql`
      INSERT INTO "Startup" (id, name, slug, tagline, description, stage, "headquartersCity", "isIndian", "isFeatured", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${s.name}, ${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}, ${s.tagline}, ${s.tagline}, ${s.stage}::"StartupStage", ${s.city}, true, false, NOW(), NOW())
      RETURNING id
    `;
    ids[s.name] = (res as any[])[0].id;
    console.log('✓ Startup:', s.name);
  }

  // Step 2: Insert funding rounds
  const rounds = [
    {
      name: 'Neysa', roundType: 'Series B',
      amountUsd: 120000000000, amountInr: BigInt('9960000000000'),
      announcedAt: '2026-02-01',
      lead: ['Blackstone'],
      all: ['Blackstone', 'Teachers Venture Growth', 'TVS Capital', '360 ONE Asset', 'Nexus Venture Partners'],
      valuation: null,
      source: 'https://economictimes.indiatimes.com',
    },
    {
      name: 'Sarvam AI', roundType: 'Series B',
      amountUsd: 32500000000, amountInr: BigInt('2697500000000'),
      announcedAt: '2026-04-01',
      lead: ['Bessemer Venture Partners'],
      all: ['Bessemer Venture Partners', 'NVIDIA', 'Amazon', 'Prosperity7 Ventures'],
      valuation: BigInt('128700000000000'),
      source: 'https://techcrunch.com',
    },
    {
      name: 'Deccan AI', roundType: 'Series A',
      amountUsd: 2500000000, amountInr: BigInt('207500000000'),
      announcedAt: '2026-03-01',
      lead: ['A91 Partners'],
      all: ['A91 Partners', 'Susquehanna International Group', 'Prosus Ventures'],
      valuation: null, source: null,
    },
    {
      name: 'Portkey', roundType: 'Series A',
      amountUsd: 1500000000, amountInr: BigInt('124500000000'),
      announcedAt: '2026-02-19',
      lead: ['Elevation Capital'],
      all: ['Elevation Capital', 'Lightspeed India'],
      valuation: null, source: null,
    },
    {
      name: 'Loop AI', roundType: 'Series A',
      amountUsd: 1400000000, amountInr: BigInt('116200000000'),
      announcedAt: '2026-02-01',
      lead: [], all: [], valuation: null, source: null,
    },
    {
      name: 'OrbitShift', roundType: 'Seed',
      amountUsd: 300000000, amountInr: BigInt('24900000000'),
      announcedAt: '2026-01-01',
      lead: ['Stellaris Venture Partners'],
      all: ['Stellaris Venture Partners', 'Kunal Shah'],
      valuation: null, source: null,
    },
  ];

  for (const r of rounds) {
    const startupId = ids[r.name];
    if (!startupId) { console.error('No startupId for', r.name); continue; }
    try {
      await sql`
        INSERT INTO "FundingRound" (
          id, "startupId", "roundType", "amountUsd", "amountInr",
          "announcedAt", "leadInvestors", "allInvestors", valuation, "sourceUrl", "createdAt"
        ) VALUES (
          gen_random_uuid(), ${startupId}, ${r.roundType},
          ${r.amountUsd}, ${r.amountInr},
          ${r.announcedAt}::timestamp, ${r.lead}, ${r.all},
          ${r.valuation}, ${r.source}, NOW()
        )
      `;
      console.log('✓ Round:', r.name, r.roundType);
    } catch(e: any) {
      console.error('✗ Round failed:', r.name, e.message);
    }
  }

  // Step 3: Create a Funding Digest for Q1 2026
  const digestExists = await sql`SELECT id FROM "FundingDigest" WHERE title ILIKE '%Q1 2026%' LIMIT 1`;
  if (!digestExists.length) {
    await sql`
      INSERT INTO "FundingDigest" (id, title, date, status, "dealsCount", "totalRaised", deals, "createdAt")
      VALUES (
        gen_random_uuid(),
        'Q1 2026: Indian AI Startups Raise $1.58B Across 6 Disclosed Rounds',
        '2026-04-01'::date,
        'PUBLISHED',
        6,
        '$1.58B',
        ${JSON.stringify([
          { startup: 'Neysa', amount: '$1.2B', stage: 'Series B' },
          { startup: 'Sarvam AI', amount: '$325M', stage: 'Series B' },
          { startup: 'Deccan AI', amount: '$25M', stage: 'Series A' },
          { startup: 'Portkey', amount: '$15M', stage: 'Series A' },
          { startup: 'Loop AI', amount: '$14M', stage: 'Series A' },
          { startup: 'OrbitShift', amount: '$3M', stage: 'Seed' },
        ])},
        NOW()
      )
    `;
    console.log('✓ Digest: Q1 2026 created');
  } else {
    console.log('Digest already exists');
  }

  console.log('\nAll done!');
}

run().catch(console.error);
