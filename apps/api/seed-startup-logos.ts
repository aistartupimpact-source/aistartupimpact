import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const logos = [
  { slug: 'neysa',       domain: 'neysa.in' },
  { slug: 'sarvam-ai',   domain: 'sarvam.ai' },
  { slug: 'krutrim',     domain: 'krutrim.ai' },
  { slug: 'deccan-ai',   domain: 'deccanai.com' },
  { slug: 'portkey',     domain: 'portkey.ai' },
  { slug: 'loop-ai',     domain: 'loopai.com' },
  { slug: 'orbitshift',  domain: 'orbitshift.io' },
  { slug: 'emergent',    domain: 'emergent.sh' },
  { slug: 'arrowhead',   domain: 'arrowhead.ai' },
  { slug: 'etherealx',   domain: 'etherealx.in' },
  { slug: 'temple-ai',   domain: 'temple.ai' },
  { slug: 'the-guild',   domain: 'theguild.in' },
  { slug: 'emversity',   domain: 'emversity.com' },
];

async function run() {
  for (const item of logos) {
    const logoUrl = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${item.domain}&size=128`;
    await sql`UPDATE "Startup" SET "logoUrl" = ${logoUrl}, "updatedAt" = NOW() WHERE slug = ${item.slug} AND "deletedAt" IS NULL`;
    console.log('✓', item.slug);
  }
  console.log('Done');
}

run().catch(console.error);
