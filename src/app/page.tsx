import React from "react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { LandingShowcase } from "@/components/marketing/landing-showcase";
import {
  ArrowRight,
  Search,
  Globe,
  Mail,
  Send,
  Users,
  Bot,
  CheckCircle2,
  Lock,
  BarChart3,
  ShieldCheck
} from "lucide-react";

export default function PublicLandingPage() {
  const pillars = [
    {
      title: "Global Discovery & Normalization",
      desc: "Query Google Places, Search APIs, or import CSVs with automatic domain deduplication and source provenance.",
      icon: Search
    },
    {
      title: "SSRF-Safe Website Intelligence",
      desc: "Inspect Lighthouse Core Web Vitals, SEO metadata, mobile UX, and legacy tech stacks safely.",
      icon: Globe
    },
    {
      title: "Evidence-Grounded Email Studio",
      desc: "Synthesize consultative pitches citing real audit measurements—never fabricated claims.",
      icon: Mail
    },
    {
      title: "Human-Approved Outreach",
      desc: "Mandatory campaign approval checkpoints, suppression enforcement, and rate-paced Gmail OAuth.",
      icon: Send
    },
    {
      title: "10-Stage CRM & Deal Pipeline",
      desc: "Drag-and-drop Kanban board, multi-currency proposals, and AI reply sentiment classification.",
      icon: Users
    },
    {
      title: "Supervised Agent Orchestration",
      desc: "8 specialized agents with BullMQ queue monitoring, worker heartbeats, and instant Emergency Stop.",
      icon: Bot
    }
  ];

  const workflowSteps = [
    { step: "01", title: "Discover & Normalize", desc: "Identify target businesses globally, normalize company profiles, and deduplicate domains automatically." },
    { step: "02", title: "Audit & Score", desc: "Run SSRF-safe Lighthouse, SEO, and mobile checks to score modernization opportunity with evidence." },
    { step: "03", title: "Approve & Outreach", desc: "Generate tailored pitches citing verified findings. Campaigns pause for mandatory admin approval." },
    { step: "04", title: "Convert & Measure ROI", desc: "Track replies with AI sentiment analysis, close deals in Kanban, and export attributable ROI." }
  ];

  const faqs = [
    {
      q: "How does BRIGHT AI ensure email compliance?",
      a: "Every outbound dispatch passes a pre-flight compliance validator that checks suppression lists, enforces RFC 8058 unsubscribe headers, and requires explicit administrator approval before sending."
    },
    {
      q: "Does BRIGHT AI invent website problems in emails?",
      a: "Never. Our AI Email Studio only cites verified technical findings measured by our SSRF-safe website crawler and Lighthouse engine."
    },
    {
      q: "Can we pause or stop automated agents immediately?",
      a: "Yes. The AI Agent Control Center includes a server-enforced Global Pause and Emergency Stop that immediately halts workflows and cancels queued dispatches."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      <MarketingNavbar />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="relative bg-white border-b border-slate-200/80 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.35] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
              backgroundSize: "24px 24px"
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#0891b2] to-[#d97706]" />
              BrightLoop Technology • BRIGHT AI Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.1]">
              Turn Business Opportunities Into Your Next Clients.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Discover businesses, analyze their digital presence, and manage intelligent client acquisition workflows from one unified platform.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight size={15} />
              </Link>
              <Link
                href="/features"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                Explore Platform
              </Link>
            </div>

            <LandingShowcase />
          </div>
        </section>

        {/* 2. Core Capabilities */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7]">Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Built for Precision, Not Volume Spam.
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Every stage of BRIGHT AI is engineered with strict data provenance, server-side compliance checks, and human-in-the-loop governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-sm transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. How It Works */}
        <section className="py-24 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0891b2]">Workflow</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                From Discovery to Closed Revenue
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                A deterministic 4-stage pipeline with human approval checkpoints.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {workflowSteps.map((w) => (
                <div key={w.step} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-xs font-mono font-bold text-[#0284c7]">STEP {w.step}</span>
                  <h3 className="text-base font-bold text-slate-900">{w.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Security & Governance Strip */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
              <Lock size={14} /> Enterprise Security & Compliance
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Admin-Only Access. Server-Enforced Safety.
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Protected by Supabase Row Level Security, AES-256-GCM encrypted OAuth tokens, SSRF crawler sandboxing, and an instant global Emergency Stop.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs shrink-0">
            {[
              "Supabase RLS Active",
              "AES-256-GCM Tokens",
              "Mandatory Approval",
              "RFC 8058 Unsubscribe"
            ].map((item) => (
              <div key={item} className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/80 font-semibold text-slate-700 flex items-center gap-2 shadow-2xs">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 5. FAQ */}
        <section className="py-20 bg-white border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-10">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <h3 className="text-sm font-bold text-slate-900">{faq.q}</h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Final CTA */}
        <section className="py-20 bg-gradient-to-r from-[#0891b2] via-[#0284c7] to-[#d97706] text-white">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Ready to Access BRIGHT AI?
            </h2>
            <p className="text-sm text-white/90 max-w-lg mx-auto">
              Sign in with your authorized BrightLoop Technology administrator credentials to launch your workspace.
            </p>
            <div className="flex justify-center">
              <Link
                href="/login"
                className="px-7 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-sm shadow-sm hover:bg-slate-50 transition-all inline-flex items-center gap-2"
              >
                Sign In to Admin Portal <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
