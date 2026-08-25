import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@aistartupimpact/database";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["IN_REVIEW", "APPROVED", "REJECTED"];
const VALID_TYPES: string[] = ["FOUNDER_STORY", "STARTUP_UPDATE"];

export async function GET(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "IN_REVIEW";
    const type = searchParams.get("type");

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
    }

    const where: any = {
      type: { in: VALID_TYPES },
      deletedAt: null,
    };

    if (status === "IN_REVIEW") {
      where.moderationStatus = "PENDING_REVIEW";
    } else if (status === "APPROVED") {
      where.moderationStatus = "APPROVED";
    } else if (status === "REJECTED") {
      where.moderationStatus = { in: ["REJECTED", "REVISION_REQUESTED"] };
    }

    if (type && VALID_TYPES.includes(type)) where.type = type as any;

    const articles = await prisma.article.findMany({
      where,
      select: {
        id: true, title: true, slug: true, type: true, status: true,
        excerpt: true, contentText: true, coverImage: true,
        moderationStatus: true, moderationNote: true,
        moderatedBy: true, moderatedAt: true,
        createdAt: true, updatedAt: true,
        Startup: { select: { id: true, name: true, slug: true } },
        SubmittedByFounder: { select: { id: true, name: true } },
        FounderAuthor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const counts = await prisma.article.groupBy({
      by: ["moderationStatus"],
      where: { type: { in: VALID_TYPES as any }, deletedAt: null },
      _count: true,
    });

    return NextResponse.json({ success: true, articles, counts });
  } catch (err) {
    console.error("[admin/content-review GET]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
