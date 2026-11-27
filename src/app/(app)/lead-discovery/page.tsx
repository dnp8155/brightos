"use client";

import React, { useState, useEffect, useRef } from "react";
import { TopHeader } from "@/components/top-header";
import { DEMO_LEADS } from "@/lib/demoData";
import { Lead } from "@/types";
import {
  Search,
  Globe,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  Filter,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface JobState {
  id: string;
  status: "queued" | "running" | "paused" | "completed" | "failed" | "cancelled";
  criteria: any;
  providers: string[];
  totalFound: number;
  duplicatesSkipped: number;
  persistedCount: number;
  progressPercent: number;
  results: any[];
  logs: { time: string; stage: string; message: string }[];
  createdAt: string;
}

export default function LeadDiscoveryPage() {
  // Search Criteria Form State
  const [country, setCountry] = useState("United States");
  const [stateRegion, setStateRegion] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("Supply Chain & Logistics");
  const [businessCategory, setBusinessCategory] = useState("Enterprise Software");
  const [companySize, setCompanySize] = useState("50-200");
  const [websiteAvailability, setWebsiteAvailability] = useState<"any" | "has_website" | "missing_website">("any");
  const [resultLimit, setResultLimit] = useState<number>(10);
  const [discoveredLeads, setDiscoveredLeads] = useState<any[]>([]);
  const [leadHistory, setLeadHistory] = useState<any[]>([]);
  const [activeViewTab, setActiveViewTab] = useState<"current" | "history">("current");
  const [tableSearch, setTableSearch] = useState("");
  const [tableFilter, setTableFilter] = useState<"all" | "has_website" | "no_website">("all");

  // Load persisted leads & history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("brightloop_discovered_leads");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setDiscoveredLeads(parsed);
      }
      const hist = localStorage.getItem("brightloop_lead_history");
      if (hist) {
        const parsedHist = JSON.parse(hist);
        if (Array.isArray(parsedHist)) setLeadHistory(parsedHist);
      }
    } catch {}

    // Also fetch persisted leads from Supabase /api/leads into Lead History
    fetch("/api/leads")
      .then((r) => r.json())
      .then((d) => {
        if (d.leads && Array.isArray(d.leads) && d.leads.length > 0) {
          setLeadHistory((prev) => {
            const existingKeys = new Set(prev.map((p) => `${p.companyName || p.businessName}-${p.publicPhone || p.websiteUrl || ""}`));
            const mapped = d.leads.map((l: any) => ({
              id: l.id,
              companyName: l.company_name || l.businessName,
              websiteUrl: l.website_url || l.website,
              industry: l.industry,
              country: l.country,
              city: l.city,
              description: l.description,
              publicEmail: l.public_email,
              publicPhone: l.public_phone,
              providerName: l.provider_name || "Supabase",
              initialQualificationScore: l.initial_qualification_score || 80
            }));
            const fresh = mapped.filter(
              (m: any) => !existingKeys.has(`${m.companyName}-${m.publicPhone || m.websiteUrl || ""}`)
            );
            return [...prev, ...fresh];
          });
        }
      })
      .catch(() => {});
  }, []);

  // Save current discovered leads & append to persistent history
  useEffect(() => {
    try {
      if (discoveredLeads.length > 0) {
        localStorage.setItem("brightloop_discovered_leads", JSON.stringify(discoveredLeads));
        setLeadHistory((prev) => {
          const existingKeys = new Set(prev.map((p) => `${p.companyName || p.businessName}-${p.publicPhone || p.websiteUrl || ""}`));
          const newItems = discoveredLeads.filter(
            (l) => !existingKeys.has(`${l.companyName || l.businessName}-${l.publicPhone || l.websiteUrl || ""}`)
          );
          if (newItems.length === 0) return prev;
          const updated = [...newItems, ...prev].slice(0, 500);
          localStorage.setItem("brightloop_lead_history", JSON.stringify(updated));
          return updated;
        });
      }
    } catch {}
  }, [discoveredLeads]);
  const [targetService, setTargetService] = useState("Next.js Modernization & Real-Time Tracking Portal");
  const [requirePublicEmail, setRequirePublicEmail] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([
    "Search API (SerpAPI / Bing)",
    "Google Places API",
    "Public Business Directory Adapter"
  ]);

  // Job & Results State
  const [activeJob, setActiveJob] = useState<JobState | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [recentJobs, setRecentJobs] = useState<JobState[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const LOCATION_MAP: Record<string, Record<string, string[]>> = {
    India: {
      Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar"],
      Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
      Delhi: ["New Delhi", "Dwarka", "Rohini"],
      Karnataka: ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru"],
      "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
      Telangana: ["Hyderabad", "Warangal"],
      Rajasthan: ["Jaipur", "Udaipur", "Jodhpur", "Kota"]
    },
    "United States": {
      California: ["San Francisco", "Los Angeles", "San Diego", "San Jose"],
      Texas: ["Austin", "Houston", "Dallas", "San Antonio"],
      "New York": ["New York", "Buffalo", "Rochester"],
      Florida: ["Miami", "Orlando", "Tampa"]
    },
    "United Kingdom": {
      England: ["London", "Manchester", "Birmingham", "Leeds"],
      Scotland: ["Edinburgh", "Glasgow"]
    },
    "United Arab Emirates": {
      Dubai: ["Dubai"],
      "Abu Dhabi": ["Abu Dhabi"],
      Sharjah: ["Sharjah"]
    },
    Canada: {
      Ontario: ["Toronto", "Ottawa", "Mississauga"],
      "British Columbia": ["Vancouver", "Victoria"]
    },
    Australia: {
      "New South Wales": ["Sydney", "Newcastle"],
      Victoria: ["Melbourne", "Geelong"]
    },
    Germany: {
      Bavaria: ["Munich", "Nuremberg"],
      Berlin: ["Berlin"]
    }
  };

  const stateSuggestions = Object.keys(LOCATION_MAP[country] || {});
  const citySuggestions =
    (stateRegion && LOCATION_MAP[country]?.[stateRegion]) ||
    Object.values(LOCATION_MAP[country] || {}).flat();

  const countries = [
    "India",
    "United States",
    "United Kingdom",
    "United Arab Emirates",
    "Canada",
    "Australia",
    "Germany",
    "Singapore",
    "Sweden",
    "Japan",
    "France",
    "Netherlands"
  ];

  const industries = [
    "Beauty Salon & Spa",
    "Restaurants & Cafes",
    "Dental & Medical Clinics",
    "Real Estate & Construction",
    "Fitness & Gyms",
    "Hotels & Hospitality",
    "Auto Repair & Dealerships",
    "Education & Coaching",
    "Supply Chain & Logistics",
    "Healthcare & Biotech",
    "Financial Services & FinTech",
    "E-Commerce & Retail",
    "Industrial Manufacturing",
    "Software & SaaS"
  ];

  // Poll active discovery job
  useEffect(() => {
    if (!activeJob || activeJob.status === "completed" || activeJob.status === "failed" || activeJob.status === "cancelled") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/discovery/jobs/${activeJob.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.job) {
            setActiveJob(data.job);
            if (data.job.results && data.job.results.length > 0) {
              setDiscoveredLeads(data.job.results);
            }
          }
        }
      } catch (err) {
        console.error("Failed polling discovery job:", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeJob]);

  // Fetch recent jobs on load
  const loadRecentJobs = async () => {
    try {
      const res = await fetch("/api/discovery/jobs");
      if (res.ok) {
        const data = await res.json();
        if (data.jobs && data.jobs.length > 0) {
          setRecentJobs(data.jobs);
          if (!activeJob) {
            setActiveJob(data.jobs[0]);
            if (data.jobs[0].results?.length) {
              setDiscoveredLeads(data.jobs[0].results);
            }
          }
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadRecentJobs();
  }, []);

  const handleStartDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);
    setNotification(null);

    try {
      const res = await fetch("/api/discovery/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          state: stateRegion || undefined,
          city: city || undefined,
          industry,
          businessCategory: businessCategory || undefined,
          companySize,
          websiteAvailability,
          targetService,
          requirePublicEmail,
          providers: selectedProviders,
          limit: 15
        })
      });

      const data = await res.json();
      if (res.ok && data.job) {
        setActiveJob(data.job);
        setRecentJobs((prev) => [data.job, ...prev]);
        setNotification("Discovery job dispatched to background queue.");
      } else {
        alert(data.error || "Failed to start discovery");
      }
    } catch (err: any) {
      alert("Error starting discovery job: " + err.message);
    } finally {
      setIsStarting(false);
    }
  };

  const handleJobAction = async (action: "pause" | "resume" | "cancel" | "retry") => {
    if (!activeJob) return;
    try {
      const res = await fetch(`/api/discovery/jobs/${activeJob.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (res.ok && data.job) {
        setActiveJob(data.job);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setNotification("Uploading and parsing CSV lead dataset...");
      const res = await fetch("/api/discovery/import", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        if (data.result?.newLeads) {
          setDiscoveredLeads(data.result.newLeads);
        }
      } else {
        alert(data.error || "CSV upload failed");
      }
    } catch (err: any) {
      alert("CSV upload exception: " + err.message);
    }
  };

  const toggleProvider = (providerName: string) => {
    setSelectedProviders((prev) =>
      prev.includes(providerName)
        ? prev.filter((p) => p !== providerName)
        : [...prev, providerName]
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] text-slate-900 min-h-screen">
      <TopHeader
        title="Worldwide Lead Discovery Engine"
        description="Multi-provider discovery across search engines, business directories, and Google Places with automated deduplication"
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

        {/* Top Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Globe size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Worldwide Business Prospecting</h2>
              <p className="text-xs text-slate-400">
                Runs background provider jobs with normalized domain deduplication. No CAPTCHA or restricted scraping.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-800 font-medium flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <Upload size={13} /> Import CSV
            </button>
            <a
              href="/api/leads/export"
              className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-medium flex items-center gap-1.5 transition-colors border border-sky-500/30"
            >
              <Download size={13} /> Export Qualified CSV
            </a>
          </div>
        </div>

        {/* Search Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form: Search Criteria (2 Cols on lg) */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Filter size={16} className="text-sky-400" /> Search & Targeting Parameters
            </h3>

            <form onSubmit={handleStartDiscovery} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Target Country *</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                  >
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">State / Region (Optional)</label>
                  <input
                    type="text"
                    list="state-suggestions"
                    placeholder="e.g. Gujarat / California"
                    value={stateRegion}
                    onChange={(e) => setStateRegion(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                  <datalist id="state-suggestions">
                    {stateSuggestions.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">City / Metro (Optional)</label>
                  <input
                    type="text"
                    list="city-suggestions"
                    placeholder="e.g. Ahmedabad / London"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                  <datalist id="city-suggestions">
                    {citySuggestions.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Target Industry *</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                  >
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Target BrightLoop Service</label>
                  <input
                    type="text"
                    value={targetService}
                    onChange={(e) => setTargetService(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Provider Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-medium text-slate-400">Enabled Data Providers</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Search API (SerpAPI / Bing)",
                    "Google Places API",
                    "Public Business Directory Adapter"
                  ].map((p) => {
                    const isSelected = selectedProviders.includes(p);
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => toggleProvider(p)}
                        className={cn(
                          "px-2.5 py-1 rounded text-xs font-medium border flex items-center gap-1.5 transition-colors",
                          isSelected
                            ? "bg-sky-500/10 text-sky-300 border-sky-500/30"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-700"
                        )}
                      >
                        {isSelected && <Check size={12} className="text-sky-400" />}
                        <span>{p}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional Toggles */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requirePublicEmail}
                    onChange={(e) => setRequirePublicEmail(e.target.checked)}
                    className="w-3.5 h-3.5 accent-sky-500 rounded"
                  />
                  <span>Require public direct email</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Website Status:</span>
                  <select
                    value={websiteAvailability}
                    onChange={(e) => setWebsiteAvailability(e.target.value as any)}
                    className="px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="has_website">Live Website Required</option>
                    <option value="missing_website">Missing Website Only</option>
                    <option value="any">Any Condition</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isStarting}
                  className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-slate-900 text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Search size={14} />
                  <span>{isStarting ? "Dispatching..." : "Launch Discovery Job"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Panel: Job Status & Live Execution Worker */}
          <div className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Layers size={16} className="text-emerald-400" /> Background Worker Status
                </h3>
                {activeJob && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                      activeJob.status === "running"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse"
                        : activeJob.status === "paused"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    )}
                  >
                    {activeJob.status}
                  </span>
                )}
              </div>

              {activeJob ? (
                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Worker Pipeline Progress</span>
                      <span className="font-bold text-sky-400">{activeJob.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-50 overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${activeJob.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Counters */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500">Total Scanned</div>
                      <div className="text-sm font-bold text-slate-900">{activeJob.totalFound}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-amber-500">Duplicates Skipped</div>
                      <div className="text-sm font-bold text-amber-400">{activeJob.duplicatesSkipped}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-emerald-500">Qualified Leads</div>
                      <div className="text-sm font-bold text-emerald-400">{activeJob.persistedCount || activeJob.results?.length || 0}</div>
                    </div>
                  </div>

                  {/* Worker Logs */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Live Job Log Feed</span>
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-400 space-y-1 max-h-32 overflow-y-auto font-mono">
                      {activeJob.logs?.map((l, i) => (
                        <div key={i} className="truncate">
                          <span className="text-slate-600">[{l.stage}]</span> {l.message}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operator Controls */}
                  <div className="flex items-center gap-2 pt-2">
                    {activeJob.status === "running" ? (
                      <button
                        onClick={() => handleJobAction("pause")}
                        className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1"
                      >
                        <Pause size={12} /> Pause Job
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJobAction("resume")}
                        className="px-3 py-1.5 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-medium flex items-center gap-1"
                      >
                        <Play size={12} /> Resume Job
                      </button>
                    )}
                    <button
                      onClick={() => handleJobAction("retry")}
                      className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1"
                    >
                      <RotateCcw size={12} /> Retry
                    </button>
                    <button
                      onClick={() => handleJobAction("cancel")}
                      className="px-3 py-1.5 rounded hover:bg-rose-500/20 text-rose-400 text-xs font-medium ml-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  No active discovery job running. Configure search criteria and click Launch.
                </div>
              )}
            </div>

            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-500">
              ⚡ <strong>BullMQ Queue Ready:</strong> Background tasks run decoupled from the browser session.
            </div>
          </div>
        </div>

        {/* Discovered Leads Results Table */}
        <div className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveViewTab("current")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors",
                  activeViewTab === "current"
                    ? "bg-[#0284c7] text-white border-[#0284c7]"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                )}
              >
                <Sparkles size={13} /> Current Results ({discoveredLeads.length})
              </button>
              <button
                onClick={() => setActiveViewTab("history")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors",
                  activeViewTab === "history"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                )}
              >
                <Clock size={13} /> Lead History ({leadHistory.length})
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search name, city, phone..."
                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] w-48"
              />
              {activeViewTab === "current" && discoveredLeads.length > 0 && (
                <button
                  onClick={() => {
                    setDiscoveredLeads([]);
                    localStorage.removeItem("brightloop_discovered_leads");
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-medium transition-colors"
                >
                  Clear View
                </button>
              )}
              {[
                { id: "all", label: "All" },
                { id: "has_website", label: "Has Website" },
                { id: "no_website", label: "No Website" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTableFilter(tab.id as any)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors",
                    tableFilter === tab.id
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                  <th className="pb-3 px-3">Company</th>
                  <th className="pb-3 px-3">Website & Domain</th>
                  <th className="pb-3 px-3">Location</th>
                  <th className="pb-3 px-3">Public Email</th>
                  <th className="pb-3 px-3">Provider Source</th>
                  <th className="pb-3 px-3 text-center">Initial Score</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(activeViewTab === "current" ? discoveredLeads : leadHistory).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                      {activeViewTab === "current"
                        ? "No leads in current view. Select a Country, Industry, and click Launch Discovery Job."
                        : "No lead history saved yet. Run a discovery job to build your persistent history."}
                    </td>
                  </tr>
                ) : (
                (activeViewTab === "current" ? discoveredLeads : leadHistory)
                  .filter((lead: any) => {
                    const hasWeb = !!(lead.websiteUrl || lead.website);
                    if (tableFilter === "has_website") return hasWeb;
                    if (tableFilter === "no_website") return !hasWeb;
                    return true;
                  })
                  .filter((lead: any) => {
                    if (!tableSearch.trim()) return true;
                    const q = tableSearch.toLowerCase();
                    return (
                      (lead.companyName || lead.businessName || "").toLowerCase().includes(q) ||
                      (lead.city || "").toLowerCase().includes(q) ||
                      (lead.publicPhone || "").toLowerCase().includes(q) ||
                      (lead.description || "").toLowerCase().includes(q)
                    );
                  })
                  .map((lead: any, idx: number) => {
                  const companyName = lead.companyName || lead.businessName;
                  const websiteUrl = lead.websiteUrl || lead.website;
                  const email = lead.publicEmail || lead.contact?.email;
                  const score = lead.initialQualificationScore ?? lead.opportunityScore ?? 80;
                  const provider = (lead.providerName || "Apollo")
                    .replace("Serper Google Places", "Google Places")
                    .replace("Search API (SerpAPI / Bing)", "Search API")
                    .replace("Public Business Directory Adapter", "Directory");

                  return (
                    <tr key={lead.id || idx} className="hover:bg-slate-100/30 transition-colors">
                      <td className="py-3 px-3 min-w-[180px]">
                        <div className="font-semibold text-slate-900">{companyName}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{lead.industry}</span>
                          {lead.metadata?.rating && (
                            <span className="text-amber-600 font-semibold">★ {lead.metadata.rating}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-[210px]">
                        {websiteUrl ? (
                          <a
                            href={websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#0284c7] hover:underline flex items-center gap-1 font-mono text-[11px]"
                          >
                            <span className="truncate">{websiteUrl.replace(/https?:\/\//, "")}</span>
                            <ExternalLink size={11} className="shrink-0" />
                          </a>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-block w-fit px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                              No Website
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Suggest: Website + Software
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 max-w-[220px]">
                        <div className="text-slate-700 font-medium">{lead.city ? `${lead.city}, ` : ""}{lead.country}</div>
                        {lead.description && (
                          <div className="text-[10px] text-slate-500 truncate mt-0.5" title={lead.description}>
                            {lead.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5">
                          {email ? (
                            <span className="text-slate-800 font-mono text-[11px]">{email}</span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                          {lead.publicPhone && (
                            <div className="flex items-center gap-2">
                              <a
                                href={`tel:${lead.publicPhone}`}
                                className="text-[#0284c7] hover:underline font-mono text-[10px] whitespace-nowrap"
                              >
                                {lead.publicPhone}
                              </a>
                              <a
                                href={`https://wa.me/${lead.publicPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${companyName} team, we noticed your business in ${lead.city || lead.country} and wanted to share a quick digital growth idea from BrightLoop Technology.`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[9px] font-bold whitespace-nowrap"
                                title="Message on WhatsApp"
                              >
                                WhatsApp
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block whitespace-nowrap text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                          {provider}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={cn(
                            "inline-block whitespace-nowrap px-2 py-0.5 rounded font-bold text-xs",
                            score >= 80
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-sky-50 text-[#0284c7] border border-sky-200"
                          )}
                        >
                          {score}/100
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                          {(lead.websiteUrl || lead.website) && (
                            <Link
                              href={`/audits?url=${encodeURIComponent(lead.websiteUrl || lead.website)}`}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors whitespace-nowrap"
                            >
                              Audit
                            </Link>
                          )}
                          <Link
                            href={`/crm?leadId=${lead.id || "lead-1"}`}
                            onClick={() => {
                              fetch("/api/crm/deals", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(lead),
                                keepalive: true
                              }).catch(() => {});
                            }}
                            className="px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 text-[#0284c7] border border-sky-200 text-[11px] font-medium transition-colors whitespace-nowrap"
                          >
                            View in CRM
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
