import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { generateToken } from "@/lib/unified-auth";
import { checkRateLimit, getClientIdentifier, authRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const { success } = await checkRateLimit(authRateLimit, identifier);
  if (!success) return NextResponse.json({ success: false, error: "Too many attempts." }, { status: 429 });

  const { email } = await request.json();
  if (!email) return NextResponse.json({ success: false, error: "Email required." }, { status: 400 });

  const user = await prisma.unifiedUser.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal if account exists
    return NextResponse.json({ success: true, message: "If account exists, verification email sent." });
  }

  if (user.emailVerified) {
    return NextResponse.json({ success: true, message: "Email already verified." });
  }

  // Generate new verify token
  const verifyToken = generateToken();
  await prisma.unifiedUser.update({ where: { id: user.id }, data: { verifyToken } });

  // TODO: Send verification email with verifyToken
  // await sendVerificationEmail(user.email, verifyToken);

  return NextResponse.json({ success: true, message: "Verification email sent." });
}
