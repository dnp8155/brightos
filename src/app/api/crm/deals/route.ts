import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CRMDeal, CRMActivity, PIPELINE_STAGES, PipelineStage } from "@/packages/crm/types/crm";
import { DEMO_LEADS } from "@/lib/demoData";

// In-memory CRM deal store with live state updates and stage history tracking
export const inMemoryDeals: CRMDeal[] = DEMO_LEADS.map((l, i) => {
  const stages: PipelineStage[] = [
    "New Lead",
    "Analyzed",
    "Qualified",
    "Contacted",
    "Interested",
    "Meeting Scheduled",
    "Proposal Sent",
    "Negotiation",
    "Won"
  ];

  const assignedStage = stages[i % stages.length];
  const dealValue = 15000 + i * 5000;

  return {
    id: `deal_${l.id}`,
    businessId: l.id,
    businessName: l.businessName,
    domain: l.website.replace(/https?:\/\//, "").split("/")[0],
    country: l.country,
    industry: l.industry,
    stage: assignedStage,
    dealValue,
    currency: "USD",
    primaryContact: {
      name: l.contact.name,
      email: l.contact.email,
      role: l.contact.role,
      phone: l.contact.phone
    },
    targetService: l.targetService,
    opportunityScore: l.opportunityScore,
    lastActivityAt: new Date(Date.now() - i * 86400000).toISOString(),
    notes: l.notes,
    proposal: assignedStage === "Proposal Sent" || assignedStage === "Negotiation" || assignedStage === "Won"
      ? {
          id: `prop_${l.id}`,
          amount: dealValue,
          currency: "USD",
          service: l.targetService,
          status: assignedStage === "Won" ? "Accepted" : "Sent",
          sentAt: new Date(Date.now() - 259200000).toISOString()
        }
      : undefined,
    sentiment: assignedStage === "Interested" || assignedStage === "Meeting Scheduled" ? "Interested" : "Neutral"
  };
});

export const inMemoryActivities: CRMActivity[] = [
  {
    id: "act-1",
    dealId: "deal_lead-2",
    businessId: "lead-2",
    actorName: "Dr. Eleanor Finch",
    activityType: "reply_received",
    description: "Prospect replied requesting technical meeting for Q1 redesign.",
    timestamp: "2026-11-25T10:42:00Z"
  },
  {
    id: "act-2",
    dealId: "deal_lead-2",
    businessId: "lead-2",
    actorName: "BrightLoop Admin",
    activityType: "stage_change",
    description: "Moved stage from 'Contacted' to 'Meeting Scheduled'.",
    timestamp: "2026-11-25T11:00:00Z"
  }
];

const UpdateDealStageSchema = z.object({
  dealId: z.string(),
  newStage: z.enum([
    "New Lead",
    "Analyzed",
    "Qualified",
    "Contacted",
    "Interested",
    "Meeting Scheduled",
    "Proposal Sent",
    "Negotiation",
    "Won",
    "Lost"
  ]),
  notes: z.string().optional()
});

// GET /api/crm/deals - Returns all pipeline deals & stage columns
export async function GET() {
  return NextResponse.json({
    stages: PIPELINE_STAGES,
    deals: inMemoryDeals,
    activities: inMemoryActivities
  });
}

// PATCH /api/crm/deals - Move deal to new stage (Drag and Drop persistence)
export async function PATCH(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = UpdateDealStageSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid stage payload", issues: parsed.error.format() }, { status: 400 });
    }

    const { dealId, newStage, notes } = parsed.data;
    const deal = inMemoryDeals.find((d) => d.id === dealId);

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const previousStage = deal.stage;
    deal.stage = newStage;
    deal.lastActivityAt = new Date().toISOString();
    if (notes) deal.notes = notes;

    // Record stage transition audit trail
    const activity: CRMActivity = {
      id: `act_${Date.now()}`,
      dealId: deal.id,
      businessId: deal.businessId,
      actorName: "Administrator",
      activityType: "stage_change",
      description: `Moved stage from '${previousStage}' to '${newStage}'.`,
      timestamp: new Date().toISOString(),
      metadata: { previousStage, newStage }
    };
    inMemoryActivities.unshift(activity);

    return NextResponse.json({
      message: `Stage updated to ${newStage}`,
      deal,
      activity
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed updating deal", details: err?.message }, { status: 500 });
  }
}
