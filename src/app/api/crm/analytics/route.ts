import { NextRequest, NextResponse } from "next/server";
import { inMemoryDeals } from "../deals/route";

// GET /api/crm/analytics - Calculates revenue analytics and conversion funnels
export async function GET() {
  try {
    let pipelineValue = 0;
    let actualWonRevenue = 0;
    let wonCount = 0;
    let lostCount = 0;
    const revenueByService: Record<string, number> = {};
    const revenueByCountry: Record<string, number> = {};

    for (const deal of inMemoryDeals) {
      pipelineValue += deal.dealValue;

      if (deal.stage === "Won") {
        actualWonRevenue += deal.dealValue;
        wonCount++;
      } else if (deal.stage === "Lost") {
        lostCount++;
      }

      // Revenue breakdown
      const svc = deal.targetService || "Modern Website Redesign";
      revenueByService[svc] = (revenueByService[svc] || 0) + deal.dealValue;

      const c = deal.country || "United States";
      revenueByCountry[c] = (revenueByCountry[c] || 0) + deal.dealValue;
    }

    const totalDeals = inMemoryDeals.length;
    const conversionRate = totalDeals > 0 ? (wonCount / totalDeals) * 100 : 0;
    const averageDealValue = totalDeals > 0 ? Math.round(pipelineValue / totalDeals) : 0;

    return NextResponse.json({
      metrics: {
        totalPipelineValue: pipelineValue,
        actualWonRevenue,
        wonDealsCount: wonCount,
        lostDealsCount: lostCount,
        conversionRate: Number(conversionRate.toFixed(1)),
        averageDealValue,
        activeProspectsCount: totalDeals - wonCount - lostCount
      },
      revenueByService: Object.entries(revenueByService).map(([name, value]) => ({ name, value })),
      revenueByCountry: Object.entries(revenueByCountry).map(([country, value]) => ({ country, value }))
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed calculating analytics", details: err?.message }, { status: 500 });
  }
}
