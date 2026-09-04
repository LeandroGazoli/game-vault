import React from "react";

export default function CategoriasLoading() {
  return (
    <div className="space-y-10 pb-16 pt-2 animate-pulse">
      {/* Hero da Página de Categorias Skeleton */}
      <section className="relative rounded-3xl border border-white/10 bg-[#12151e] p-8 sm:p-12 shadow-2xl space-y-4">
        <div className="h-6 w-44 rounded-full bg-white/10" />
        <div className="h-10 sm:h-14 w-3/4 max-w-lg rounded-2xl bg-white/15" />
        <div className="h-4 w-full max-w-xl rounded bg-white/5" />
      </section>

      {/* Grid com Categorias Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col justify-between p-6 rounded-3xl border border-white/10 bg-[#10131b] min-h-[240px] relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 rounded-xl bg-white/10" />
              <div className="w-8 h-8 rounded-xl bg-white/5" />
            </div>
            <div className="space-y-2 mt-8">
              <div className="h-7 w-2/3 rounded-xl bg-white/15" />
              <div className="h-4 w-full rounded bg-white/5" />
              <div className="h-3 w-1/2 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
