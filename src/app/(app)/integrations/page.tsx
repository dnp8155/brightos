"use client";

import React, { useState, useEffect } from "react";
import { TopHeader } from "@/components/top-header";
import {
  IntegrationConnectionItem,
  IntegrationProvider
} from "@/packages/integrations/types/integrations";
import {
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Lock,
  Plus,
  Play,
  KeyRound,
  Server,
  Zap,
  Cpu,
  Mail,
  Search,
  Database,
  Radio,
  Sliders,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationConnectionItem[]>([]);
  const [providers, setProviders] = useState<IntegrationProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Credential Modal State
  const [selectedProvider, setSelectedProvider] = useState<IntegrationConnectionItem | null>(null);
  const [credentialInput, setCredentialInput] = useState("");
  const [savingKey, setSavingKey] = useState(false);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/integrations");
      const data = await res.json();
      if (data.success) {
        setIntegrations(data.integrations || []);
        setProviders(data.providers || []);
      }
    } catch (err) {
      console.error("Failed to fetch integrations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleTestConnection = async (providerId: string) => {
    setTestingProvider(providerId);
    setTestResult(null);
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", providerId })
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(data.result);
      }
    } catch (err: any) {
      setTestResult({
        providerId,
        status: "error",
        message: err.message || "Connection check failed",
        latencyMs: 0
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSaveCredential = async () => {
    if (!selectedProvider || !credentialInput.trim()) return;
    setSavingKey(true);
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_credential",
          providerId: selectedProvider.providerId,
          secretValue: credentialInput.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setCredentialInput("");
        setSelectedProvider(null);
        fetchIntegrations();
      }
    } catch (err: any) {
      alert("Failed to encrypt and save credential: " + err.message);
    } finally {
      setSavingKey(false);
    }
  };

  const categories = ["All", "database", "ai", "email", "search", "queue", "auditing"];

  const filteredIntegrations = integrations.filter((item) => {
    if (selectedCategory === "All") return true;
    const prov = providers.find((p) => p.id === item.providerId);
    return prov?.category === selectedCategory;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19] text-slate-100 min-h-screen">
      <TopHeader
        title="Integrations Hub & API Management"
        description="Centralized catalog, credential encryption at rest, health check probes, and verified webhook gateways"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Security & Health Banner */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">Central Security & Credential Governance</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  AES-256-GCM Encrypted
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                All external secrets are encrypted at rest with hardware-derived symmetric keys. Plaintext keys are never sent to browsers.
              </p>
            </div>
          </div>

          <button
            onClick={fetchIntegrations}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh Catalog
          </button>
        </div>

        {/* Test Result Callout */}
        {testResult && (
          <div className={cn(
            "p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all",
            testResult.status === "connected"
              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/20 border-red-500/30 text-red-300"
          )}>
            <div className="flex items-center gap-2.5">
              {testResult.status === "connected" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>
                <strong>[{testResult.providerId}]</strong> {testResult.message} ({testResult.latencyMs}ms)
              </span>
            </div>
            <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap",
                selectedCategory === cat
                  ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              )}
            >
              {cat === "All" ? "All Providers (11)" : cat}
            </button>
          ))}
        </div>

        {/* 11 Integration Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((item) => {
            const prov = providers.find((p) => p.id === item.providerId);
            return (
              <div
                key={item.providerId}
                className="p-5 rounded-xl bg-[#111827] border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      {prov?.category || "Service"}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        item.status === "connected"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : item.status === "error"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      )}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 mt-2.5">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {prov?.category === "ai" ? (
                        <Cpu size={16} />
                      ) : prov?.category === "database" ? (
                        <Database size={16} />
                      ) : prov?.category === "email" ? (
                        <Mail size={16} />
                      ) : prov?.category === "search" ? (
                        <Search size={16} />
                      ) : (
                        <Server size={16} />
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100">{item.name}</h3>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                    {prov?.description || "External service integration adapter."}
                  </p>

                  {/* Masked Secret Telemetry */}
                  <div className="mt-3.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Auth Type:</span>
                      <span className="text-slate-300 capitalize">{prov?.authType || "API Key"}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Stored Key:</span>
                      <span className="text-sky-300">{item.maskedKey || "Not Configured"}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Latency:</span>
                      <span className="text-emerald-400">{item.responseTimeMs ? `${item.responseTimeMs}ms` : "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTestConnection(item.providerId)}
                    disabled={testingProvider === item.providerId}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Play size={12} className={testingProvider === item.providerId ? "animate-spin" : ""} />
                    {testingProvider === item.providerId ? "Testing..." : "Test Connection"}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedProvider(item);
                      setCredentialInput("");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Configure API Credential"
                  >
                    <KeyRound size={12} /> Configure
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Configure Encrypted Credential */}
        {selectedProvider && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-sky-400" />
                  <h3 className="text-sm font-semibold text-white">Configure {selectedProvider.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Enter your production API secret or connection string. It will be encrypted via <strong>AES-256-GCM</strong> before persisting to Supabase and will never be echoed back in plaintext.
                </p>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">New Secret / API Token</label>
                  <input
                    type="password"
                    placeholder="Enter secret (e.g. sk-proj-...)"
                    value={credentialInput}
                    onChange={(e) => setCredentialInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCredential}
                  disabled={savingKey || !credentialInput.trim()}
                  className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  {savingKey ? "Encrypting..." : "Save Encrypted Credential"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
