import React from "react";

export default function ProfileLoading() {
  return (
    <div className="space-y-8 pb-20 animate-pulse">
      {/* Profile Hero Skeleton */}
      <div className="rounded-[32px] bg-[#14161f] border border-white/10 overflow-hidden shadow-2xl">
        {/* Banner */}
        <div className="h-40 sm:h-56 bg-white/5 w-full relative" />
        
        {/* Info Area */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#1e2330] border-4 border-[#14161f] shrink-0" />
              <div className="space-y-2 pb-1">
                <div className="h-6 w-44 rounded-lg bg-white/15" />
                <div className="h-4 w-28 rounded bg-white/10" />
              </div>
            </div>
            
            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2">
              <div className="h-9 w-28 rounded-xl bg-white/10" />
              <div className="h-9 w-24 rounded-xl bg-white/5" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview Skeleton (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-[#14161f] border border-white/10 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-20 rounded bg-white/10" />
              <div className="w-7 h-7 rounded-lg bg-white/5" />
            </div>
            <div className="h-7 w-16 rounded bg-white/20" />
          </div>
        ))}
      </div>

      {/* Status Shelf Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-hidden py-1 border-b border-white/5 pb-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-9 w-24 rounded-xl bg-white/10 shrink-0" />
          ))}
        </div>

        {/* Game Shelf Grid (12 Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
            <div
              key={n}
              className="aspect-[3/4] rounded-2xl bg-[#14161f] border border-white/5 relative overflow-hidden"
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
