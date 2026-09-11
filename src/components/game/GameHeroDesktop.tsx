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
  Check,
} from "lucide-react";
import { Game, UserGame } from "@/lib/types";
import { translateGenre } from "@/lib/gameUtils";
import { STATUS_CONFIG } from "@/components/StatusBadge";
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

  // Rótulo dinâmico para nota do Metacritic
  const getMetacriticLabel = (score: number) => {
    if (score >= 90) return "Aclamação Universal";
    if (score >= 75) return "Geralmente Favorável";
    if (score >= 50) return "Misto ou Mediano";
    return "Avaliação Baixa";
  };

  return (
    <div className="hidden lg:block relative z-20">
      {/* Spotlight Card Unificado com Linha Superior de Luz Esmeralda */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent pointer-events-none" />

        <div className="grid grid-cols-12 gap-8 items-start">
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
            {/* Badges Row Enxuta e Alinhada */}
            <div className="flex flex-wrap items-center gap-2">
              {getAgeRatingBadge(game.age_ratings, isAdult)}

              {game.released && (
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-200 text-xs font-mono font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  {game.released.substring(0, 4)}
                </span>
              )}

              {primaryGenre && (
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-200 text-xs font-semibold">
                  {primaryGenre}
                </span>
              )}

              {(game.franchises?.[0] || game.collections?.[0]) && (
                <Link
                  href={`/search?q=${encodeURIComponent(game.franchises?.[0] || game.collections?.[0] || "")}`}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Saga {game.franchises?.[0] || game.collections?.[0]}</span>
                </Link>
              )}

              {game.ptbrSupport?.audio ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                  <span>🇧🇷</span> Dublado &amp; Legendado PT-BR
                </span>
              ) : game.ptbrSupport?.subtitles ? (
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1.5">
                  <span>🇧🇷</span> Legendado PT-BR
                </span>
              ) : null}
            </div>

            {/* Título & Créditos de Estúdios */}
            <div>
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight text-white mb-2 leading-tight">
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

            {/* Key Metrics Bar (3 Cards Flutuantes) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card 1: Avaliação da Comunidade */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3.5 hover:border-amber-500/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl font-black flex-shrink-0">
                  ★
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                    Avaliação MGL
                  </div>
                  <div className="text-xl font-extrabold text-white flex items-baseline gap-1 font-mono">
                    {game.rating ? game.rating.toFixed(1) : "—"}
                    <span className="text-xs text-zinc-400 font-normal font-sans">/10</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {game.ratings_count ? `${game.ratings_count.toLocaleString("pt-BR")} votos` : "Avaliações da comunidade"}
                  </div>
                </div>
              </div>

              {/* Card 2: Metascore Oficial */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3.5 hover:border-emerald-500/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl font-black font-mono shadow-[0_0_15px_rgba(16,185,129,0.2)] flex-shrink-0">
                  {game.metacritic ?? "—"}
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                    Metascore Oficial
                  </div>
                  <div className="text-xs font-bold text-emerald-400 truncate">
                    {game.metacritic ? getMetacriticLabel(game.metacritic) : "Sem nota de crítica"}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">Críticas da Mídia</div>
                </div>
              </div>

              {/* Card 3: Campanha HLTB */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3.5 hover:border-cyan-500/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl font-mono font-black flex-shrink-0">
                  <Clock className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                    Campanha (HLTB)
                  </div>
                  <div className="text-xl font-extrabold text-cyan-300 font-mono flex items-baseline gap-1">
                    {game.hltb?.mainStory ? `~${game.hltb.mainStory}h` : "—"}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {game.hltb?.completionist ? `Completo: ~${game.hltb.completionist}h` : "Média de conclusão"}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Toolbar Compacta */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
              {/* Botão Primário: Vault */}
              <button
                type="button"
                onClick={onOpenModal}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-extrabold text-sm flex items-center gap-2.5 transition-all shadow-lg shadow-emerald-950/40 active:scale-98 cursor-pointer"
              >
                {userGame ? (
                  <>
                    <Check className="w-5 h-5 text-black stroke-[3]" />
                    <span>No Meu Vault ({STATUS_CONFIG[userGame.status]?.label || "Salvo"})</span>
                    <Edit3 className="w-3.5 h-3.5 ml-1 text-black/70" />
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-black stroke-[3]" />
                    <span>Adicionar ao Meu Vault</span>
                  </>
                )}
              </button>

              {/* Botão Secundário: Desejar */}
              <button
                type="button"
                onClick={onQuickWishlist}
                className={`px-4 py-3 rounded-xl border font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  isBacklog
                    ? "bg-pink-500/20 text-pink-300 border-pink-500/50 hover:bg-pink-500/30"
                    : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-pink-500/40 text-white"
                }`}
              >
                <Heart className={`w-4 h-4 ${isBacklog ? "fill-pink-400 text-pink-400" : "text-pink-400"}`} />
                <span>{isBacklog ? "Desejado" : "Desejar"}</span>
              </button>

              {/* Botão Avaliar */}
              <button
                type="button"
                onClick={onOpenModal}
                className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 text-white font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{userGame?.userRating ? `Nota: ${userGame.userRating}/10` : "Avaliar Jogo"}</span>
              </button>

              {/* Botão Compartilhar */}
              <button
                type="button"
                onClick={onShare}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all ml-auto cursor-pointer"
                title="Compartilhar este jogo"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Onde Comprar (Lojas Digitais) */}
            {storeWebsites.length > 0 && (
              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-zinc-400 font-medium mr-1">Onde Comprar:</span>
                {storeWebsites.slice(0, 5).map((w) => {
                  const meta = getWebsiteMeta(w.url);
                  return (
                    <a
                      key={w.id}
                      href={w.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 hover:border-emerald-500/40 text-zinc-300 hover:text-emerald-300 flex items-center gap-1.5 transition-all text-xs"
                      title={`Página oficial na ${meta.label}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{meta.label}</span>
                      <ExternalLink className="w-3 h-3 text-zinc-500" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
