"use client";

import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm space-y-6 text-center">
        <div className="flex justify-center">
          <BrandLogo size="lg" variant="full" />
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
          <div className="flex justify-center">
            <ShieldAlert size={24} className="text-amber-600" />
          </div>
          <h1 className="text-base font-bold">Public Registration Disabled</h1>
          <p className="text-xs text-amber-800 leading-relaxed">
            BrightLoop AI is an internal admin-only platform for BrightLoop Technology. Public users cannot self-register or request administrator privileges.
          </p>
        </div>

        <p className="text-xs text-slate-500">
          If you are an authorized team member, please contact your Super Administrator for an invitation or sign in with your provisioned credentials.
        </p>

        <Link
          href="/login"
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0891b2] text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all"
        >
          <ArrowLeft size={14} /> Return to Admin Login
        </Link>
      </div>
    </div>
  );
}
