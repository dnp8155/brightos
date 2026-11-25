"use client";

import React, { useState } from "react";
import { TopHeader } from "@/components/top-header";
import {
  DEMO_ACQUISITION_CHART,
  DEMO_CAMPAIGN_PERF_CHART,
  DEMO_AGENTS,
  DEMO_LEADS
} from "@/lib/demoData";
import {
  Users,
  Globe,
  Award,
  Send,
  MessageSquare,
  TrendingUp,
  Play,
  Pause,
  ChevronRight,
  DollarSign,
  Plus
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
    { title: "Total Leads", value: "1,248", delta: "+18.4%", icon: Users },
    { title: "Websites Audited", value: "486", delta: "Lighthouse", icon: Globe },
    { title: "Qualified", value: "320", delta: "65.8% fit", icon: Award },
    { title: "Dispatched", value: "346", delta: "97.7% deliv.", icon: Send },
    { title: "Replies", value: "57", delta: "16.9% rate", icon: MessageSquare },
    { title: "Won Revenue", value: "$92,500", delta: "4 deals", icon: DollarSign }
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] text-slate-900 min-h-screen">
      <TopHeader
        title="Overview"
        description="Client acquisition metrics, pipeline velocity, and agent status"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Workspace Summary</h2>
            <p className="text-xs text-slate-500">Real-time operational overview across discovery, audits, and CRM.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/lead-discovery"
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5"
            >
              <Plus size={13} /> New Discovery
            </Link>
            <Link
              href="/crm"
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors flex items-center gap-1.5"
            >
              Open Pipeline <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        {/* Clean SaaS KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.title}
                className="p-4 rounded-xl bg-white border border-slate-200/90 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-medium truncate">{kpi.title}</span>
                  <Icon size={14} className="text-slate-400 shrink-0" />
                </div>
                <div className="mt-3">
                  <div className="text-xl font-bold tracking-tight text-slate-900">{kpi.value}</div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <TrendingUp size={11} className="text-emerald-600" />
                    <span>{kpi.delta}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-white border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Lead Acquisition Velocity</h3>
                <p className="text-xs text-slate-500">Discovered vs audited vs contacted</p>
              </div>
            </div>
            <div className="h-60 w-full">
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
                      fontSize: "12px"
                    }}
                  />
                  <Line type="monotone" dataKey="leads" name="Discovered" stroke="#0f172a" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="audited" name="Audited" stroke="#0284c7" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="contacted" name="Contacted" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Campaign Conversion</h3>
                <p className="text-xs text-slate-500">Dispatched vs delivered vs replied</p>
              </div>
            </div>
            <div className="h-60 w-full">
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
                      fontSize: "12px"
                    }}
                  />
                  <Bar dataKey="sent" name="Dispatched" fill="#0f172a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="opened" name="Delivered" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="replied" name="Replied" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* High-Priority Prospects & Agent Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Recent Qualified Prospects</h3>
              <Link href="/crm" className="text-xs font-medium text-[#0284c7] hover:underline">
                View all &rarr;
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {DEMO_LEADS.slice(0, 4).map((lead) => (
                <div key={lead.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs text-slate-900 truncate">{lead.businessName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">{lead.country}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate mt-0.5">{lead.website}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-semibold text-slate-700">{lead.opportunityScore}/100</span>
                    <Link
                      href="/email-studio"
                      className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
                    >
                      Draft Pitch
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Agent Fleet</h3>
              <Link href="/agents" className="text-xs font-medium text-[#0284c7] hover:underline">
                Manage &rarr;
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {agents.slice(0, 4).map((agent) => (
                <div key={agent.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-slate-900 block truncate">{agent.name}</span>
                    <span className="text-[10px] text-slate-400">Processed: {agent.metrics.processedCount}</span>
                  </div>
                  <button
                    onClick={() => toggleAgent(agent.id)}
                    className={cn(
                      "px-2 py-1 rounded text-[10px] font-medium border flex items-center gap-1 transition-colors",
                      agent.status === "running"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    )}
                  >
                    {agent.status === "running" ? <Pause size={10} /> : <Play size={10} />}
                    {agent.status === "running" ? "Active" : "Paused"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
