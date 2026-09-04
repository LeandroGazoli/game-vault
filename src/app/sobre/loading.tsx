import React from "react";

export default function InstitutionalLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 pt-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-32 rounded-full bg-white/10" />
        <div className="h-10 sm:h-12 w-3/4 rounded-2xl bg-white/15" />
        <div className="h-4 w-full max-w-lg rounded bg-white/5" />
      </div>

      {/* Content Skeleton Card */}
      <div className="rounded-3xl bg-[#14161f] border border-white/10 p-6 sm:p-10 space-y-6">
        <div className="h-7 w-48 rounded-xl bg-white/15" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-white/5" />
          <div className="h-4 w-11/12 rounded bg-white/5" />
          <div className="h-4 w-4/5 rounded bg-white/5" />
        </div>

        <div className="h-7 w-40 rounded-xl bg-white/15 pt-4" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-white/5" />
          <div className="h-4 w-5/6 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}
