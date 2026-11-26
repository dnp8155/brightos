"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/brand-logo";
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff, CheckCircle2 } from "lucide-react";

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

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const userRole = (profile as any)?.role || "user";
      if (!["admin", "super_admin", "operator", "user"].includes(userRole)) {
        await supabase.auth.signOut();
        setErrorMsg("Access denied. Your account is not authorized.");
        setLoading(false);
        return;
      }
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row selection:bg-sky-100 selection:text-sky-900">
      {/* Left Panel: Clean Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 bg-white">
        <div className="w-full max-w-sm mx-auto space-y-8">
          <div className="space-y-3">
            <BrandLogo size="md" variant="full" />
            <div className="pt-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Sign in with your authorized BrightLoop Technology credentials.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-slate-400" size={15} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@brightlooptechnology.in"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-[#0284c7] font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-slate-400" size={15} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? "Authenticating..." : "Sign in to Workspace"}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck size={14} className="text-emerald-600" />
              New here?{" "}
              <Link href="/signup" className="font-semibold text-[#0284c7] hover:underline">
                Create account
              </Link>
            </span>
            <Link href="/" className="font-semibold text-slate-700 hover:text-[#0284c7]">
              &larr; Public site
            </Link>
          </div>
        </div>
      </div>

      {/* Right Panel: Branded SaaS Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#f8fafc] border-l border-slate-200/80 p-12 flex-col justify-between relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />
        <div className="relative z-10">
          <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-2xs">
            BrightLoop AI 2.0
          </span>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Intelligent Client Acquisition, Engineered for Precision.
          </h2>
          <div className="space-y-3">
            {[
              "SSRF-safe Lighthouse & SEO website audits",
              "Evidence-grounded AI consultative email studio",
              "10-stage CRM Kanban & multi-currency proposals",
              "Server-enforced Emergency Stop & compliance"
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                <CheckCircle2 size={15} className="text-[#0284c7] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          &copy; 2026 BrightLoop Technology • brightlooptechnology.in
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-xs text-slate-500">Loading portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
