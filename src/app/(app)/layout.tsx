import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

async function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes("placeholder-project")) {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = (profile as any)?.role;
    if (!role || (role !== "admin" && role !== "super_admin" && role !== "operator")) {
      redirect("/access-denied");
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden bg-[#f8fafc]">
        {children}
      </div>
    </div>
  );
}

export default function PrivateAppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-xs text-slate-500">
          Verifying administrator session...
        </div>
      }
    >
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  );
}
