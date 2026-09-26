import React from "react";

export default function RootLoading() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12 animate-pulse pt-2 px-1">
      {/* Page Header Skeleton */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#141822] border border-white/5 p-5 sm:p-7 space-y-3">
        <div className="h-4 w-28 rounded-full bg-emerald-500/20" />
        <div className="h-8 sm:h-10 w-2/3 max-w-md rounded-xl bg-white/10" />
        <div className="h-3.5 w-full max-w-lg rounded-lg bg-white/5" />
      </div>

      {/* Segmented Filter / Quick Action Chips */}
      <div className="flex gap-2 overflow-hidden py-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-24 shrink-0 rounded-xl bg-[#141822] border border-white/5" />
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-2xl bg-[#141822] border border-white/5 relative overflow-hidden"
          >
            <div className="absolute inset-x-3 bottom-3 space-y-1.5">
              <div className="h-3.5 w-4/5 rounded bg-white/10" />
              <div className="h-2.5 w-1/2 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
