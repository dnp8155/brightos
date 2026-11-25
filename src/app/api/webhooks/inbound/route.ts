import { NextRequest, NextResponse } from "next/server";
import { IntegrationsHubService } from "@/packages/integrations/services/integrations-hub-service";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-brightloop-signature") || "";
    const secret = process.env.WEBHOOK_SIGNING_SECRET || "brightloop-hmac-sha256-webhook-signing-secret";

    const isValid = IntegrationsHubService.verifyWebhookSignature(rawBody, signature, secret);

    let parsedPayload: any = {};
    try {
      parsedPayload = JSON.parse(rawBody);
    } catch {}

    const idempotencyKey = req.headers.get("x-idempotency-key") || `wh-${Date.now()}`;

    return NextResponse.json({
      received: true,
      signatureVerified: isValid,
      idempotencyKey,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json(
      { received: false, error: err.message },
      { status: 400 }
    );
  }
}
