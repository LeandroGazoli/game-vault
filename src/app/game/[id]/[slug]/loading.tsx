import React from "react";

export default function GameDetailLoading() {
  return (
    <div className="min-h-screen pb-20 animate-pulse space-y-6">
      {/* Botão Voltar Skeleton */}
      <div className="h-5 w-20 rounded-lg bg-white/10" />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna Esquerda: Poster & Ações Rápidas */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start space-y-5">
            <div className="w-52 sm:w-64 aspect-[3/4] rounded-3xl bg-[#181c26] border-2 border-white/10 shadow-2xl" />
            <div className="w-full space-y-2.5 max-w-xs">
              <div className="h-12 w-full rounded-2xl bg-[#00E5FF]/20 border border-[#00E5FF]/30" />
              <div className="h-11 w-full rounded-2xl bg-white/5 border border-white/10" />
            </div>
          </div>

          {/* Coluna Direita: Informações, Sinopse e HLTB */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header: Título & Badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-6 w-20 rounded-full bg-white/10" />
                <div className="h-6 w-24 rounded-full bg-white/10" />
                <div className="h-6 w-16 rounded-full bg-white/10" />
              </div>
              <div className="h-10 sm:h-14 w-4/5 rounded-2xl bg-white/15" />
              <div className="flex items-center gap-3">
                <div className="h-8 w-14 rounded-lg bg-emerald-500/20" />
                <div className="h-4 w-48 rounded bg-white/10" />
              </div>
            </div>

            {/* HowLongToBeat Card Skeleton */}
            <div className="rounded-3xl bg-[#141722] border border-white/10 p-5 sm:p-6 space-y-4">
              <div className="h-5 w-48 rounded bg-white/15" />
              <div className="grid grid-cols-3 gap-3">
                <div className="h-20 rounded-2xl bg-white/5 p-3" />
                <div className="h-20 rounded-2xl bg-white/5 p-3" />
                <div className="h-20 rounded-2xl bg-white/5 p-3" />
              </div>
            </div>

            {/* Sinopse Skeleton */}
            <div className="rounded-3xl bg-[#141722] border border-white/10 p-5 sm:p-6 space-y-3">
              <div className="h-5 w-32 rounded bg-white/15" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-white/5" />
                <div className="h-4 w-full rounded bg-white/5" />
                <div className="h-4 w-3/4 rounded bg-white/5" />
              </div>
            </div>

            {/* Screenshots / Galeria Skeleton */}
            <div className="space-y-3">
              <div className="h-5 w-40 rounded bg-white/15" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="aspect-video rounded-2xl bg-white/5" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
