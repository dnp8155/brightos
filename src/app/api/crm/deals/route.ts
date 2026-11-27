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

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// GET /api/crm/deals - Returns all pipeline deals & stage columns (Supabase-backed)
export async function GET() {
  const admin = getSupabaseAdmin();
  if (admin) {
    try {
      const { data: rows, error } = await admin
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error && rows && rows.length > 0) {
        const dbDeals: CRMDeal[] = rows.map((r: any) => ({
          id: `deal_${r.id}`,
          businessId: String(r.id),
          businessName: r.business_name || r.company_name || "Lead",
          domain: r.website ? String(r.website).replace(/https?:\/\//, "").split("/")[0] : "",
          country: r.country || "India",
          industry: r.industry || "Business",
          stage: (PIPELINE_STAGES.includes(r.status) ? r.status : "New Lead") as PipelineStage,
          dealValue: Number(r.deal_value || 25000),
          currency: r.currency || "INR",
          primaryContact: {
            name: r.contact_name || "Decision Maker",
            email: r.contact_email || "",
            role: r.contact_role || "Owner",
            phone: r.contact_phone || ""
          },
          targetService: r.target_service || "Digital Growth & Automation",
          opportunityScore: Number(r.opportunity_score || 80),
          lastActivityAt: r.updated_at || r.created_at || new Date().toISOString(),
          notes: r.notes || "",
          sentiment: "Neutral"
        }));

        return NextResponse.json({
          stages: PIPELINE_STAGES,
          deals: dbDeals,
          activities: inMemoryActivities
        });
      }
    } catch {
      // Fallback to inMemoryDeals if Supabase query fails
    }
  }

  return NextResponse.json({
    stages: PIPELINE_STAGES,
    deals: inMemoryDeals,
    activities: inMemoryActivities
  });
}

// POST /api/crm/deals - Upsert a lead into the CRM pipeline
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const businessId = String(body.id || body.businessId || `lead_${Date.now()}`);
    const existing = inMemoryDeals.find((d) => d.businessId === businessId || d.id === `deal_${businessId}`);
    if (existing) {
      return NextResponse.json({ deal: existing });
    }

    const website = String(body.websiteUrl || body.website || body.url || "");
    const domain = website ? website.replace(/https?:\/\//, "").split("/")[0] : "";
    const resolvedName = String(
      body.businessName || body.companyName || body.title || body.name || body.company || domain || "Lead"
    );
    const newDeal: CRMDeal = {
      id: `deal_${businessId}`,
      businessId,
      businessName: resolvedName,
      domain,
      country: String(body.country || "India"),
      industry: String(body.industry || body.category || "Business"),
      stage: "New Lead",
      dealValue: Number(body.dealValue || 25000),
      currency: "INR",
      primaryContact: {
        name: String(body.contact?.name || body.contactName || "Decision Maker"),
        email: String(body.contact?.email || body.contactEmail || ""),
        role: String(body.contact?.role || "Owner"),
        phone: String(body.contact?.phone || body.phone || "")
      },
      targetService: String(body.targetService || "Digital Growth & Automation"),
      opportunityScore: Number(body.opportunityScore || 80),
      lastActivityAt: new Date().toISOString(),
      notes: String(body.notes || "Imported from Lead Discovery"),
      sentiment: "Neutral"
    };

    inMemoryDeals.unshift(newDeal);

    const admin = getSupabaseAdmin();
    if (admin) {
      await admin
        .from("leads")
        .upsert({
          id: businessId,
          business_name: resolvedName,
          website,
          country: newDeal.country,
          industry: newDeal.industry,
          status: newDeal.stage,
          deal_value: newDeal.dealValue,
          currency: "INR",
          contact_name: newDeal.primaryContact.name,
          contact_email: newDeal.primaryContact.email,
          contact_phone: newDeal.primaryContact.phone,
          opportunity_score: newDeal.opportunityScore,
          notes: newDeal.notes,
          updated_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();
    }

    return NextResponse.json({ deal: newDeal }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create CRM deal", details: err?.message }, { status: 500 });
  }
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
    const rawId = dealId.replace(/^deal_/, "");

    const admin = getSupabaseAdmin();
    if (admin) {
      await admin
        .from("leads")
        .update({
          status: newStage,
          ...(notes ? { notes } : {}),
          updated_at: new Date().toISOString()
        })
        .eq("id", rawId);
    }

    const deal = inMemoryDeals.find((d) => d.id === dealId);

    if (!deal) {
      return NextResponse.json({
        message: `Stage updated to ${newStage}`,
        deal: { id: dealId, businessId: rawId, stage: newStage, notes }
      });
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
