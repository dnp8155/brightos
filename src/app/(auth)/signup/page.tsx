"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/brand-logo";
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: "user" },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 bg-white">
        <div className="w-full max-w-sm mx-auto space-y-7">
          <div className="space-y-3">
            <BrandLogo size="md" variant="full" />
            <div className="pt-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Create your account
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Join the BRIGHT AI workspace. New accounts start with standard user access.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-center">
              <CheckCircle2 size={24} className="mx-auto text-emerald-600" />
              <h2 className="text-sm font-bold">Account Created</h2>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Check your inbox at <strong>{email}</strong> to verify your email address, then sign in.
              </p>
              <Link
                href="/login"
                className="inline-block mt-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-slate-400" size={15} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dipak Patel"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-slate-400" size={15} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-slate-400" size={15} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
                {!loading && <ArrowRight size={14} />}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Already have an account?</span>
            <Link href="/login" className="font-semibold text-[#0284c7] hover:underline">
              Sign in &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-[#f8fafc] border-l border-slate-200/80 p-12 flex-col justify-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-extrabold text-slate-900">BRIGHT AI Workspace</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Discover local & global businesses, run SSRF-safe website audits, and manage your sales pipeline in INR.
          </p>
          <div className="space-y-2 pt-2">
            {["Real Google Places & Search Discovery", "Lighthouse & SEO Audits", "Role-based Admin Controls"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <CheckCircle2 size={14} className="text-[#0284c7]" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
