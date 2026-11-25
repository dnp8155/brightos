"use client";

import React, { useState } from "react";
import { Search, Globe, Mail, Users, CheckCircle2, ArrowUpRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  {
    id: "discovery",
    label: "Lead Discovery",
    icon: Search,
    badge: "Global Search",
    title: "Normalized Business Intelligence",
    rows: [
      { name: "Apex Supply Chain Ltd", domain: "apexlogistics.co.uk", country: "UK", score: 88, status: "Qualified" },
      { name: "Vanguard Manufacturing", domain: "vanguardmfg.com", country: "US", score: 92, status: "Audited" },
      { name: "Nordic Cloud Systems", domain: "nordiccloud.de", country: "DE", score: 84, status: "Ready" }
    ]
  },
  {
    id: "audit",
    label: "Website Audit",
    icon: Globe,
    badge: "SSRF-Safe Crawler",
    title: "Lighthouse & Technical Deficit Analysis",
    metrics: [
      { label: "Performance", value: "48 / 100", note: "LCP 4.2s" },
      { label: "SEO Structure", value: "74 / 100", note: "Missing Schema" },
      { label: "Mobile UX", value: "61 / 100", note: "CLS 0.29" },
      { label: "Tech Stack", value: "Legacy PHP", note: "Modernization Fit" }
    ]
  },
  {
    id: "email",
    label: "AI Email Studio",
    icon: Mail,
    badge: "Zero Hallucination",
    title: "Evidence-Grounded Consultative Pitch",
    subject: "Quick note regarding mobile layout shift on apexlogistics.co.uk",
    body: "Hi Sarah, during a technical review of apexlogistics.co.uk, we observed a 4.2s LCP on 4G networks and a 0.29 CLS score on mobile checkout..."
  },
  {
    id: "crm",
    label: "CRM Pipeline",
    icon: Users,
    badge: "10-Stage Kanban",
    title: "Structured Deal Progression",
    stages: [
      { name: "Qualified", count: 14, value: "$140,000" },
      { name: "Meeting Scheduled", count: 5, value: "$85,000" },
      { name: "Proposal Sent", count: 3, value: "$60,000" },
      { name: "Won", count: 4, value: "$92,500" }
    ]
  }
];

export function LandingShowcase() {
  const [activeTab, setActiveTab] = useState("discovery");
  const current = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div className="mt-14 max-w-5xl mx-auto">
      {/* Interactive Module Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 border",
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900"
              )}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Browser Frame */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50 overflow-hidden transition-all duration-300">
        {/* Top Window Chrome */}
        <div className="h-11 bg-slate-50/90 border-b border-slate-200/80 px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          </div>
          <div className="px-3 py-1 rounded-md bg-white border border-slate-200/80 text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={11} className="text-emerald-600" />
            ai.brightlooptechnology.in/{activeTab === "discovery" ? "lead-discovery" : activeTab === "audit" ? "audits" : activeTab === "email" ? "email-studio" : "crm"}
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-50 text-[#0284c7] border border-sky-200/80">
            {current.badge}
          </span>
        </div>

        {/* Dynamic Content Area */}
        <div className="p-6 sm:p-8 text-left min-h-[260px] flex flex-col justify-center">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-slate-900">{current.title}</h3>
            <span className="text-[11px] text-slate-400 font-mono">Live Workspace Preview</span>
          </div>

          {activeTab === "discovery" && current.rows && (
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
              {current.rows.map((r) => (
                <div key={r.domain} className="px-4 py-3 bg-white hover:bg-slate-50/80 transition-colors flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{r.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{r.domain}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">{r.country}</span>
                    <span className="font-bold text-[#0284c7]">Score {r.score}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "audit" && current.metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {current.metrics.map((m) => (
                <div key={m.label} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500">{m.label}</span>
                  <div className="text-lg font-extrabold text-slate-900 mt-1">{m.value}</div>
                  <span className="text-[11px] font-medium text-[#0284c7] mt-1 block">{m.note}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "email" && (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="text-xs">
                <span className="text-slate-400 font-semibold">Subject: </span>
                <span className="font-bold text-slate-900">{current.subject}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-200/80 pt-3">
                {current.body}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 size={10} /> Verified Audit Citation
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  RFC 8058 Unsubscribe Ready
                </span>
              </div>
            </div>
          )}

          {activeTab === "crm" && current.stages && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {current.stages.map((s) => (
                <div key={s.name} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">{s.name}</span>
                  <div className="text-lg font-extrabold text-slate-900">{s.value}</div>
                  <span className="text-[11px] text-[#0284c7] font-semibold">{s.count} active deals</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
