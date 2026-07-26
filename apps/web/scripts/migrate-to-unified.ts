/**
 * Phase 2 — Bulk Migration Script
 * 
 * Creates UnifiedUser records from existing WebUser, FounderUser, and EventOrganizer accounts.
 * Matches by lowercased email. Links workspace profiles via unifiedUserId FK.
 * 
 * Safe to re-run (idempotent). Never modifies old tables' auth fields.
 * 
 * Usage: npx tsx scripts/migrate-to-unified.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface MigrationReport {
  totalEmails: number;
  migrated: number;
  communityOnly: number;
  communityFounder: number;
  communityOrganizer: number;
  communityBoth: number;
  founderOnly: number;
  organizerOnly: number;
  skippedExisting: number;
  flaggedDuplicateEmail: number;
  flaggedGoogleConflict: number;
  flaggedNullEmail: number;
  flaggedMalformedHash: number;
  errors: number;
  details: string[];
}

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Unified Identity Migration Script");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  const report: MigrationReport = {
    totalEmails: 0, migrated: 0,
    communityOnly: 0, communityFounder: 0, communityOrganizer: 0, communityBoth: 0,
    founderOnly: 0, organizerOnly: 0,
    skippedExisting: 0, flaggedDuplicateEmail: 0, flaggedGoogleConflict: 0,
    flaggedNullEmail: 0, flaggedMalformedHash: 0, errors: 0, details: [],
  };

  // 1. Collect all unique emails across all tables
  const webUsers = await prisma.webUser.findMany({ select: { id: true, email: true, name: true, avatar: true, passwordHash: true } });
  const founders = await prisma.founderUser.findMany({ select: { id: true, email: true, name: true, avatar: true, passwordHash: true, googleId: true, twoFactorEnabled: true, twoFactorSecret: true, twoFactorBackupCodes: true } });
  const organizers = await prisma.eventOrganizer.findMany({ select: { id: true, email: true, name: true, avatar: true, passwordHash: true, googleId: true, emailVerified: true } });

  // Build email map
  const emailMap = new Map<string, { webUser?: any; founder?: any; organizer?: any }>();

  for (const wu of webUsers) {
    if (!wu.email) { report.flaggedNullEmail++; report.details.push(`WebUser ${wu.id}: null email`); continue; }
    const key = wu.email.toLowerCase();
    if (!emailMap.has(key)) emailMap.set(key, {});
    const entry = emailMap.get(key)!;
    if (entry.webUser) { report.flaggedDuplicateEmail++; report.details.push(`Duplicate WebUser email: ${key}`); continue; }
    entry.webUser = wu;
  }

  for (const f of founders) {
    if (!f.email) { report.flaggedNullEmail++; report.details.push(`FounderUser ${f.id}: null email`); continue; }
    const key = f.email.toLowerCase();
    if (!emailMap.has(key)) emailMap.set(key, {});
    const entry = emailMap.get(key)!;
    if (entry.founder) { report.flaggedDuplicateEmail++; report.details.push(`Duplicate FounderUser email: ${key}`); continue; }
    entry.founder = f;
  }

  for (const o of organizers) {
    if (!o.email) { report.flaggedNullEmail++; report.details.push(`EventOrganizer ${o.id}: null email`); continue; }
    const key = o.email.toLowerCase();
    if (!emailMap.has(key)) emailMap.set(key, {});
    const entry = emailMap.get(key)!;
    if (entry.organizer) { report.flaggedDuplicateEmail++; report.details.push(`Duplicate EventOrganizer email: ${key}`); continue; }
    entry.organizer = o;
  }

  report.totalEmails = emailMap.size;
  console.log(`Found ${report.totalEmails} unique emails across all tables`);
  console.log("");

  // 2. Process each email
  for (const [email, accounts] of emailMap) {
    try {
      // Skip if UnifiedUser already exists for this email
      const existing = await prisma.unifiedUser.findUnique({ where: { email } });
      if (existing) {
        report.skippedExisting++;
        // Still link profiles if not yet linked
        if (accounts.founder && !accounts.founder.unifiedUserId) {
          await prisma.founderUser.update({ where: { id: accounts.founder.id }, data: { unifiedUserId: existing.id } });
        }
        if (accounts.organizer && !accounts.organizer.unifiedUserId) {
          await prisma.eventOrganizer.update({ where: { id: accounts.organizer.id }, data: { unifiedUserId: existing.id } });
        }
        continue;
      }

      // Determine best name, avatar, passwordHash
      const name = accounts.founder?.name || accounts.webUser?.name || accounts.organizer?.name || email.split("@")[0];
      const avatar = accounts.founder?.avatar || accounts.webUser?.avatar || accounts.organizer?.avatar || null;
      const passwordHash = accounts.founder?.passwordHash || accounts.webUser?.passwordHash || accounts.organizer?.passwordHash || null;

      // Validate password hash format (bcrypt starts with $2)
      let validHash = passwordHash;
      if (passwordHash && !passwordHash.startsWith("$2")) {
        report.flaggedMalformedHash++;
        report.details.push(`${email}: malformed passwordHash (not bcrypt)`);
        validHash = null;
      }

      // Google ID conflict detection
      const googleIds = new Set<string>();
      if (accounts.founder?.googleId) googleIds.add(accounts.founder.googleId);
      if (accounts.organizer?.googleId) googleIds.add(accounts.organizer.googleId);
      // WebUser doesn't store googleId directly

      let googleId: string | null = null;
      if (googleIds.size === 1) {
        googleId = [...googleIds][0];
      } else if (googleIds.size > 1) {
        report.flaggedGoogleConflict++;
        report.details.push(`${email}: multiple googleIds (${[...googleIds].join(", ")})`);
        googleId = null; // Don't pick one — user can use email/password
      }

      // Check if googleId already used by another UnifiedUser
      if (googleId) {
        const existingGoogle = await prisma.unifiedUser.findUnique({ where: { googleId } });
        if (existingGoogle) {
          report.flaggedGoogleConflict++;
          report.details.push(`${email}: googleId ${googleId} already used by UnifiedUser ${existingGoogle.id}`);
          googleId = null;
        }
      }

      // Email verified?
      const emailVerified = !!(accounts.founder?.emailVerified || accounts.organizer?.emailVerified || accounts.webUser);

      // 2FA
      const twoFactorEnabled = accounts.founder?.twoFactorEnabled || false;
      const twoFactorSecret = accounts.founder?.twoFactorSecret || null;
      const twoFactorBackupCodes = accounts.founder?.twoFactorBackupCodes || [];
      const twoFactorInherited = twoFactorEnabled && (!!accounts.webUser || !!accounts.organizer);

      // Create UnifiedUser
      const unified = await prisma.unifiedUser.create({
        data: {
          email,
          name,
          avatar,
          passwordHash: validHash,
          googleId,
          emailVerified,
          twoFactorEnabled,
          twoFactorSecret,
          twoFactorBackupCodes,
          twoFactorInherited,
        },
      });

      // Link workspace profiles
      if (accounts.founder) {
        await prisma.founderUser.update({ where: { id: accounts.founder.id }, data: { unifiedUserId: unified.id } });
      }
      if (accounts.organizer) {
        await prisma.eventOrganizer.update({ where: { id: accounts.organizer.id }, data: { unifiedUserId: unified.id } });
      }

      // Log
      await prisma.workspaceLinkLog.create({
        data: {
          userId: unified.id,
          workspace: accounts.founder ? "founder" : accounts.organizer ? "organizer" : "community",
          action: "bulk_migrated",
          linkedId: accounts.founder?.id || accounts.organizer?.id || accounts.webUser?.id || "none",
          emailMatch: true,
          verified: emailVerified,
        },
      });

      // Categorize
      report.migrated++;
      const hasWeb = !!accounts.webUser;
      const hasFounder = !!accounts.founder;
      const hasOrganizer = !!accounts.organizer;

      if (hasWeb && hasFounder && hasOrganizer) report.communityBoth++;
      else if (hasWeb && hasFounder) report.communityFounder++;
      else if (hasWeb && hasOrganizer) report.communityOrganizer++;
      else if (hasWeb) report.communityOnly++;
      else if (hasFounder) report.founderOnly++;
      else if (hasOrganizer) report.organizerOnly++;

    } catch (error: any) {
      report.errors++;
      report.details.push(`${email}: ERROR — ${error.message}`);
    }
  }

  // 3. Print report
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Migration Report");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Total unique emails:       ${report.totalEmails}`);
  console.log(`Successfully migrated:     ${report.migrated}`);
  console.log(`  ├── Community only:      ${report.communityOnly}`);
  console.log(`  ├── Community + Founder: ${report.communityFounder}`);
  console.log(`  ├── Community + Organizer: ${report.communityOrganizer}`);
  console.log(`  ├── Community + Both:    ${report.communityBoth}`);
  console.log(`  ├── Founder only:        ${report.founderOnly}`);
  console.log(`  └── Organizer only:      ${report.organizerOnly}`);
  console.log(`Skipped (already exists):  ${report.skippedExisting}`);
  console.log(`Flagged for review:        ${report.flaggedDuplicateEmail + report.flaggedGoogleConflict + report.flaggedNullEmail + report.flaggedMalformedHash}`);
  console.log(`  ├── Duplicate email:     ${report.flaggedDuplicateEmail}`);
  console.log(`  ├── Google ID conflict:  ${report.flaggedGoogleConflict}`);
  console.log(`  ├── Null/missing email:  ${report.flaggedNullEmail}`);
  console.log(`  └── Malformed hash:      ${report.flaggedMalformedHash}`);
  console.log(`Errors:                    ${report.errors}`);
  console.log("");

  if (report.details.length > 0) {
    console.log("Details:");
    report.details.forEach(d => console.log(`  • ${d}`));
  }

  console.log("");
  console.log("Done.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Migration failed:", e);
  prisma.$disconnect();
  process.exit(1);
});
