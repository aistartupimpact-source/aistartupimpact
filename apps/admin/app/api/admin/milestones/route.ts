import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@aistartupimpact/database";

export const dynamic = "force-dynamic";

const VALID_FILTERS = ["all", "FOUNDER_REPORTED", "PLATFORM_VERIFIED"];

export async function GET(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const verification = searchParams.get("verification") || "all";

    if (!VALID_FILTERS.includes(verification)) {
      return NextResponse.json({ error: "Invalid filter" }, { status: 400 });
    }

    const where: any = { status: { not: "DELETED" } };
    if (verification === "FOUNDER_REPORTED") where.verificationStatus = "FOUNDER_REPORTED";
    if (verification === "PLATFORM_VERIFIED") where.verificationStatus = "PLATFORM_VERIFIED";

    const milestones = await prisma.founderMilestone.findMany({
      where,
      include: {
        startup: { select: { id: true, name: true, slug: true } },
        founder: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ success: true, milestones });
  } catch (err) {
    console.error("[admin/milestones GET]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
