import React from "react";
import Link from "next/link";
import {
  Calendar,
  Sparkles,
  Building2,
  Globe,
  Star,
} from "lucide-react";
import { Game, UserGame } from "@/lib/types";
import { translateGenre } from "@/lib/gameUtils";
import GameReleaseCountdown, { isGameUnreleased } from "@/components/GameReleaseCountdown";
import { getAgeRatingBadge, GameWebsite } from "./gameDetailHelpers";
import GameDesktopMetrics from "./GameDesktopMetrics";
import GameDesktopActions from "./GameDesktopActions";

interface GameHeroDesktopProps {
  game: Game;
  backdropImage?: string | null;
  posterError: boolean;
  onPosterError: () => void;
  isAdult?: boolean;
  userGame?: UserGame;
  storeWebsites: GameWebsite[];
  onOpenModal: () => void;
  onQuickWishlist: () => void;
  onShare: () => void;
}

export default function GameHeroDesktop({
  game,
  backdropImage,
  posterError,
  onPosterError,
  isAdult,
  userGame,
  storeWebsites,
  onOpenModal,
  onQuickWishlist,
  onShare,
}: GameHeroDesktopProps) {
  const primaryGenre = game.genres?.[0]?.name ? translateGenre(game.genres[0].name) : null;

  return (
    <div className="hidden lg:block relative z-20">
      {/* Spotlight Card Unificado com Linha Superior de Luz Esmeralda */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 relative overflow-hidden border border-white/10 shadow-2xl">
        {/* Split Artwork Mural Backdrop (Degrade ao transparente: Esquerda transparente -> Direita aparecendo) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {backdropImage && (
            <div className="absolute inset-y-0 right-0 w-full lg:w-3/5 xl:w-2/3 pointer-events-none [mask-image:linear-gradient(to_right,transparent_0%,transparent_15%,black_80%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,transparent_15%,black_80%)]">
              <img
                src={backdropImage}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover object-top lg:object-center opacity-55 lg:opacity-70 scale-105 filter brightness-105 contrast-110"
              />
              {/* Tint Atmosférico e Luz Ambiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-transparent to-transparent opacity-90" />
              <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent mix-blend-screen" />
            </div>
          )}

          {/* Gradientes Suaves de Máscara para Fundir Atrás dos Metadados (Esquerda 100% escura/transparente) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d12] via-[#0b0d12]/95 lg:via-[#0b0d12]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b0d12]/60 via-transparent to-[#0b0d12]/90" />
        </div>

        {/* Linha Superior de Acento Esmeralda */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent pointer-events-none z-10" />

        <div className="grid grid-cols-12 gap-8 items-start relative z-10">
          {/* Coluna 1: Capa Oficial & Selos (3.5 colunas) */}
          <div className="col-span-4 xl:col-span-3 flex flex-col items-center">
            <div className="relative group w-full max-w-[260px] aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/15 bg-neutral-950 flex flex-col justify-end">
              {game.background_image && !posterError ? (
                <img
                  src={game.background_image}
                  alt={`Capa oficial ${game.name}`}
                  decoding="async"
                  onError={onPosterError}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#1c222e] to-[#0f1218] text-gray-500 absolute inset-0">
                  <Sparkles className="w-8 h-8 text-cyan-400/40 mb-2" />
                  <span className="text-xs font-semibold text-gray-300 line-clamp-2">{game.name}</span>
                </div>
              )}

              {/* Holographic Tag no topo da capa */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold tracking-wider text-white shadow">
                MÍDIA OFICIAL
              </div>

              {/* Tag inferior ou Countdown */}
              {isGameUnreleased(game) ? (
                <div className="relative z-10 w-full">
                  <GameReleaseCountdown game={game} variant="floating" />
                </div>
              ) : (
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-emerald-500/90 text-black text-[10px] font-black uppercase tracking-wider shadow">
                  Oficial
                </div>
              )}
            </div>

            {/* Linha de status sutil abaixo da capa */}
            <div className="mt-3.5 flex items-center gap-2 text-xs text-zinc-400 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                {game.franchises?.[0]
                  ? `Franquia ${game.franchises[0]}`
                  : game.released
                  ? `Lançado em ${new Date(game.released).getFullYear()}`
                  : "Acervo MGL Vault"}
              </span>
            </div>
          </div>

          {/* Coluna 2: Dados Principais & Métricas (8.5 colunas) */}
          <div className="col-span-8 xl:col-span-9 flex flex-col justify-between space-y-5">
            {/* Badges Row Padronizada e Alinhada */}
            <div className="flex flex-wrap items-center gap-2">
              {getAgeRatingBadge(game.age_ratings, isAdult)}

              {game.released && (
                <span className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-zinc-200 text-xs font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{game.released.substring(0, 4)}</span>
                </span>
              )}

              {primaryGenre && (
                <span className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-zinc-200 text-xs font-semibold flex items-center gap-1.5">
                  <span>{primaryGenre}</span>
                </span>
              )}

              {(game.franchises?.[0] || game.collections?.[0]) && (
                <Link
                  href={`/search?q=${encodeURIComponent(game.franchises?.[0] || game.collections?.[0] || "")}`}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/20 backdrop-blur-md transition-colors"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Saga {game.franchises?.[0] || game.collections?.[0]}</span>
                </Link>
              )}

              {game.ptbrSupport?.audio ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                  <span className="text-xs">🇧🇷</span>
                  <span>Totalmente Dublado &amp; Legendado PT-BR</span>
                </span>
              ) : game.ptbrSupport?.subtitles ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                  <span className="text-xs">🇧🇷</span>
                  <span>Totalmente Legendado PT-BR</span>
                </span>
              ) : null}
            </div>

            {/* Título & Créditos de Estúdios */}
            <div>
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight text-white mb-2 leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                {game.name}
              </h1>
              {game.developers?.length || game.publishers?.length ? (
                <p className="text-xs sm:text-sm text-zinc-300 flex flex-wrap items-center gap-x-2 gap-y-1">
                  {game.developers && game.developers.length > 0 && (
                    <>
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-cyan-400" /> Desenvolvido por
                      </span>
                      <span className="font-bold text-white">
                        {game.developers.map((dev, idx) => (
                          <Link
                            key={dev}
                            href={`/search?q=${encodeURIComponent(dev)}`}
                            className="hover:text-emerald-400 transition-colors"
                          >
                            {dev}{idx < game.developers!.length - 1 ? ", " : ""}
                          </Link>
                        ))}
                      </span>
                    </>
                  )}
                  {game.developers?.length && game.publishers?.length ? (
                    <span className="text-zinc-500">•</span>
                  ) : null}
                  {game.publishers && game.publishers.length > 0 && (
                    <>
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-purple-400" /> Publicado por
                      </span>
                      <span className="font-semibold text-zinc-200">
                        {game.publishers.map((pub, idx) => (
                          <Link
                            key={pub}
                            href={`/search?q=${encodeURIComponent(pub)}`}
                            className="hover:text-purple-300 transition-colors"
                          >
                            {pub}{idx < game.publishers!.length - 1 ? ", " : ""}
                          </Link>
                        ))}
                      </span>
                    </>
                  )}
                </p>
              ) : null}
            </div>

            {/* Key Metrics Bar (3 Floating Cards com Alto Contraste) */}
            <GameDesktopMetrics
              rating={game.rating}
              ratingsCount={game.ratings_count}
              metacritic={game.metacritic}
              hltbMainStory={game.hltb?.mainStory}
              hltbCompletionist={game.hltb?.completionist}
            />

            {/* Action Toolbar & Onde Comprar */}
            <GameDesktopActions
              userGame={userGame}
              storeWebsites={storeWebsites}
              onOpenModal={onOpenModal}
              onQuickWishlist={onQuickWishlist}
              onShare={onShare}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
