import React from "react";
import Link from "next/link";
import { IndieGame } from "@/lib/types/indie.types";
import { getGameUrl } from "@/lib/routes";
import IndieVoteButton from "./IndieVoteButton";
import { Gamepad2, ArrowRight, ExternalLink, Sparkles } from "lucide-react";

interface IndieGameCardProps {
  game: IndieGame;
}

export default function IndieGameCard({ game }: IndieGameCardProps) {
  const targetUrl =
    game.isCatalogGame && game.linkedGameId
      ? getGameUrl({
          id: game.linkedGameId,
          name: game.linkedGameName || game.title,
          slug: game.linkedGameSlug,
        })
      : `/indies/${game.slug}`;

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#141822] hover:border-emerald-500/40 transition-all duration-300 shadow-xl hover:shadow-emerald-950/10 hover:-translate-y-1">
      <div>
        <div className="relative h-48 w-full overflow-hidden bg-neutral-900">
          <img
            src={game.coverImage}
            alt={game.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141822] via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 font-bold text-[10px] uppercase tracking-wider font-mono">
              {game.isCatalogGame ? "Destaque Acervo" : game.platforms[0] || "Indie"}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-2.5">
          <div className="space-y-1">
            <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
              {game.title}
            </h3>
            <p className="text-[11px] text-gray-400">
              Desenvolvido por <strong className="text-gray-300">{game.developerName}</strong>
            </p>
          </div>

          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {game.tagline || game.description}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {game.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[10px] text-gray-400 font-mono"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 border-t border-white/5 mt-4 flex items-center justify-between gap-2">
        <IndieVoteButton
          gameId={game.id}
          initialVotesCount={game.votesCount || 0}
          initialVoters={game.voters || []}
          size="sm"
        />

        <Link
          href={targetUrl}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <span>{game.isCatalogGame ? "Ver no Acervo" : "Conhecer"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
