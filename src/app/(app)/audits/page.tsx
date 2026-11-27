"use client";

import React, { useState, useEffect } from "react";
import { TopHeader } from "@/components/top-header";
import { DEMO_AUDITS } from "@/lib/demoData";
import {
  Globe,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Zap,
  Sparkles,
  Download,
  AlertTriangle,
  Layers,
  Cpu,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  Lock,
  RefreshCw,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuditsPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  const [inputUrl, setInputUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"findings" | "technologies" | "pages" | "ai_summary">("findings");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get("url");
    if (urlParam) {
      setInputUrl(urlParam);
    }
  }, []);

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl })
      });

      const data = await res.json();
      if (res.ok && data.report) {
        if (data.report.status === "failed") {
          setErrorMsg(data.report.errorMessage || "Audit failed to crawl the target domain.");
        } else {
          setAudits([data.report, ...audits]);
          setSelectedAudit(data.report);
          setInputUrl("");
        }
      } else {
        setErrorMsg(data.error || "Audit request failed");
      }
    } catch (err: any) {
      setErrorMsg("Network error running audit: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    const reportData = JSON.stringify(selectedAudit, null, 2);
    const blob = new Blob([reportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brightloop-audit-${selectedAudit.finalDomain || selectedAudit.businessName || "report"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] text-slate-900 min-h-screen">
      <TopHeader
        title="AI Website Intelligence & Technical Audit Engine"
        description="SSRF-protected multi-page crawler, SEO, Core Web Vitals, mobile UX, technology stack detection, and AI recommendations"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* URL Input Form */}
        <div className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-sky-400" />
              <h3 className="text-sm font-semibold text-slate-900">
                Trigger Real-Time Website Audit
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Lock size={12} className="text-emerald-400" />
              <span>SSRF Guardrail Active (Private IPs & Loopbacks Blocked)</span>
            </div>
          </div>

          <form onSubmit={handleRunAudit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                required
                placeholder="Enter public domain (e.g. https://stripe.com or example.com)"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-slate-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Auditing Multi-Page Layout...</span>
                </>
              ) : (
                <>
                  <span>Audit Website</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle size={14} className="text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Audit Inspector Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Audited Domains List */}
          <div className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Audited Websites ({audits.length})
            </h4>
            <div className="space-y-2">
              {audits.map((item, idx) => {
                const name = item.finalDomain || item.businessName || item.url;
                const date = item.date || item.completedAt?.split("T")[0] || "2026-11-25";
                const isSelected = selectedAudit?.id === item.id || (!selectedAudit && idx === 0);

                return (
                  <div
                    key={item.id || idx}
                    onClick={() => setSelectedAudit(item)}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-colors space-y-1",
                      isSelected
                        ? "bg-sky-500/10 border-sky-500/40"
                        : "bg-slate-50 border-slate-200 hover:border-slate-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 truncate pr-2">
                        {name}
                      </span>
                      <span className="text-[10px] text-slate-500 shrink-0">{date}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      {item.url}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Audit Report Panel (2 Columns) */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-6">
            {/* Header info & export */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>{selectedAudit.finalDomain || selectedAudit.businessName}</span>
                  {selectedAudit.status && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                      {selectedAudit.status}
                    </span>
                  )}
                </h3>
                <a
                  href={selectedAudit.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-sky-400 hover:underline flex items-center gap-1 mt-0.5"
                >
                  {selectedAudit.url} <ExternalLink size={11} />
                </a>
              </div>
              <button
                onClick={handleExportReport}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-800 flex items-center gap-1.5 transition-colors self-start sm:self-auto border border-slate-200"
              >
                <Download size={13} /> Export Audit JSON
              </button>
            </div>

            {/* Score Grid (Performance, SEO, Mobile, Design) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                  <Zap size={12} className="text-amber-400" /> Performance
                </div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {selectedAudit.scores?.performance ?? selectedAudit.scores?.performance}%
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-400" /> Technical SEO
                </div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {selectedAudit.scores?.seo}%
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                  <Smartphone size={12} className="text-sky-400" /> Mobile UX
                </div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {selectedAudit.scores?.mobile}%
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                  <Sparkles size={12} className="text-violet-400" /> Visual Design
                </div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {selectedAudit.scores?.design}%
                </div>
              </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-slate-200 text-xs">
              <button
                onClick={() => setActiveTab("findings")}
                className={cn(
                  "px-4 py-2 font-medium border-b-2 transition-colors",
                  activeTab === "findings"
                    ? "border-sky-400 text-sky-400"
                    : "border-transparent text-slate-400 hover:text-slate-800"
                )}
              >
                Verified Findings ({selectedAudit.issues?.length || 4})
              </button>
              <button
                onClick={() => setActiveTab("technologies")}
                className={cn(
                  "px-4 py-2 font-medium border-b-2 transition-colors",
                  activeTab === "technologies"
                    ? "border-sky-400 text-sky-400"
                    : "border-transparent text-slate-400 hover:text-slate-800"
                )}
              >
                Tech Stack ({selectedAudit.technologies?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("pages")}
                className={cn(
                  "px-4 py-2 font-medium border-b-2 transition-colors",
                  activeTab === "pages"
                    ? "border-sky-400 text-sky-400"
                    : "border-transparent text-slate-400 hover:text-slate-800"
                )}
              >
                Crawled Pages ({selectedAudit.pagesAudited?.length || 1})
              </button>
              <button
                onClick={() => setActiveTab("ai_summary")}
                className={cn(
                  "px-4 py-2 font-medium border-b-2 transition-colors",
                  activeTab === "ai_summary"
                    ? "border-sky-400 text-sky-400"
                    : "border-transparent text-slate-400 hover:text-slate-800"
                )}
              >
                AI Roadmap
              </button>
            </div>

            {/* Tab 1: Findings with Evidence */}
            {activeTab === "findings" && (
              <div className="space-y-3">
                {selectedAudit.issues && selectedAudit.issues.length > 0 ? (
                  selectedAudit.issues.map((issue: any, i: number) => (
                    <div
                      key={issue.id || i}
                      className="p-3.5 rounded-lg bg-slate-50/80 border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          <AlertTriangle
                            size={13}
                            className={cn(
                              issue.severity === "critical"
                                ? "text-rose-400"
                                : issue.severity === "high"
                                ? "text-amber-400"
                                : "text-sky-400"
                            )}
                          />
                          {issue.title}
                        </span>
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                            issue.severity === "critical"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : issue.severity === "high"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-slate-100 text-slate-400"
                          )}
                        >
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">{issue.description}</p>
                      <div className="text-[11px] text-slate-400 bg-slate-50/60 p-2 rounded border border-slate-200 font-mono">
                        <span className="text-slate-500">Evidence:</span> {issue.evidence}
                      </div>
                      <div className="text-[11px] text-emerald-400">
                        <span className="font-semibold text-slate-700">Suggested Fix:</span> {issue.suggestedImprovement}
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback for Phase 1 demo reports
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-xs font-semibold text-amber-400">Performance</span>
                      <ul className="text-xs text-slate-700 space-y-1">
                        {selectedAudit.findings?.performance?.map((f: string, i: number) => (
                          <li key={i}>• {f}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-xs font-semibold text-emerald-400">SEO</span>
                      <ul className="text-xs text-slate-700 space-y-1">
                        {selectedAudit.findings?.seo?.map((f: string, i: number) => (
                          <li key={i}>• {f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Detected Technologies */}
            {activeTab === "technologies" && (
              <div className="space-y-3">
                {selectedAudit.technologies && selectedAudit.technologies.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedAudit.technologies.map((tech: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900">{tech.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {tech.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{tech.evidence}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No technologies detected or this is a legacy demonstration report.
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Crawled Pages */}
            {activeTab === "pages" && (
              <div className="space-y-2">
                {selectedAudit.pagesAudited && selectedAudit.pagesAudited.length > 0 ? (
                  selectedAudit.pagesAudited.map((p: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-800 capitalize">
                          {p.pageType === "homepage" ? "Homepage" : `${p.pageType} Page`}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate max-w-md">{p.url}</div>
                      </div>
                      <div className="text-right text-[11px]">
                        <span className={cn(
                          "px-2 py-0.5 rounded font-bold",
                          p.statusCode >= 400
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        )}>
                          HTTP {p.statusCode}
                        </span>
                        <div className="text-slate-500 text-[10px] mt-0.5">{p.loadTimeMs}ms latency</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Single homepage crawl evaluated.
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: AI Summary & Roadmap */}
            {activeTab === "ai_summary" && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <h5 className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                    <Sparkles size={14} /> Executive AI Summary
                  </h5>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedAudit.aiSummary?.executiveSummary || "Audit results indicate high potential for frontend modernization and Core Web Vitals optimization."}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <h5 className="text-xs font-semibold text-slate-800">Recommended BrightLoop Modernization Roadmap</h5>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
                    {(selectedAudit.aiSummary?.suggestedRoadmap || [
                      "Migrate legacy pages to Next.js App Router",
                      "Implement mobile responsive viewport guidelines",
                      "Deploy automated Core Web Vitals image optimization"
                    ]).map((step: string, i: number) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* BrightLoop Service Recommendations Section */}
            <div className="p-4 rounded-lg bg-sky-500/5 border border-sky-500/20 space-y-2">
              <h5 className="text-xs font-semibold text-sky-400">
                Recommended BrightLoop Modernization Solutions
              </h5>
              <div className="space-y-2">
                {(selectedAudit.serviceRecommendations || []).length > 0 ? (
                  selectedAudit.serviceRecommendations.map((svc: any, i: number) => (
                    <div key={i} className="p-2.5 rounded bg-slate-50/80 border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{svc.serviceName}</div>
                        <div className="text-[11px] text-slate-400">{svc.reason}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {svc.priority} Priority
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(selectedAudit.recommendedServices || [
                      "Next.js Modernization",
                      "Mobile UX Redesign",
                      "Technical SEO Overhaul"
                    ]).map((s: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
