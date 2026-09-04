import React from "react";

export default function RankingsLoading() {
  return (
    <div className="space-y-8 pb-16 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="rounded-[32px] bg-[#12151d] border border-[#242a36] p-6 sm:p-8 space-y-4">
        <div className="h-6 w-48 rounded-full bg-white/10" />
        <div className="h-9 sm:h-12 w-3/4 max-w-xl rounded-2xl bg-white/15" />
        <div className="h-4 w-full max-w-lg rounded bg-white/5" />
      </div>

      {/* Categories & Scope Controls Skeleton */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2 overflow-hidden py-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-9 w-36 rounded-xl bg-white/10 shrink-0" />
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
          <div className="h-4 w-28 rounded bg-white/10" />
          <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-14 rounded-lg bg-white/10" />
            ))}
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-52 rounded-2xl bg-[#12151c] border border-[#222834] p-4 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-white/10" />
              <div className="w-12 h-6 rounded-md bg-white/10" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded bg-white/15" />
              <div className="h-3 w-1/2 rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>

      {/* Ranking List Rows Skeleton */}
      <div className="space-y-2.5">
        {[4, 5, 6, 7, 8, 9, 10].map((rank) => (
          <div
            key={rank}
            className="h-18 rounded-2xl bg-[#12151c]/70 border border-white/5 p-3 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-white/10 shrink-0" />
              <div className="w-11 h-14 rounded-lg bg-white/10 shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-4 w-1/2 rounded bg-white/15" />
                <div className="h-3 w-1/3 rounded bg-white/5" />
              </div>
            </div>
            <div className="w-12 h-8 rounded-lg bg-white/10 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
