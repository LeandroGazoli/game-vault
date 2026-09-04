import React from "react";

export default function CalendarLoading() {
  return (
    <div className="space-y-8 pb-16 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="rounded-[32px] bg-[#18191c]/80 border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="max-w-2xl space-y-3">
          <div className="h-6 w-44 rounded-full bg-white/10" />
          <div className="h-8 sm:h-10 w-80 rounded-2xl bg-white/15" />
          <div className="h-4 w-full max-w-md rounded bg-white/5" />
        </div>

        {/* Month Selector Bar Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2 bg-[#12141a] p-1.5 rounded-2xl border border-white/10">
            <div className="w-8 h-8 rounded-xl bg-white/10" />
            <div className="h-5 w-32 rounded bg-white/10 mx-2" />
            <div className="w-8 h-8 rounded-xl bg-white/10" />
          </div>
          <div className="h-8 w-28 rounded-xl bg-white/10" />
        </div>
      </div>

      {/* Main Grid: Feed + Mini Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Feed de Dias (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {[1, 2, 3].map((day) => (
            <div key={day} className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="h-6 w-40 rounded-lg bg-white/15" />
                <div className="h-4 w-24 rounded bg-white/10" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {[1, 2, 3, 4].map((j) => (
                  <div
                    key={j}
                    className="aspect-[3/4] rounded-2xl bg-[#18191c]/80 border border-white/5 relative overflow-hidden"
                  >
                    <div className="absolute inset-x-2 bottom-2 space-y-1">
                      <div className="h-3.5 w-3/4 rounded bg-white/15" />
                      <div className="h-3 w-1/2 rounded bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Mini Calendar (4 cols) */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          <div className="rounded-3xl bg-[#18191c]/80 border border-white/10 p-5 space-y-4">
            <div className="h-5 w-32 rounded bg-white/15" />
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-white/5" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
