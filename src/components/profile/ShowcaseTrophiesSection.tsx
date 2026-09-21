"use client";

import React, { useState } from "react";
import { ImportedTrophyItem } from "@/lib/types/profile.types";
import { Trophy, Award, Sparkles, Plus, ExternalLink, ShieldCheck } from "lucide-react";

interface ShowcaseTrophiesSectionProps {
  trophies?: ImportedTrophyItem[];
  isOwner?: boolean;
}

const DEFAULT_TROPHIES: ImportedTrophyItem[] = [
  {
    id: "er_plat",
    gameTitle: "Elden Ring",
    trophyName: "Elden Ring",
    description: "Desbloqueou todas as conquistas e restaurou a Ordem Áurea nas Terras Intermédias.",
    iconUrl: "https://community.cloudflare.steamstatic.com/public/images/apps/1245620/a9a4897f2c98d63567b5797f1f31f9e9a4f494f6.jpg",
    platform: "steam",
    rarity: 9.8,
    isPlatinum: true,
  },
  {
    id: "p5r_plat",
    gameTitle: "Persona 5 Royal",
    trophyName: "The Phenomenal Phantom Thief",
    description: "Obtained all trophies. Mastered the Metaverse and stole every distorted heart.",
    iconUrl: "https://community.cloudflare.steamstatic.com/public/images/apps/1687950/2205511cb93d7c2a714652c7be0f9f30e9d6d84f.jpg",
    platform: "steam",
    rarity: 15.4,
    isPlatinum: true,
  },
  {
    id: "bb_plat",
    gameTitle: "Bloodborne",
    trophyName: "Bloodborne",
    description: "Todos os troféus obtidos. Entrou no pesadelo e acordou sob o sol da manhã.",
    iconUrl: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=150",
    platform: "psn",
    rarity: 6.3,
    isPlatinum: true,
  },
  {
    id: "gow_plat",
    gameTitle: "God of War Ragnarök",
    trophyName: "The Bear and the Wolf",
    description: "Colecionou todos os troféus. O destino foi moldado.",
    iconUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150",
    platform: "psn",
    rarity: 8.2,
    isPlatinum: true,
  },
  {
    id: "sekiro_plat",
    gameTitle: "Sekiro: Shadows Die Twice",
    trophyName: "Man Without Equal",
    description: "Derrotou todos os chefes no auge do conflito em Ashina.",
    iconUrl: "https://community.cloudflare.steamstatic.com/public/images/apps/814380/7e6fcadfb9d5cbfb88301ec4c41499f579177a3d.jpg",
    platform: "steam",
    rarity: 10.2,
    isPlatinum: true,
  },
];

export default function ShowcaseTrophiesSection({
  trophies = DEFAULT_TROPHIES,
  isOwner = false,
}: ShowcaseTrophiesSectionProps) {
  const [selectedTrophy, setSelectedTrophy] = useState<ImportedTrophyItem | null>(null);
  const displayTrophies = trophies.length > 0 ? trophies : DEFAULT_TROPHIES;

  return (
    <div className="rounded-3xl bg-[#141822] border border-white/10 p-4 sm:p-5 shadow-lg space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
              <span>Vitrine de Troféus &amp; Platinas</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                Steam / PSN / Xbox
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">
              Conquistas mais raras e platinas importadas diretamente das redes conectadas
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Troféus Raros */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
        {displayTrophies.map((trophy) => {
          const isSelected = selectedTrophy?.id === trophy.id;
          return (
            <div
              key={trophy.id}
              onClick={() => setSelectedTrophy(isSelected ? null : trophy)}
              className={`group relative rounded-2xl p-2.5 cursor-pointer border transition-all duration-300 ${
                isSelected
                  ? "bg-[#1d2433] border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                  : "bg-[#181d28] border-white/5 hover:border-cyan-500/30"
              }`}
            >
              {/* Ícone da Conquista / Troféu */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-[#0d1017] border border-white/10 flex items-center justify-center">
                <img
                  src={trophy.iconUrl}
                  alt={trophy.trophyName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150";
                  }}
                />

                {/* Badge da Plataforma */}
                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase bg-black/75 backdrop-blur-sm text-cyan-300 border border-white/10">
                  {trophy.platform}
                </span>

                {/* Badge Platina / 100% */}
                {trophy.isPlatinum && (
                  <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-md bg-cyan-500 text-black flex items-center justify-center font-black shadow-md">
                    <Sparkles className="w-3 h-3" />
                  </span>
                )}
              </div>

              {/* Informações */}
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {trophy.trophyName}
                </h3>
                <p className="text-[10px] text-gray-400 truncate">{trophy.gameTitle}</p>
                {trophy.rarity && (
                  <p className="text-[9px] font-mono text-cyan-400/90 font-semibold pt-0.5">
                    {trophy.rarity}% raridade
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Banner de Detalhes do Troféu Selecionado */}
      {selectedTrophy && (
        <div className="p-3 rounded-2xl bg-[#1d2433] border border-cyan-500/30 flex items-start gap-3 animate-fadeIn">
          <Award className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 min-w-0">
            <h4 className="text-xs font-bold text-white">
              {selectedTrophy.trophyName} •{" "}
              <span className="text-cyan-300">{selectedTrophy.gameTitle}</span>
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              {selectedTrophy.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
