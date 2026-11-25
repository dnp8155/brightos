import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UpdateLeadSchema } from "@/lib/validations";
import { DEMO_LEADS } from "@/lib/demoData";

// GET /api/leads/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: lead, error } = await supabase
      .from("businesses")
      .select(`
        *,
        contacts(*),
        website_audits(*),
        lead_scores(*)
      `)
      .eq("id", id)
      .single();

    if (!error && lead) {
      return NextResponse.json({ source: "database", lead });
    }

    // Demo fallback lookup
    const demoLead = DEMO_LEADS.find((l) => l.id === id);
    if (demoLead) {
      return NextResponse.json({ source: "demo_fallback", lead: demoLead });
    }

    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch lead", details: err?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/leads/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await request.json();
    const parsed = UpdateLeadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: updated, error } = await (supabase
      .from("businesses") as any)
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update lead in database", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Lead updated successfully",
      lead: updated
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update lead", details: err?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/leads/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase.from("businesses").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete lead from database", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to delete lead", details: err?.message },
      { status: 500 }
    );
  }
}
