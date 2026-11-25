import { NextRequest, NextResponse } from "next/server";
import { inMemoryAuditStore } from "../route";

// GET /api/audits/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const audit = inMemoryAuditStore.get(id);

    if (!audit) {
      return NextResponse.json({ error: "Audit report not found" }, { status: 404 });
    }

    return NextResponse.json({ report: audit });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to retrieve report", details: err?.message }, { status: 500 });
  }
}
