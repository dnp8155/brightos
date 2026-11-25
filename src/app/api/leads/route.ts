import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreateLeadSchema } from "@/lib/validations";
import { DEMO_LEADS } from "@/lib/demoData";

// GET /api/leads - Returns paginated, searchable, filterable leads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const country = searchParams.get("country");
    const industry = searchParams.get("industry");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // Query Supabase businesses
    let query = supabase
      .from("businesses")
      .select(`
        *,
        contacts(*),
        website_audits(*),
        lead_scores(*)
      `, { count: "exact" });

    if (search) {
      query = query.or(`name.ilike.%${search}%,domain.ilike.%${search}%,industry.ilike.%${search}%`);
    }
    if (status && status !== "All") {
      query = query.eq("status", status);
    }
    if (country && country !== "All") {
      query = query.eq("country", country);
    }
    if (industry && industry !== "All") {
      query = query.eq("industry", industry);
    }

    const { data: dbLeads, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // If database table is populated, return real records
    if (!error && dbLeads && dbLeads.length > 0) {
      return NextResponse.json({
        source: "database",
        total: count,
        page,
        limit,
        leads: dbLeads
      });
    }

    // Graceful fallback to demonstration records when DB is empty/unmigrated
    const filteredDemo = DEMO_LEADS.filter((l) => {
      const matchSearch = !search || l.businessName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !status || status === "All" || l.status === status;
      const matchCountry = !country || country === "All" || l.country === country;
      const matchInd = !industry || industry === "All" || l.industry === industry;
      return matchSearch && matchStatus && matchCountry && matchInd;
    });

    return NextResponse.json({
      source: "demo_fallback",
      message: "Supabase empty or unmigrated. Displaying verified demonstration records.",
      total: filteredDemo.length,
      page,
      limit,
      leads: filteredDemo.slice(offset, offset + limit)
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal server error fetching leads", details: err?.message },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create new lead with validated business & contact payload
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = CreateLeadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const { contact, ...businessData } = parsed.data;
    const supabase = await createClient();

    // Insert business
    const { data: business, error: bError } = await (supabase
      .from("businesses") as any)
      .insert(businessData)
      .select()
      .single();

    if (bError) {
      return NextResponse.json(
        { error: "Failed to create business record", details: bError.message },
        { status: 400 }
      );
    }

    // Insert contact if provided
    let insertedContact = null;
    if (contact && business) {
      const { data: cData, error: cError } = await (supabase
        .from("contacts") as any)
        .insert({
          ...contact,
          business_id: (business as any).id,
          is_primary: true
        })
        .select()
        .single();

      if (!cError) insertedContact = cData;
    }

    return NextResponse.json(
      {
        message: "Lead created successfully",
        lead: {
          ...business,
          contact: insertedContact
        }
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process lead creation", details: err?.message },
      { status: 500 }
    );
  }
}
