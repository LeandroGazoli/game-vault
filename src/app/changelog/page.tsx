import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowLeft, Calendar, ShieldCheck, CheckCircle2 } from "lucide-react";
import { APP_VERSION, APP_RELEASE_DATE, RECENT_CHANGELOG } from "@/lib/version";

export const metadata: Metadata = {
  title: "Novidades & Atualizações • MyGameList",
  description: "Acompanhe todas as novidades, melhorias e lançamentos do MyGameList de forma simples e transparente.",
  alternates: {
    canonical: "/changelog",
  },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#0b0d12] text-[#e2e2e9] pb-24 selection:bg-[#10b981] selection:text-black">
      {/* Top Header */}
      <div className="border-b border-white/10 bg-[#0f121a]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Voltar ao Início</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-400">{APP_VERSION}</span>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Hero da Página */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Histórico de Atualizações</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Novidades &amp; Melhorias do MyGameList
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl leading-relaxed">
            Aqui você acompanha tudo o que foi implementado e aprimorado no aplicativo em uma linguagem direta, simples e sem complicações técnicas.
          </p>
        </div>

        {/* Linha do Tempo de Atualizações */}
        <div className="space-y-6">
          {RECENT_CHANGELOG.map((entry, idx) => {
            const isLatest = idx === 0;
            return (
              <article
                key={entry.version}
                className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                  isLatest
                    ? "bg-[#141822] border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.08)]"
                    : "bg-[#12151e] border-white/10"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-xs sm:text-sm font-mono font-black px-2.5 py-1 rounded-xl ${
                        isLatest
                          ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                          : "bg-white/10 text-white font-semibold"
                      }`}
                    >
                      {entry.version}
                    </span>
                    {isLatest && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        Versão Atual
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <span>{entry.date}</span>
                  </div>
                </div>

                <h2 className="text-base sm:text-lg font-black text-white mb-3">
                  {entry.title}
                </h2>

                <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
                  {entry.highlights.map((highlight, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2.5 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        {/* Rodapé Interno da Página */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1 text-xs text-gray-400">
          <p className="font-semibold text-white">Transparência para a Comunidade Gamer</p>
          <p>
            Trabalhamos constantemente para tornar seu gerenciamento de jogos mais fluido, bonito e completo.
          </p>
        </div>
      </main>
    </div>
  );
}
