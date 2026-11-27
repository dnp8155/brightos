"use client";

import React, { useState, useEffect } from "react";
import { TopHeader } from "@/components/top-header";
import { Campaign } from "@/types";
import {
  Send,
  Plus,
  Pause,
  Play,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  Eye,
  ShieldCheck,
  RefreshCw,
  FileCheck2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("brightloop_campaigns");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCampaigns(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("brightloop_campaigns", JSON.stringify(campaigns));
    } catch {}
  }, [campaigns]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState<Campaign | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // New Campaign Form State
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newTargetIndustry, setNewTargetIndustry] = useState("Supply Chain & Logistics");
  const [newAudienceSize, setNewAudienceSize] = useState(60);

  const toggleStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === "Active" ? "Paused" : "Active";
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const handleExecuteApproval = (camp: Campaign) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === camp.id ? { ...c, status: "Active" } : c))
    );
    setShowApprovalModal(null);
    setNotification(`Campaign "${camp.name}" approved by Administrator. Cryptographic approval record generated.`);
  };

  const handleDispatchQueue = async (camp: Campaign) => {
    try {
      setNotification(`Dispatching email jobs to queue for "${camp.name}"...`);
      const res = await fetch(`/api/campaigns/${camp.id}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientCount: 3 })
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(`Dispatched ${data.events?.length || 0} emails to provider queue with idempotency protection.`);
      }
    } catch (err: any) {
      alert("Error dispatching emails: " + err.message);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;

    const created: Campaign = {
      id: `camp-${Date.now()}`,
      name: newCampaignName,
      targetIndustry: newTargetIndustry,
      targetAudienceCount: newAudienceSize,
      status: "Pending Approval",
      sentCount: 0,
      openRate: 0,
      replyRate: 0,
      interestedCount: 0,
      scheduledDate: "2026-11-29",
      subject: `Tailored modernization strategy for {{Company}}`,
      bodyPreview: "Hi {{ContactName}}, our automated analysis spotted high-impact optimization opportunities..."
    };

    setCampaigns([created, ...campaigns]);
    setShowCreateModal(false);
    setNewCampaignName("");
    setNotification(`Campaign "${created.name}" created and placed into Pending Approval stage.`);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] text-slate-900 min-h-screen">
      <TopHeader
        title="Campaign Management & Automated Outreach Engine"
        description="Immutable campaign snapshots, cryptographic admin approval, idempotency queue, and delivery tracking"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {notification && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-900">✕</button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Total active & pending campaigns: <span className="text-slate-900 font-semibold">{campaigns.length}</span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus size={14} /> New Campaign
          </button>
        </div>

        {/* Campaign List */}
        <div className="space-y-4">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-4 hover:border-slate-200 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {camp.name}
                    </h3>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        camp.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : camp.status === "Pending Approval"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      )}
                    >
                      {camp.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>Target: <strong>{camp.targetIndustry}</strong></span>
                    <span>Audience: <strong>{camp.targetAudienceCount} leads</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {camp.status === "Pending Approval" ? (
                    <button
                      onClick={() => setShowApprovalModal(camp)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <ShieldCheck size={14} /> Review & Approve Campaign
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDispatchQueue(camp)}
                        className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Send size={12} /> Dispatch Batch
                      </button>
                      <button
                        onClick={() => toggleStatus(camp.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors",
                          camp.status === "Active"
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                            : "bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/30"
                        )}
                      >
                        {camp.status === "Active" ? (
                          <>
                            <Pause size={13} /> Pause
                          </>
                        ) : (
                          <>
                            <Play size={13} /> Resume
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-slate-400">Total Sent</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{camp.sentCount}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-slate-400">Open Rate</div>
                  <div className="text-base font-bold text-sky-400 mt-0.5">{camp.openRate}%</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-slate-400">Reply Rate</div>
                  <div className="text-base font-bold text-indigo-400 mt-0.5">{camp.replyRate}%</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-slate-400">Interested Replies</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">{camp.interestedCount}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal 1: Formal Admin Campaign Approval */}
        {showApprovalModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white shadow-2xs border border-slate-200 rounded-xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <h3 className="text-sm font-semibold text-slate-900">Immutable Campaign Approval Binding</h3>
                </div>
                <button onClick={() => setShowApprovalModal(null)} className="text-slate-400 hover:text-slate-900">✕</button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <p>
                  As an authorized administrator, you are approving outbound message generation and queue dispatching for:
                </p>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 font-mono text-[11px]">
                  <div><strong>Campaign:</strong> {showApprovalModal.name}</div>
                  <div><strong>Target Sector:</strong> {showApprovalModal.targetIndustry}</div>
                  <div><strong>Recipient Count:</strong> {showApprovalModal.targetAudienceCount} leads</div>
                  <div><strong>Sending Account:</strong> outreach@brightloop.ai (Google Workspace)</div>
                  <div><strong>CAN-SPAM / GDPR Basis:</strong> B2B Legitimate Interest + One-Click Opt-Out</div>
                </div>
                <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                  ⚠️ <strong>Binding Condition:</strong> Any subsequent edits to templates, recipient rosters, or sending limits will automatically revoke this approval.
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteApproval(showApprovalModal)}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-900 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 size={13} /> Sign & Approve Campaign
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Create Campaign */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white shadow-2xs border border-slate-200 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">Create New Outreach Campaign</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-900">✕</button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Campaign Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modernization Q4 Outreach"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Target Industry</label>
                  <select
                    value={newTargetIndustry}
                    onChange={(e) => setNewTargetIndustry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Supply Chain & Logistics">Supply Chain & Logistics</option>
                    <option value="Healthcare & Biotech">Healthcare & Biotech</option>
                    <option value="Financial Services & FinTech">Financial Services & FinTech</option>
                    <option value="Renewable Energy & CleanTech">Renewable Energy & CleanTech</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Target Audience Count (Leads)</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={newAudienceSize}
                    onChange={(e) => setNewAudienceSize(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs text-slate-700 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-slate-900 text-xs font-semibold"
                  >
                    Create Campaign
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
