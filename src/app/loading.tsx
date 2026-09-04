import React from "react";

export default function RootLoading() {
  return (
    <div className="space-y-12 pb-16 animate-pulse">
      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-[#12151d] to-[#0d0f14] border border-[#242a36] p-6 sm:p-10 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="h-6 w-36 rounded-full bg-white/10" />
          <div className="h-10 sm:h-14 w-3/4 rounded-2xl bg-white/15" />
          <div className="h-4 sm:h-5 w-full max-w-xl rounded-lg bg-white/5" />
          
          {/* Fake Hero Search */}
          <div className="pt-2 max-w-xl">
            <div className="h-14 w-full rounded-2xl bg-white/10 border border-white/5" />
          </div>

          {/* Quick Chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-28 rounded-xl bg-white/10" />
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Row 1 Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-6 w-52 rounded-lg bg-white/15" />
            <div className="h-3.5 w-72 rounded bg-white/5" />
          </div>
          <div className="h-4 w-28 rounded bg-white/10" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-2xl bg-[#141720] border border-white/5 relative overflow-hidden"
            >
              <div className="absolute inset-x-2.5 bottom-2.5 space-y-1.5">
                <div className="h-4 w-4/5 rounded bg-white/15" />
                <div className="h-3 w-1/2 rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Catalog Row 2 Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-6 w-44 rounded-lg bg-white/15" />
            <div className="h-3.5 w-64 rounded bg-white/5" />
          </div>
          <div className="h-4 w-24 rounded bg-white/10" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-2xl bg-[#141720] border border-white/5 relative overflow-hidden"
            >
              <div className="absolute inset-x-2.5 bottom-2.5 space-y-1.5">
                <div className="h-4 w-4/5 rounded bg-white/15" />
                <div className="h-3 w-1/2 rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
