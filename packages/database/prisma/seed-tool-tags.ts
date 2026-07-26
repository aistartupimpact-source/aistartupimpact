/**
 * Seed script: AI Tool Tag System
 * 12 Groups, 224 Tags
 * 
 * Run: npx tsx prisma/seed-tool-tags.ts
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env from monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const sql = neon(process.env.DATABASE_URL!);

interface TagGroup {
  name: string;
  slug: string;
  icon: string;
  description: string;
  sortOrder: number;
  displayMode: 'expandable' | 'searchable' | 'chips';
  maxVisibleDefault: number;
  isAdminOnly: boolean;
  tags: TagDef[];
}

interface TagDef {
  name: string;
  emoji?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove special chars except dashes
    .replace(/[\s_]+/g, '-')  // spaces/underscores to dashes
    .replace(/-+/g, '-')      // collapse multiple dashes
    .replace(/^-|-$/g, '');   // trim leading/trailing dashes
}

const TAG_GROUPS: TagGroup[] = [
  {
    name: 'Platform & Access',
    slug: 'platform-access',
    icon: '🖥️',
    description: 'Where and how you can use this tool',
    sortOrder: 1,
    displayMode: 'expandable',
    maxVisibleDefault: 6,
    isAdminOnly: false,
    tags: [
      { name: 'Web App' },
      { name: 'Progressive Web App (PWA)' },
      { name: 'iOS App' },
      { name: 'Android App' },
      { name: 'Chrome Extension' },
      { name: 'Firefox Extension' },
      { name: 'Edge Extension' },
      { name: 'Desktop (Windows)' },
      { name: 'Desktop (Mac)' },
      { name: 'Desktop (Linux)' },
      { name: 'Slack Bot' },
      { name: 'Discord Bot' },
      { name: 'Telegram Bot' },
      { name: 'WhatsApp Bot' },
      { name: 'WhatsApp Business' },
      { name: 'API Only' },
      { name: 'WordPress Plugin' },
      { name: 'Shopify App' },
      { name: 'Figma Plugin' },
      { name: 'VS Code Extension' },
      { name: 'Notion Integration' },
      { name: 'Browser-Based (No Install)' },
    ],
  },
  {
    name: 'AI Model / Technology',
    slug: 'ai-model-technology',
    icon: '🧠',
    description: 'Underlying AI models and technology',
    sortOrder: 2,
    displayMode: 'expandable',
    maxVisibleDefault: 6,
    isAdminOnly: false,
    tags: [
      { name: 'GPT-4 / GPT-4o' },
      { name: 'GPT-4o Mini' },
      { name: 'Claude' },
      { name: 'Gemini' },
      { name: 'Llama' },
      { name: 'Mistral' },
      { name: 'Stable Diffusion' },
      { name: 'DALL-E' },
      { name: 'Midjourney' },
      { name: 'Flux' },
      { name: 'Whisper' },
      { name: 'ElevenLabs' },
      { name: 'Sarvam AI' },
      { name: 'Krutrim' },
      { name: 'Custom / Proprietary Model' },
      { name: 'Open Source Model' },
      { name: 'Multiple Models' },
      { name: 'Fine-Tuned Model' },
      { name: 'On-Device AI' },
      { name: 'Real-Time AI' },
    ],
  },
  {
    name: 'Pricing & Access',
    slug: 'pricing-access',
    icon: '💰',
    description: 'Pricing models and access options',
    sortOrder: 3,
    displayMode: 'expandable',
    maxVisibleDefault: 6,
    isAdminOnly: false,
    tags: [
      { name: 'Completely Free' },
      { name: 'Freemium' },
      { name: 'Free Trial Available' },
      { name: 'Free Tier (Limited)' },
      { name: 'Pay Per Use' },
      { name: 'Monthly Subscription' },
      { name: 'Annual Discount Available' },
      { name: 'One-Time Purchase' },
      { name: 'Lifetime Deal Available' },
      { name: 'Enterprise Custom Pricing' },
      { name: 'Usage-Based Billing' },
      { name: 'No Credit Card Required' },
      { name: 'No Signup Required' },
      { name: 'Open Source' },
      { name: 'Student Discount Available' },
      { name: 'Startup Plan Available' },
      { name: 'INR Pricing Available' },
      { name: 'Regional Pricing Available' },
    ],
  },
  {
    name: 'Target User',
    slug: 'target-user',
    icon: '👤',
    description: 'Who this tool is built for',
    sortOrder: 4,
    displayMode: 'chips',
    maxVisibleDefault: 16,
    isAdminOnly: false,
    tags: [
      { name: 'Solo / Freelancer' },
      { name: 'Small Business (2–50)' },
      { name: 'Mid-Market (50–500)' },
      { name: 'Enterprise (500+)' },
      { name: 'Startup' },
      { name: 'Developer / Engineer' },
      { name: 'Designer' },
      { name: 'Marketer' },
      { name: 'Content Creator' },
      { name: 'Student' },
      { name: 'Teacher / Educator' },
      { name: 'Researcher' },
      { name: 'Non-Technical User' },
      { name: 'Agency' },
      { name: 'Government / Public Sector' },
      { name: 'NGO / Non-Profit' },
    ],
  },
  {
    name: 'Deployment & Security',
    slug: 'deployment-security',
    icon: '🔒',
    description: 'Deployment options and security compliance',
    sortOrder: 5,
    displayMode: 'expandable',
    maxVisibleDefault: 6,
    isAdminOnly: false,
    tags: [
      { name: 'Cloud / SaaS' },
      { name: 'On-Premise' },
      { name: 'Self-Hosted' },
      { name: 'Hybrid' },
      { name: 'SOC 2 Compliant' },
      { name: 'GDPR Compliant' },
      { name: 'HIPAA Compliant' },
      { name: 'ISO 27001' },
      { name: 'DPDP Act Compliant' },
      { name: 'CERT-In Compliant' },
      { name: 'MeitY Empanelled' },
      { name: 'End-to-End Encrypted' },
      { name: 'SSO / SAML' },
      { name: 'Role-Based Access' },
      { name: 'Air-Gapped / Offline' },
      { name: 'Data Residency Options' },
    ],
  },
  {
    name: 'Payment & Billing',
    slug: 'payment-billing',
    icon: '💳',
    description: 'Accepted payment methods and billing options',
    sortOrder: 6,
    displayMode: 'expandable',
    maxVisibleDefault: 6,
    isAdminOnly: false,
    tags: [
      { name: 'UPI' },
      { name: 'Razorpay' },
      { name: 'PayU' },
      { name: 'Cashfree' },
      { name: 'Stripe' },
      { name: 'PayPal' },
      { name: 'Wire Transfer / NEFT / RTGS' },
      { name: 'Credit / Debit Card' },
      { name: 'Net Banking' },
      { name: 'Invoice Billing' },
      { name: 'GST Invoice Available' },
      { name: 'Multi-Currency Support' },
      { name: 'Crypto Payment' },
      { name: 'Purchase Order / PO Based' },
    ],
  },
  {
    name: 'Integration Ecosystem',
    slug: 'integration-ecosystem',
    icon: '🔗',
    description: 'Integrations with other tools and platforms',
    sortOrder: 7,
    displayMode: 'searchable',
    maxVisibleDefault: 6,
    isAdminOnly: false,
    tags: [
      { name: 'Zapier' },
      { name: 'Make (Integromat)' },
      { name: 'n8n' },
      { name: 'Pabbly Connect' },
      { name: 'Slack' },
      { name: 'Microsoft Teams' },
      { name: 'Google Workspace' },
      { name: 'Microsoft 365' },
      { name: 'Notion' },
      { name: 'Airtable' },
      { name: 'HubSpot' },
      { name: 'Salesforce' },
      { name: 'Zoho CRM' },
      { name: 'Freshworks' },
      { name: 'Leadsquared' },
      { name: 'Shopify' },
      { name: 'WooCommerce' },
      { name: 'WordPress' },
      { name: 'Webflow' },
      { name: 'Figma' },
      { name: 'GitHub' },
      { name: 'GitLab' },
      { name: 'Jira' },
      { name: 'Confluence' },
      { name: 'Asana' },
      { name: 'Trello' },
      { name: 'Monday.com' },
      { name: 'Intercom' },
      { name: 'Zendesk' },
      { name: 'Freshdesk' },
      { name: 'Stripe' },
      { name: 'Tally (India)' },
      { name: 'QuickBooks' },
      { name: 'REST API / Webhooks' },
    ],
  },
  {
    name: 'Language & Localization',
    slug: 'language-localization',
    icon: '🌐',
    description: 'Supported languages and localization',
    sortOrder: 8,
    displayMode: 'searchable',
    maxVisibleDefault: 6,
    isAdminOnly: false,
    tags: [
      { name: 'English' },
      { name: 'Hindi' },
      { name: 'Tamil' },
      { name: 'Telugu' },
      { name: 'Kannada' },
      { name: 'Malayalam' },
      { name: 'Bengali' },
      { name: 'Marathi' },
      { name: 'Gujarati' },
      { name: 'Punjabi' },
      { name: 'Urdu' },
      { name: 'Odia' },
      { name: 'Assamese' },
      { name: 'Spanish' },
      { name: 'French' },
      { name: 'German' },
      { name: 'Portuguese' },
      { name: 'Chinese (Simplified)' },
      { name: 'Japanese' },
      { name: 'Korean' },
      { name: 'Arabic' },
      { name: 'Indonesian' },
      { name: 'Thai' },
      { name: 'Vietnamese' },
      { name: 'Russian' },
      { name: 'Turkish' },
      { name: 'Multi-Language (10+)' },
      { name: 'Multi-Language (50+)' },
    ],
  },
  {
    name: 'Content & Output Type',
    slug: 'content-output-type',
    icon: '📄',
    description: 'Types of content the tool generates',
    sortOrder: 9,
    displayMode: 'expandable',
    maxVisibleDefault: 6,
    isAdminOnly: false,
    tags: [
      { name: 'Text Output' },
      { name: 'Image Output' },
      { name: 'Video Output' },
      { name: 'Audio Output' },
      { name: 'Code Output' },
      { name: 'Spreadsheet Output' },
      { name: 'PDF Output' },
      { name: 'Presentation Output' },
      { name: '3D Output' },
      { name: 'Data / CSV Output' },
      { name: 'API Response' },
      { name: 'Real-Time Streaming' },
      { name: 'Batch Processing' },
      { name: 'Multi-Modal (Text + Image)' },
      { name: 'Multi-Modal (Text + Video)' },
      { name: 'Multi-Modal (Text + Audio)' },
      { name: 'Embeddable Widget' },
      { name: 'White Label Output' },
      { name: 'Export to Multiple Formats' },
      { name: 'Template-Based' },
      { name: 'Custom Training Output' },
      { name: 'Vernacular / Regional Content Output' },
    ],
  },
  {
    name: 'Feature Capabilities',
    slug: 'feature-capabilities',
    icon: '⚡',
    description: 'Key features and capabilities',
    sortOrder: 10,
    displayMode: 'expandable',
    maxVisibleDefault: 6,
    isAdminOnly: false,
    tags: [
      { name: 'Team Collaboration' },
      { name: 'Multi-User Workspace' },
      { name: 'Version History' },
      { name: 'Comments & Annotations' },
      { name: 'Real-Time Co-Editing' },
      { name: 'Scheduling & Automation' },
      { name: 'Analytics & Reporting' },
      { name: 'A/B Testing' },
      { name: 'Bulk Processing' },
      { name: 'Custom Branding' },
      { name: 'Webhook Support' },
      { name: 'Custom API' },
      { name: 'Mobile Responsive' },
      { name: 'Offline Mode' },
      { name: 'Voice Input' },
      { name: 'Image Input' },
      { name: 'PDF / Document Input' },
      { name: 'URL Input' },
      { name: 'Video Input' },
      { name: 'Audit Trail' },
      { name: 'Priority Support' },
      { name: 'Dedicated Account Manager' },
      { name: 'SLA Available' },
      { name: 'Uptime Guarantee' },
      { name: 'Low Bandwidth Mode' },
      { name: 'Multi-Tenant Architecture' },
      { name: 'Sandbox / Demo Environment' },
      { name: 'Custom Workflow Builder' },
    ],
  },
  {
    name: 'Industry & Domain',
    slug: 'industry-domain',
    icon: '🏢',
    description: 'Industry verticals and domains',
    sortOrder: 11,
    displayMode: 'expandable',
    maxVisibleDefault: 6,
    isAdminOnly: false,
    tags: [
      { name: 'EdTech' },
      { name: 'FinTech' },
      { name: 'HealthTech' },
      { name: 'LegalTech' },
      { name: 'AgriTech' },
      { name: 'D2C / E-Commerce' },
      { name: 'SaaS' },
      { name: 'Media & Publishing' },
      { name: 'Manufacturing' },
      { name: 'Logistics & Supply Chain' },
      { name: 'Real Estate & PropTech' },
      { name: 'Government & GovTech' },
      { name: 'BFSI (Banking, Financial Services, Insurance)' },
      { name: 'Hospitality & Travel' },
      { name: 'Telecom' },
      { name: 'Energy & Sustainability' },
      { name: 'Automotive' },
      { name: 'Retail' },
      { name: 'Pharma & Life Sciences' },
      { name: 'Web3 & Blockchain' },
    ],
  },
  {
    name: 'Trending & Editorial',
    slug: 'trending-editorial',
    icon: '🔥',
    description: 'Editorial picks and trending badges',
    sortOrder: 12,
    displayMode: 'chips',
    maxVisibleDefault: 16,
    isAdminOnly: true,
    tags: [
      { name: 'Trending This Week', emoji: '🔥' },
      { name: 'New (Last 30 Days)', emoji: '✨' },
      { name: "Editor's Pick", emoji: '⭐' },
      { name: 'Category Leader', emoji: '🏆' },
      { name: 'Hidden Gem', emoji: '💎' },
      { name: 'Rising Fast', emoji: '🚀' },
      { name: 'Best Free Alternative', emoji: '🆓' },
      { name: 'Recently Updated', emoji: '🔄' },
      { name: 'Beta / Early Access', emoji: '🧪' },
      { name: 'Most Bookmarked', emoji: '📈' },
      { name: 'Most Reviewed', emoji: '🎯' },
      { name: 'Enterprise Ready', emoji: '💼' },
      { name: 'Beginner Friendly', emoji: '👶' },
      { name: 'Developer First', emoji: '🔧' },
      { name: 'Made in India', emoji: '🇮🇳' },
      { name: 'Works Worldwide', emoji: '🌍' },
    ],
  },
];

async function seed() {
  console.log('🏷️  Seeding Tool Tag System...\n');

  let totalTags = 0;

  for (const group of TAG_GROUPS) {
    console.log(`  📁 Group ${group.sortOrder}: ${group.name} (${group.tags.length} tags)`);

    // Upsert group
    await sql`
      INSERT INTO "ToolTagGroup" (id, name, slug, icon, description, "sortOrder", "displayMode", "maxVisibleDefault", "isAdminOnly", "isActive", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${group.name}, ${group.slug}, ${group.icon}, ${group.description}, ${group.sortOrder}, ${group.displayMode}, ${group.maxVisibleDefault}, ${group.isAdminOnly}, true, NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        icon = EXCLUDED.icon,
        description = EXCLUDED.description,
        "sortOrder" = EXCLUDED."sortOrder",
        "displayMode" = EXCLUDED."displayMode",
        "maxVisibleDefault" = EXCLUDED."maxVisibleDefault",
        "isAdminOnly" = EXCLUDED."isAdminOnly",
        "updatedAt" = NOW()
    `;

    // Get the group ID
    const groupRows = await sql`SELECT id FROM "ToolTagGroup" WHERE slug = ${group.slug}`;
    const groupId = groupRows[0].id;

    // Insert tags
    for (let i = 0; i < group.tags.length; i++) {
      const tag = group.tags[i];
      const tagSlug = slugify(tag.name);

      await sql`
        INSERT INTO "ToolSystemTag" (id, name, slug, emoji, "groupId", "sortOrder", "isActive", "tagCount", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${tag.name}, ${tagSlug}, ${tag.emoji || null}, ${groupId}, ${i + 1}, true, 0, NOW(), NOW())
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          emoji = EXCLUDED.emoji,
          "groupId" = EXCLUDED."groupId",
          "sortOrder" = EXCLUDED."sortOrder",
          "updatedAt" = NOW()
      `;
      totalTags++;
    }
  }

  console.log(`\n✅ Seeded ${TAG_GROUPS.length} groups and ${totalTags} tags successfully!`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
