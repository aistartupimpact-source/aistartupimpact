import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { getFounderSession } from "@/lib/founder-auth";
import { verifyStartupAccess } from "@/lib/founder-content-auth";
import { canEditOwnContent, canEditAnyContent, canDeleteContent } from "@/lib/founder-team-permissions";
import { checkRateLimit, getClientIdentifier, strictRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["FUNDING", "LAUNCH", "PARTNERSHIP", "ACQUISITION", "AWARD", "HIRING", "REVENUE", "USER_MILESTONE"] as const;

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getFounderSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const identifier = getClientIdentifier(request);
    const { success: rlOk } = await checkRateLimit(strictRateLimit, identifier);
    if (!rlOk) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const { id } = await params;

    const milestone = await prisma.founderMilestone.findUnique({
      where: { id },
      select: { id: true, startupId: true, founderId: true },
    });
    if (!milestone) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const auth = await verifyStartupAccess(milestone.startupId);
    if (!auth) return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });

    const isOwn = milestone.founderId === session.userId;
    if (!isOwn && !canEditAnyContent(auth.role)) {
      return NextResponse.json({ success: false, error: "Not authorized to edit this milestone" }, { status: 403 });
    }
    if (isOwn && !canEditOwnContent(auth.role)) {
      return NextResponse.json({ success: false, error: "Your role does not allow editing" }, { status: 403 });
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.title) updateData.title = body.title.slice(0, 200);
    if (body.description !== undefined) updateData.description = body.description?.slice(0, 500) || null;
    if (body.type && VALID_TYPES.includes(body.type)) updateData.type = body.type;
    if (body.amount !== undefined) updateData.amount = body.amount ? parseFloat(body.amount) : null;
    if (body.currency) updateData.currency = body.currency.slice(0, 10);
    if (body.date) updateData.date = new Date(body.date);
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic;

    const updated = await prisma.founderMilestone.update({ where: { id }, data: updateData });

    await prisma.contentActivityLog.create({
      data: {
        milestoneId: id,
        startupId: milestone.startupId,
        actorId: session.userId,
        actorType: "FOUNDER",
        action: "EDITED",
        metadata: { fields: Object.keys(updateData) },
      },
    });

    return NextResponse.json({ success: true, milestone: updated });
  } catch (err) {
    console.error("[founder/milestones/[id] PUT]", err);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getFounderSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const identifier = getClientIdentifier(request);
    const { success: rlOk } = await checkRateLimit(strictRateLimit, identifier);
    if (!rlOk) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const { id } = await params;

    const milestone = await prisma.founderMilestone.findUnique({
      where: { id },
      select: { id: true, startupId: true, founderId: true },
    });
    if (!milestone) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const auth = await verifyStartupAccess(milestone.startupId);
    if (!auth) return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });

    const isOwn = milestone.founderId === session.userId;
    if (!isOwn && !canDeleteContent(auth.role)) {
      return NextResponse.json({ success: false, error: "Not authorized to delete this milestone" }, { status: 403 });
    }

    await prisma.founderMilestone.update({ where: { id }, data: { status: "DELETED" } });

    await prisma.contentActivityLog.create({
      data: {
        milestoneId: id,
        startupId: milestone.startupId,
        actorId: session.userId,
        actorType: "FOUNDER",
        action: "DELETED",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[founder/milestones/[id] DELETE]", err);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
