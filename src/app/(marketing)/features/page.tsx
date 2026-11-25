import React from "react";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { Search, Globe, Mail, Send, Users, Bot, BarChart3, ShieldCheck } from "lucide-react";

export default function FeaturesPage() {
  const features = [
    { title: "Worldwide Lead Discovery", desc: "Multi-provider search across Google Places, Search APIs, public directories, and CSV imports.", icon: Search },
    { title: "Website Intelligence & Audits", desc: "SSRF-safe Playwright crawler with Lighthouse Core Web Vitals, SEO, and mobile UX checks.", icon: Globe },
    { title: "AI Email Studio", desc: "Consultative pitch generation grounded in verified audit evidence with tone controls.", icon: Mail },
    { title: "Campaign Management", desc: "Recipient snapshotting, mandatory admin approval, and rate-paced Gmail OAuth delivery.", icon: Send },
    { title: "10-Stage CRM Pipeline", desc: "Drag-and-drop Kanban board, deal value tracking, multi-currency proposals, and AI reply analysis.", icon: Users },
    { title: "AI Agent Control Center", desc: "Centralized registry for 8 agents, 10-step workflow engine, and BullMQ queue monitoring.", icon: Bot },
    { title: "Analytics & BI Reports", desc: "Funnel conversion rates, attributable ROI unit economics, and CSV/PDF digest exports.", icon: BarChart3 },
    { title: "Enterprise Security", desc: "Supabase RLS, AES-256-GCM token encryption, IP rate limiting, and audit logging.", icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      <MarketingNavbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7]">Platform Features</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Unified Client Acquisition Architecture
          </h1>
          <p className="text-sm text-slate-600">
            Every module works together seamlessly under strict security and compliance governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-[#0284c7] flex items-center justify-center">
                  <Icon size={18} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
