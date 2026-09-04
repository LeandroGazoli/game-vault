import React from "react";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-[#18191c] rounded-xl" />
      <div className="h-32 bg-[#18191c] rounded-[28px]" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square bg-[#18191c] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
