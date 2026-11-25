import React from "react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import {
  ArrowRight,
  Search,
  Globe,
  Mail,
  Send,
  Users,
  Bot,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight
} from "lucide-react";

export default function PublicLandingPage() {
  const capabilities = [
    {
      title: "Worldwide Lead Discovery",
      desc: "Search global directories, Google Places, and public registries with automated normalization and deduplication.",
      icon: Search,
      color: "text-[#0284c7]",
      bg: "bg-sky-50"
    },
    {
      title: "Website Intelligence & Audits",
      desc: "SSRF-safe crawling, Lighthouse Core Web Vitals, SEO metadata, mobile UX, and technology stack detection.",
      icon: Globe,
      color: "text-[#0891b2]",
      bg: "bg-cyan-50"
    },
    {
      title: "AI-Powered Email Studio",
      desc: "Generate consultative sales pitches grounded strictly in verified audit findings with zero fabricated claims.",
      icon: Mail,
      color: "text-[#d97706]",
      bg: "bg-amber-50"
    },
    {
      title: "Campaign Management & Approval",
      desc: "Human-in-the-loop approval checkpoints, suppression enforcement, and rate-paced Gmail OAuth delivery.",
      icon: Send,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "CRM & Pipeline Management",
      desc: "10-stage drag-and-drop Kanban pipeline, deal value tracking, multi-currency proposals, and AI reply analysis.",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "AI Agent Automation",
      desc: "8 supervised autonomous agents with BullMQ queue monitoring, worker heartbeats, and instant Emergency Stop.",
      icon: Bot,
      color: "text-[#0284c7]",
      bg: "bg-sky-50"
    }
  ];

  const faqs = [
    {
      q: "How does BrightLoop AI ensure email compliance?",
      a: "Every outbound dispatch passes a pre-flight compliance validator that checks suppression lists, enforces RFC 8058 unsubscribe headers, and requires explicit administrator approval before sending."
    },
    {
      q: "Does BrightLoop AI invent website problems in emails?",
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
        <section className="relative overflow-hidden bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-semibold text-[#0284c7] mb-6">
              <Sparkles size={13} />
              <span>BrightLoop Technology • Intelligent Client Acquisition</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
              Turn Business Opportunities Into Your Next Clients.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Discover businesses, analyze their digital presence, and manage intelligent client acquisition workflows from one unified platform.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0891b2] hover:opacity-95 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight size={16} />
              </Link>
              <Link
                href="/features"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm shadow-2xs transition-colors flex items-center justify-center gap-2"
              >
                Explore Platform
              </Link>
            </div>

            {/* Product Showcase Mockup */}
            <div className="mt-16 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-lg max-w-5xl mx-auto">
              <div className="rounded-xl bg-white border border-slate-200/80 overflow-hidden">
                <div className="h-10 bg-slate-50 border-b border-slate-200 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">ai.brightlooptechnology.in/dashboard</span>
                  <div className="w-12" />
                </div>
                <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[11px] font-semibold text-slate-500">Lead Discovery</span>
                    <div className="text-xl font-bold text-slate-900 mt-1">Global Search</div>
                    <span className="text-[10px] text-[#0284c7] font-medium">Normalized & Deduplicated</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[11px] font-semibold text-slate-500">Website Audits</span>
                    <div className="text-xl font-bold text-slate-900 mt-1">Lighthouse</div>
                    <span className="text-[10px] text-[#0891b2] font-medium">SEO, Mobile & Tech Stack</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[11px] font-semibold text-slate-500">AI Email Studio</span>
                    <div className="text-xl font-bold text-slate-900 mt-1">Consultative</div>
                    <span className="text-[10px] text-[#d97706] font-medium">Evidence-Grounded Pitches</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[11px] font-semibold text-slate-500">CRM Pipeline</span>
                    <div className="text-xl font-bold text-slate-900 mt-1">10 Stages</div>
                    <span className="text-[10px] text-emerald-600 font-medium">Kanban & Proposal Tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Platform Capabilities Grid */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Everything Required for Intelligent Client Acquisition
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Built as one cohesive enterprise system—from initial business discovery to closed-won CRM conversion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl ${cap.bg} flex items-center justify-center mb-4`}>
                    <Icon size={20} className={cap.color} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{cap.title}</h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">{cap.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. How the Platform Works */}
        <section className="py-20 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                How BrightLoop AI Works
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                A deterministic, human-supervised 4-stage acquisition workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: "01", title: "Discover & Normalize", desc: "Identify target businesses globally and normalize contact provenance." },
                { step: "02", title: "Audit & Score", desc: "Run Lighthouse, SEO, and mobile checks to score modernization fit." },
                { step: "03", title: "Approve & Outreach", desc: "Generate tailored pitches and approve compliant Gmail dispatches." },
                { step: "04", title: "Convert in CRM", desc: "Track replies with AI sentiment analysis and close deals in Kanban." }
              ].map((item) => (
                <div key={item.step} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs font-mono font-bold text-[#0284c7]">STEP {item.step}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. FAQ */}
        <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">{faq.q}</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Final CTA */}
        <section className="py-16 bg-gradient-to-r from-[#0284c7] to-[#0891b2] text-white">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Ready to Modernize Your Client Acquisition?
            </h2>
            <p className="text-sm text-sky-100 max-w-xl mx-auto">
              Access the BrightLoop AI platform with your authorized BrightLoop Technology administrator credentials.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/login"
                className="px-7 py-3 rounded-xl bg-white text-[#0284c7] font-bold text-sm shadow-sm hover:bg-sky-50 transition-colors flex items-center gap-2"
              >
                Sign In to Platform <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
