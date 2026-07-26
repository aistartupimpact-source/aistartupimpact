import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { createUnifiedSession, hashPassword, generateToken } from "@/lib/unified-auth";
import { checkRateLimit, getClientIdentifier, authRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const { success } = await checkRateLimit(authRateLimit, identifier);
  if (!success) return NextResponse.json({ success: false, error: "Too many attempts." }, { status: 429 });

  const { name, email, password } = await request.json();
  if (!name || !email || !password) return NextResponse.json({ success: false, error: "All fields required." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ success: false, error: "Password min 8 characters." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ success: false, error: "Invalid email." }, { status: 400 });

  const existing = await prisma.unifiedUser.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ success: false, error: "Account already exists. Try signing in." }, { status: 409 });

  const passwordHash = await hashPassword(password);
  const verifyToken = generateToken();

  const user = await prisma.unifiedUser.create({
    data: { email, name, passwordHash, emailVerified: false, verifyToken },
  });

  await createUnifiedSession(user.id, "direct");

  // TODO: Send verification email with verifyToken

  return NextResponse.json({ success: true, message: "Account created! Check email to verify." });
}
