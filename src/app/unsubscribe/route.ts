import { NextRequest, NextResponse } from "next/server";
import { ComplianceValidator } from "@/packages/email/compliance/compliance-validator";

// GET /api/unsubscribe or /unsubscribe?email=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const campaignId = searchParams.get("campaignId");

  if (!email) {
    return NextResponse.json({ error: "Email query param is required." }, { status: 400 });
  }

  // Record permanent suppression
  ComplianceValidator.addSuppression(email, "unsubscribed");

  // Render accessible opt-out confirmation HTML
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Unsubscribe Confirmation – BrightLoop AI</title>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 32px; max-width: 480px; text-align: center; }
          h2 { color: #38bdf8; margin-top: 0; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(56, 189, 248, 0.1); color: #38bdf8; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">BrightLoop Compliance Registry</div>
          <h2>Unsubscribe Confirmed</h2>
          <p>The address <strong>${email}</strong> has been permanently added to BrightLoop Technology's global suppression list.</p>
          <p>You will not receive any further automated outreach from our client acquisition platform.</p>
        </div>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
