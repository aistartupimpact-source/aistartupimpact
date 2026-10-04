/**
 * Recategorize media files:
 * - Move all uploads/ files to founder-avatar prefix (they are LinkedIn founder profile pics)
 * - Re-run usage backfill matching both old and new R2 domains
 *
 * Usage: npx tsx scripts/recategorize-media.ts
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('=== Media Recategorization ===\n');

  // Step 1: Move uploads/ → founder-avatar (prefix metadata only, R2 key unchanged)
  const result = await prisma.mediaAsset.updateMany({
    where: { prefix: 'uploads' },
    data: { prefix: 'founder-avatar' },
  });
  console.log(`Step 1: Recategorized ${result.count} files from uploads/ → founder-avatar`);

  // Step 2: Re-run usage backfill matching both old and new R2 domains
  const currentDomain = process.env.R2_PUBLIC_URL?.replace(/\/$/, '');
  const oldDomains = [
    'https://pub-5a271e4327a5417daf0699e16055d515.r2.dev',
    'https://pub-13cc9cc075664a129c48949c52d1908f.r2.dev',
  ];
  const allDomains = [currentDomain, ...oldDomains].filter(Boolean) as string[];

  console.log(`\nStep 2: Re-linking usage with domains: ${allDomains.join(', ')}`);

  const allMedia = await prisma.mediaAsset.findMany({
    select: { id: true, url: true, key: true },
  });

  // Build lookup: for each key, map all possible URL variants → mediaId
  const urlToId = new Map<string, string>();
  for (const m of allMedia) {
    urlToId.set(m.url, m.id);
    for (const domain of allDomains) {
      urlToId.set(`${domain}/${m.key}`, m.id);
    }
  }

  let created = 0;
  let skipped = 0;

  async function trackUsage(entityType: string, entityId: string, field: string, imageUrl: string | null) {
    if (!imageUrl) return;
    const mediaId = urlToId.get(imageUrl);
    if (!mediaId) return;
    try {
      await prisma.mediaUsage.create({
        data: { mediaId, entityType, entityId, field },
      });
      created++;
    } catch {
      skipped++;
    }
  }

  // Articles
  const articles = await prisma.article.findMany({
    select: { id: true, coverImage: true, thumbnailImage: true },
  });
  for (const a of articles) {
    await trackUsage('ARTICLE', a.id, 'coverImage', a.coverImage);
    await trackUsage('ARTICLE', a.id, 'thumbnailImage', a.thumbnailImage);
  }

  // AI Tools
  const tools = await prisma.aiTool.findMany({ select: { id: true, logoUrl: true } });
  for (const t of tools) {
    await trackUsage('TOOL', t.id, 'logoUrl', t.logoUrl);
  }

  // Startups
  const startups = await prisma.startup.findMany({ select: { id: true, logoUrl: true } });
  for (const s of startups) {
    await trackUsage('STARTUP', s.id, 'logoUrl', s.logoUrl);
  }

  // Investors
  const investors = await prisma.investor.findMany({ select: { id: true, logoUrl: true } });
  for (const i of investors) {
    await trackUsage('INVESTOR', i.id, 'logoUrl', i.logoUrl);
  }

  // Events
  const events = await prisma.event.findMany({ select: { id: true, coverImageUrl: true } });
  for (const e of events) {
    await trackUsage('EVENT', e.id, 'coverImageUrl', e.coverImageUrl);
  }

  console.log(`  New usage records: ${created}`);
  console.log(`  Already tracked: ${skipped}`);

  // Step 3: Summary
  const prefixCounts: Record<string, number> = {};
  const allFiles = await prisma.mediaAsset.findMany({ select: { prefix: true } });
  for (const f of allFiles) {
    prefixCounts[f.prefix] = (prefixCounts[f.prefix] || 0) + 1;
  }
  console.log('\n=== Final folder distribution ===');
  for (const [p, c] of Object.entries(prefixCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${p}: ${c}`);
  }

  const totalUsage = await prisma.mediaUsage.count();
  console.log(`\nTotal usage records: ${totalUsage}`);

  await prisma.$disconnect();
  console.log('\nDone.');
}
main();
