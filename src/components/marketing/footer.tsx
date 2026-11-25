import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function MarketingFooter() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <BrandLogo variant="full" size="md" />
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              AI-powered client acquisition, website intelligence, and consultative outreach platform built by BrightLoop Technology.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link href="/features" className="hover:text-[#0284c7]">Features</Link></li>
              <li><Link href="/how-it-works" className="hover:text-[#0284c7]">How it Works</Link></li>
              <li><Link href="/login" className="hover:text-[#0284c7]">Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link href="/about" className="hover:text-[#0284c7]">About BrightLoop</Link></li>
              <li><Link href="/contact" className="hover:text-[#0284c7]">Contact Us</Link></li>
              <li><a href="https://brightlooptechnology.in" target="_blank" rel="noreferrer" className="hover:text-[#0284c7]">brightlooptechnology.in</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Legal & Compliance
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link href="/privacy" className="hover:text-[#0284c7]">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#0284c7]">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>&copy; 2026 BrightLoop Technology. All rights reserved.</span>
          <span>BrightLoop AI — Enterprise Client Acquisition SaaS</span>
        </div>
      </div>
    </footer>
  );
}
