import React from "react";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      <MarketingNavbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
        <p className="text-xs text-slate-500">Last updated: November 26, 2026 • BrightLoop Technology</p>
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs text-slate-600 leading-relaxed">
          <p>Access to the BrightLoop AI platform is restricted to authorized administrators and operators of BrightLoop Technology.</p>
          <p>Users must comply with all applicable electronic communication regulations (GDPR, CAN-SPAM, CASL, PECR) and must never bypass suppression lists or campaign approval checkpoints.</p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
