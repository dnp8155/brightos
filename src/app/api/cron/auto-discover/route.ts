import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// GET / POST /api/cron/auto-discover - Daily automated lead discovery via Serper -> Supabase
async function runAutoDiscover(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const serperKey = process.env.SERPER_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serperKey || !supabaseUrl || !serviceKey) {
    return NextResponse.json({
      discovered: 0,
      message: "SERPER_API_KEY or Supabase service role not configured"
    });
  }

  const query = process.env.AUTO_DISCOVERY_QUERY || "software company digital agency India";
  try {
    const res = await fetch("https://google.serper.dev/places", {
      method: "POST",
      headers: {
        "X-API-KEY": serperKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ q: query, num: 15 })
    });

    const data = await res.json();
    const places: any[] = data?.places || [];
    if (places.length === 0) {
      return NextResponse.json({ discovered: 0, message: "No places returned" });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const rows = places.map((p, idx) => ({
      id: `auto_${Date.now()}_${idx}`,
      business_name: p.title || "Discovered Business",
      website: p.website || "",
      country: "India",
      industry: p.category || "Business",
      status: "New Lead",
      deal_value: 25000,
      currency: "INR",
      contact_phone: p.phoneNumber || "",
      opportunity_score: 82,
      notes: `Auto-discovered via Serper (${p.address || "India"})`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error } = await admin.from("leads").insert(rows);
    if (error) {
      return NextResponse.json({ discovered: places.length, saved: 0, error: error.message });
    }

    return NextResponse.json({
      discovered: places.length,
      saved: rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Auto-discovery failed", details: err?.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return runAutoDiscover(req);
}

export async function POST(req: NextRequest) {
  return runAutoDiscover(req);
}
