import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { getUserSession } from "@/lib/user-session";
import { checkRateLimit, getClientIdentifier, strictRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getUserSession();
    if (!session?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const identifier = getClientIdentifier(request);
    const { success: rlOk } = await checkRateLimit(strictRateLimit, identifier);
    if (!rlOk) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const { reason, description } = await request.json();
    const validReasons = ["SPAM", "INAPPROPRIATE", "MISLEADING", "COPYRIGHT", "OTHER"];
    if (!reason || !validReasons.includes(reason)) {
      return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
      where: { id },
      select: { id: true, startupId: true },
    });
    if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.founderContentReport.create({
      data: {
        contentId: id,
        reporterType: "USER",
        reporterId: session.email,
        reason: reason as any,
        description: description?.slice(0, 500) || null,
      },
    });

    if (article.startupId) {
      await prisma.contentActivityLog.create({
        data: {
          contentId: id,
          startupId: article.startupId,
          actorId: "anonymous",
          actorType: "USER",
          action: "REPORTED",
          metadata: { reason },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[content report POST]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
