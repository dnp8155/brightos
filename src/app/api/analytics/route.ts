import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService, AnalyticsFilterOptions } from "@/packages/analytics/services/analytics-service";

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
