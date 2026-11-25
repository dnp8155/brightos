"use client";

import React from "react";
import { Bell, Database, LogOut, Search, Sparkles, HelpCircle } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";

interface HeaderProps {
  title?: string;
  description?: string;
}

export function TopHeader({ title, description }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div>
        {title && (
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
        )}
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Global Search Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-400 w-64 focus-within:ring-1 focus-within:ring-[#0284c7] focus-within:border-[#0284c7] transition-all">
          <Search size={14} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, audits, deals..."
            className="bg-transparent border-none text-slate-800 placeholder-slate-400 text-xs focus:outline-none w-full"
          />
          <kbd className="hidden sm:inline-block font-mono text-[9px] px-1 py-0.5 bg-white border border-slate-200 rounded text-slate-500 shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Database Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-800">
          <Database size={12} className="text-emerald-600" />
          <span>PostgreSQL Live</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Multi-Agent Active Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-[11px] font-semibold text-sky-800">
          <Sparkles size={12} className="text-[#0284c7]" />
          <span>8 AI Agents</span>
        </div>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 border-2 border-white" />
        </button>

        {/* User profile & Logout */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-xs">
            BL
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 leading-tight">Admin Operator</span>
            <span className="text-[10px] text-slate-500">BrightLoop Technology</span>
          </div>
          <form action={logoutAction} className="ml-1">
            <button
              type="submit"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
