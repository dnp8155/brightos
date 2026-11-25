"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Menu, X, ArrowRight } from "lucide-react";

export function MarketingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "/features" },
    { name: "How it works", href: "/how-it-works" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <BrandLogo variant="full" size="md" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-[#0284c7] transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0891b2] hover:opacity-95 text-white text-sm font-semibold shadow-xs transition-all flex items-center gap-1.5"
          >
            Get Started <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-[#0284c7]"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2.5 text-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
            >
              Login
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2.5 text-center rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0891b2] text-white text-sm font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
