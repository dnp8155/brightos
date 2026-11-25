import { NextRequest, NextResponse } from "next/server";
import { CampaignExecutionWorker, executedEmailEvents } from "@/packages/email/queue/campaign-worker";
import { DEMO_LEADS } from "@/lib/demoData";

// POST /api/campaigns/[id]/dispatch - Dispatches approved campaign to email queue worker
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await request.json();

    const recipientCount = json.recipientCount || 2;
    const leadsToDispatch = DEMO_LEADS.slice(0, recipientCount);

    const results = [];
    for (const lead of leadsToDispatch) {
      const event = await CampaignExecutionWorker.processIndividualEmail({
        campaignId: id,
        recipientId: lead.id,
        contactEmail: lead.contact.email,
        contactName: lead.contact.name,
        businessName: lead.businessName,
        country: lead.country,
        subject: `Accelerating performance and modernizing client portals for ${lead.businessName}`,
        bodyText: `Hi ${lead.contact.name},\n\nWe prepared a technical teardown highlighting opportunities to improve mobile responsiveness for ${lead.businessName}.`,
        senderEmail: "outreach@brightloop.ai"
      });
      results.push(event);
    }

    return NextResponse.json({
      message: `Dispatched ${results.length} email jobs to queue`,
      events: results
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to dispatch campaign", details: err?.message }, { status: 500 });
  }
}

// GET /api/campaigns/[id]/events - View email delivery events
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const events = executedEmailEvents.filter((e) => e.campaignId === id);

    return NextResponse.json({ events });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed fetching events", details: err?.message }, { status: 500 });
  }
}
