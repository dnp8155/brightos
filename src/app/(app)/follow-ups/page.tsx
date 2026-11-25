"use client";

import React, { useState } from "react";
import { TopHeader } from "@/components/top-header";
import { Clock, CheckCircle2, AlertCircle, Calendar, ArrowRight } from "lucide-react";

export default function FollowUpsPage() {
  const [tasks, setTasks] = useState([
    {
      id: "fu-1",
      leadName: "Dr. Eleanor Finch",
      company: "Vertex Health Labs",
      due: "Today, 2:00 PM",
      status: "Pending",
      notes: "Send HIPAA architecture teardown and schedule video demo."
    },
    {
      id: "fu-2",
      leadName: "Marcus Vance",
      company: "Aura Logistics Group",
      due: "Tomorrow, 10:00 AM",
      status: "Pending",
      notes: "Follow up on mobile Core Web Vitals audit with case study link."
    },
    {
      id: "fu-3",
      leadName: "Astrid Lindholm",
      company: "Nordic Clean Energy",
      due: "Nov 28, 4:00 PM",
      status: "Scheduled",
      notes: "Deliver phased Next.js migration budget estimate."
    }
  ]);

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "Completed" ? "Pending" : "Completed" }
          : t
      )
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] text-slate-900 min-h-screen">
      <TopHeader
        title="Follow-ups & Cadence Engine"
        description="Monitor automated second-touch follow-ups, reply reminders, and outreach cadences"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        <div className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-sky-400" /> Scheduled Follow-Up Tasks
            </h3>
            <span className="text-[11px] text-slate-400">
              {tasks.filter((t) => t.status === "Pending").length} Pending Actions
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">{task.leadName}</span>
                    <span className="text-[10px] text-slate-400">({task.company})</span>
                  </div>
                  <p className="text-xs text-slate-700">{task.notes}</p>
                  <div className="text-[10px] text-sky-400 flex items-center gap-1">
                    <Calendar size={11} /> Due: {task.due}
                  </div>
                </div>

                <button
                  onClick={() => toggleTask(task.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    task.status === "Completed"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                  }`}
                >
                  {task.status === "Completed" ? "Completed ✓" : "Mark Done"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
