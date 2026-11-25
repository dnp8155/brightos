import React from "react";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { ShieldCheck, Globe, Cpu } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      <MarketingNavbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7]">About BrightLoop Technology</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Engineering Intelligent Client Acquisition
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            BrightLoop AI is developed by BrightLoop Technology to help B2B engineering and digital modernization teams discover qualified opportunities, audit real technical deficits, and conduct compliant consultative outreach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <ShieldCheck size={20} className="text-[#0284c7]" />
            <h3 className="text-sm font-bold text-slate-900">Compliance First</h3>
            <p className="text-xs text-slate-600">Strict suppression lists, RFC 8058 unsubscribe headers, and human-in-the-loop campaign approvals.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <Globe size={20} className="text-[#0891b2]" />
            <h3 className="text-sm font-bold text-slate-900">Verified Intelligence</h3>
            <p className="text-xs text-slate-600">Every outreach message is grounded in real Lighthouse, SEO, and technology stack measurements.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <Cpu size={20} className="text-[#d97706]" />
            <h3 className="text-sm font-bold text-slate-900">Supervised Automation</h3>
            <p className="text-xs text-slate-600">8 specialized AI agents with BullMQ queue supervision and instant server-side Emergency Stop.</p>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
