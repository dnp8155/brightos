"use client";

import React, { useState, useEffect } from "react";
import { TopHeader } from "@/components/top-header";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { CRMDeal, PipelineStage, PIPELINE_STAGES } from "@/packages/crm/types/crm";
import {
  Users,
  Search,
  Filter,
  Kanban,
  Table,
  DollarSign,
  TrendingUp,
  FileCheck2,
  Calendar,
  Clock,
  Sparkles,
  Phone,
  Mail,
  ExternalLink,
  X,
  Save,
  MessageSquare,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Briefcase,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CRMPage() {
  const [deals, setDeals] = useState<CRMDeal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<CRMDeal | null>(null);
  const [crmTab, setCrmTab] = useState<"pipeline" | "tasks" | "meetings" | "proposals" | "ai">("pipeline");
  const [tasks, setTasks] = useState<{ id: string; title: string; due: string; done: boolean }[]>([
    { id: "t1", title: "Follow up on Next.js Modernization scope", due: "Today", done: false },
    { id: "t2", title: "Send Lighthouse audit PDF to prospect", due: "Tomorrow", done: false }
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [meetings, setMeetings] = useState<{ id: string; title: string; date: string; type: string }[]>([
    { id: "m1", title: "Discovery Call — Architecture Review", date: "Tomorrow, 3:00 PM", type: "Video Call" }
  ]);
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [notification, setNotification] = useState<string | null>(null);

  // Proposal Creation in Drawer State
  const [proposalAmount, setProposalAmount] = useState<number>(25000);
  const [proposalCurrency, setProposalCurrency] = useState("INR");
  const [proposalService, setProposalService] = useState("Next.js Decoupled Modernization");
  const [noteDraft, setNoteDraft] = useState("");

  const fetchDeals = async () => {
    try {
      const res = await fetch("/api/crm/deals");
      const data = await res.json();
      if (data.deals) {
        setDeals(data.deals);
      }
    } catch {
      //
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const targetStage = destination.droppableId as PipelineStage;

    // Optimistic UI update
    setDeals((prev) =>
      prev.map((deal) => (deal.id === draggableId ? { ...deal, stage: targetStage } : deal))
    );

    if (selectedDeal && selectedDeal.id === draggableId) {
      setSelectedDeal((prev) => (prev ? { ...prev, stage: targetStage } : null));
    }

    try {
      const res = await fetch("/api/crm/deals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: draggableId,
          newStage: targetStage
        })
      });

      if (res.ok) {
        setNotification(`Moved deal to '${targetStage}' (Audit trail recorded).`);
      }
    } catch (err: any) {
      console.error("Failed persisting stage drag-and-drop:", err);
    }
  };

  const handleCreateProposal = () => {
    if (!selectedDeal) return;

    const updatedProposal = {
      id: `prop_${Date.now()}`,
      amount: proposalAmount,
      currency: proposalCurrency,
      service: proposalService,
      status: "Sent" as const,
      sentAt: new Date().toISOString()
    };

    const updatedDeal: CRMDeal = {
      ...selectedDeal,
      dealValue: proposalAmount,
      currency: proposalCurrency,
      stage: "Proposal Sent",
      proposal: updatedProposal
    };

    setSelectedDeal(updatedDeal);
    setDeals(deals.map((d) => (d.id === updatedDeal.id ? updatedDeal : d)));
    setNotification(`Proposal for ${proposalCurrency} ${proposalAmount.toLocaleString()} recorded.`);
  };

  const handleGeneratePaymentLink = async () => {
    if (!selectedDeal) return;
    try {
      const res = await fetch("/api/crm/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: selectedDeal.id,
          businessName: selectedDeal.businessName,
          contactName: (selectedDeal as any).contact?.name || selectedDeal.businessName,
          contactEmail: (selectedDeal as any).contact?.email || "",
          amountInr: proposalAmount || selectedDeal.dealValue || 25000,
          description: `${proposalService} - ${selectedDeal.businessName}`
        })
      });
      const data = await res.json();
      if (data.paymentUrl) {
        await navigator.clipboard?.writeText(data.paymentUrl).catch(() => {});
        setNotification(`INR Payment Link (${data.provider.toUpperCase()}) copied: ${data.paymentUrl}`);
      } else {
        setNotification(data.error || "Failed to generate payment link");
      }
    } catch {
      setNotification("Network error generating payment link");
    }
  };

  const handleAddNote = () => {
    if (!selectedDeal || !noteDraft.trim()) return;
    const newNotes = selectedDeal.notes
      ? `${selectedDeal.notes}\n• ${noteDraft.trim()}`
      : `• ${noteDraft.trim()}`;

    const updatedDeal = { ...selectedDeal, notes: newNotes };
    setSelectedDeal(updatedDeal);
    setDeals(deals.map((d) => (d.id === updatedDeal.id ? updatedDeal : d)));
    setNoteDraft("");
    setNotification("Note recorded on deal timeline.");
  };

  const filteredDeals = deals.filter((d) => {
    const matchSearch =
      d.businessName.toLowerCase().includes(search.toLowerCase()) ||
      d.primaryContact.name.toLowerCase().includes(search.toLowerCase()) ||
      d.domain.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || d.stage === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPipelineValue = deals.reduce((acc, d) => acc + d.dealValue, 0);

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] text-slate-900 min-h-screen">
      <TopHeader
        title="CRM Intelligence & Sales Pipeline Management"
        description="Comprehensive client conversion management with drag-and-drop Kanban, meeting tracker, proposal ledger, and revenue forecasting"
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

        {/* Pipeline Analytics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white shadow-2xs border border-slate-200">
            <span className="text-xs text-slate-400">Total Pipeline Value</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              ₹{totalPipelineValue.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-sky-400 mt-1 inline-block">Across all 10 stages</span>
          </div>

          <div className="p-4 rounded-xl bg-white shadow-2xs border border-slate-200">
            <span className="text-xs text-slate-400">Active Opportunities</span>
            <div className="text-2xl font-bold text-sky-400 mt-1">
              {deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost").length}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">Prospects in motion</span>
          </div>

          <div className="p-4 rounded-xl bg-white shadow-2xs border border-slate-200">
            <span className="text-xs text-slate-400">Proposals in Review</span>
            <div className="text-2xl font-bold text-indigo-400 mt-1">
              {deals.filter((d) => d.stage === "Proposal Sent" || d.stage === "Negotiation").length}
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 inline-block">High probability</span>
          </div>

          <div className="p-4 rounded-xl bg-white shadow-2xs border border-slate-200">
            <span className="text-xs text-slate-400">Won Conversion Revenue</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              ₹{deals.filter((d) => d.stage === "Won").reduce((acc, d) => acc + d.dealValue, 0).toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 inline-block">Client conversions confirmed</span>
          </div>
        </div>

        {/* CRM Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
          {[
            { id: "pipeline", label: "Sales Pipeline" },
            { id: "tasks", label: `Tasks & Follow-ups (${tasks.filter((t) => !t.done).length})` },
            { id: "meetings", label: `Meetings (${meetings.length})` },
            { id: "proposals", label: "Proposals" },
            { id: "ai", label: "AI Sales Assistant" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCrmTab(tab.id as any)}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                crmTab === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {crmTab === "tasks" && (
          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900">Tasks & Follow-ups</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="New follow-up task..."
                  className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]"
                />
                <button
                  onClick={() => {
                    if (!newTaskTitle.trim()) return;
                    setTasks([{ id: `t-${Date.now()}`, title: newTaskTitle.trim(), due: "Today", done: false }, ...tasks]);
                    setNewTaskTitle("");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0284c7] text-white text-xs font-semibold"
                >
                  Add Task
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {tasks.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => setTasks(tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
                      className="rounded border-slate-300"
                    />
                    <span className={cn("font-medium", t.done ? "line-through text-slate-400" : "text-slate-900")}>
                      {t.title}
                    </span>
                  </label>
                  <span className="text-[11px] text-slate-400">{t.due}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {crmTab === "meetings" && (
          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900">Scheduled Meetings</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMeetingTitle}
                  onChange={(e) => setNewMeetingTitle(e.target.value)}
                  placeholder="Meeting title..."
                  className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]"
                />
                <button
                  onClick={() => {
                    if (!newMeetingTitle.trim()) return;
                    setMeetings([{ id: `m-${Date.now()}`, title: newMeetingTitle.trim(), date: "Scheduled", type: "Video Call" }, ...meetings]);
                    setNewMeetingTitle("");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0284c7] text-white text-xs font-semibold"
                >
                  Schedule
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {meetings.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">{m.title}</span>
                  <span className="text-[11px] text-slate-500">{m.date} • {m.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {crmTab === "proposals" && (
          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Proposals & Quotations</h3>
            <p className="text-xs text-slate-500">Click any deal in the Sales Pipeline tab to record a multi-currency formal proposal.</p>
          </div>
        )}

        {crmTab === "ai" && (
          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">AI Sales Assistant</h3>
            <p className="text-xs text-slate-600">
              Active opportunities: <strong>{deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost").length}</strong>.
              Weighted pipeline is calculated from deal value × stage probability. Use <strong>Inbox & Replies</strong> to run AI sentiment analysis on prospect replies.
            </p>
          </div>
        )}

        {crmTab === "pipeline" && (
          <>

        {/* Toolbar: Search, Filters & View Toggle */}
        <div className="p-4 rounded-xl bg-white shadow-2xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search companies, contacts, domains..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Stage:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
              >
                <option value="All">All Stages</option>
                {PIPELINE_STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* View Switcher */}
            <div className="flex items-center rounded-lg bg-slate-50 border border-slate-200 p-0.5">
              <button
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors",
                  viewMode === "kanban" ? "bg-sky-500 text-slate-900" : "text-slate-400 hover:text-slate-900"
                )}
              >
                <Kanban size={13} /> Kanban
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors",
                  viewMode === "table" ? "bg-sky-500 text-slate-900" : "text-slate-400 hover:text-slate-900"
                )}
              >
                <Table size={13} /> Table
              </button>
            </div>
          </div>
        </div>

        {/* View 1: Drag-and-Drop Kanban Board */}
        {viewMode === "kanban" ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 select-none">
              {PIPELINE_STAGES.map((stage) => {
                const stageDeals = filteredDeals.filter((d) => d.stage === stage);
                const stageValue = stageDeals.reduce((acc, d) => acc + d.dealValue, 0);

                return (
                  <Droppable key={stage} droppableId={stage}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "w-72 shrink-0 rounded-xl bg-white shadow-2xs border p-3 flex flex-col min-h-[500px] transition-colors",
                          snapshot.isDraggingOver ? "border-sky-500/60 bg-sky-500/5" : "border-slate-200"
                        )}
                      >
                        {/* Stage Column Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-800">{stage}</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] text-slate-400 font-medium">
                              {stageDeals.length}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400">
                            ${(stageValue / 1000).toFixed(0)}k
                          </span>
                        </div>

                        {/* Draggable Cards */}
                        <div className="flex-1 space-y-2.5">
                          {stageDeals.map((deal, idx) => (
                            <Draggable key={deal.id} draggableId={deal.id} index={idx}>
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  onClick={() => setSelectedDeal(deal)}
                                  className={cn(
                                    "p-3 rounded-lg bg-slate-50 border cursor-pointer transition-all space-y-2 shadow-sm",
                                    dragSnapshot.isDragging ? "shadow-2xl border-sky-400 ring-2 ring-sky-500/20" : "border-slate-200 hover:border-slate-200",
                                    selectedDeal?.id === deal.id && "border-sky-500/50 bg-sky-500/5"
                                  )}
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <div className="text-xs font-semibold text-slate-900 leading-tight">
                                      {deal.businessName}
                                    </div>
                                    <span className="text-[10px] font-bold text-sky-400 shrink-0">
                                      {deal.opportunityScore}/100
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-slate-400 truncate">
                                    {deal.primaryContact.name} &bull; {deal.primaryContact.role}
                                  </div>

                                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px]">
                                    <span className="text-emerald-400 font-semibold">
                                      ${deal.dealValue.toLocaleString()}
                                    </span>
                                    <span className="text-slate-500 truncate max-w-[110px]">
                                      {deal.country}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        ) : (
          /* View 2: Traditional Tabular CRM */
          <div className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                  <th className="pb-3 px-3">Company</th>
                  <th className="pb-3 px-3">Primary Contact</th>
                  <th className="pb-3 px-3">Stage</th>
                  <th className="pb-3 px-3">Deal Value</th>
                  <th className="pb-3 px-3">Target Service</th>
                  <th className="pb-3 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    onClick={() => setSelectedDeal(deal)}
                    className={cn(
                      "hover:bg-slate-100/30 cursor-pointer transition-colors",
                      selectedDeal?.id === deal.id && "bg-sky-500/10"
                    )}
                  >
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{deal.businessName}</div>
                      <div className="text-[10px] text-slate-400">{deal.domain} &bull; {deal.country}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800">{deal.primaryContact.name}</div>
                      <div className="text-[10px] text-slate-400">{deal.primaryContact.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
                        {deal.stage}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-emerald-400">
                      ${deal.dealValue.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-700 max-w-xs truncate">
                      {deal.targetService}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDeal(deal);
                        }}
                        className="text-sky-400 hover:text-sky-300 text-xs font-medium"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
          </>
        )}

        {/* Comprehensive Business Profile Drawer */}
        {selectedDeal && (
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl p-6 z-50 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      {selectedDeal.businessName}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {selectedDeal.stage}
                    </span>
                  </div>
                  <a
                    href={`https://${selectedDeal.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-sky-400 flex items-center gap-1 font-mono mt-1 hover:underline"
                  >
                    {selectedDeal.domain} <ExternalLink size={11} />
                  </a>
                </div>
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Deal Value Strip */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Estimated Deal Value</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">
                    ${selectedDeal.dealValue.toLocaleString()} {selectedDeal.currency}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Opportunity Score</div>
                  <div className="text-lg font-bold text-sky-400 mt-0.5">
                    {selectedDeal.opportunityScore}/100
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-3.5 rounded-lg bg-slate-50/80 border border-slate-200 space-y-2">
                <span className="text-xs font-semibold text-slate-800">Decision Maker Profile</span>
                <div className="text-xs text-slate-900 font-medium">
                  {selectedDeal.primaryContact.name} &bull; {selectedDeal.primaryContact.role}
                </div>
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-slate-500" />
                    <span>{selectedDeal.primaryContact.email}</span>
                  </div>
                  {selectedDeal.primaryContact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-500" />
                      <span>{selectedDeal.primaryContact.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Proposal Management Section */}
              <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200 space-y-3">
                <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                  <Briefcase size={14} /> Commercial Proposal Tracking
                </span>

                {selectedDeal.proposal ? (
                  <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{selectedDeal.proposal.service}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {selectedDeal.proposal.status}
                      </span>
                    </div>
                    <div className="text-emerald-400 font-bold">
                      {selectedDeal.proposal.currency} {selectedDeal.proposal.amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">Sent on {selectedDeal.proposal.sentAt?.split("T")[0]}</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Proposal Value</label>
                        <input
                          type="number"
                          value={proposalAmount}
                          onChange={(e) => setProposalAmount(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Currency</label>
                        <select
                          value={proposalCurrency}
                          onChange={(e) => setProposalCurrency(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-900"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="SGD">SGD (S$)</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={handleCreateProposal}
                      className="w-full py-1.5 rounded bg-sky-500 hover:bg-sky-600 text-slate-900 text-xs font-semibold"
                    >
                      Record Formal Proposal
                    </button>
                    <button
                      onClick={handleGeneratePaymentLink}
                      className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                    >
                      Generate & Copy INR Payment Link
                    </button>
                  </div>
                )}
              </div>

              {/* Notes & Activity History */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Deal Notes & Activity Timeline
                </span>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-line max-h-36 overflow-y-auto">
                  {selectedDeal.notes || "No notes logged for this deal."}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add meeting notes or call log..."
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-600 text-slate-900 text-xs font-medium flex items-center gap-1"
                  >
                    <Save size={13} /> Save
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[10px] text-slate-500">
                Last Activity: {selectedDeal.lastActivityAt.split("T")[0]}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="/email-studio"
                  className="px-4 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-xs font-semibold text-white transition-colors"
                >
                  Draft AI Pitch
                </a>
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-800 transition-colors"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
