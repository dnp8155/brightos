import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Clock, ArrowLeft, RefreshCw } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm space-y-6 text-center">
        <div className="flex justify-center">
          <BrandLogo size="lg" variant="full" />
        </div>
        <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2.5">
          <Clock size={28} className="mx-auto text-amber-600" />
          <h1 className="text-base font-bold">Pending Admin Approval</h1>
          <p className="text-xs text-amber-900/90 leading-relaxed">
            Your account is registered, but workspace access is restricted until the administrator grants you{" "}
            <span className="font-semibold">Operator</span> or <span className="font-semibold">Admin</span> permissions in Settings.
          </p>
          <p className="text-[11px] text-amber-800/80">
            Need immediate access? Contact <span className="font-semibold">contact@dipakpatel.site</span>.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Link
            href="/dashboard"
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw size={14} /> Check Access
          </Link>
          <Link
            href="/"
            className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={14} /> Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
