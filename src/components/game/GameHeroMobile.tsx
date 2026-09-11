import React from "react";
import Link from "next/link";
import { ChevronLeft, Share2, Heart, Sparkles } from "lucide-react";
import { Game, UserGame } from "@/lib/types";
import { translateGenre, getCategorySearchUrl } from "@/lib/gameUtils";
import GameReleaseCountdown, { isGameUnreleased } from "@/components/GameReleaseCountdown";
import { getAgeRatingBadge } from "./gameDetailHelpers";
import GameStatsBar from "./GameStatsBar";
import GameActionButtons from "./GameActionButtons";

interface GameHeroMobileProps {
  game: Game;
  backdropImage: string | null;
  bannerError: boolean;
  onBannerError: () => void;
  posterError: boolean;
  onPosterError: () => void;
  isAdult?: boolean;
  userGame?: UserGame;
  onBack: () => void;
  onShare: () => void;
  onQuickWishlist: () => void;
  onOpenModal: () => void;
}

export default function GameHeroMobile({
  game,
  backdropImage,
  bannerError,
  onBannerError,
  posterError,
  onPosterError,
  isAdult,
  userGame,
  onBack,
  onShare,
  onQuickWishlist,
  onOpenModal,
}: GameHeroMobileProps) {
  const isBacklog = userGame?.status === "backlog";

  return (
    <div className="lg:hidden relative rounded-[28px] overflow-hidden border border-white/10 bg-[#141822] shadow-2xl">
      {/* Backdrop Banner */}
      <div className="relative h-48 sm:h-72 w-full overflow-hidden bg-neutral-950">
        {backdropImage && !bannerError ? (
          <img
            src={backdropImage}
            alt=""
            loading="eager"
            decoding="async"
            onError={onBannerError}
            className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-cyan-950 via-[#18191c] to-black" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#141822] via-[#141822]/60 to-transparent" />

        {/* Top Floating Action Bar */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-20">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-xl active:scale-95 transition-all cursor-pointer"
            title="Voltar"
          >
            <ChevronLeft className="w-6 h-6 -ml-0.5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onShare}
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-xl active:scale-95 transition-all cursor-pointer"
              title="Compartilhar Jogo"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onQuickWishlist}
              className={`w-10 h-10 rounded-full backdrop-blur-xl border flex items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer ${
                isBacklog
                  ? "bg-pink-500 text-white border-pink-400"
                  : "bg-black/60 hover:bg-black/80 text-white border-white/20"
              }`}
              title={isBacklog ? "Na lista de desejos" : "Adicionar aos desejos"}
            >
              <Heart
                className={`w-4 h-4 ${isBacklog ? "fill-white text-white" : "text-white"}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo do Hero Mobile */}
      <div className="relative -mt-16 sm:-mt-24 p-4 sm:p-6 space-y-4">
        <div className="flex items-end gap-3.5 sm:gap-5">
          {/* Capa Poster */}
          <div className="w-28 sm:w-36 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-neutral-900 flex-shrink-0 group relative flex flex-col justify-end">
            {game.background_image && !posterError ? (
              <img
                src={game.background_image}
                alt={game.name}
                decoding="async"
                onError={onPosterError}
                className="w-full h-full object-cover absolute inset-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-[#1c222e] to-[#0f1218] text-gray-500 absolute inset-0">
                <Sparkles className="w-6 h-6 text-[#00E5FF]/40 mb-1" />
                <span className="text-[10px] font-semibold text-gray-300 line-clamp-2">{game.name}</span>
              </div>
            )}

            {/* Countdown Compacto na Capa (Mobile) */}
            {isGameUnreleased(game) && (
              <div className="relative z-10 w-full">
                <GameReleaseCountdown game={game} variant="floating" />
              </div>
            )}
          </div>

          {/* Resumo ao lado da capa */}
          <div className="flex-1 min-w-0 pb-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {getAgeRatingBadge(game.age_ratings, isAdult)}

              {game.released && (
                <span className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-zinc-200 text-xs font-semibold flex items-center gap-1">
                  {game.released.substring(0, 4)}
                </span>
              )}

              {game.ptbrSupport?.audio ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1 backdrop-blur-md">
                  <span>🇧🇷</span> Dublado
                </span>
              ) : game.ptbrSupport?.subtitles ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1 backdrop-blur-md">
                  <span>🇧🇷</span> Legendado
                </span>
              ) : null}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight line-clamp-2">
              {game.name}
            </h1>

            {game.developers && game.developers[0] && (
              <p className="text-xs text-gray-400 font-medium truncate">
                {game.developers[0]}
              </p>
            )}

            {game.metacritic && (
              <div className="pt-0.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    Metacritic
                  </span>
                  <span className="text-xs font-black font-mono">{game.metacritic}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Barra de Estatísticas em 3 Colunas */}
        <GameStatsBar
          rating={game.rating}
          metacritic={game.metacritic}
          hltbMainStory={game.hltb?.mainStory}
        />

        {/* Botões Duplos de Ação */}
        <GameActionButtons
          userGame={userGame}
          onQuickWishlist={onQuickWishlist}
          onOpenModal={onOpenModal}
        />

        {/* Gêneros Rápidos no Mobile */}
        {game.genres && game.genres.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {game.genres.slice(0, 4).map((g) => (
              <Link
                key={g.id}
                href={getCategorySearchUrl(g.name)}
                className="flex-shrink-0 text-[11px] text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/70 border border-cyan-500/30 px-2.5 py-1 rounded-full font-medium transition-all"
              >
                {translateGenre(g.name)}
              </Link>
            ))}
            {game.genres.length > 4 && (
              <span className="text-[10px] text-gray-500 font-mono px-1">
                +{game.genres.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
