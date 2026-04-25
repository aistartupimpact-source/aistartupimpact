import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { detectCategory } from '@/lib/categories';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, websiteUrl, linkedinUrl, logoUrl,
      tagline, description, stage,
      headquartersCity, foundedYear, employeeCount,
      founders, founderEmail,
      category, useCases,
    } = body;

    if (!name || !websiteUrl || !tagline || !founderEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      + '-' + Math.random().toString(36).substring(2, 6);

    // Auto-detect category if not provided
    const finalCategory = category || detectCategory(`${name} ${tagline} ${description || ''}`);

    // Insert startup
    const result = await sql`
      INSERT INTO "Startup" (
        id, name, slug, tagline, description, "websiteUrl", "linkedinUrl", "logoUrl",
        stage, "headquartersCity", "foundedYear", "employeeCount",
        category, "useCases",
        "isIndian", "isFeatured", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), ${name}, ${slug},
        ${tagline.slice(0, 60)},
        ${description || null},
        ${websiteUrl},
        ${linkedinUrl || null},
        ${logoUrl || null},
        ${stage || 'SEED'}::"StartupStage",
        ${headquartersCity || null},
        ${foundedYear ? parseInt(foundedYear) : null},
        ${employeeCount ? parseInt(employeeCount) : null},
        ${finalCategory || null},
        ${useCases && useCases.length > 0 ? useCases : null},
        true, false, NOW(), NOW()
      )
      RETURNING id
    `;

    const startupId = (result[0] as any).id;

    // Save founders data if provided
    if (founders?.length > 0) {
      const validFounders = founders.filter((f: any) => f.name?.trim());
      if (validFounders.length > 0) {
        await sql`
          UPDATE "Startup" SET "foundersData" = ${JSON.stringify(validFounders)}::jsonb
          WHERE id = ${startupId}
        `;
      }
    }

    return NextResponse.json({ success: true, slug });
  } catch (e: any) {
    console.error('startup submit error:', e);
    return NextResponse.json({ error: 'Submission failed. Please try again.' }, { status: 500 });
  }
}
