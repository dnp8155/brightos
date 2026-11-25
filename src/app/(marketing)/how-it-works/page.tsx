import React from "react";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";

export default function HowItWorksPage() {
  const steps = [
    { num: "01", title: "Configure Discovery Criteria", desc: "Select target countries, industries, and modernization services. Import via CSV or query permitted business APIs." },
    { num: "02", title: "Automated Website Intelligence", desc: "Our SSRF-safe crawler evaluates performance, SEO, mobile responsiveness, and technology stacks." },
    { num: "03", title: "AI Pitch Synthesis & Approval", desc: "Generate tailored emails citing verified audit findings. Campaigns pause at Step 6 for mandatory admin approval." },
    { num: "04", title: "CRM Conversion & Analytics", desc: "Track replies with AI sentiment classification, manage deals in the 10-stage Kanban, and measure ROI." }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      <MarketingNavbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7]">Workflow</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How BrightLoop AI Works
          </h1>
          <p className="text-sm text-slate-600">
            A transparent, auditable 4-step pipeline from lead discovery to client conversion.
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((s) => (
            <div key={s.num} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex gap-5 items-start">
              <span className="text-lg font-mono font-extrabold text-[#0284c7]">{s.num}</span>
              <div>
                <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
