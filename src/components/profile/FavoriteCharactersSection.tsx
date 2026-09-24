"use client";

import React from "react";
import { FavoriteCharacter } from "@/lib/types/profile.types";
import { Heart, User, Sparkles } from "lucide-react";

interface FavoriteCharactersSectionProps {
  characters?: FavoriteCharacter[];
  isOwner?: boolean;
}

const DEFAULT_CHARACTERS: FavoriteCharacter[] = [
  { id: "1", name: "Joker", gameTitle: "Persona 5 Royal", imageUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.webp" },
  { id: "2", name: "Kazuma Kiryu", gameTitle: "Yakuza / Like a Dragon", imageUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co20wa.webp" },
  { id: "3", name: "Cloud Strife", gameTitle: "Final Fantasy VII", imageUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1x77.webp" },
  { id: "4", name: "Crono", gameTitle: "Chrono Trigger", imageUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1x0m.webp" },
  { id: "5", name: "Vivi Ornitier", gameTitle: "Final Fantasy IX", imageUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tnt.webp" },
];

export default function FavoriteCharactersSection({
  characters = [],
}: FavoriteCharactersSectionProps) {
  if (!characters || characters.length === 0) {
    return null;
  }

  const displayCharacters = characters;

  return (
    <div className="rounded-3xl bg-[#141822] border border-white/10 p-4 sm:p-5 shadow-lg space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
            <Heart className="w-4 h-4 fill-rose-500/20" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
              <span>Personagens Favoritos</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                Top 5
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">
              Ícones e heróis mais marcantes da jornada nos games
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Personagens */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
        {displayCharacters.slice(0, 5).map((char, idx) => (
          <div
            key={char.id || idx}
            className="group relative rounded-2xl bg-[#181d28] border border-white/10 p-2 text-center transition-all duration-300 hover:border-rose-500/40 hover:-translate-y-0.5 overflow-hidden"
          >
            {/* Foto / Avatar do Personagem */}
            <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-[#0b0d12] relative">
              <img
                src={char.imageUrl}
                alt={char.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80";
                }}
              />
              <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-black text-rose-400 flex items-center justify-center border border-white/10">
                #{idx + 1}
              </div>
            </div>

            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-white truncate group-hover:text-rose-300 transition-colors">
                {char.name}
              </h3>
              <p className="text-[10px] text-gray-400 truncate">{char.gameTitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
