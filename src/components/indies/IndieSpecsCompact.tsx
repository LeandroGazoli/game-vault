"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IndieGame } from "@/lib/types/indie.types";
import { getGameUrl } from "@/lib/routes";
import {
  Monitor,
  Gamepad2,
  Link2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface IndieSpecsCompactProps {
  game: IndieGame;
}

export default function IndieSpecsCompact({ game }: IndieSpecsCompactProps) {
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Card Retrátil de Ficha Técnica */}
      <div className="rounded-3xl border border-white/10 bg-[#141822] overflow-hidden shadow-xl transition-all">
        {/* Cabeçalho Interativo em Accordion */}
        <button
          type="button"
          onClick={() => setIsSpecsOpen(!isSpecsOpen)}
          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                Ficha Técnica &amp; Detalhes
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                {game.developerName} • {game.platforms.join(", ")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-mono text-gray-500 hidden sm:inline">
              {isSpecsOpen ? "Recolher" : "Expandir"}
            </span>
            <div className="w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
              {isSpecsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </button>

        {/* Conteúdo Expansível com Animação */}
        {isSpecsOpen && (
          <div className="p-4 sm:p-5 pt-0 border-t border-white/5 space-y-3 text-xs animate-fadeIn">
            <div className="divide-y divide-white/5">
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Desenvolvedora:</span>
                <span className="font-semibold text-emerald-400">{game.developerName}</span>
              </div>

              {game.publisherName && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Distribuidora:</span>
                  <span className="font-semibold text-white">{game.publisherName}</span>
                </div>
              )}

              {game.releaseDate && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Lançamento:</span>
                  <span className="font-mono text-gray-200">{game.releaseDate}</span>
                </div>
              )}

              {game.gameModes && game.gameModes.length > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Modos de Jogo:</span>
                  <span className="font-semibold text-white">{game.gameModes.join(", ")}</span>
                </div>
              )}

              {game.playerPerspectives && game.playerPerspectives.length > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Câmera / Visão:</span>
                  <span className="font-semibold text-white">
                    {game.playerPerspectives.join(", ")}
                  </span>
                </div>
              )}

              {game.themes && game.themes.length > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Temas:</span>
                  <span className="font-semibold text-cyan-300">{game.themes.join(", ")}</span>
                </div>
              )}

              <div className="flex justify-between py-2">
                <span className="text-gray-400">Classificação:</span>
                <span className="font-bold text-amber-400">{game.ageRating || "Livre"}</span>
              </div>

              {game.ptbrSupport && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Português (Brasil):</span>
                  <span className="font-semibold text-emerald-400">
                    {game.ptbrSupport.audio
                      ? "Dublado & Legendado 🇧🇷"
                      : game.ptbrSupport.subtitles
                      ? "Legendas & Interface 🇧🇷"
                      : "Interface 🇧🇷"}
                  </span>
                </div>
              )}
            </div>

            {/* Plataformas em Pills Compactas */}
            <div className="pt-2">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Plataformas Disponíveis:
              </span>
              <div className="flex flex-wrap gap-1">
                {game.platforms.map((plat) => (
                  <span
                    key={plat}
                    className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-gray-300"
                  >
                    {plat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vínculo com Catálogo Principal Game Vault */}
      {game.linkedGameId && (
        <div className="rounded-3xl border border-cyan-500/30 bg-cyan-500/5 p-4 sm:p-5 space-y-2.5 shadow-lg">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
            <Link2 className="w-4 h-4" />
            <span>Catálogo Principal Game Vault</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Conectado à base oficial: adicione ao backlog, registre horas jogadas e avalie com a comunidade.
          </p>
          <Link
            href={getGameUrl({
              id: game.linkedGameId,
              name: game.linkedGameName || game.title,
              slug: game.linkedGameSlug,
            })}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 h-10 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-colors"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Ver no Catálogo do Vault</span>
          </Link>
        </div>
      )}

      {/* Selo Informativo de Criador */}
      <div className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-1.5">
        <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Desenvolvedor Certificado
        </span>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Projeto aprovado pela curadoria comunitária do MyGameList. Criadores recebem insígnia exclusiva no perfil.
        </p>
      </div>
    </div>
  );
}
