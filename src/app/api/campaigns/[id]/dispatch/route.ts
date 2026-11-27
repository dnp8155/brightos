import { NextRequest, NextResponse } from "next/server";
import { CampaignExecutionWorker, executedEmailEvents } from "@/packages/email/queue/campaign-worker";
import { DEMO_LEADS } from "@/lib/demoData";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// POST /api/campaigns/[id]/dispatch - Dispatches approved campaign to email queue worker
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await request.json().catch(() => ({}));
    const recipientCount = json.recipientCount || 10;
    const senderEmail = json.senderEmail || process.env.OUTREACH_FROM_EMAIL || "outreach@brightloop.ai";

    const admin = getSupabaseAdmin();
    let leadsToDispatch: Array<{
      id: string;
      email: string;
      name: string;
      businessName: string;
      country: string;
    }> = [];

    if (admin) {
      const { data: dbLeads } = await admin
        .from("leads")
        .select("id, contact_email, contact_name, business_name, country")
        .not("contact_email", "is", null)
        .limit(recipientCount);

      if (dbLeads && dbLeads.length > 0) {
        leadsToDispatch = dbLeads.map((l: any) => ({
          id: l.id,
          email: l.contact_email,
          name: l.contact_name || "Team",
          businessName: l.business_name || "Your Company",
          country: l.country || "IN"
        }));
      }
    }

    if (leadsToDispatch.length === 0) {
      leadsToDispatch = DEMO_LEADS.slice(0, recipientCount).map((l) => ({
        id: l.id,
        email: l.contact.email,
        name: l.contact.name,
        businessName: l.businessName,
        country: l.country
      }));
    }

    const results = [];
    for (const lead of leadsToDispatch) {
      const event = await CampaignExecutionWorker.processIndividualEmail({
        campaignId: id,
        recipientId: lead.id,
        contactEmail: lead.email,
        contactName: lead.name,
        businessName: lead.businessName,
        country: lead.country,
        subject: json.subject || `Accelerating performance and modernizing client portals for ${lead.businessName}`,
        bodyText:
          json.bodyText ||
          `Hi ${lead.name},\n\nWe prepared a technical teardown highlighting opportunities to improve mobile responsiveness and conversion speed for ${lead.businessName}.`,
        senderEmail
      });
      results.push(event);
    }

    return NextResponse.json({
      message: `Dispatched ${results.length} email jobs`,
      events: results
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to dispatch campaign", details: err?.message }, { status: 500 });
  }
}

// GET /api/campaigns/[id]/dispatch - View email delivery & tracking events
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = getSupabaseAdmin();

    if (admin) {
      const { data, error } = await admin
        .from("email_events")
        .select("*")
        .eq("campaign_id", id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error && data && data.length > 0) {
        return NextResponse.json({ events: data });
      }
    }

    const events = executedEmailEvents.filter((e) => e.campaignId === id);
    return NextResponse.json({ events });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed fetching events", details: err?.message }, { status: 500 });
  }
}
