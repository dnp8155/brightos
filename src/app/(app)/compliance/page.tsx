"use client";

import React, { useState } from "react";
import { TopHeader } from "@/components/top-header";
import { ShieldCheck, CheckCircle2, Lock, AlertCircle } from "lucide-react";

export default function CompliancePage() {
  const [canSpam, setCanSpam] = useState(true);
  const [gdpr, setGdpr] = useState(true);
  const [unsubscribeFooter, setUnsubscribeFooter] = useState(true);
  const [dailyCap, setDailyCap] = useState(150);

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] text-slate-900 min-h-screen">
      <TopHeader
        title="Compliance & Deliverability Guardrails"
        description="CAN-SPAM, GDPR, opt-out mechanisms, and sending volume safeguards"
      />

      <main className="p-6 space-y-6 max-w-4xl mx-auto w-full">
        <div className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <ShieldCheck size={18} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-900">
              Outbound Regulatory Governance
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-semibold text-slate-800">CAN-SPAM Opt-Out Enforcement</div>
                <div className="text-[11px] text-slate-400">
                  Automatically appends physical BrightLoop address and one-click unsubscribe links to outbound emails.
                </div>
              </div>
              <input
                type="checkbox"
                checked={canSpam}
                onChange={(e) => setCanSpam(e.target.checked)}
                className="w-4 h-4 accent-sky-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-semibold text-slate-800">GDPR Legitimate Interest Verification</div>
                <div className="text-[11px] text-slate-400">
                  Restricts B2B cold emails to documented technical findings and relevant corporate roles.
                </div>
              </div>
              <input
                type="checkbox"
                checked={gdpr}
                onChange={(e) => setGdpr(e.target.checked)}
                className="w-4 h-4 accent-sky-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-semibold text-slate-800">Domain Reputation Protection (Daily Cap)</div>
                <div className="text-[11px] text-slate-400">
                  Maximum outbound messages per inbox per 24 hours to prevent spam filtering.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="20"
                  max="500"
                  value={dailyCap}
                  onChange={(e) => setDailyCap(Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded bg-slate-100 border border-slate-200 text-xs text-center text-slate-900"
                />
                <span className="text-xs text-slate-400">/day</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
