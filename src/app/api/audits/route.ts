import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuditService } from "@/packages/website-audit/services/audit-service";
import { FullAuditReport } from "@/packages/website-audit/types/audit";
import { DEMO_AUDITS } from "@/lib/demoData";

// In-memory audit cache for rapid UI state management & background jobs
export const inMemoryAuditStore = new Map<string, FullAuditReport>();

const CreateAuditSchema = z.object({
  url: z.string().min(3, "URL is required"),
  businessId: z.string().optional()
});

// GET /api/audits - Returns audit reports list
export async function GET() {
  try {
    const memoryAudits = Array.from(inMemoryAuditStore.values());

    return NextResponse.json({
      audits: memoryAudits.length > 0 ? memoryAudits : DEMO_AUDITS
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed fetching audits", details: err?.message }, { status: 500 });
  }
}

// POST /api/audits - Triggers SSRF-safe multi-page crawl & analysis
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = CreateAuditSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid URL", issues: parsed.error.format() }, { status: 400 });
    }

    const { url, businessId } = parsed.data;

    // Run audit pipeline
    const report = await AuditService.executeAudit(url, businessId);
    inMemoryAuditStore.set(report.id, report);

    return NextResponse.json(
      {
        message: "Audit execution completed",
        report
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Audit process failed", details: err?.message },
      { status: 500 }
    );
  }
}
