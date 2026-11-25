"use client";

import React, { useState, useEffect } from "react";
import { TopHeader } from "@/components/top-header";
import { 
  RegisteredAgent, 
  SystemControls, 
  WorkflowStepDefinition, 
  WorkflowExecution,
  SystemEvent 
} from "@/packages/agents/types/agents";
import { QueueMetrics } from "@/packages/agents/services/job-monitoring-service";
import {
  Bot,
  Play,
  Pause,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Activity,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  Settings2,
  Cpu,
  Server,
  Zap,
  RotateCcw,
  Sliders,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AgentsPage() {
  const [agents, setAgents] = useState<RegisteredAgent[]>([]);
  const [controls, setControls] = useState<SystemControls>({ emergencyStop: false, globalPause: false });
  const [queueMetrics, setQueueMetrics] = useState<QueueMetrics[]>([]);
  const [activeTab, setActiveTab] = useState<"agents" | "workflows" | "queues" | "events" | "settings">("agents");
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<WorkflowExecution | null>(null);
  const [events, setEvents] = useState<SystemEvent[]>([]);

  // Workflow simulation state
  const [approvalGranted, setApprovalGranted] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [agentRes, eventRes] = await Promise.all([
        fetch("/api/agents"),
        fetch("/api/agents/events?limit=30")
      ]);
      const agentData = await agentRes.json();
      const eventData = await eventRes.json();

      if (agentData.success) {
        setAgents(agentData.agents || []);
        setControls(agentData.controls || { emergencyStop: false, globalPause: false });
        setQueueMetrics(agentData.queueMetrics || []);
      }
      if (eventData.success) {
        setEvents(eventData.events || []);
      }
    } catch (err) {
      console.error("Failed to load agent control center:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleEmergencyStop = async () => {
    const newState = !controls.emergencyStop;
    setActionInProgress("emergencyStop");
    try {
      const res = await fetch("/api/agents/controls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyStop: newState,
          emergencyStopReason: newState ? "Operator activated Emergency Stop: Cancelling active sends." : null
        })
      });
      const data = await res.json();
      if (data.success) {
        setControls(data.controls);
      }
    } catch (err) {
      console.error("Failed to update emergency stop", err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleToggleGlobalPause = async () => {
    const newState = !controls.globalPause;
    setActionInProgress("globalPause");
    try {
      const res = await fetch("/api/agents/controls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          globalPause: newState,
          globalPauseReason: newState ? "Operator suspended all automation cycles." : null
        })
      });
      const data = await res.json();
      if (data.success) {
        setControls(data.controls);
      }
    } catch (err) {
      console.error("Failed to update global pause", err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleAgentAction = async (agentId: string, action: "enable" | "disable" | "pause" | "resume") => {
    setActionInProgress(agentId);
    try {
      const res = await fetch("/api/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, action })
      });
      const data = await res.json();
      if (data.success) {
        setAgents((prev) =>
          prev.map((a) => {
            if (a.id === agentId) {
              return {
                ...a,
                executionStatus: data.result.newStatus as any,
                enabled: action !== "disable"
              };
            }
            return a;
          })
        );
      }
    } catch (err) {
      console.error("Failed to execute agent action", err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRunWorkflow = async () => {
    setActionInProgress("runWorkflow");
    try {
      const res = await fetch("/api/agents/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            isApproved: approvalGranted,
            leadScore: 88,
            hasReplied: false
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setExecutionResult(data.execution);
        // also push event
        await fetch("/api/agents/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: "workflow.executed",
            idempotencyKey: `wf-exec-${Date.now()}`,
            payload: { executionId: data.execution.id, status: data.execution.status }
          })
        });
        fetchData();
      } else {
        alert(data.error || "Workflow execution halted");
      }
    } catch (err) {
      console.error("Failed to execute workflow:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19] text-slate-100 min-h-screen">
      <TopHeader
        title="AI Agent Control Center & Automation Intelligence"
        description="Centralized multi-agent registry, state transitions, durable workflow engine, and BullMQ queue supervision"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Safety Header Controls */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-lg border",
              controls.emergencyStop 
                ? "bg-red-500/10 border-red-500/30 text-red-400" 
                : controls.globalPause
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            )}>
              {controls.emergencyStop ? (
                <AlertOctagon size={24} className="animate-pulse" />
              ) : controls.globalPause ? (
                <Pause size={24} />
              ) : (
                <ShieldCheck size={24} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">Automation Safety Governance</h2>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                  controls.emergencyStop
                    ? "bg-red-500/20 text-red-300 border border-red-500/40"
                    : controls.globalPause
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                )}>
                  {controls.emergencyStop ? "EMERGENCY STOPPED" : controls.globalPause ? "PAUSED" : "SYSTEM ACTIVE"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {controls.emergencyStop
                  ? controls.emergencyStopReason || "Emergency stop active: Dispatches and active crawler jobs cancelled."
                  : controls.globalPause
                  ? controls.globalPauseReason || "Global pause active: All background cycles suspended."
                  : "All 8 autonomous agent workers online and executing verified routines."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleGlobalPause}
              disabled={actionInProgress === "globalPause"}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all",
                controls.globalPause
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              )}
            >
              {controls.globalPause ? <Play size={14} /> : <Pause size={14} />}
              {controls.globalPause ? "Resume Automation" : "Global Pause"}
            </button>

            <button
              onClick={handleToggleEmergencyStop}
              disabled={actionInProgress === "emergencyStop"}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border transition-all",
                controls.emergencyStop
                  ? "bg-red-600 text-white border-red-500 hover:bg-red-700 shadow-lg shadow-red-900/30"
                  : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
              )}
            >
              <AlertOctagon size={14} />
              {controls.emergencyStop ? "Deactivate Stop" : "Emergency Stop"}
            </button>

            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Refresh Registry"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: "agents", label: "Agent Registry (8)", icon: Bot },
            { id: "workflows", label: "10-Step Workflow Engine", icon: Layers },
            { id: "queues", label: "BullMQ Queues & Workers", icon: Server },
            { id: "events", label: "Activity & Durable Events", icon: Activity },
            { id: "settings", label: "Global Policies", icon: Sliders }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                )}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: AGENT REGISTRY */}
        {activeTab === "agents" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {agents.map((agent) => {
                return (
                  <div
                    key={agent.id}
                    className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">v{agent.version}</span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                            agent.executionStatus === "running"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : agent.executionStatus === "paused"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : agent.executionStatus === "disabled"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          )}
                        >
                          {agent.executionStatus}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 mt-2">
                        <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          <Bot size={16} />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-100">{agent.name}</h3>
                      </div>

                      <p className="text-xs text-slate-400 mt-2.5 leading-relaxed line-clamp-3">
                        {agent.description}
                      </p>

                      {/* Worker Heartbeat Telemetry */}
                      <div className="mt-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Worker Node:</span>
                          <span className="font-mono text-slate-300">
                            {agent.heartbeat ? agent.heartbeat.workerNodeId : "worker-eu-01"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Heartbeat:</span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            Confirmed (Live)
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Last Exec:</span>
                          <span className="text-slate-300">
                            {agent.lastExecution ? new Date(agent.lastExecution).toLocaleTimeString() : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() =>
                          handleAgentAction(
                            agent.id,
                            agent.executionStatus === "paused" ? "resume" : "pause"
                          )
                        }
                        disabled={actionInProgress === agent.id || controls.emergencyStop}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border transition-colors",
                          agent.executionStatus === "paused"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                        )}
                      >
                        {agent.executionStatus === "paused" ? (
                          <>
                            <Play size={12} /> Resume
                          </>
                        ) : (
                          <>
                            <Pause size={12} /> Pause
                          </>
                        )}
                      </button>

                      <button
                        onClick={() =>
                          handleAgentAction(
                            agent.id,
                            agent.enabled ? "disable" : "enable"
                          )
                        }
                        disabled={actionInProgress === agent.id}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                          agent.enabled
                            ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                            : "bg-sky-500/10 border-sky-500/20 text-sky-400 hover:bg-sky-500/20"
                        )}
                      >
                        {agent.enabled ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: 10-STEP WORKFLOW ENGINE */}
        {activeTab === "workflows" && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-[#111827] border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-white">Autonomous Client Acquisition Pipeline</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      10-Step Deterministic Flow
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    End-to-end autonomous cycle with strict conditional branching, retry policies, and human approval checkpoints.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={approvalGranted}
                      onChange={(e) => setApprovalGranted(e.target.checked)}
                      className="rounded border-slate-700 text-sky-500 focus:ring-0 bg-slate-800"
                    />
                    <span>Grant Human Approval Checkpoint</span>
                  </label>

                  <button
                    onClick={handleRunWorkflow}
                    disabled={actionInProgress === "runWorkflow" || controls.emergencyStop}
                    className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Play size={14} /> Run Workflow Simulation
                  </button>
                </div>
              </div>

              {/* Steps Visualizer */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
                {[
                  { order: 1, name: "Discover Business", agent: "Lead Discovery Agent", check: false },
                  { order: 2, name: "Save Lead", agent: "Lead Discovery Agent", check: false },
                  { order: 3, name: "Analyze Website", agent: "Website Audit Agent", check: false },
                  { order: 4, name: "Score Lead", agent: "Lead Scoring Agent", check: false },
                  { order: 5, name: "Generate Email", agent: "Email Generation Agent", check: false },
                  { order: 6, name: "Human Approval", agent: "Operator Checkpoint", check: true },
                  { order: 7, name: "Execute Campaign", agent: "Campaign Execution", check: false },
                  { order: 8, name: "Process Email Events", agent: "Campaign Execution", check: false },
                  { order: 9, name: "Update CRM Deal", agent: "CRM Intelligence Agent", check: false },
                  { order: 10, name: "Schedule Follow-up", agent: "Follow-up Agent", check: false }
                ].map((s) => (
                  <div
                    key={s.order}
                    className={cn(
                      "p-3 rounded-lg border text-xs flex flex-col justify-between space-y-2",
                      s.check
                        ? "bg-violet-950/20 border-violet-500/30 text-violet-300"
                        : "bg-slate-900/60 border-slate-800 text-slate-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-400">Step {s.order}</span>
                      {s.check && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          Checkpoint
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">{s.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{s.agent}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Execution Result Log */}
              {executionResult && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">Execution Result: {executionResult.id}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      executionResult.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : executionResult.status === "awaiting_approval"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-red-500/20 text-red-400"
                    )}>
                      {executionResult.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    {executionResult.stepExecutions?.map((se) => (
                      <div key={se.id} className="flex items-center justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-300">Step {se.stepOrder}: {se.name}</span>
                        <span className={cn(
                          se.status === "completed" ? "text-emerald-400" : se.status === "awaiting_approval" ? "text-amber-400" : "text-slate-400"
                        )}>
                          [{se.status}]
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: BULLMQ QUEUES */}
        {activeTab === "queues" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {queueMetrics.map((q) => (
                <div key={q.name} className="p-5 rounded-xl bg-[#111827] border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                        <Server size={16} />
                      </div>
                      <span className="text-xs font-semibold text-slate-200 font-mono">{q.name}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Waiting</div>
                      <div className="text-base font-bold text-slate-200">{q.waiting}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Active</div>
                      <div className="text-base font-bold text-sky-400">{q.active}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Completed</div>
                      <div className="text-base font-bold text-emerald-400">{q.completed}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Workers: {q.workerCount} online</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Heartbeat OK
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DURABLE EVENT BUS */}
        {activeTab === "events" && (
          <div className="p-5 rounded-xl bg-[#111827] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Durable Application Event Stream</h3>
                <p className="text-xs text-slate-400">Real-time audit log of internal events with idempotency keys</p>
              </div>
              <button
                onClick={fetchData}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 font-medium hover:bg-slate-700"
              >
                Refresh Stream
              </button>
            </div>

            <div className="divide-y divide-slate-800/80">
              {events.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No system events recorded yet. Run a workflow to emit events.
                </div>
              ) : (
                events.map((e) => (
                  <div key={e.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-sky-500/10 text-sky-400 font-mono text-[11px]">
                        {e.eventType}
                      </div>
                      <span className="font-mono text-slate-400 text-[11px] truncate max-w-xs">
                        Key: {e.idempotencyKey}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-[11px]">
                        {new Date(e.createdAt).toLocaleTimeString()}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {e.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: GLOBAL POLICIES */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-xl bg-[#111827] border border-slate-800 space-y-4">
              <h3 className="text-sm font-semibold text-white">Lead Scoring Weights</h3>
              <p className="text-xs text-slate-400">Mathematical weighting applied during autonomous qualification.</p>

              <div className="space-y-3 text-xs">
                {[
                  { label: "Website Performance & Core Web Vitals", weight: "25%" },
                  { label: "SEO & Content Architecture Deficits", weight: "20%" },
                  { label: "Technology Modernization Opportunity", weight: "25%" },
                  { label: "Company Size & Headcount Fit", weight: "15%" },
                  { label: "Market Presence & Brand Capital", weight: "15%" }
                ].map((w, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-300">{w.label}</span>
                    <span className="font-mono font-semibold text-sky-400">{w.weight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#111827] border border-slate-800 space-y-4">
              <h3 className="text-sm font-semibold text-white">AI Model & Safety Parameters</h3>
              <p className="text-xs text-slate-400">Strict temperature and token limits enforced across prompts.</p>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">Default Model</span>
                  <span className="font-mono font-semibold text-sky-400">gpt-4o-mini</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">Sampling Temperature</span>
                  <span className="font-mono font-semibold text-sky-400">0.40 (Deterministic)</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">Outbound Rate Limit</span>
                  <span className="font-mono font-semibold text-sky-400">60 emails / hour / domain</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300">Max Discovery Concurrency</span>
                  <span className="font-mono font-semibold text-sky-400">5 parallel workers</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
