import { NextRequest, NextResponse } from "next/server";
import { DiscoveryService } from "@/packages/discovery/services/discovery-service";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/discovery/import - Upload and parse CSV dataset of business leads
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    const text = await file.text();
    const discoveryService = new DiscoveryService();

    // Query existing businesses for deduplication
    let existingRecords: any[] = [];
    try {
      const supabase = createAdminClient();
      const { data } = await supabase.from("businesses").select("id, name, domain, country, city");
      if (data) existingRecords = data;
    } catch {
      // Continue without existing DB records
    }

    const result = await discoveryService.processCsvImport(text, existingRecords);

    return NextResponse.json({
      message: `Processed CSV dataset: ${result.newLeads.length} unique leads imported, ${result.duplicatesSkipped.length} duplicates skipped.`,
      result
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process CSV file", details: err?.message },
      { status: 500 }
    );
  }
}
