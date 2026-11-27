import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CRMDeal, CRMActivity, PIPELINE_STAGES, PipelineStage } from "@/packages/crm/types/crm";
import { createClient } from "@supabase/supabase-js";

// Live CRM deal store (no demo/fake leads)
export const inMemoryDeals: CRMDeal[] = [];

export const inMemoryActivities: CRMActivity[] = [];

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
