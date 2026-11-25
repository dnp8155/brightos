"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/brand-logo";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <BrandLogo size="lg" variant="full" />
          <h1 className="text-xl font-bold text-slate-900 pt-2">Reset Admin Password</h1>
          <p className="text-xs text-slate-500">
            Enter your authorized administrator email to receive a recovery link.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {sent ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2 text-center">
            <CheckCircle2 size={22} className="mx-auto text-emerald-600" />
            <p className="font-bold">Recovery Email Sent</p>
            <p>If an authorized account exists for {email}, you will receive a password reset link shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-slate-400" size={15} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@brightlooptechnology.in"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0891b2] text-white font-bold text-xs hover:opacity-95 disabled:opacity-50"
            >
              {loading ? "Sending recovery link..." : "Send Recovery Link"}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <Link href="/login" className="text-xs font-semibold text-[#0284c7] hover:underline inline-flex items-center gap-1">
            <ArrowLeft size={13} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
