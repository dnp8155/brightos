import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/packages/analytics/services/analytics-service";

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") || "csv";
    const report = req.nextUrl.searchParams.get("report") || "pipeline";

    const [main, roi, sales, leads] = await Promise.all([
      AnalyticsService.getMainMetrics(),
      AnalyticsService.getROIMetrics(),
      AnalyticsService.getSalesAndRevenueMetrics(),
      AnalyticsService.getLeadFacetMetrics()
    ]);

    if (type === "html_digest" || type === "pdf") {
      const html = AnalyticsService.generateExecutiveDigestHTML(main, roi, sales);
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `inline; filename="brightloop_executive_digest_${Date.now()}.html"`
        }
      });
    }

    // Default: CSV Export
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `brightloop_report_${report}_${Date.now()}.csv`;

    if (report === "revenue" || report === "services") {
      headers = ["Service Line", "Won Revenue (USD)", "Open Pipeline Value (USD)"];
      rows = sales.revenueByService.map(s => [s.service, s.wonRevenue, s.openPipeline]);
    } else if (report === "countries") {
      headers = ["Country", "Discovered Count", "Qualified Count"];
      rows = leads.byCountry.map(c => [c.name, c.count, c.qualifiedCount]);
    } else if (report === "roi") {
      headers = ["Expense Category", "Cost (USD)", "Notes"];
      rows = [
        ["Search API", roi.searchApiExpenses, "Places and Search API queries"],
        ["AI Prompt Tokens", roi.aiUsageExpenses, "OpenAI generation"],
        ["Headless Audits", roi.websiteAnalysisExpenses, "Lighthouse crawler"],
        ["Infrastructure Overhead", roi.infrastructureOverhead, "Worker & server compute"],
        ["Total Cost", roi.totalCost, "Attributable Acquisition Cost"],
        ["Attributable Won Revenue", roi.attributableWonRevenue, "Closed CRM deals"],
        ["Net Return", roi.netReturn, "Revenue minus expenses"],
        ["ROI Percentage", `${roi.roiPercentage}%`, "Net return / cost"]
      ];
    } else {
      // Default: Pipeline stages
      headers = ["Pipeline Stage", "Lead Count", "Conversion Rate (%)"];
      rows = sales.pipelineFunnel.map(f => [f.stage, f.count, f.conversionRate]);
    }

    const csvContent = AnalyticsService.generateCSV(headers, rows);

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate export" },
      { status: 500 }
    );
  }
}
