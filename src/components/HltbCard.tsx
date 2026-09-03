"use client";

import React, { useState } from "react";
import { HLTBData } from "@/lib/types";
import { Clock, Sword, Compass, Crown, Calculator, Calendar, CheckCircle2 } from "lucide-react";

interface HltbCardProps {
  hltb: HLTBData | null | undefined;
  compact?: boolean;
  userPlaytimeHours?: number | null;
}

export default function HltbCard({ hltb, compact = false, userPlaytimeHours }: HltbCardProps) {
  const [dailyHours, setDailyHours] = useState<number>(2);

  if (!hltb || (!hltb.mainStory && !hltb.mainExtra && !hltb.completionist)) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-3 text-center text-xs text-gray-400">
        <Clock className="w-4 h-4 mx-auto mb-1 opacity-50" />
        Tempo de jogo ainda não estimado
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
          <div className="text-sm font-bold text-white mt-0.5">
            {hltb.mainStory ? `${hltb.mainStory}h` : "--"}
          </div>
        </div>
        <div className="rounded-lg bg-purple-950/40 border border-purple-800/30 p-2">
          <div className="text-[10px] uppercase font-semibold text-purple-300 flex items-center justify-center gap-1">
            <Compass className="w-3 h-3" /> + Extras
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {hltb.mainExtra ? `${hltb.mainExtra}h` : "--"}
          </div>
        </div>
        <div className="rounded-lg bg-amber-950/40 border border-amber-800/30 p-2">
          <div className="text-[10px] uppercase font-semibold text-amber-300 flex items-center justify-center gap-1">
            <Crown className="w-3 h-3" /> 100%
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
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

  // Cálculo do Progresso Pessoal
  const hasPlaytime = typeof userPlaytimeHours === "number" && userPlaytimeHours > 0;
  const storyProgress = hasPlaytime && hltb.mainStory
    ? Math.min(100, Math.round((userPlaytimeHours / hltb.mainStory) * 100))
    : 0;

  return (
    <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <h4 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Clock className="w-5 h-5" />
            </div>
            Duração Média para Zerar (HowLongToBeat)
          </h4>
          <p className="text-xs text-gray-400">
            Estimativa calculada pela comunidade com base no estilo de jogo.
          </p>
        </div>
        <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 w-fit">
          {hltb.source || "IGDB / HLTB"}
        </span>
      </div>

      {/* Grid com os 3 Modos de Duração */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* História Principal */}
        <div className="group rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-950/25 to-blue-900/5 p-4 transition-all hover:border-blue-500/40 shadow-lg">
          <div className="flex items-center justify-between text-blue-400 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sword className="w-4 h-4" /> Campanha Principal
            </span>
          </div>
          <div className="text-3xl font-black text-white mt-1">
            {hltb.mainStory ? (
              <>
                {hltb.mainStory} <span className="text-sm font-medium text-gray-400">horas</span>
              </>
            ) : (
              <span className="text-gray-500 text-lg">--</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">Foco direto na história e objetivos principais</p>
        </div>

        {/* Principal + Extras */}
        <div className="group rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-950/25 to-purple-900/5 p-4 transition-all hover:border-purple-500/40 shadow-lg">
          <div className="flex items-center justify-between text-purple-400 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> História + Extras
            </span>
          </div>
          <div className="text-3xl font-black text-white mt-1">
            {hltb.mainExtra ? (
              <>
                {hltb.mainExtra} <span className="text-sm font-medium text-gray-400">horas</span>
              </>
            ) : (
              <span className="text-gray-500 text-lg">--</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">Campanha principal + missões e conteúdo secundário</p>
        </div>

        {/* 100% Complecionista */}
        <div className="group rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-950/25 to-amber-900/5 p-4 transition-all hover:border-amber-500/40 shadow-lg">
          <div className="flex items-center justify-between text-amber-400 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-4 h-4" /> 100% / Platina
            </span>
          </div>
          <div className="text-3xl font-black text-white mt-1">
            {hltb.completionist ? (
              <>
                {hltb.completionist} <span className="text-sm font-medium text-gray-400">horas</span>
              </>
            ) : (
              <span className="text-gray-500 text-lg">--</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">Todos os troféus, segredos, colecionáveis e desafios</p>
        </div>
      </div>

      {/* Progresso Pessoal do Usuário (se registrado no perfil) */}
      {hasPlaytime && hltb.mainStory && (
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 sm:p-5 space-y-2.5">
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

          <div className="w-full h-3 rounded-full bg-black/60 overflow-hidden border border-white/10 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700 shadow-sm"
              style={{ width: `${storyProgress}%` }}
            />
          </div>

          <p className="text-[11px] text-gray-400">
            {storyProgress >= 100
              ? "🎉 Você já superou o tempo médio de campanha principal deste jogo!"
              : `Faltam aproximadamente ${Math.max(0, hltb.mainStory - userPlaytimeHours)} horas para concluir a história principal com base na média.`}
          </p>
        </div>
      )}

      {/* Calculadora de Ritmo de Jogo: "Quanto tempo levo para zerar?" */}
      <div className="rounded-2xl border border-white/5 bg-[#121316] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-400" />
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              Planejamento de Backlog: Quanto tempo levo?
            </h5>
          </div>

          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 text-xs">
            <span className="text-[10px] text-gray-400 px-2 font-medium">Jogando por dia:</span>
            {[1, 2, 3, 4].map((h) => (
              <button
                key={h}
                onClick={() => setDailyHours(h)}
                className={`px-2.5 py-0.5 rounded-lg font-bold font-mono transition-all ${
                  dailyHours === h
                    ? "bg-amber-400 text-black shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {storyDays && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div className="text-xs">
                <span className="text-gray-400 block text-[10px]">Campanha</span>
                <strong className="text-white font-bold">~{storyDays} dias</strong>{" "}
                <span className="text-[10px] text-gray-400">({(storyDays / 7).toFixed(1)} sem.)</span>
              </div>
            </div>
          )}

          {extraDays && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <div className="text-xs">
                <span className="text-gray-400 block text-[10px]">História + Extras</span>
                <strong className="text-white font-bold">~{extraDays} dias</strong>{" "}
                <span className="text-[10px] text-gray-400">({(extraDays / 7).toFixed(1)} sem.)</span>
              </div>
            </div>
          )}

          {platDays && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="text-xs">
                <span className="text-gray-400 block text-[10px]">100% Complecionista</span>
                <strong className="text-white font-bold">~{platDays} dias</strong>{" "}
                <span className="text-[10px] text-gray-400">({(platDays / 7).toFixed(1)} sem.)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
