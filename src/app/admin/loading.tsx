import React from "react";

export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-pulse">
      {/* Header Skeleton */}
      <div className="rounded-3xl bg-[#14161f] border border-white/10 p-6 sm:p-8 space-y-3">
        <div className="h-6 w-32 rounded-full bg-white/10" />
        <div className="h-9 w-64 rounded-xl bg-white/15" />
        <div className="h-4 w-96 rounded bg-white/5" />
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-[#14161f] border border-white/10 space-y-2">
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="h-8 w-16 rounded bg-white/20" />
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-32 rounded-xl bg-white/10" />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl bg-[#14161f] border border-white/10 p-6 space-y-4">
        <div className="h-10 w-full max-w-sm rounded-xl bg-white/5" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-14 w-full rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
