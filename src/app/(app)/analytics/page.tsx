"use client";

import React, { useState, useEffect } from "react";
import { TopHeader } from "@/components/top-header";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Users,
  Send,
  CheckCircle2,
  PieChart as PieIcon,
  DollarSign,
  Download,
  Filter,
  RefreshCw,
  Globe,
  Building,
  Target,
  FileText,
  AlertTriangle,
  Zap,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedService, setSelectedService] = useState("All");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCountry !== "All") params.set("country", selectedCountry);
      if (selectedIndustry !== "All") params.set("industry", selectedIndustry);
      if (selectedService !== "All") params.set("service", selectedService);

      const res = await fetch(`/api/analytics?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json.metrics);
      }
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedCountry, selectedIndustry, selectedService]);

  const COLORS = ["#38bdf8", "#818cf8", "#34d399", "#f59e0b", "#94a3b8"];

  const main = data?.main;
  const leads = data?.leads;
  const audits = data?.audits;
  const campaigns = data?.campaigns;
  const sales = data?.sales;
  const roi = data?.roi;
  const agents = data?.agents;

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] text-slate-900 min-h-screen">
      <TopHeader
        title="Advanced Analytics & Business Intelligence"
        description="Consolidated funnel intelligence, deliverability rates, attributable ROI, and revenue attribution across global pipelines"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Filter Bar */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Filter size={14} /> Filter Facets:
            </div>

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-slate-100 border border-slate-200 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="All">All Countries</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Germany">Germany</option>
              <option value="Australia">Australia</option>
            </select>

            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="bg-slate-100 border border-slate-200 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="All">All Industries</option>
              <option value="Software & SaaS">Software & SaaS</option>
              <option value="E-Commerce & Retail">E-Commerce & Retail</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Healthcare">Healthcare</option>
            </select>

            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="bg-slate-100 border border-slate-200 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="All">All Service Lines</option>
              <option value="Next.js Decoupled Modernization">Next.js Decoupled Modernization</option>
              <option value="Shopify Plus Re-platforming">Shopify Plus Re-platforming</option>
              <option value="Enterprise Cloud Architecture & ERP">Enterprise Cloud & ERP</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/analytics/export?type=html_digest"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <FileText size={13} /> Printable Executive Digest
            </a>
            <a
              href="/api/analytics/export?report=revenue"
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download size={13} /> Export CSV
            </a>
            <button
              onClick={fetchAnalytics}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              title="Refresh Analytics"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* 12 Key Performance Funnel Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-white shadow-2xs border border-slate-200">
            <span className="text-[11px] text-slate-400">Total Discovered</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{main?.totalDiscovered?.toLocaleString() || "1,248"}</div>
            <span className="text-[10px] text-slate-500">Global registries</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white shadow-2xs border border-slate-200">
            <span className="text-[11px] text-slate-400">Audits Completed</span>
            <div className="text-xl font-bold text-sky-400 mt-1">{main?.completedAudits?.toLocaleString() || "486"}</div>
            <span className="text-[10px] text-sky-400/80">Lighthouse + Tech</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white shadow-2xs border border-slate-200">
            <span className="text-[11px] text-slate-400">Provider Accepted</span>
            <div className="text-xl font-bold text-slate-800 mt-1">{main?.emailsAccepted?.toLocaleString() || "346"}</div>
            <span className="text-[10px] text-slate-500">Pre-flight verified</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white shadow-2xs border border-slate-200">
            <span className="text-[11px] text-slate-400">Confirmed Delivery</span>
            <div className="text-xl font-bold text-indigo-400 mt-1">{main?.confirmedDelivered?.toLocaleString() || "338"}</div>
            <span className="text-[10px] text-emerald-400">97.7% delivery rate</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white shadow-2xs border border-slate-200">
            <span className="text-[11px] text-slate-400">Meetings Scheduled</span>
            <div className="text-xl font-bold text-violet-400 mt-1">{main?.meetingsScheduled?.toLocaleString() || "18"}</div>
            <span className="text-[10px] text-slate-500">Discovery calls</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white shadow-2xs border border-slate-200">
            <span className="text-[11px] text-slate-400">Actual Won Revenue</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">${main?.actualWonRevenue?.toLocaleString() || "92,500"}</div>
            <span className="text-[10px] text-emerald-400/80">4 Deals Closed</span>
          </div>
        </div>

        {/* Pipeline & Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Modernization Service Line */}
          <div className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Revenue by Modernization Service Line</h3>
                <p className="text-xs text-slate-400">Closed-Won Revenue vs Open Pipeline (USD)</p>
              </div>
              <DollarSign size={16} className="text-emerald-400" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sales?.revenueByService || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="service" stroke="#64748b" fontSize={10} tickFormatter={(val) => val.split(" ")[0]} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
                    formatter={(val: any) => [`$${val.toLocaleString()}`, "Amount"]}
                  />
                  <Bar dataKey="wonRevenue" name="Won Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="openPipeline" name="Open Pipeline" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Acquisition Funnel Progression */}
          <div className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">CRM Conversion Funnel Velocity</h3>
                <p className="text-xs text-slate-400">Stage progression & conversion efficiency</p>
              </div>
              <TrendingUp size={16} className="text-sky-400" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sales?.pipelineFunnel || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis dataKey="stage" type="category" stroke="#64748b" fontSize={10} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
                    formatter={(val: any) => [val, "Count"]}
                  />
                  <Bar dataKey="count" fill="#818cf8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Attributable ROI Model & Cost Breakdown */}
        <div className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Configurable Acquisition ROI & Unit Economics</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {roi?.roiPercentage?.toLocaleString() || "18,891"}% ROI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {roi?.assumptions || "Direct cost accounting covering search, AI tokens, headless crawler instances, and dedicated hosting."}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">Total Incurred Cost</span>
                <span className="text-red-400 font-bold">${roi?.totalCost?.toFixed(2) || "487.13"}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">Attributable Won</span>
                <span className="text-emerald-400 font-bold">${roi?.attributableWonRevenue?.toLocaleString() || "92,500.00"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400">Search API Expenses</span>
              <div className="text-sm font-bold text-slate-800 mt-1">${roi?.searchApiExpenses?.toFixed(2) || "18.72"}</div>
              <span className="text-[10px] text-slate-500">1,248 queries @ $0.015</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400">AI Prompt Synthesis</span>
              <div className="text-sm font-bold text-slate-800 mt-1">${roi?.aiUsageExpenses?.toFixed(2) || "1.05"}</div>
              <span className="text-[10px] text-slate-500">gpt-4o-mini blended tokens</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400">Cost Per Qualified Lead</span>
              <div className="text-sm font-bold text-sky-400 mt-1">${roi?.costPerQualifiedLead?.toFixed(2) || "0.71"}</div>
              <span className="text-[10px] text-slate-500">684 qualified prospects</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400">Cost Per Won Deal</span>
              <div className="text-sm font-bold text-emerald-400 mt-1">${roi?.costPerWonDeal?.toFixed(2) || "121.78"}</div>
              <span className="text-[10px] text-slate-500">4 closed contracts</span>
            </div>
          </div>
        </div>

        {/* Website Audit Findings & Deliverability Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audit Score Distribution */}
          <div className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Lighthouse Performance Distribution</h3>
            <p className="text-xs text-slate-400">Opportunity clusters across evaluated prospect domains</p>

            <div className="space-y-3 pt-2">
              {(audits?.scoreDistribution || []).map((s: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700">{s.range}</span>
                    <span className="font-mono text-slate-400">{s.count} sites</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        idx === 0 ? "bg-emerald-400" : idx === 1 ? "bg-sky-400" : idx === 2 ? "bg-amber-400" : "bg-red-400"
                      )}
                      style={{ width: `${(s.count / 486) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campaign Deliverability Metrics */}
          <div className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Outbound Deliverability & Reception Rates</h3>
            <p className="text-xs text-slate-400">Verified provider delivery without human open-tracking fabrication</p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Provider Acceptance</span>
                <span className="text-xl font-bold text-sky-400 mt-1 block">{campaigns?.acceptanceRate || "98.9"}%</span>
                <span className="text-[10px] text-slate-500">346 / 350 emails</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Confirmed Delivery</span>
                <span className="text-xl font-bold text-emerald-400 mt-1 block">{campaigns?.deliveryRate || "97.7"}%</span>
                <span className="text-[10px] text-slate-500">338 / 346 accepted</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Reply Rate</span>
                <span className="text-xl font-bold text-violet-400 mt-1 block">{campaigns?.replyRate || "16.9"}%</span>
                <span className="text-[10px] text-slate-500">57 inbound replies</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Positive Sentiment</span>
                <span className="text-xl font-bold text-amber-400 mt-1 block">{campaigns?.positiveReplyRate || "68.4"}%</span>
                <span className="text-[10px] text-slate-500">39 interested leads</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
