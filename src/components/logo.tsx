import React from "react";

interface LogoProps {
  collapsed?: boolean;
}

export function Logo({ collapsed = false }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Minimal Geometric Loop Icon */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 shadow-sm shadow-blue-500/20 text-white font-bold shrink-0">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <path d="M12 2a10 10 0 1 0 10 10" />
          <path d="M12 6a6 6 0 1 1-6 6" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      </div>

      {!collapsed && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 leading-none">
            <span className="font-semibold tracking-tight text-white text-base">
              Bright<span className="text-sky-400">Loop</span>
            </span>
            <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
              AI
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5">
            BrightLoop Technology
          </span>
        </div>
      )}
    </div>
  );
}
