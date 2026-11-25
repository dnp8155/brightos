"use client";

import React, { useState } from "react";
import { TopHeader } from "@/components/top-header";
import {
  DEMO_METRICS,
  DEMO_ACQUISITION_CHART,
  DEMO_CAMPAIGN_PERF_CHART,
  DEMO_AGENTS,
  DEMO_LEADS,
  DEMO_CAMPAIGNS
} from "@/lib/demoData";
import {
  Users,
  Globe,
  Award,
  Send,
  MessageSquare,
  Zap,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Play,
  Pause,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Bot,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Sparkles,
  FileText
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function OverviewPage() {
  const [agents, setAgents] = useState(DEMO_AGENTS);

  const toggleAgent = (id: string) => {
    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.id === id) {
          const nextStatus = agent.status === "running" ? "paused" : "running";
          return {
            ...agent,
            status: nextStatus,
            lastActivity: "Just now",
            currentTask:
              nextStatus === "running"
                ? "Resumed automated processing cycle"
                : "Paused by dashboard operator"
          };
        }
        return agent;
      })
    );
  };

  const kpis = [
    {
      title: "Total Leads Discovered",
      value: "1,248",
      delta: "+18.4% month-over-month",
      icon: Users,
      color: "text-[#0284c7]",
      bg: "bg-sky-50",
      border: "border-sky-200"
    },
    {
      title: "Websites Audited",
      value: "486",
      delta: "486 domains evaluated",
      icon: Globe,
      color: "text-[#0891b2]",
      bg: "bg-cyan-50",
      border: "border-cyan-200"
    },
    {
      title: "Qualified Prospects",
      value: "320",
      delta: "65.8% conversion fit",
      icon: Award,
      color: "text-[#d97706]",
      bg: "bg-amber-50",
      border: "border-amber-200"
    },
    {
      title: "Emails Dispatched",
      value: "346",
      delta: "97.7% delivery rate",
      icon: Send,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200"
    },
    {
      title: "Inbound Replies",
      value: "57",
      delta: "16.9% real reply rate",
      icon: MessageSquare,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200"
    },
    {
      title: "Actual Won Revenue",
      value: "$92,500",
      delta: "4 closed enterprise deals",
      icon: DollarSign,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-300"
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] text-slate-900 min-h-screen">
      <TopHeader
        title="Executive Performance Overview"
        description="Consolidated client acquisition telemetry, active agent supervision, and verified conversion pipelines"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Welcome Executive Hero Banner */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-1.5 z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                BrightLoop AI 2.0
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-600" /> All 8 Agents Active & Healthy
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome to BrightLoop Client Acquisition
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Autonomous prospecting, Lighthouse website intelligence, consultative email generation, and closed sales pipeline progression for BrightLoop Technology.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
            <Link
              href="/crm"
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs shadow-xs transition-colors flex items-center gap-2"
            >
              <Users size={14} className="text-[#0284c7]" /> Open CRM Pipeline
            </Link>
            <Link
              href="/agents"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0891b2] hover:opacity-95 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
            >
              <Bot size={14} /> Agent Control Center
            </Link>
          </div>
        </div>

        {/* 6 Key Performance Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.title}
                className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 truncate">
                    {kpi.title}
                  </span>
                  <div className={cn("p-1.5 rounded-lg", kpi.bg, kpi.border)}>
                    <Icon size={14} className={kpi.color} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                    {kpi.value}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 mt-1 flex items-center gap-1">
                    <TrendingUp size={11} className="text-emerald-600" />
                    <span>{kpi.delta}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Acquisition Velocity & Campaign Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Lead Acquisition Flow */}
          <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Lead Acquisition & Audit Velocity
                </h3>
                <p className="text-xs text-slate-500">
                  Weekly discovery volume vs audited and contacted prospects
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-[#0284c7] border border-sky-200">
                Weekly Trend
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={DEMO_ACQUISITION_CHART} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                      fontSize: "12px",
                      color: "#0f172a"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="leads"
                    name="Discovered"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={{ fill: "#0284c7", r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="audited"
                    name="Audited"
                    stroke="#0891b2"
                    strokeWidth={2.5}
                    dot={{ fill: "#0891b2", r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="contacted"
                    name="Contacted"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ fill: "#10b981", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Campaign Performance */}
          <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Campaign Conversion Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Total sent vs delivered vs replied across active campaigns
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Deliveries
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEMO_CAMPAIGN_PERF_CHART} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="campaign" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                      fontSize: "12px",
                      color: "#0f172a"
                    }}
                  />
                  <Bar dataKey="sent" name="Dispatched" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="opened" name="Delivered" fill="#0891b2" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="replied" name="Replied" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Agents Supervisory Grid */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-[#0284c7]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Supervised Autonomous Agent Fleet
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  8 Agents Operational
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time supervision of discovery, crawling, scoring, email synthesis, and CRM intelligence agents
              </p>
            </div>
            <Link
              href="/agents"
              className="text-xs font-bold text-[#0284c7] hover:underline flex items-center gap-1 self-start sm:self-center"
            >
              Control Center <ChevronRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {agents.slice(0, 4).map((agent) => (
              <div
                key={agent.id}
                className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Agent Core</span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        agent.status === "running"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      )}
                    >
                      {agent.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mt-2">{agent.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {agent.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Processed: {agent.metrics.processedCount}</span>
                  <button
                    onClick={() => toggleAgent(agent.id)}
                    className="text-xs font-bold text-[#0284c7] hover:underline flex items-center gap-1"
                  >
                    {agent.status === "running" ? <Pause size={11} /> : <Play size={11} />}
                    {agent.status === "running" ? "Pause" : "Resume"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent High-Priority Leads & Quick Outreach */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* High Priority Leads */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">High-Opportunity Prospects</h3>
                <p className="text-xs text-slate-500">Qualified leads ready for consultative modernization outreach</p>
              </div>
              <Link href="/crm" className="text-xs font-bold text-[#0284c7] hover:underline">
                View CRM &rarr;
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {DEMO_LEADS.slice(0, 4).map((lead) => (
                <div key={lead.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate">{lead.businessName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {lead.country}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate mt-0.5">{lead.website}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-[#0284c7] block">Score: {lead.opportunityScore}/100</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">{lead.status}</span>
                    </div>
                    <Link
                      href="/email-studio"
                      className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284c7] font-bold text-[11px] border border-sky-200/60 transition-colors"
                    >
                      Draft Pitch
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Platform Actions */}
          <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Operator Quick Launch</h3>
            <p className="text-xs text-slate-500">Trigger standard autonomous routines or manual audits</p>

            <div className="space-y-2.5 pt-1">
              <Link
                href="/lead-discovery"
                className="p-3 rounded-lg bg-slate-50 hover:bg-sky-50/60 border border-slate-200/80 hover:border-sky-200 transition-all flex items-center justify-between text-xs font-bold text-slate-800 group"
              >
                <div className="flex items-center gap-2.5">
                  <Globe size={16} className="text-[#0284c7]" />
                  <span>Launch Discovery Cycle</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-[#0284c7]" />
              </Link>

              <Link
                href="/audits"
                className="p-3 rounded-lg bg-slate-50 hover:bg-sky-50/60 border border-slate-200/80 hover:border-sky-200 transition-all flex items-center justify-between text-xs font-bold text-slate-800 group"
              >
                <div className="flex items-center gap-2.5">
                  <Award size={16} className="text-[#0891b2]" />
                  <span>Execute Lighthouse Crawl</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-[#0891b2]" />
              </Link>

              <Link
                href="/campaigns"
                className="p-3 rounded-lg bg-slate-50 hover:bg-sky-50/60 border border-slate-200/80 hover:border-sky-200 transition-all flex items-center justify-between text-xs font-bold text-slate-800 group"
              >
                <div className="flex items-center gap-2.5">
                  <Send size={16} className="text-indigo-600" />
                  <span>Review Pending Campaigns</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-indigo-600" />
              </Link>

              <Link
                href="/reports"
                className="p-3 rounded-lg bg-slate-50 hover:bg-sky-50/60 border border-slate-200/80 hover:border-sky-200 transition-all flex items-center justify-between text-xs font-bold text-slate-800 group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText size={16} className="text-[#d97706]" />
                  <span>Export Executive Digest</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-[#d97706]" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
