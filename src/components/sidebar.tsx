"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import {
  LayoutDashboard,
  Bot,
  Search,
  Users,
  Globe,
  Mail,
  Send,
  Inbox,
  Clock,
  BarChart3,
  FileText,
  Settings,
  Puzzle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Shield,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "WORKSPACE",
    items: [
      { name: "Executive Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "AI Agent Control", href: "/agents", icon: Bot, badge: "8 Live" },
      { name: "Worldwide Discovery", href: "/lead-discovery", icon: Search },
      { name: "CRM & Pipelines", href: "/crm", icon: Users },
      { name: "Website Audits", href: "/audits", icon: Globe }
    ]
  },
  {
    title: "OUTREACH",
    items: [
      { name: "AI Email Studio", href: "/email-studio", icon: Mail },
      { name: "Campaigns", href: "/campaigns", icon: Send },
      { name: "Inbox & Replies", href: "/inbox", icon: Inbox },
      { name: "Follow-ups", href: "/follow-ups", icon: Clock }
    ]
  },
  {
    title: "INTELLIGENCE",
    items: [
      { name: "BI Analytics", href: "/analytics", icon: BarChart3 },
      { name: "Executive Reports", href: "/reports", icon: FileText }
    ]
  },
  {
    title: "GOVERNANCE",
    items: [
      { name: "Integrations Hub", href: "/integrations", icon: Puzzle },
      { name: "Compliance & Safety", href: "/compliance", icon: ShieldCheck },
      { name: "Settings & Keys", href: "/settings", icon: Settings }
    ]
  }
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-200 bg-white transition-all duration-300 z-30 select-none shadow-xs",
        collapsed ? "w-18" : "w-64"
      )}
    >
      {/* Brand Header with Official Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 bg-white">
        <BrandLogo
          variant={collapsed ? "icon" : "full"}
          size={collapsed ? "sm" : "md"}
        />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <h2 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {section.title}
              </h2>
            )}
            {section.items.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 group",
                    isActive
                      ? "bg-sky-50 text-[#0284c7] font-bold shadow-xs border border-sky-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      size={16}
                      className={cn(
                        "shrink-0 transition-colors",
                        isActive ? "text-[#0284c7]" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100/80 text-[#0284c7] border border-sky-200/60">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Admin Profile & Status Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        <div
          className={cn(
            "p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-2",
            collapsed && "justify-center p-2"
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              BL
            </div>
            {!collapsed && (
              <div className="flex flex-col text-xs leading-tight overflow-hidden">
                <span className="font-bold text-slate-800 truncate">
                  Admin Operator
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  BrightLoop Tech
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
