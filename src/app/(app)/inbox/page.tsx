"use client";

import React, { useState } from "react";
import { TopHeader } from "@/components/top-header";
import { DEMO_INBOX_THREADS } from "@/lib/demoData";
import { InboxThread } from "@/types";
import { Inbox, MessageSquare, Send, CheckCircle2, User, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InboxPage() {
  const [threads, setThreads] = useState<InboxThread[]>(DEMO_INBOX_THREADS);
  const [selectedThread, setSelectedThread] = useState<InboxThread>(DEMO_INBOX_THREADS[0]);
  const [replyText, setReplyText] = useState("");

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      sender: "agent" as const,
      senderName: "BrightLoop Operator",
      time: "Just now",
      content: replyText
    };

    const updated = {
      ...selectedThread,
      messages: [...selectedThread.messages, newMsg],
      lastMessageSnippet: replyText,
      timestamp: "Just now"
    };

    setSelectedThread(updated);
    setThreads(threads.map((t) => (t.id === updated.id ? updated : t)));
    setReplyText("");
  };

  const getBadgeStyle = (classification: string) => {
    switch (classification) {
      case "Interested":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Follow-up":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "Question":
        return "bg-violet-500/10 text-violet-400 border-violet-500/20";
      default:
        return "bg-slate-100 text-slate-400 border-slate-200";
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] text-slate-900 min-h-screen">
      <TopHeader
        title="Inbox & Replies"
        description="Unified thread management with automated sentiment classification (Interested, Follow-up, Question)"
      />

      <main className="p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[600px]">
          {/* Thread List */}
          <div className="p-4 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-3 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Conversations ({threads.length})
              </span>
              <span className="text-[10px] text-sky-400">All Channels</span>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all space-y-1.5",
                    selectedThread.id === thread.id
                      ? "bg-sky-500/10 border-sky-500/40"
                      : "bg-slate-50 border-slate-200 hover:border-slate-200"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">
                      {thread.contactName}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {thread.timestamp}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-medium truncate">
                    {thread.company}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400 line-clamp-1 pr-2">
                      {thread.lastMessageSnippet}
                    </span>
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0",
                        getBadgeStyle(thread.classification)
                      )}
                    >
                      {thread.classification}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversation Panel */}
          <div className="md:col-span-2 p-5 rounded-xl bg-white shadow-2xs border border-slate-200 flex flex-col justify-between space-y-4">
            {/* Thread Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {selectedThread.contactName} – {selectedThread.company}
                </h3>
                <span className="text-xs text-slate-400">
                  Classification:{" "}
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-medium border",
                      getBadgeStyle(selectedThread.classification)
                    )}
                  >
                    {selectedThread.classification}
                  </span>
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Phase 1 Demo Thread
              </div>
            </div>

            {/* Message Bubble Feed */}
            <div className="flex-1 space-y-3 overflow-y-auto p-2">
              {selectedThread.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-lg space-y-1",
                    msg.sender === "agent" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <span className="text-[10px] text-slate-500">
                    {msg.senderName} • {msg.time}
                  </span>
                  <div
                    className={cn(
                      "p-3 rounded-lg text-xs leading-relaxed",
                      msg.sender === "agent"
                        ? "bg-sky-600 text-slate-900 rounded-br-none"
                        : "bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Reply Form */}
            <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-200 flex gap-2">
              <input
                type="text"
                placeholder={`Reply to ${selectedThread.contactName}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Send size={13} /> Send
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
