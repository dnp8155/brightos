import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ success: true, team: [], totalUsers: 0 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      team: data || [],
      totalUsers: data?.length || 0
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authClient = await createClient();
    const {
      data: { user }
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json({ success: false, error: "Admin client unavailable" }, { status: 500 });
    }

    // Verify caller is admin or super_admin
    const { data: callerProfile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const callerRole = (callerProfile as any)?.role;
    if (callerRole !== "admin" && callerRole !== "super_admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only admins can manage user roles" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, role } = body;
    if (!userId || !["admin", "operator", "user"].includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid userId or role" }, { status: 400 });
    }

    const { error } = await (adminClient.from("profiles") as any)
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId, role });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
