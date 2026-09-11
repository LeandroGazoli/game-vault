import React from "react";
import Link from "next/link";
import { Monitor, Building2, Globe } from "lucide-react";
import { Game } from "@/lib/types";
import {
  translateGenre,
  translateGameMode,
  translatePlayerPerspective,
} from "@/lib/gameUtils";
import { getAgeRatingBadge } from "./gameDetailHelpers";

interface GameSpecsTableProps {
  game: Game;
  isAdult?: boolean;
}

export default function GameSpecsTable({ game, isAdult }: GameSpecsTableProps) {
  return (
    <div className="glass-card rounded-2xl p-5 lg:p-6 border border-white/10 space-y-4">
      <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-white/10">
        <Monitor className="w-4 h-4 text-emerald-400" />
        <span>Ficha Técnica Detalhada</span>
      </h3>

      {/* Lista Key-Value Limpa e Compacta */}
      <div className="space-y-2.5 text-xs">
        {/* Gênero Principal */}
        {game.genres && game.genres[0] && (
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-zinc-400">Gênero Principal:</span>
            <span className="font-semibold text-white">
              {game.genres.slice(0, 3).map((g) => translateGenre(g.name)).join(" / ")}
            </span>
          </div>
        )}

        {/* Lançamento */}
        {game.released && (
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-zinc-400">Data de Lançamento:</span>
            <span className="font-mono font-semibold text-zinc-200">
              {new Date(game.released).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        )}

        {/* Desenvolvedora */}
        {game.developers && game.developers.length > 0 && (
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-zinc-400">Desenvolvedora:</span>
            <span className="font-semibold text-emerald-400">
              {game.developers.map((dev, idx) => (
                <Link
                  key={dev}
                  href={`/search?q=${encodeURIComponent(dev)}`}
                  className="hover:underline"
                >
                  {dev}{idx < game.developers!.length - 1 ? ", " : ""}
                </Link>
              ))}
            </span>
          </div>
        )}

        {/* Distribuidora */}
        {game.publishers && game.publishers.length > 0 && (
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-zinc-400">Distribuidora:</span>
            <span className="font-semibold text-zinc-200">
              {game.publishers.map((pub, idx) => (
                <Link
                  key={pub}
                  href={`/search?q=${encodeURIComponent(pub)}`}
                  className="hover:underline"
                >
                  {pub}{idx < game.publishers!.length - 1 ? ", " : ""}
                </Link>
              ))}
            </span>
          </div>
        )}

        {/* Classificação Indicativa */}
        <div className="flex justify-between items-center py-1.5 border-b border-white/5">
          <span className="text-zinc-400">Classificação:</span>
          <div>{getAgeRatingBadge(game.age_ratings, isAdult) || <span className="text-zinc-400">Livre</span>}</div>
        </div>

        {/* Português (Brasil) */}
        {game.ptbrSupport && (
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-zinc-400">Português (Brasil):</span>
            <span className="font-semibold text-emerald-400">
              {game.ptbrSupport.audio
                ? "Dublado & Legendado 🇧🇷"
                : game.ptbrSupport.subtitles
                ? "Legendas & Interface 🇧🇷"
                : "Interface"}
            </span>
          </div>
        )}

        {/* Modos de Jogo */}
        {game.game_modes && game.game_modes.length > 0 && (
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-zinc-400">Modos de Jogo:</span>
            <span className="font-semibold text-zinc-200">
              {game.game_modes.map((m) => translateGameMode(m)).join(", ")}
            </span>
          </div>
        )}

        {/* Câmera / Perspectiva */}
        {game.player_perspectives && game.player_perspectives.length > 0 && (
          <div className="flex justify-between py-1.5">
            <span className="text-zinc-400">Câmera / Visão:</span>
            <span className="font-semibold text-zinc-200">
              {game.player_perspectives.map((p) => translatePlayerPerspective(p)).join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* Plataformas Suportadas (Pills Mono) */}
      {game.platforms && game.platforms.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Plataformas Suportadas:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {game.platforms.map((p) => (
              <Link
                key={p.platform.id}
                href={`/search?platform=${encodeURIComponent(p.platform.name)}`}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-zinc-300 hover:text-white transition-colors"
                title={`Buscar jogos para ${p.platform.name}`}
              >
                {p.platform.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
