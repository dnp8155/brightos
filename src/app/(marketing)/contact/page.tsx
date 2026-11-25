import React from "react";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { Mail, Globe } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      <MarketingNavbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7]">Contact</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Get in Touch with BrightLoop Technology
          </h1>
          <p className="text-sm text-slate-600">
            For enterprise inquiries, administrator access requests, or compliance questions, reach out to our team.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <Globe size={18} className="text-[#0284c7]" />
            <span>Website: <a href="https://brightlooptechnology.in" target="_blank" rel="noreferrer" className="text-[#0284c7] font-semibold hover:underline">brightlooptechnology.in</a></span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <Mail size={18} className="text-[#0891b2]" />
            <span>Email: <span className="font-semibold">contact@brightlooptechnology.in</span></span>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
