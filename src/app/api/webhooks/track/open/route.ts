import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 1x1 transparent GIF
const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

// GET /api/webhooks/track/open - Records email open event and returns 1x1 tracking pixel
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("cid") || "unknown";
  const recipientId = searchParams.get("rid") || "unknown";
  const email = searchParams.get("email") || "";

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key && email) {
      const admin = createClient(url, key);
      await admin.from("email_events").insert({
        message_id: `open_${Date.now()}_${recipientId}`,
        campaign_id: campaignId,
        recipient_id: recipientId,
        recipient_email: email,
        event_type: "opened",
        provider: "tracking_pixel",
        created_at: new Date().toISOString()
      });
    }
  } catch {
    // Never fail pixel response
  }

  return new NextResponse(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0"
    }
  });
}
