"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Bot,
  Users,
  Globe,
  Mail,
  Send,
  Inbox,
  Clock,
  BarChart3,
  FileText,
  Puzzle,
  ShieldCheck,
  Settings,
  X,
  ArrowRight
} from "lucide-react";

const COMMAND_ITEMS = [
  { name: "Executive Overview", category: "Workspace", href: "/dashboard", icon: LayoutDashboard, keywords: "home dashboard metrics" },
  { name: "AI Agent Control Center", category: "Workspace", href: "/agents", icon: Bot, keywords: "agents workflow emergency stop bullmq" },
  { name: "Worldwide Lead Discovery", category: "Workspace", href: "/lead-discovery", icon: Search, keywords: "search serper places csv import leads" },
  { name: "CRM & Deal Pipeline", category: "Workspace", href: "/crm", icon: Users, keywords: "kanban deals pipeline proposals" },
  { name: "Website Audits & Lighthouse", category: "Workspace", href: "/audits", icon: Globe, keywords: "seo performance crawler ssrf" },
  { name: "AI Email Studio", category: "Outreach", href: "/email-studio", icon: Mail, keywords: "pitch generator openai draft" },
  { name: "Campaigns", category: "Outreach", href: "/campaigns", icon: Send, keywords: "outreach approval dispatch" },
  { name: "Inbox & Replies", category: "Outreach", href: "/inbox", icon: Inbox, keywords: "replies sentiment" },
  { name: "Follow-ups", category: "Outreach", href: "/follow-ups", icon: Clock, keywords: "cadence schedule" },
  { name: "BI Analytics", category: "Intelligence", href: "/analytics", icon: BarChart3, keywords: "roi revenue charts" },
  { name: "Executive Reports", category: "Intelligence", href: "/reports", icon: FileText, keywords: "csv pdf export" },
  { name: "Integrations Hub", category: "Governance", href: "/integrations", icon: Puzzle, keywords: "api keys openai supabase gmail" },
  { name: "Compliance & Safety", category: "Governance", href: "/compliance", icon: ShieldCheck, keywords: "unsubscribe suppression" },
  { name: "Settings & Team", category: "Governance", href: "/settings", icon: Settings, keywords: "team roles profile" }
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpenEvent = () => setOpen(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-command-palette", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-command-palette", onOpenEvent);
    };
  }, []);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const filtered = COMMAND_ITEMS.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keywords.includes(q)
  );

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-[15vh] p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, tools, or actions..."
            className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={15} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching workspace routes found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => handleSelect(item.href)}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-sky-50 group-hover:text-[#0284c7] transition-colors">
                      <Icon size={15} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-400">{item.category}</div>
                    </div>
                  </div>
                  <ArrowRight size={13} className="text-slate-300 group-hover:text-[#0284c7]" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
