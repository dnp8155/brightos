import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ShieldX, ArrowLeft } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm space-y-6 text-center">
        <div className="flex justify-center">
          <BrandLogo size="lg" variant="full" />
        </div>
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-2">
          <ShieldX size={28} className="mx-auto text-red-600" />
          <h1 className="text-base font-bold">Access Denied</h1>
          <p className="text-xs text-red-800 leading-relaxed">
            Your account does not have administrator permissions required to access the BrightLoop AI internal platform.
          </p>
        </div>
        <Link
          href="/"
          className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={14} /> Return to Public Website
        </Link>
      </div>
    </div>
  );
}
