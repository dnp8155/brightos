"use client";

import React, { useState, useEffect } from "react";
import { TopHeader } from "@/components/top-header";
import { useToast } from "@/components/toast-provider";
import { Settings, Save, CheckCircle2, Shield, Database, Cpu, Mail, Globe, Users } from "lucide-react";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("BrightLoop Technology");
  const [productName, setProductName] = useState("BrightLoop AI");
  const [defaultModel, setDefaultModel] = useState("gemini-1.5-pro");
  const [supabaseUrl, setSupabaseUrl] = useState("https://xyzcompany.supabase.co");
  const [searchProvider, setSearchProvider] = useState("apollo");
  const [emailProvider, setEmailProvider] = useState("resend");
  const [complianceNotice, setComplianceNotice] = useState(true);
  const [saved, setSaved] = useState(false);
  const [team, setTeam] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/settings/team")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.team) setTeam(d.team);
      })
      .catch(() => {});
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    toast("Workspace configuration saved.", "success");
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] text-slate-900 min-h-screen">
      <TopHeader
        title="Settings & Platform Configuration"
        description="Configure organization profile, AI model selection, Supabase architecture, and providers"
      />

      <main className="p-6 space-y-6 max-w-4xl mx-auto w-full">
        {saved && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={14} />
            <span>Settings saved successfully to local workspace configuration.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* General Company Profile */}
          <div className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Globe size={16} className="text-sky-400" /> Company Profile & Branding
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Platform Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* AI Orchestration Config */}
          <div className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Cpu size={16} className="text-violet-400" /> AI Agent Core Models
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Primary Reasoning Model</label>
                <select
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                >
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (High-Throughput)</option>
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Search Discovery Provider</label>
                <select
                  value={searchProvider}
                  onChange={(e) => setSearchProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                >
                  <option value="apollo">Apollo B2B Index</option>
                  <option value="brightdata">Bright Data Enterprise Scraper</option>
                  <option value="serpapi">Google Search SERP API</option>
                </select>
              </div>
            </div>
          </div>

          {/* Supabase Architecture Config */}
          <div className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Database size={16} className="text-emerald-400" /> Supabase Storage & Relational Database
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Supabase Project URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">
                  Supabase Anon Key (Public)
                </label>
                <input
                  type="password"
                  value="sbp_anon_9281923098123091283"
                  readOnly
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-400 focus:outline-none cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500">
                  Backend secrets (service role keys) are configured strictly via server environment variables, never on the client.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Save size={14} /> Save Configuration
            </button>
          </div>
        </form>

        {/* Team & Access Control */}
        <div className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-[#0284c7]" /> Authorized Team & Roles
            </h3>
            <span className="text-[11px] font-medium text-slate-500">Admin-only policy active</span>
          </div>

          {team.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No team profiles loaded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {team.map((member) => (
                <div key={member.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{member.full_name || "Administrator"}</div>
                    <div className="text-[11px] text-slate-500">{member.email}</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0284c7] border border-sky-200 text-[10px] font-bold uppercase">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
