import React from "react";

export default function FeedbackLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="rounded-[32px] bg-[#14161f] border border-white/10 p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-3 max-w-xl">
          <div className="h-6 w-44 rounded-full bg-white/10" />
          <div className="h-9 sm:h-11 w-3/4 rounded-2xl bg-white/15" />
          <div className="h-4 w-full rounded bg-white/5" />
        </div>
        <div className="h-12 w-36 rounded-2xl bg-white/10 shrink-0" />
      </div>

      {/* Tabs & Controls Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-hidden py-1 border-b border-white/5 pb-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-28 rounded-xl bg-white/10 shrink-0" />
          ))}
        </div>

        {/* Feedback Cards Skeleton */}
        <div className="space-y-3.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="p-5 rounded-2xl bg-[#14161f] border border-white/10 flex items-start gap-4"
            >
              {/* Vote box */}
              <div className="w-12 h-16 rounded-xl bg-white/5 shrink-0" />
              {/* Content */}
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-20 rounded bg-white/10" />
                  <div className="h-4 w-16 rounded bg-white/5" />
                </div>
                <div className="h-5 w-3/4 rounded bg-white/15" />
                <div className="h-3.5 w-full max-w-md rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
