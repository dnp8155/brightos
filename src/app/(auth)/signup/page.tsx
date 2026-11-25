"use client";

import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ShieldAlert, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 bg-white">
        <div className="w-full max-w-sm mx-auto space-y-6">
          <BrandLogo size="md" variant="full" />

          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-sm">
              <ShieldAlert size={18} className="text-amber-600" />
              <span>Admin-Only Registration Policy</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              BrightLoop AI is an internal enterprise platform for BrightLoop Technology. Public self-registration is disabled to protect client data and outreach controls.
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Authorized team members are provisioned directly by a Super Administrator. If you already have credentials, sign in below.
          </p>

          <Link
            href="/login"
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft size={14} /> Go to Admin Login
          </Link>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-[#f8fafc] border-l border-slate-200/80 p-12 flex-col justify-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-extrabold text-slate-900">Controlled Access Architecture</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every operator session is verified server-side against Supabase Row Level Security and role-based access policies.
          </p>
          <div className="space-y-2 pt-2">
            {["No public admin creation", "Server-side role verification", "Complete audit logging"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
