import { NextRequest, NextResponse } from "next/server";
import { IntegrationsHubService } from "@/packages/integrations/services/integrations-hub-service";
import { createClient } from "@supabase/supabase-js";

const EVENT_TYPE_MAP: Record<string, string> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.bounced": "bounced",
  "email.complained": "complained",
  "email.replied": "replied"
};

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
    const eventType = EVENT_TYPE_MAP[parsedPayload?.type] || parsedPayload?.event_type || "unknown";
    const data = parsedPayload?.data || parsedPayload;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key && eventType !== "unknown") {
      const admin = createClient(url, key);
      const recipientEmail = Array.isArray(data?.to) ? data.to[0] : data?.to || data?.from || "";
      const campaignId = data?.tags?.campaign_id || data?.campaign_id || "webhook";
      const recipientId = data?.tags?.recipient_id || data?.recipient_id || "webhook";

      await admin.from("email_events").insert({
        message_id: data?.email_id || data?.message_id || idempotencyKey,
        campaign_id: campaignId,
        recipient_id: recipientId,
        recipient_email: recipientEmail,
        event_type: eventType,
        provider: "resend_webhook",
        created_at: new Date().toISOString()
      });

      // If inbound reply, also record in inbox_messages with auto-categorized sentiment
      if (eventType === "replied" && data?.from) {
        const replyText = String(data.text || data.html || "").toLowerCase();
        let sentimentTag = "Question";
        if (/not interested|unsubscribe|stop|remove me|no thanks/.test(replyText)) {
          sentimentTag = "Not Interested";
        } else if (/call|meeting|schedule|calendar|zoom|meet|tomorrow|next week/.test(replyText)) {
          sentimentTag = "Meeting Requested";
        } else if (/interested|yes|sure|send|pricing|quote|details|tell me more/.test(replyText)) {
          sentimentTag = "Interested";
        }

        await admin.from("inbox_messages").insert({
          sender_email: data.from,
          subject: data.subject || "Re: Outreach",
          body: data.text || data.html || "",
          direction: "inbound",
          status: "unread",
          sentiment_tag: sentimentTag,
          created_at: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({
      received: true,
      eventType,
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
