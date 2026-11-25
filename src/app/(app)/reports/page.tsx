"use client";

import React, { useState } from "react";
import { TopHeader } from "@/components/top-header";
import { FileText, Download, Calendar, ArrowUpRight, CheckCircle2, Globe, Shield, RefreshCw } from "lucide-react";

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const reports = [
    {
      id: "pipeline",
      title: "Consolidated Sales Pipeline & Stage Velocity Digest",
      category: "Sales & CRM",
      date: "Nov 26, 2026",
      format: "CSV",
      summary: "Funnel conversion efficiency, deal velocity, and qualification ratios across 10 pipeline stages."
    },
    {
      id: "revenue",
      title: "Modernization Service Line & Closed Revenue Tear-Sheet",
      category: "Revenue",
      date: "Nov 26, 2026",
      format: "CSV",
      summary: "Closed-won contract values vs open pipeline segmented by decoupled web and ERP modernization lines."
    },
    {
      id: "countries",
      title: "Geographic Expansion & International Lead Distribution",
      category: "Market Expansion",
      date: "Nov 26, 2026",
      format: "CSV",
      summary: "Discovery volume and qualification density across US, UK, Canada, Germany, and Australia."
    },
    {
      id: "roi",
      title: "Unit Economics & Multi-Agent Attributable ROI Audit",
      category: "Executive Financials",
      date: "Nov 26, 2026",
      format: "CSV",
      summary: "Transparent cost accounting of search queries, LLM prompt tokens, and headless crawler compute."
    }
  ];

  const handleDownload = async (reportId: string) => {
    setDownloading(reportId);
    try {
      window.location.href = `/api/analytics/export?report=${reportId}`;
    } catch (err) {
      console.error("Export download failed", err);
    } finally {
      setTimeout(() => setDownloading(null), 1500);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] text-slate-900 min-h-screen">
      <TopHeader
        title="Reports & Executive Exports"
        description="Download ready-to-present digests of client acquisition pipelines, site audits, and campaigns"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Printable Executive Digest Banner */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-sky-950/40 via-indigo-950/20 to-slate-900 border border-sky-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <FileText size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Printable Executive Performance Digest (PDF Ready)</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  HTML / PDF
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete board-ready performance tear-sheet with closed revenue, unit economics, and deliverability proofs.
              </p>
            </div>
          </div>

          <a
            href="/api/analytics/export?type=html_digest"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-colors self-start md:self-center"
          >
            <ArrowUpRight size={14} /> Open Printable Digest
          </a>
        </div>

        {/* Generated Reports List */}
        <div className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <FileText size={16} className="text-sky-400" /> Exportable Data Digests & Audit Sheets
          </h3>

          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-200 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{r.category}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">{r.format}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 mt-1">{r.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{r.summary}</p>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                    <span>{r.date}</span>
                    <span>•</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Verified Attributable Data
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(r.id)}
                  disabled={downloading === r.id}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors self-start sm:self-center disabled:opacity-50"
                >
                  <Download size={13} />
                  {downloading === r.id ? "Generating..." : `Download ${r.format}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
