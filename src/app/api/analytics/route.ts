import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService, AnalyticsFilterOptions } from "@/packages/analytics/services/analytics-service";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const filter: AnalyticsFilterOptions = {
      country: searchParams.get("country") || undefined,
      industry: searchParams.get("industry") || undefined,
      service: searchParams.get("service") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined
    };

    const [main, leads, audits, campaigns, sales, roi, agents] = await Promise.all([
      AnalyticsService.getMainMetrics(filter),
      AnalyticsService.getLeadFacetMetrics(filter),
      AnalyticsService.getAuditAnalytics(filter),
      AnalyticsService.getCampaignAnalytics(filter),
      AnalyticsService.getSalesAndRevenueMetrics(filter),
      AnalyticsService.getROIMetrics(filter),
      AnalyticsService.getAgentMetrics()
    ]);

    const admin = getSupabaseAdmin();
    if (admin) {
      const [{ data: dbLeads }, { data: dbEvents }, { data: dbReplies }] = await Promise.all([
        admin.from("leads").select("id, status, deal_value, opportunity_score"),
        admin.from("email_events").select("id, event_type"),
        admin.from("inbox_messages").select("id, sentiment_tag")
      ]);

      const leadRows = dbLeads || [];
      const eventRows = dbEvents || [];
      const replyRows = dbReplies || [];

      const totalLeads = leadRows.length;
      const qualifiedLeads = leadRows.filter((l: any) => (l.opportunity_score || 0) >= 75).length;
      const totalPipelineValue = leadRows.reduce((sum: number, l: any) => sum + Number(l.deal_value || 0), 0);
      const wonRevenue = leadRows
        .filter((l: any) => l.status === "Won")
        .reduce((sum: number, l: any) => sum + Number(l.deal_value || 0), 0);

      const sentCount = eventRows.filter((e: any) => e.event_type === "sent" || e.event_type === "delivered").length;
      const openCount = eventRows.filter((e: any) => e.event_type === "opened").length;
      const replyCount = replyRows.length;

      return NextResponse.json({
        success: true,
        source: "supabase_live",
        filter,
        metrics: {
          main: {
            ...main,
            totalLeads,
            qualifiedLeads,
            emailsSent: sentCount,
            repliesReceived: replyCount,
            pipelineValue: totalPipelineValue,
            wonRevenue
          },
          leads,
          audits,
          campaigns: {
            ...campaigns,
            totalSent: sentCount,
            totalOpened: openCount,
            totalReplied: replyCount,
            openRate: sentCount > 0 ? Math.round((openCount / sentCount) * 100) : 0,
            replyRate: sentCount > 0 ? Math.round((replyCount / sentCount) * 100) : 0
          },
          sales: {
            ...sales,
            totalPipelineValue,
            wonRevenue
          },
          roi,
          agents
        }
      });
    }

    return NextResponse.json({
      success: true,
      filter,
      metrics: {
        main,
        leads,
        audits,
        campaigns,
        sales,
        roi,
        agents
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve analytics" },
      { status: 500 }
    );
  }
}
