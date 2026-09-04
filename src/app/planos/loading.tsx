import React from "react";

export default function PlanosLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center space-y-4 max-w-2xl mx-auto pt-6">
        <div className="h-6 w-40 rounded-full bg-white/10 mx-auto" />
        <div className="h-10 sm:h-12 w-3/4 rounded-2xl bg-white/15 mx-auto" />
        <div className="h-4 w-full rounded bg-white/5 mx-auto" />
      </div>

      {/* Plan Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {[1, 2, 3].map((card) => (
          <div
            key={card}
            className="rounded-3xl bg-[#14161f] border border-white/10 p-6 sm:p-8 space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="h-6 w-24 rounded-full bg-white/10" />
              <div className="h-8 w-36 rounded-xl bg-white/15" />
              <div className="h-4 w-full rounded bg-white/5" />
              <div className="space-y-2.5 pt-4 border-t border-white/5">
                {[1, 2, 3, 4, 5].map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-white/10 shrink-0" />
                    <div className="h-3.5 w-3/4 rounded bg-white/5" />
                  </div>
                ))}
              </div>
            </div>
            <div className="h-12 w-full rounded-2xl bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
