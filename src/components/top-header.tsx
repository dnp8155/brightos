"use client";

import React, { useState } from "react";
import { Bell, LogOut, Search, Menu, CheckCheck } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

interface HeaderProps {
  title?: string;
  description?: string;
}

const INITIAL_NOTIFICATIONS = [
  { id: "n1", title: "Serper.dev Search API Ready", time: "Just now", unread: true },
  { id: "n2", title: "Website Audit Engine Online", time: "12m ago", unread: true },
  { id: "n3", title: "Supabase RLS & Admin Auth Active", time: "1h ago", unread: false }
];

export function TopHeader({ title, description }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

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
        {/* Global Command Palette Trigger */}
        <button
          onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
          className="hidden md:flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-400 w-56 transition-all text-left"
        >
          <span className="flex items-center gap-2">
            <Search size={13} className="text-slate-400 shrink-0" />
            <span>Search workspace...</span>
          </span>
          <kbd className="font-mono text-[9px] px-1 py-0.5 bg-white border border-slate-200 rounded text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Interactive Notification Center */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-medium text-[#0284c7] hover:underline flex items-center gap-1"
                  >
                    <CheckCheck size={12} /> Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="px-3.5 py-2.5 hover:bg-slate-50 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-slate-800">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] mt-1.5 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
