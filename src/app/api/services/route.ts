import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreateServiceSchema } from "@/lib/validations";

// Default catalog of BrightLoop offerings
const DEFAULT_SERVICES = [
  {
    name: "Next.js Modernization & Real-Time Tracking Portal",
    slug: "nextjs-modernization-portal",
    description: "Decoupled architecture migration and Core Web Vitals optimization.",
    typical_price_tier: "$15,000 - $35,000",
    is_active: true
  },
  {
    name: "HIPAA Compliant Patient Intake & Design System",
    slug: "hipaa-compliant-intake",
    description: "Secure, accessible healthcare intake portal redesign.",
    typical_price_tier: "$20,000 - $45,000",
    is_active: true
  },
  {
    name: "Interactive Investor Dashboard & AI Analytics",
    slug: "investor-dashboard-analytics",
    description: "High-frequency financial metrics dashboard and real-time visualization.",
    typical_price_tier: "$25,000 - $50,000",
    is_active: true
  }
];

// GET /api/services
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: services, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && services && services.length > 0) {
      return NextResponse.json({ source: "database", services });
    }

    return NextResponse.json({
      source: "demo_fallback",
      services: DEFAULT_SERVICES
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch services", details: err?.message },
      { status: 500 }
    );
  }
}

// POST /api/services
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = CreateServiceSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: created, error } = await (supabase
      .from("services") as any)
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create service in database", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Service created successfully", service: created },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process service creation", details: err?.message },
      { status: 500 }
    );
  }
}
