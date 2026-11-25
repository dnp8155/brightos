"use client";

import React, { useState, useEffect } from "react";
import { TopHeader } from "@/components/top-header";
import { DEMO_LEADS } from "@/lib/demoData";
import {
  Mail,
  Sparkles,
  Send,
  Save,
  Eye,
  CheckCircle2,
  RefreshCw,
  Clock,
  History,
  FileCheck2,
  Check,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmailStudioPage() {
  const [leads, setLeads] = useState<any[]>(DEMO_LEADS);
  const [selectedLead, setSelectedLead] = useState<any>(DEMO_LEADS[0]);
  const [selectedService, setSelectedService] = useState("website-redesign");
  const [selectedTone, setSelectedTone] = useState<"professional" | "friendly" | "consultative" | "concise" | "formal">("professional");

  // Editable Editor State
  const [subject, setSubject] = useState("Modernization opportunities for Aura Logistics Group");
  const [body, setBody] = useState(
    `Hi Marcus,\n\nWhile reviewing https://auralogistics.example.io, our automated audit identified key mobile viewport hydration bottlenecks.\n\nAt BrightLoop Technology, we engineer decoupled Next.js systems that eliminate these bottlenecks and elevate customer experience.\n\nWould you have 15 minutes this Thursday for a brief walkthrough of the technical audit teardown?\n\nBest regards,\nBrightLoop Outreach Team\nBrightLoop Technology\n100 Pine St, Suite 1250, San Francisco, CA\n\n---\nYou received this message based on public corporate information. Reply 'unsubscribe' to opt out.`
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [versions, setVersions] = useState<{ versionNumber: number; subject: string; bodyText: string; savedAt: string }[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<"draft" | "approved">("draft");

  // Load leads from API
  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        if (data.leads && data.leads.length > 0) {
          setLeads(data.leads);
        }
      })
      .catch(() => {});
  }, []);

  const handleLeadChange = (leadId: string) => {
    const lead = leads.find((l) => (l.id || l.businessName) === leadId);
    if (lead) {
      setSelectedLead(lead);
      const name = lead.businessName || lead.name;
      setSubject(`Modernization opportunities for ${name}`);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setNotification(null);

    const bName = selectedLead.businessName || selectedLead.name;
    const bUrl = selectedLead.website || selectedLead.website_url;
    const cName = selectedLead.contact?.name || `${selectedLead.contacts?.[0]?.first_name || ""} ${selectedLead.contacts?.[0]?.last_name || ""}`.trim();

    try {
      const res = await fetch("/api/email-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: bName,
          websiteUrl: bUrl.startsWith("http") ? bUrl : `https://${bUrl}`,
          industry: selectedLead.industry || "General B2B",
          country: selectedLead.country || "United States",
          contactName: cName || "Decision Maker",
          targetService: selectedService,
          tone: selectedTone,
          auditId: selectedLead.auditId
        })
      });

      const data = await res.json();
      if (res.ok && data.draft) {
        setSubject(data.draft.subject);
        setBody(data.draft.fullBodyText);
        setApprovalStatus("draft");
        setNotification(`AI tailored draft generated successfully (Model: ${data.draft.metadata.model})`);
      } else {
        alert(data.error || "Generation error");
      }
    } catch (err: any) {
      alert("Error generating email: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async (approve = false) => {
    const status = approve ? "approved" : "draft";
    const bName = selectedLead.businessName || selectedLead.name;
    const rEmail = selectedLead.contact?.email || selectedLead.contacts?.[0]?.email || "prospect@example.com";

    try {
      const res = await fetch("/api/email-studio/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: bName,
          recipientEmail: rEmail,
          service: selectedService,
          tone: selectedTone,
          subject,
          bodyText: body,
          status
        })
      });

      const data = await res.json();
      if (res.ok && data.draft) {
        setApprovalStatus(status);
        setVersions(data.draft.versions || []);
        setNotification(data.message);
      }
    } catch (err: any) {
      alert("Failed saving draft: " + err.message);
    }
  };

  const restoreVersion = (v: { subject: string; bodyText: string }) => {
    setSubject(v.subject);
    setBody(v.bodyText);
    setNotification("Restored historical draft version.");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19] text-slate-100 min-h-screen">
      <TopHeader
        title="AI Email Studio & Pitch Generator"
        description="Craft hyper-personalized, evidence-backed sales outreach using verified website audit findings and tone controls"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {notification && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Configuration Bar */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          {/* Target Business Selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Target Prospect</label>
            <select
              value={selectedLead.id || selectedLead.businessName}
              onChange={(e) => handleLeadChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {leads.map((l: any, i: number) => (
                <option key={l.id || i} value={l.id || l.businessName}>
                  {l.businessName || l.name} ({l.country})
                </option>
              ))}
            </select>
          </div>

          {/* Service Pitch */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Target BrightLoop Service</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value as any)}
              className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="website-redesign">Modern Website Redesign</option>
              <option value="website-development">Next.js Frontend Modernization</option>
              <option value="seo-digital-marketing">SEO & Schema Optimization</option>
              <option value="shopify-ecommerce">Shopify & E-Commerce Overhaul</option>
              <option value="custom-software-erp">Custom ERP / Portal Engineering</option>
            </select>
          </div>

          {/* Tone Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Outreach Tone</label>
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value as any)}
              className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500 capitalize"
            >
              <option value="professional">Professional</option>
              <option value="consultative">Consultative</option>
              <option value="friendly">Friendly</option>
              <option value="concise">Concise</option>
              <option value="formal">Formal</option>
            </select>
          </div>

          {/* Generate Action Button */}
          <div className="pt-4 sm:pt-0">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Synthesizing Pitch...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Generate AI Pitch</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2-Column Editor & Envelope Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Form */}
          <div className="p-5 rounded-xl bg-[#111827] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-sky-400" />
                <h3 className="text-sm font-semibold text-slate-100">Email Draft Editor</h3>
              </div>
              <div className="flex items-center gap-2">
                {versions.length > 0 && (
                  <button
                    onClick={() => setShowVersions(!showVersions)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 flex items-center gap-1"
                  >
                    <History size={12} />
                    <span>Versions ({versions.length})</span>
                  </button>
                )}
                <button
                  onClick={() => handleSaveDraft(false)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5"
                >
                  <Save size={13} /> Save Draft
                </button>
                <button
                  onClick={() => handleSaveDraft(true)}
                  className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5"
                >
                  <Check size={13} /> Approve Draft
                </button>
              </div>
            </div>

            {/* Version History Drawer (if opened) */}
            {showVersions && versions.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Version History</span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {versions.map((v) => (
                    <div
                      key={v.versionNumber}
                      onClick={() => restoreVersion(v)}
                      className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs cursor-pointer hover:border-sky-500 transition-colors"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-200">v{v.versionNumber}:</span> {v.subject}
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">Restore</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-400">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Body */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-400">Full Email Body</label>
                <span className="text-[10px] text-slate-500">Includes verified audit observation & unsubscribe notice</span>
              </div>
              <textarea
                rows={14}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3 py-2.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500 leading-relaxed"
              />
            </div>

            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Status: <strong className={approvalStatus === "approved" ? "text-emerald-400" : "text-amber-400"}>{approvalStatus.toUpperCase()}</strong></span>
              <span className="text-slate-500">Live sending deactivated in Phase 5</span>
            </div>
          </div>

          {/* Interactive Live Email Envelope Preview */}
          <div className="p-5 rounded-xl bg-[#111827] border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Eye size={16} className="text-emerald-400" /> Recipient Inbox Preview
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready for Campaign Assignment
                </span>
              </div>

              {/* Envelope Container */}
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-inner">
                <div className="space-y-1 text-xs border-b border-slate-800/80 pb-3">
                  <div className="flex gap-2 text-slate-400">
                    <span className="w-16 text-slate-500">To:</span>
                    <span className="text-slate-200 font-mono">
                      {selectedLead.contact?.email || selectedLead.contacts?.[0]?.email || "contact@target-domain.com"}
                    </span>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <span className="w-16 text-slate-500">From:</span>
                    <span className="text-slate-200">BrightLoop Technology &lt;outreach@brightloop.ai&gt;</span>
                  </div>
                  <div className="flex gap-2 text-slate-400 pt-1">
                    <span className="w-16 text-slate-500">Subject:</span>
                    <span className="text-white font-semibold">{subject}</span>
                  </div>
                </div>

                <div className="pt-1 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans max-h-96 overflow-y-auto">
                  {body}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 size={13} />
                <span>CAN-SPAM Opt-Out & Address Included</span>
              </div>
              <div>Approved drafts automatically sync to the Campaign Management module.</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
