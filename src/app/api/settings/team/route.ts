import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ success: true, team: [], totalUsers: 0 });
    }

    const [{ data: profiles }, { data: authData }] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, role, created_at"),
      supabase.auth.admin.listUsers()
    ]);

    const profileMap = new Map<string, any>();
    (profiles || []).forEach((p: any) => profileMap.set(p.id, p));

    const authUsers = authData?.users || [];
    const merged = authUsers.map((u: any) => {
      const prof = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email,
        full_name: prof?.full_name || u.user_metadata?.full_name || "Workspace User",
        role: prof?.role || "user",
        last_sign_in_at: u.last_sign_in_at,
        created_at: u.created_at
      };
    });

    return NextResponse.json({
      success: true,
      team: merged,
      totalUsers: merged.length
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
    const { userId, role, email } = body;
    if (!userId || !["admin", "operator", "user"].includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid userId or role" }, { status: 400 });
    }

    const { error } = await (adminClient.from("profiles") as any)
      .upsert({
        id: userId,
        email: email || undefined,
        role,
        updated_at: new Date().toISOString()
      });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId, role });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
