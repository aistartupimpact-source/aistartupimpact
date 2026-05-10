import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getFounderSession } from '@/lib/founder-auth';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getFounderSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const startups = await sql`
      SELECT id, "ownerId"
      FROM "Startup"
      WHERE id = ${params.id}
      LIMIT 1
    `;

    if (!startups.length || startups[0].ownerId !== session.userId) {
      return NextResponse.json(
        { error: 'Startup not found or you do not have permission' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { rounds } = body;

    if (!Array.isArray(rounds)) {
      return NextResponse.json(
        { error: 'Invalid rounds data' },
        { status: 400 }
      );
    }

    // Delete existing rounds for this startup
    await sql`
      DELETE FROM "FundingRound"
      WHERE "startupId" = ${params.id}
    `;

    // Insert new rounds
    for (const round of rounds) {
      if (!round.roundType || !round.amountUsd || !round.announcedAt) {
        continue; // Skip invalid rounds
      }

      await sql`
        INSERT INTO "FundingRound" (
          id, "startupId", "roundType", "amountInr", "amountUsd",
          "announcedAt", "leadInvestors", "allInvestors", "createdAt"
        ) VALUES (
          gen_random_uuid(),
          ${params.id},
          ${round.roundType},
          ${round.amountUsd},
          ${round.amountUsd},
          ${round.announcedAt}::timestamp,
          ${round.leadInvestors || []}::text[],
          ${round.allInvestors || []}::text[],
          NOW()
        )
      `;
    }

    // Update total funding on startup (in USD cents)
    const totalFunding = rounds.reduce((sum, r) => sum + (r.amountUsd || 0), 0);
    await sql`
      UPDATE "Startup"
      SET "totalFundingInr" = ${totalFunding}
      WHERE id = ${params.id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Funding rounds saved successfully',
    });
  } catch (error: any) {
    console.error('Save funding rounds error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save funding rounds' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getFounderSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rounds = await sql`
      SELECT 
        id, "roundType", "amountInr", "amountUsd",
        "announcedAt"::text AS "announcedAt",
        "leadInvestors", "allInvestors"
      FROM "FundingRound"
      WHERE "startupId" = ${params.id}
      ORDER BY "announcedAt" DESC
    `;

    return NextResponse.json({ rounds });
  } catch (error: any) {
    console.error('Get funding rounds error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get funding rounds' },
      { status: 500 }
    );
  }
}
