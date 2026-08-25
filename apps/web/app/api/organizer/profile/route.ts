import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { getOrganizerSession } from "@/lib/organizer-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getOrganizerSession();
  if (!session) return NextResponse.json({ success: false }, { status: 401 });

  const org = await prisma.eventOrganizer.findUnique({
    where: { id: session.id },
    select: { name: true, company: true, bio: true, website: true, linkedin: true, phone: true, avatar: true, email: true },
  });

  return NextResponse.json({ success: true, profile: org || {} });
}

export async function PUT(request: NextRequest) {
  const session = await getOrganizerSession();
  if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

  const { name, company, bio, website, linkedin, phone, twitter } = await request.json();

  if (!name) return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
  if (typeof bio === "string" && bio.length > 500) return NextResponse.json({ success: false, error: "Bio must be 500 characters or less" }, { status: 400 });
  if (typeof name === "string" && name.length > 100) return NextResponse.json({ success: false, error: "Name must be 100 characters or less" }, { status: 400 });

  await prisma.eventOrganizer.update({
    where: { id: session.id },
    data: { name: name.slice(0, 100), company: company?.slice(0, 100) || null, bio: bio?.slice(0, 500) || null, website: website?.slice(0, 500) || null, linkedin: linkedin?.slice(0, 500) || null, phone: phone?.slice(0, 20) || null },
  });

  return NextResponse.json({ success: true });
}
