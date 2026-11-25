import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { MailCheck, ArrowLeft } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm space-y-6 text-center">
        <div className="flex justify-center">
          <BrandLogo size="lg" variant="full" />
        </div>
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 space-y-2">
          <MailCheck size={28} className="mx-auto text-[#0284c7]" />
          <h1 className="text-base font-bold">Verify Your Email Address</h1>
          <p className="text-xs text-sky-800 leading-relaxed">
            Please check your inbox and click the verification link to activate your authorized BrightLoop AI account.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284c7] hover:underline"
        >
          <ArrowLeft size={13} /> Return to Login
        </Link>
      </div>
    </div>
  );
}
