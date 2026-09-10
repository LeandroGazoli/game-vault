import React from "react";
import Link from "next/link";
import {
  Calendar,
  Sparkles,
  Building2,
  Globe,
  Star,
  Award,
  Clock,
  Heart,
  Plus,
  Edit3,
  Share2,
  ExternalLink,
} from "lucide-react";
import { Game, UserGame } from "@/lib/types";
import { translateGenre } from "@/lib/gameUtils";
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
  onQuickWishlist: () => void;
  onShare: () => void;
}

export default function GameHeroDesktop({
  game,
  posterError,
  onPosterError,
  isAdult,
  userGame,
  storeWebsites,
  onOpenModal,
  onQuickWishlist,
  onShare,
}: GameHeroDesktopProps) {
  const isBacklog = userGame?.status === "backlog";
  const primaryGenre = game.genres?.[0]?.name ? translateGenre(game.genres[0].name) : null;

  return (
    <div className="hidden lg:flex relative -mt-32 xl:-mt-36 p-6 xl:p-8 flex-row items-start gap-7 xl:gap-8">
      {/* Capa Poster com cantos generosos, profundidade e countdown */}
      <div className="w-48 xl:w-52 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/15 bg-neutral-950 flex-shrink-0 group relative flex flex-col justify-end">
        {game.background_image && !posterError ? (
          <img
            src={game.background_image}
            alt={game.name}
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

        {/* Countdown Compacto na Capa */}
        {isGameUnreleased(game) && (
          <div className="relative z-10 w-full">
            <GameReleaseCountdown game={game} variant="floating" />
          </div>
        )}
      </div>

      {/* Conteúdo e Dados do Jogo */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Linha 1: Metadados Limpos e Essenciais (Sem poluição de dezenas de tags) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {getAgeRatingBadge(game.age_ratings, isAdult)}

          {game.released && (
            <span className="flex items-center gap-1.5 font-mono text-gray-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{game.released.substring(0, 4)}</span>
            </span>
          )}

          {primaryGenre && (
            <span className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 font-medium">
              {primaryGenre}
            </span>
          )}

          {(game.franchises?.[0] || game.collections?.[0]) && (
            <Link
              href={`/search?q=${encodeURIComponent(game.franchises?.[0] || game.collections?.[0] || "")}`}
              className="flex items-center gap-1.5 text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-0.5 rounded-lg hover:bg-amber-900/60 transition-colors"
              title="Ver franquia"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium">{game.franchises?.[0] || game.collections?.[0]}</span>
            </Link>
          )}

          {game.ptbrSupport?.audio && (
            <span
              className="flex items-center gap-1 text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg font-medium"
              title="Possui Dublagem em Português do Brasil"
            >
              🇧🇷 Dublado
            </span>
          )}
          {game.ptbrSupport?.subtitles && !game.ptbrSupport?.audio && (
            <span
              className="flex items-center gap-1 text-blue-300 bg-blue-950/50 border border-blue-500/30 px-2.5 py-0.5 rounded-lg font-medium"
              title="Possui Legendas em Português do Brasil"
            >
              🇧🇷 Legendado
            </span>
          )}
        </div>

        {/* Linha 2: Título Principal */}
        <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
          {game.name}
        </h1>

        {/* Linha 3: Desenvolvedora e Distribuidora com links limpos */}
        {game.developers?.length || game.publishers?.length ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-400 font-medium">
            {game.developers && game.developers.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400/80" />
                <span className="text-gray-400">Dev:</span>
                <span className="text-gray-200 font-semibold">
                  {game.developers.map((dev, idx) => (
                    <Link
                      key={dev}
                      href={`/search?q=${encodeURIComponent(dev)}`}
                      className="hover:text-cyan-300 hover:underline transition-colors"
                    >
                      {dev}{idx < game.developers!.length - 1 ? ", " : ""}
                    </Link>
                  ))}
                </span>
              </span>
            )}
            {game.publishers && game.publishers.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-400/80" />
                <span className="text-gray-400">Pub:</span>
                <span className="text-gray-200 font-semibold">
                  {game.publishers.map((pub, idx) => (
                    <Link
                      key={pub}
                      href={`/search?q=${encodeURIComponent(pub)}`}
                      className="hover:text-purple-300 hover:underline transition-colors"
                    >
                      {pub}{idx < game.publishers!.length - 1 ? ", " : ""}
                    </Link>
                  ))}
                </span>
              </span>
            )}
          </div>
        ) : null}

        {/* Linha 4: Barra de Métricas em 3 Colunas (Stats Bar no padrão do Mobile) */}
        <div className="max-w-md grid grid-cols-3 divide-x divide-white/10 rounded-2xl bg-[#0f1218]/95 border border-white/10 p-2.5 text-center shadow-inner">
          {/* 1. Avaliação de Usuários */}
          <div className="flex flex-col items-center justify-center px-2">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
              Avaliação
            </span>
            <div className="flex items-center gap-1 text-sm font-black text-white font-mono">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{game.rating ? game.rating.toFixed(1) : "—"}</span>
              <span className="text-[10px] text-gray-500 font-normal">/10</span>
            </div>
          </div>

          {/* 2. Metacritic */}
          <div className="flex flex-col items-center justify-center px-2">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
              Metacritic
            </span>
            <div className="flex items-center gap-1 text-sm font-black text-emerald-400 font-mono">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>{game.metacritic ?? "—"}</span>
            </div>
          </div>

          {/* 3. Campanha HLTB */}
          <div className="flex flex-col items-center justify-center px-2">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
              Campanha
            </span>
            <div className="flex items-center gap-1 text-sm font-black text-cyan-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{game.hltb?.mainStory ? `${game.hltb.mainStory}h` : "—"}</span>
            </div>
          </div>
        </div>

        {/* Linha 5: Botões de Ação Duplos + Botão Compartilhar */}
        <div className="pt-1 flex flex-wrap items-center gap-3">
          {/* Botão Secundário: Desejar / Desejado */}
          <button
            type="button"
            onClick={onQuickWishlist}
            className={`h-11 flex items-center justify-center gap-2 px-4 rounded-xl border text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-md ${
              isBacklog
                ? "bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border-pink-500/50"
                : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
            }`}
            title={isBacklog ? "Jogo presente na sua Lista de Desejos" : "Adicionar à Lista de Desejos"}
          >
            <Heart
              className={`w-4 h-4 ${
                isBacklog ? "fill-pink-400 text-pink-400" : "text-gray-400"
              }`}
            />
            <span>{isBacklog ? "Desejado" : "Desejar"}</span>
          </button>

          {/* Botão Primário: Adicionar ao Vault ou Editar Status */}
          <button
            type="button"
            onClick={onOpenModal}
            className={`h-11 flex items-center justify-center gap-2 px-6 rounded-xl text-xs font-black transition-all active:scale-[0.98] cursor-pointer shadow-xl ${
              userGame
                ? "bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300"
                : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/25"
            }`}
          >
            {userGame ? (
              <>
                <StatusBadge
                  status={userGame.status}
                  completionType={userGame.completionType}
                  size="sm"
                />
                <span>Editar no Meu Vault</span>
                <Edit3 className="w-3.5 h-3.5 ml-1 text-emerald-400 flex-shrink-0" />
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-black stroke-[3]" />
                <span>Adicionar ao Meu Vault</span>
              </>
            )}
          </button>

          {/* Botão Compartilhar */}
          <button
            type="button"
            onClick={onShare}
            className="h-11 w-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all active:scale-95 cursor-pointer shadow-md"
            title="Compartilhar este jogo"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Linha 6: Onde Jogar (Pills compactas e discretas) */}
        {storeWebsites.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-400 mr-1">
              Onde Jogar:
            </span>
            {storeWebsites.slice(0, 5).map((w) => {
              const meta = getWebsiteMeta(w.url);
              return (
                <a
                  key={w.id}
                  href={w.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/20 transition-all active:scale-95"
                  title={`Abrir na ${meta.label}`}
                >
                  <span>{meta.label}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
