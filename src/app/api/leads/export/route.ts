import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_LEADS } from "@/lib/demoData";

// GET /api/leads/export - Generates downloadable CSV of qualified leads
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: dbLeads, error } = await supabase
      .from("businesses")
      .select(`
        *,
        contacts(*)
      `);

    let exportRows: any[] = [];

    if (!error && dbLeads && dbLeads.length > 0) {
      exportRows = dbLeads.map((b: any) => ({
        BusinessName: b.name,
        Domain: b.domain,
        WebsiteUrl: b.website_url,
        Country: b.country,
        Industry: b.industry,
        BusinessType: b.business_type,
        Status: b.status,
        ContactName: b.contacts?.[0] ? `${b.contacts[0].first_name} ${b.contacts[0].last_name}` : "N/A",
        ContactEmail: b.contacts?.[0]?.email || "N/A",
        ContactPhone: b.contacts?.[0]?.phone || "N/A",
        Notes: b.notes || ""
      }));
    } else {
      // Demo records export
      exportRows = DEMO_LEADS.map((l) => ({
        BusinessName: l.businessName,
        Domain: l.website.replace(/https?:\/\//, "").split("/")[0],
        WebsiteUrl: l.website,
        Country: l.country,
        Industry: l.industry,
        BusinessType: l.businessType,
        Status: l.status,
        ContactName: l.contact.name,
        ContactEmail: l.contact.email,
        ContactPhone: l.contact.phone || "N/A",
        Notes: l.notes || ""
      }));
    }

    // Convert to CSV
    const headers = Object.keys(exportRows[0]).join(",");
    const rows = exportRows.map((r) =>
      Object.values(r)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="brightloop-leads-export-${Date.now()}.csv"`
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to generate CSV export", details: err?.message }, { status: 500 });
  }
}
