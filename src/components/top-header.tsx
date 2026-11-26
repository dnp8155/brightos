"use client";

import React from "react";
import { Bell, LogOut, Search, Menu } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

interface HeaderProps {
  title?: string;
  description?: string;
}

export function TopHeader({ title, description }: HeaderProps) {
  return (
    <header className="h-14 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => window.dispatchEvent(new Event("toggle-mobile-sidebar"))}
          className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          {title && (
            <h1 className="text-sm font-semibold text-slate-900 tracking-tight truncate">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-[11px] text-slate-500 truncate">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Global Search */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-400 w-56 focus-within:bg-white focus-within:border-slate-300 transition-all">
          <Search size={13} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search workspace..."
            className="bg-transparent border-none text-slate-800 placeholder-slate-400 text-xs focus:outline-none w-full"
          />
          <kbd className="font-mono text-[9px] px-1 py-0.5 bg-white border border-slate-200 rounded text-slate-400">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
        </button>

        {/* User profile & Logout */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-[11px] font-semibold text-white">
            DP
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-medium text-slate-800 leading-tight">Dipak Patel</span>
            <span className="text-[10px] text-slate-400">Administrator</span>
          </div>
          <form action={logoutAction} className="ml-1">
            <button
              type="submit"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
