"use client";

import React, { useState } from "react";
import { HLTBData } from "@/lib/types";
import { Clock, Sword, Compass, Crown, CheckCircle2 } from "lucide-react";

interface HltbCardProps {
  hltb: HLTBData | null | undefined;
  compact?: boolean;
  userPlaytimeHours?: number | null;
}

export default function HltbCard({ hltb, compact = false, userPlaytimeHours }: HltbCardProps) {
  const [dailyHours, setDailyHours] = useState<number>(1);

  if (!hltb || (!hltb.mainStory && !hltb.mainExtra && !hltb.completionist)) {
    return (
      <div className="glass-card rounded-2xl p-5 text-center text-xs text-zinc-400 border border-white/10">
        <Clock className="w-4 h-4 mx-auto mb-1 opacity-50 text-cyan-400" />
        Tempo de jogo ainda não estimado pela comunidade
      </div>
    );
  }

  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-blue-950/40 border border-blue-800/30 p-2">
          <div className="text-[10px] uppercase font-semibold text-blue-300 flex items-center justify-center gap-1">
            <Sword className="w-3 h-3" /> Principal
          </div>
          <div className="text-sm font-bold text-white mt-0.5 font-mono">
            {hltb.mainStory ? `${hltb.mainStory}h` : "--"}
          </div>
        </div>
        <div className="rounded-lg bg-purple-950/40 border border-purple-800/30 p-2">
          <div className="text-[10px] uppercase font-semibold text-purple-300 flex items-center justify-center gap-1">
            <Compass className="w-3 h-3" /> + Extras
          </div>
          <div className="text-sm font-bold text-white mt-0.5 font-mono">
            {hltb.mainExtra ? `${hltb.mainExtra}h` : "--"}
          </div>
        </div>
        <div className="rounded-lg bg-amber-950/40 border border-amber-800/30 p-2">
          <div className="text-[10px] uppercase font-semibold text-amber-300 flex items-center justify-center gap-1">
            <Crown className="w-3 h-3" /> 100%
          </div>
          <div className="text-sm font-bold text-white mt-0.5 font-mono">
            {hltb.completionist ? `${hltb.completionist}h` : "--"}
          </div>
        </div>
      </div>
    );
  }

  // Cálculos da Calculadora de Ritmo
  const storyDays = hltb.mainStory ? Math.ceil(hltb.mainStory / dailyHours) : null;
  const extraDays = hltb.mainExtra ? Math.ceil(hltb.mainExtra / dailyHours) : null;
  const platDays = hltb.completionist ? Math.ceil(hltb.completionist / dailyHours) : null;

  // Progresso pessoal se o usuário tiver horas registradas
  const hasPlaytime = typeof userPlaytimeHours === "number" && userPlaytimeHours > 0;
  const storyProgress = hasPlaytime && hltb.mainStory
    ? Math.min(100, Math.round((userPlaytimeHours / hltb.mainStory) * 100))
    : 0;

  return (
    <section className="glass-card rounded-2xl p-6 lg:p-7 border border-white/10 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Duração Média para Zerar</h2>
            <p className="text-xs text-zinc-400">Dados integrados e aferidos pela comunidade HowLongToBeat</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
          {hltb.source || "IGDB Community Time"}
        </span>
      </div>

      {/* Os 3 Pilares Principais de Duração */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Campanha Principal */}
        <div className="p-4 rounded-xl bg-gradient-to-b from-[#141d2d] to-[#121622] border border-cyan-500/20 text-center">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Campanha Principal</div>
          <div className="text-3xl font-black font-mono text-cyan-300 tracking-tight">
            {hltb.mainStory ? (
              <>
                {hltb.mainStory} <span className="text-base text-zinc-400 font-medium font-sans">horas</span>
              </>
            ) : (
              <span className="text-zinc-500 text-lg">--</span>
            )}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Foco direto no enredo e missões primárias</div>
        </div>

        {/* História + Extras */}
        <div className="p-4 rounded-xl bg-gradient-to-b from-[#1c1c2a] to-[#121622] border border-purple-500/20 text-center">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">História + Extras</div>
          <div className="text-3xl font-black font-mono text-purple-300 tracking-tight">
            {hltb.mainExtra ? (
              <>
                {hltb.mainExtra} <span className="text-base text-zinc-400 font-medium font-sans">horas</span>
              </>
            ) : (
              <span className="text-zinc-500 text-lg">--</span>
            )}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Missões paralelas, assaltos e hobbies</div>
        </div>

        {/* 100% / Platina */}
        <div className="p-4 rounded-xl bg-gradient-to-b from-[#251e1e] to-[#121622] border border-amber-500/20 text-center">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">100% / Platina</div>
          <div className="text-3xl font-black font-mono text-amber-300 tracking-tight">
            {hltb.completionist ? (
              <>
                {hltb.completionist} <span className="text-base text-zinc-400 font-medium font-sans">horas</span>
              </>
            ) : (
              <span className="text-zinc-500 text-lg">--</span>
            )}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Todos os troféus, colecionáveis e segredos</div>
        </div>
      </div>

      {/* Progresso Pessoal do Jogador (se tiver horas registradas) */}
      {hasPlaytime && hltb.mainStory && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Seu Progresso de Campanha
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300">
              {userPlaytimeHours}h jogadas / ~{hltb.mainStory}h ({storyProgress}%)
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-black/60 overflow-hidden border border-white/10 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-700"
              style={{ width: `${storyProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Calculadora Interativa de Backlog */}
      <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="text-emerald-400 font-mono">⚡</span> Planejador de Backlog: Quanto tempo levo?
            </div>
            <div className="text-[11px] text-zinc-400">Selecione sua média de tempo diário para estimar o término:</div>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setDailyHours(h)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  dailyHours === h
                    ? "bg-emerald-500 text-black shadow"
                    : "bg-white/5 hover:bg-white/10 text-zinc-300"
                }`}
              >
                {h}h/dia
              </button>
            ))}
          </div>
        </div>

        {/* Resultados das Estimativas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs">
            <span className="text-zinc-400">Só a Campanha:</span>
            <span className="font-mono font-bold text-emerald-400">
              {storyDays ? `~${storyDays} dias (${(storyDays / 7).toFixed(1)} sem.)` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs">
            <span className="text-zinc-400">História + Extras:</span>
            <span className="font-mono font-bold text-purple-400">
              {extraDays ? `~${extraDays} dias (${(extraDays / 7).toFixed(1)} sem.)` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs">
            <span className="text-zinc-400">Platina Total:</span>
            <span className="font-mono font-bold text-amber-400">
              {platDays ? `~${platDays} dias (${(platDays / 7).toFixed(1)} sem.)` : "—"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
