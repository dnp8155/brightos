"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/brand-logo";
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    // Check if user has an authorized role in profiles table
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const userRole = (profile as any)?.role;
      if (!userRole || (userRole !== "admin" && userRole !== "operator")) {
        await supabase.auth.signOut();
        setErrorMsg("Access denied. Your account is not authorized as an administrator.");
        setLoading(false);
        return;
      }
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 selection:bg-sky-100 selection:text-sky-900">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <BrandLogo size="lg" variant="full" />
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Enterprise Administrator Portal
            </h2>
            <p className="text-xs text-slate-500">
              Sign in with authorized BrightLoop Technology admin credentials
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Admin Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@brightlooptechnology.in"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => alert("Contact your platform super-administrator to reset access keys.")}
                className="text-[11px] text-[#0284c7] font-semibold hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0891b2] hover:opacity-95 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Authenticating session..." : "Sign in to Dashboard"}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Restricted Admin Portal • Public registration disabled</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-xs text-slate-500">Loading portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
