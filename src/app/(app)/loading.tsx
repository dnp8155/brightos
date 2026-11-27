import React from "react";

export default function AppLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-56 rounded-lg bg-slate-200/80" />
          <div className="h-3.5 w-80 rounded-md bg-slate-200/60" />
        </div>
        <div className="h-9 w-32 rounded-xl bg-slate-200/80" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200/80 p-4 space-y-3">
            <div className="h-3.5 w-24 rounded bg-slate-200/70" />
            <div className="h-7 w-20 rounded bg-slate-200/90" />
            <div className="h-3 w-32 rounded bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="h-80 rounded-2xl bg-white border border-slate-200/80 p-5 space-y-4">
        <div className="h-4 w-40 rounded bg-slate-200/80" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full rounded-xl bg-slate-100/90" />
          ))}
        </div>
      </div>
    </div>
  );
}
