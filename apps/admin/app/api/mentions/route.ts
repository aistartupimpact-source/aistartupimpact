import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@aistartupimpact/database';

export async function GET(req: NextRequest) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER', 'WRITER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const pattern = `%${q}%`;

  try {
    const [startups, tools, founders] = await Promise.all([
      prisma.$queryRaw`
        SELECT id, name, slug, "logoUrl" as avatar, "tagline"
        FROM "Startup"
        WHERE "deletedAt" IS NULL
          AND name ILIKE ${pattern}
        ORDER BY name ASC
        LIMIT 4
      ` as Promise<any[]>,
      prisma.$queryRaw`
        SELECT id, name, slug, "logoUrl" as avatar, "tagline"
        FROM "AiTool"
        WHERE name ILIKE ${pattern}
        ORDER BY name ASC
        LIMIT 4
      ` as Promise<any[]>,
      prisma.$queryRaw`
        SELECT id, name, avatar, company, role
        FROM "FounderUser"
        WHERE name ILIKE ${pattern}
        ORDER BY name ASC
        LIMIT 4
      ` as Promise<any[]>,
    ]);

    const results = [
      ...startups.map((s: any) => ({
        type: 'startup' as const,
        id: s.id,
        name: s.name,
        slug: s.slug,
        avatar: s.avatar,
        subtitle: s.tagline || '',
      })),
      ...tools.map((t: any) => ({
        type: 'tool' as const,
        id: t.id,
        name: t.name,
        slug: t.slug,
        avatar: t.avatar,
        subtitle: t.tagline || '',
      })),
      ...founders.map((f: any) => ({
        type: 'founder' as const,
        id: f.id,
        name: f.name,
        slug: `founder-${f.id}`,
        avatar: f.avatar,
        subtitle: [f.role, f.company].filter(Boolean).join(' at ') || '',
      })),
    ];

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Mentions search error:', error);
    return NextResponse.json({ results: [] });
  }
}
