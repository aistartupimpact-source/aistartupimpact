import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { verifyUnsubscribeToken } from "@/lib/events/unsubscribe";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  let email: string | null = null;

  if (token) {
    const payload = await verifyUnsubscribeToken(token);
    if (payload) {
      email = payload.email;
    }
  }

  if (!email) {
    return new NextResponse(
      renderPage("Invalid Link", "This unsubscribe link is invalid or expired.", false),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  try {
    // Find subscriber
    const subscriber = await prisma.eventSubscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      return new NextResponse(
        renderPage("Not Found", "This email is not in our event mailing list.", false),
        { headers: { "Content-Type": "text/html" } }
      );
    }

    if (!subscriber.subscribed || subscriber.unsubscribedAt) {
      return new NextResponse(
        renderPage("Already Unsubscribed", "You were already unsubscribed from event emails.", true),
        { headers: { "Content-Type": "text/html" } }
      );
    }

    // Unsubscribe
    await prisma.eventSubscriber.update({
      where: { id: subscriber.id },
      data: {
        subscribed: false,
        unsubscribedAt: new Date(),
      },
    });

    return new NextResponse(
      renderPage(
        "Unsubscribed",
        "You've been unsubscribed from AI event email notifications. You won't receive any more event announcements from us.",
        true
      ),
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return new NextResponse(
      renderPage("Error", "Something went wrong. Please try again.", false),
      { headers: { "Content-Type": "text/html" }, status: 500 }
    );
  }
}

/**
 * POST /api/events/unsubscribe
 * Handles RFC 8058 List-Unsubscribe-Post one-click unsubscribe.
 */
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  let email: string | null = null;

  if (token) {
    const payload = await verifyUnsubscribeToken(token);
    if (payload) email = payload.email;
  }

  if (!email) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  try {
    await prisma.eventSubscriber.updateMany({
      where: { email, subscribed: true },
      data: { subscribed: false, unsubscribedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// ─── HTML page renderer ───

function renderPage(title: string, message: string, success: boolean): string {
  const icon = success ? "✓" : "✕";
  const color = success ? "#16a34a" : "#dc2626";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — AI Startup Impact</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb; color: #374151; }
    .card { background: white; border-radius: 16px; padding: 48px; max-width: 420px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .icon { width: 64px; height: 64px; border-radius: 50%; background: ${color}15; color: ${color}; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; margin: 0 auto 20px; }
    h1 { font-size: 22px; margin: 0 0 12px; color: #111827; }
    p { font-size: 15px; line-height: 1.6; margin: 0 0 24px; color: #6b7280; }
    a { color: #FF3131; text-decoration: none; font-weight: 600; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/">Back to AI Startup Impact</a>
  </div>
</body>
</html>`;
}
