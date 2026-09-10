import React, { useState, useRef, useEffect } from "react";
import { Game, GameStatus } from "@/lib/types";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { useAuth } from "@/context/AuthContext";
import MetacriticBadge from "./MetacriticBadge";
import StatusBadge from "./StatusBadge";
import GameModal from "./GameModal";
import Link from "next/link";
import { getGameUrl } from "@/lib/routes";
import { Clock, Plus, Check, Star, MoreHorizontal, Trophy, Play, Bookmark, Pause, XCircle, Trash2, Edit3, Layers, Sparkles } from "lucide-react";
import Card3DTilt from "./3d/Card3DTilt";
import { formatGameDuration, formatGenreName, getPrimaryAgeRating, isAdultGame } from "@/lib/gameUtils";

interface GameCardProps {
  game: Game;
  onOpenAuthModal?: () => void;
  isAiRecommended?: boolean;
}

function GameCardComponent({ game, onOpenAuthModal, isAiRecommended }: GameCardProps) {
  const { user } = useAuth();
  const { getGameInLibrary, addOrUpdateGame, deleteGame } = useGameLibrary();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userGame = getGameInLibrary(game.id);
  const releaseYear = game.released ? game.released.substring(0, 4) : "";
  const duration = formatGameDuration(game, userGame?.userPlaytimeHours);
  const primaryRating = getPrimaryAgeRating(game.age_ratings);
  const isAdult = isAdultGame(game);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMenuOpen]);

  const handleQuickStatus = async (status: GameStatus) => {
    if (!user) {
      setIsMenuOpen(false);
      onOpenAuthModal?.();
      return;
    }
    await addOrUpdateGame({
      gameId: game.id,
      gameSlug: game.slug || String(game.id),
      gameTitle: game.name,
      gameCover: game.background_image || "",
      status,
      platformsPlayed: game.platforms?.map((p) => p.platform?.name || "").filter(Boolean) || [],
      genres: game.genres?.map((g) => g.name) || [],
      metacritic: game.metacritic || null,
      hltbData: game.hltb || null,
    });
    setIsMenuOpen(false);
  };

  const handleRemove = async () => {
    if (!user) return;
    await deleteGame(game.id);
    setIsMenuOpen(false);
  };

  const isAi = Boolean(isAiRecommended || game.isAiRecommended);

  return (
    <>
      <Card3DTilt maxTilt={8} className="h-full">
        <div className={isAi ? "ai-card-wrapper h-full" : "h-full"}>
          {isAi && <div className="ai-card-border-beam" />}
          <div className={`group relative flex flex-col h-full ${isAi ? "rounded-2xl" : "rounded-2xl border border-white/[0.07] hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-black/70"} bg-[#141822] hover:bg-[#181d28] overflow-hidden transition-all duration-200`}>
            {/* Capa do Jogo Vertical Estilo Poster - Clicar abre a página do jogo */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-950">
              <Link
                href={getGameUrl(game)}
                className="block w-full h-full cursor-pointer"
                title={`Ver detalhes de ${game.name}`}
              >
                {game.background_image && !imgError ? (
                  <img
                    src={game.background_image}
                    alt=""
                    className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-[#181c25] to-[#0d0f14] text-neutral-500">
                    <Clock className="w-6 h-6 mb-1.5 text-neutral-600 opacity-60" />
                    <span className="text-[11px] font-semibold text-neutral-400 line-clamp-2 px-1">
                      {game.name}
                    </span>
                  </div>
                )}

                {/* Gradiente sutil para transição com a base */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141822] via-black/20 to-transparent opacity-90" />
              </Link>

              {/* Badge Curadoria IA */}
              {isAi && (
                <div className="absolute top-2 left-2 z-20 pointer-events-none flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#081520]/95 border border-[#00E5FF]/70 text-[#00E5FF] text-[9px] font-black uppercase tracking-wider shadow-lg shadow-cyan-500/30 backdrop-blur-md">
                  <Sparkles className="w-2.5 h-2.5 text-[#00E5FF] animate-pulse" />
                  <span>Curadoria IA</span>
                </div>
              )}

              {/* Metacritic Badge Discreto (Canto Superior Esquerdo) */}
              {game.metacritic && !isAi && (
                <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none transition-all">
                  <MetacriticBadge score={game.metacritic} size="sm" />
                </div>
              )}

              {/* Selo Oficial de Classificação Indicativa (+18, etc) se não tiver Metacritic */}
              {!game.metacritic && primaryRating ? (
                <div
                  className={`absolute ${
                    userGame ? "top-2.5 right-11" : "top-2.5 left-2.5"
                  } z-10 pointer-events-none transition-all`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-black shadow-lg border ${
                      primaryRating.bgClass
                    } ${primaryRating.textClass} ${
                      primaryRating.borderClass || "border-white/20"
                    }`}
                    title={`Classificação Indicativa: ${primaryRating.description}`}
                  >
                    {primaryRating.badgeText}
                  </span>
                </div>
              ) : !game.metacritic && isAdult ? (
                <div
                  className={`absolute ${
                    userGame ? "top-2.5 right-11" : "top-2.5 left-2.5"
                  } z-10 pointer-events-none transition-all`}
                >
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-black shadow-lg border bg-black text-red-500 border-red-500/50"
                    title="Classificação Indicativa: Conteúdo Adulto / Erótico (+18)"
                  >
                    18
                  </span>
                </div>
              ) : null}

              {/* Status do Usuário se na Biblioteca (Canto Superior Direito) */}
              {userGame && (
                <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                  <StatusBadge status={userGame.status} completionType={userGame.completionType} size="sm" />
                </div>
              )}

          {/* Botão de Micro-Ações Rápidas (...) */}
          <div ref={menuRef} className="absolute bottom-2.5 right-2.5 z-30">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  setIsModalOpen(true);
                } else {
                  setIsMenuOpen(!isMenuOpen);
                }
              }}
              className="w-8 h-8 rounded-lg bg-[#181c25]/95 hover:bg-white text-white hover:text-black flex items-center justify-center opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-150 shadow-md border border-[#2e3646] hover:border-white active:scale-95 cursor-pointer"
              title={userGame ? "Editar registro do jogo" : "Adicionar à biblioteca"}
              aria-label="Ações rápidas"
            >
              {userGame ? (
                <Check className="w-4 h-4 text-[#00E5FF] group-hover:text-black" />
              ) : (
                <MoreHorizontal className="w-4 h-4" />
              )}
            </button>

            {/* Dropdown de Micro-Ações Rápidas */}
            {isMenuOpen && (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="absolute right-0 bottom-full mb-2 w-48 rounded-xl bg-[#14171f] border border-[#2b3342] shadow-2xl p-1.5 space-y-0.5 z-50 text-xs font-medium animate-fadeIn backdrop-blur-xl"
              >
                <div className="px-2 py-1 text-[10px] uppercase font-mono font-bold text-gray-400 border-b border-white/5 mb-1">
                  Definir Status
                </div>

                <button
                  onClick={() => handleQuickStatus("completed")}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    userGame?.status === "completed"
                      ? "bg-emerald-500/20 text-emerald-300 font-bold"
                      : "text-gray-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Já Zerei</span>
                </button>

                <button
                  onClick={() => handleQuickStatus("playing")}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    userGame?.status === "playing"
                      ? "bg-cyan-500/20 text-cyan-300 font-bold"
                      : "text-gray-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Play className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Jogando Agora</span>
                </button>

                <button
                  onClick={() => handleQuickStatus("library")}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    userGame?.status === "library"
                      ? "bg-indigo-500/20 text-indigo-300 font-bold"
                      : "text-gray-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Na Biblioteca</span>
                </button>

                <button
                  onClick={() => handleQuickStatus("backlog")}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    userGame?.status === "backlog"
                      ? "bg-amber-500/20 text-amber-300 font-bold"
                      : "text-gray-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Quero Jogar</span>
                </button>

                <button
                  onClick={() => handleQuickStatus("dropped")}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    userGame?.status === "dropped"
                      ? "bg-rose-500/20 text-rose-300 font-bold"
                      : "text-gray-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Abandonado</span>
                </button>

                <div className="pt-1 border-t border-white/5 mt-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>Detalhes &amp; DLCs...</span>
                  </button>

                  {userGame && (
                    <button
                      onClick={handleRemove}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-rose-400 hover:bg-rose-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>Remover da Lista</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informações do Jogo Estilo Print 1 (Compacto e Clean) */}
        <div className="p-3 flex-1 flex flex-col justify-between gap-2 bg-[#141822]">
          <div className="space-y-0.5">
            {/* Título em destaque */}
            <Link href={getGameUrl(game)} className="block">
              <h3
                className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-1 leading-snug"
                title={game.name}
              >
                {game.name}
              </h3>
            </Link>

            {/* Subtítulo: Desenvolvedora ou Gênero + Ano */}
            <p className="text-[11px] text-neutral-400 font-medium truncate">
              {game.developers && game.developers.length > 0
                ? game.developers[0]
                : game.genres && game.genres.length > 0
                ? formatGenreName(game.genres[0].name)
                : releaseYear || "Game"}
              {releaseYear && game.developers && game.developers.length > 0 ? ` • ${releaseYear}` : ""}
            </p>
          </div>

          {/* Rodapé Compacto: Pill de Nota / Duração & Ação Rápida */}
          <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
            {/* Pill de Avaliação (Estilo Print 1 com Estrela Amarela) */}
            {userGame && userGame.userRating !== null ? (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-400/10 border border-amber-400/25 text-amber-400 font-mono font-bold text-[11px]">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{userGame.userRating.toFixed(1)}</span>
              </div>
            ) : game.rating ? (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-amber-400 font-mono font-bold text-[11px]">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{(game.rating > 10 ? game.rating / 10 : game.rating).toFixed(1)}</span>
              </div>
            ) : duration.text && !duration.isTbd ? (
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300 font-mono text-[10px]"
                title="Média de duração no HowLongToBeat"
              >
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>{duration.text}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-neutral-400 font-mono text-[10px]">
                <span>{releaseYear || "TBD"}</span>
              </div>
            )}

            {/* Ação rápida / status */}
            <div>
              {userGame ? (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px] flex items-center gap-0.5 transition-colors cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  <span>Salvo</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-neutral-400 hover:text-white font-medium text-[11px] transition-colors cursor-pointer"
                >
                  + Lista
                </button>
              )}
            </div>
          </div>
        </div>
        </div>
        </div>
      </Card3DTilt>

      {/* Modal para configurar o jogo */}
      <GameModal
        game={game}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOpenAuthModal={onOpenAuthModal}
      />
    </>
  );
}

const GameCard = React.memo(GameCardComponent);
export default GameCard;
