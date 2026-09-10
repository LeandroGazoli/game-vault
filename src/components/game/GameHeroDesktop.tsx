import React from "react";
import Link from "next/link";
import {
  Calendar,
  Sparkles,
  Search,
  Layers,
  Building2,
  Globe,
  Star,
  Edit3,
  Plus,
  ShoppingCart,
  ExternalLink,
} from "lucide-react";
import { Game, UserGame } from "@/lib/types";
import { translateGenre, translateTheme, getCategorySearchUrl } from "@/lib/gameUtils";
import MetacriticBadge from "@/components/MetacriticBadge";
import StatusBadge from "@/components/StatusBadge";
import GameReleaseCountdown, { isGameUnreleased } from "@/components/GameReleaseCountdown";
import { getAgeRatingBadge, getWebsiteMeta, GameWebsite } from "./gameDetailHelpers";

interface GameHeroDesktopProps {
  game: Game;
  posterError: boolean;
  onPosterError: () => void;
  isAdult?: boolean;
  userGame?: UserGame;
  storeWebsites: GameWebsite[];
  onOpenModal: () => void;
}

export default function GameHeroDesktop({
  game,
  posterError,
  onPosterError,
  isAdult,
  userGame,
  storeWebsites,
  onOpenModal,
}: GameHeroDesktopProps) {
  return (
    <div className="hidden lg:flex relative -mt-36 p-8 flex-row items-start gap-8">
      {/* Capa Poster */}
      <div className="w-52 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 bg-neutral-900 flex-shrink-0 group relative flex flex-col justify-end">
        {game.background_image && !posterError ? (
          <img
            src={game.background_image}
            alt=""
            decoding="async"
            onError={onPosterError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-[#1c222e] to-[#0f1218] text-gray-500 absolute inset-0">
            <Sparkles className="w-8 h-8 text-[#00E5FF]/40 mb-2" />
            <span className="text-xs font-semibold text-gray-300 line-clamp-2">{game.name}</span>
          </div>
        )}

        {/* Countdown Compacto na Capa (Desktop) */}
        {isGameUnreleased(game) && (
          <div className="relative z-10 w-full">
            <GameReleaseCountdown game={game} variant="floating" />
          </div>
        )}
      </div>

      {/* Dados do Jogo */}
      <div className="flex-1 min-w-0 space-y-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {getAgeRatingBadge(game.age_ratings, isAdult)}

          {game.released && (
            <span className="flex items-center gap-1 text-xs font-mono text-gray-300 bg-black/60 border border-white/10 px-3 py-1 rounded-full">
              <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
              {game.released.substring(0, 4)}
            </span>
          )}

          {(game.franchises?.[0] || game.collections?.[0]) && (
            <Link
              href={`/search?q=${encodeURIComponent(game.franchises?.[0] || game.collections?.[0] || "")}`}
              className="flex items-center gap-1 text-xs text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full hover:bg-amber-900/60 transition-colors"
              title="Ver todos os jogos desta franquia"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {game.franchises?.[0] || game.collections?.[0]}
            </Link>
          )}

          {game.ptbrSupport?.audio && (
            <span
              className="flex items-center gap-1 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full font-medium"
              title="Possui Dublagem em Português do Brasil"
            >
              🇧🇷 Dublado
            </span>
          )}
          {game.ptbrSupport?.subtitles && !game.ptbrSupport?.audio && (
            <span
              className="flex items-center gap-1 text-xs text-blue-300 bg-blue-950/60 border border-blue-500/30 px-3 py-1 rounded-full font-medium"
              title="Possui Legendas em Português do Brasil"
            >
              🇧🇷 Legendado
            </span>
          )}

          {game.genres?.map((g) => (
            <Link
              key={g.id}
              href={getCategorySearchUrl(g.name)}
              className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 hover:border-cyan-400 px-3 py-1 rounded-full font-medium transition-all shadow-sm hover:shadow-cyan-500/20 active:scale-95 group cursor-pointer"
              title={`Buscar outros jogos na categoria ${translateGenre(g.name)}`}
            >
              <Search className="w-3 h-3 text-cyan-400/80 group-hover:text-cyan-200 transition-colors" />
              <span>{translateGenre(g.name)}</span>
            </Link>
          ))}

          {game.themes?.slice(0, 2).map((t) => (
            <Link
              key={t}
              href={getCategorySearchUrl(t)}
              className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 hover:border-purple-400 px-3 py-1 rounded-full font-medium transition-all shadow-sm hover:shadow-purple-500/20 active:scale-95 group cursor-pointer"
              title={`Buscar jogos com o tema ${translateTheme(t)}`}
            >
              <Layers className="w-3 h-3 text-purple-400/80 group-hover:text-purple-200 transition-colors" />
              <span>{translateTheme(t)}</span>
            </Link>
          ))}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {game.name}
        </h1>

        {game.developers?.length || game.publishers?.length ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400 font-medium">
            {game.developers && game.developers.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                Dev:{" "}
                {game.developers.map((dev, idx) => (
                  <Link
                    key={dev}
                    href={`/search?q=${encodeURIComponent(dev)}`}
                    className="text-gray-200 hover:text-cyan-300 hover:underline font-bold transition-colors"
                    title={`Buscar todos os jogos desenvolvidos por ${dev}`}
                  >
                    {dev}{idx < game.developers!.length - 1 ? ", " : ""}
                  </Link>
                ))}
              </span>
            )}
            {game.publishers && game.publishers.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                Pub:{" "}
                {game.publishers.map((pub, idx) => (
                  <Link
                    key={pub}
                    href={`/search?q=${encodeURIComponent(pub)}`}
                    className="text-gray-200 hover:text-purple-300 hover:underline font-bold transition-colors"
                    title={`Buscar todos os jogos publicados por ${pub}`}
                  >
                    {pub}{idx < game.publishers!.length - 1 ? ", " : ""}
                  </Link>
                ))}
              </span>
            )}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {game.metacritic && (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <MetacriticBadge score={game.metacritic} size="md" showLabel />
            </div>
          )}

          {game.rating && (
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-mono">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-white font-bold">{game.rating.toFixed(1)}</span>
              <span className="text-gray-400">/ 10</span>
            </div>
          )}

          {userGame && (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <span className="text-xs text-gray-400 font-medium">Seu Status:</span>
              <StatusBadge status={userGame.status} completionType={userGame.completionType} size="md" />
            </div>
          )}
        </div>

        <div className="pt-2 w-full sm:w-auto flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-black shadow-xl shadow-emerald-500/25 transition-all active:scale-[0.98] cursor-pointer"
          >
            {userGame ? (
              <>
                <Edit3 className="w-4 h-4 text-black" />
                <span>Atualizar Meu Registro</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-black stroke-[3]" />
                <span>Adicionar à Coleção</span>
              </>
            )}
          </button>
        </div>

        {storeWebsites.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5 mr-1">
              <ShoppingCart className="w-3.5 h-3.5 text-cyan-400" /> Onde Jogar:
            </span>
            {storeWebsites.map((w) => {
              const meta = getWebsiteMeta(w.url);
              return (
                <a
                  key={w.id}
                  href={w.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 active:scale-95 ${meta.color}`}
                  title={`Página oficial do jogo em ${meta.label}`}
                >
                  <span>{meta.label}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
