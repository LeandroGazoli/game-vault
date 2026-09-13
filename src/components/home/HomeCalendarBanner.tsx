"use client";

import React from "react";
import Link from "next/link";
import { Calendar as CalendarIcon, ArrowRight } from "lucide-react";

export default function HomeCalendarBanner() {
  return (
    <section className="calendar-banner rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#11141a] to-indigo-950/40 border border-cyan-500/20 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <CalendarIcon className="w-3.5 h-3.5 text-cyan-400" /> Calendário Mensal
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Nunca perca a estreia de um grande jogo.
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
          Acompanhe o dia a dia de lançamentos mês a mês, filtre por datas e adicione os títulos mais aguardados diretamente à sua lista de desejos.
        </p>
      </div>

      <Link
        href="/calendar"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-bold px-6 sm:px-8 py-3.5 text-xs sm:text-sm transition-all shadow-xl active:scale-95 flex-shrink-0"
      >
        <span className="whitespace-nowrap">Abrir Calendário de Lançamentos</span>
        <ArrowRight className="w-4 h-4 shrink-0 text-black" />
      </Link>
    </section>
  );
}
