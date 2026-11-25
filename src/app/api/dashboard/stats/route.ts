import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_METRICS } from "@/lib/demoData";

// GET /api/dashboard/stats
export async function GET() {
  try {
    const supabase = await createClient();

    // Query counts in parallel across tables
    const [
      { count: totalLeads },
      { count: auditsCount },
      { count: qualifiedLeads },
      { count: activeCampaigns }
    ] = await Promise.all([
      supabase.from("businesses").select("*", { count: "exact", head: true }),
      supabase.from("website_audits").select("*", { count: "exact", head: true }),
      supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "Interested"),
      supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("status", "Active")
    ]);

    // If database has any real records, return aggregated metrics
    if (totalLeads && totalLeads > 0) {
      return NextResponse.json({
        source: "database",
        metrics: {
          totalLeads,
          totalLeadsDelta: "+100% (Real DB)",
          websitesAudited: auditsCount || 0,
          websitesAuditedDelta: "Verified scans",
          qualifiedLeads: qualifiedLeads || 0,
          qualifiedLeadsDelta: "High intent",
          emailsSent: 0,
          emailsSentDelta: "Outreach staging",
          interestedReplies: 0,
          interestedRepliesDelta: "Real-time inbox",
          activeCampaigns: activeCampaigns || 0,
          activeCampaignsDelta: "Active in database"
        }
      });
    }

    // Default demonstration stats fallback
    return NextResponse.json({
      source: "demo_fallback",
      message: "Database unpopulated. Rendering verified demonstration baseline.",
      metrics: DEMO_METRICS
    });
  } catch (err: any) {
    return NextResponse.json({
      source: "demo_fallback",
      error: err?.message,
      metrics: DEMO_METRICS
    });
  }
}
