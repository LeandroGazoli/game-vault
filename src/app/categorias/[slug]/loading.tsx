import React from "react";

export default function CategoryDetailLoading() {
  return (
    <div className="space-y-8 pb-16 pt-2 animate-pulse">
      {/* Category Hero Banner Skeleton */}
      <section className="relative rounded-3xl border border-white/10 bg-[#12151e] p-8 sm:p-12 shadow-2xl space-y-4">
        <div className="h-6 w-32 rounded-full bg-white/10" />
        <div className="h-10 sm:h-12 w-2/3 max-w-md rounded-2xl bg-white/15" />
        <div className="h-4 w-full max-w-xl rounded bg-white/5" />
      </section>

      {/* Filter Bar Skeleton */}
      <div className="flex items-center gap-2 overflow-hidden py-1 border-b border-white/5 pb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-28 rounded-full bg-white/10 shrink-0" />
        ))}
      </div>

      {/* Game Cards Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
          <div
            key={n}
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
  );
}
