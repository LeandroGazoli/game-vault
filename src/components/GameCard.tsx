import React, { useState, useRef, useEffect } from "react";
import { Game, GameStatus } from "@/lib/types";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { useAuth } from "@/context/AuthContext";
import MetacriticBadge from "./MetacriticBadge";
import StatusBadge from "./StatusBadge";
import GameModal from "./GameModal";
import Link from "next/link";
import { getGameUrl } from "@/lib/routes";
import { Clock, Plus, Check, Star, MoreHorizontal, Trophy, Play, Bookmark, Pause, XCircle, Trash2, Edit3 } from "lucide-react";
import Card3DTilt from "./3d/Card3DTilt";
import { formatGameDuration, formatGenreName } from "@/lib/gameUtils";

interface GameCardProps {
  game: Game;
  onOpenAuthModal?: () => void;
}

export default function GameCard({ game, onOpenAuthModal }: GameCardProps) {
  const { user } = useAuth();
  const { getGameInLibrary, addOrUpdateGame, deleteGame } = useGameLibrary();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userGame = getGameInLibrary(game.id);
  const releaseYear = game.released ? game.released.substring(0, 4) : "";
  const duration = formatGameDuration(game, userGame?.userPlaytimeHours);

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

  return (
    <>
      <Card3DTilt maxTilt={8} className="h-full">
        <div className="group relative flex flex-col h-full rounded-xl bg-[#12151c] border border-[#222834] hover:border-[#384255] hover:bg-[#151922] overflow-hidden transition-colors duration-200 hover:shadow-2xl hover:shadow-black/70">
        {/* Capa do Jogo Vertical Estilo Poster - Clicar abre a página do jogo */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-950">
          <Link
            href={getGameUrl(game)}
            className="block w-full h-full cursor-pointer"
            title={`Ver detalhes de ${game.name}`}
          >
            {game.background_image ? (
              <img
                src={game.background_image}
                alt={game.name}
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-950 text-neutral-600 text-xs">
                Sem Imagem
              </div>
            )}

            {/* Gradiente sutil para transição com a base */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#12151c] via-transparent to-transparent opacity-80" />
          </Link>

          {/* Metacritic Badge (Canto Superior Esquerdo) */}
          {game.metacritic && (
            <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
              <MetacriticBadge score={game.metacritic} size="sm" />
            </div>
          )}

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
                setIsMenuOpen(!isMenuOpen);
              }}
              className="w-8 h-8 rounded-lg bg-[#181c25]/95 hover:bg-white text-white hover:text-black flex items-center justify-center opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-150 shadow-md border border-[#2e3646] hover:border-white active:scale-95 cursor-pointer"
              title="Ações rápidas no jogo"
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

        {/* Informações do Jogo */}
        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1 font-mono">
              <span className="tabular-nums">{releaseYear}</span>
              {userGame?.dlcs && userGame.dlcs.length > 0 ? (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-[#00E5FF] font-mono border border-cyan-500/30 font-bold"
                  title={`${userGame.dlcs.filter((d) => d.status === "completed").length} de ${userGame.dlcs.length} DLCs zeradas`}
                >
                  +{userGame.dlcs.length} DLC{userGame.dlcs.length > 1 ? "s" : ""}
                </span>
              ) : game.genres && game.genres.length > 0 ? (
                <span
                  className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300 font-bold uppercase tracking-wider text-[9px] shrink-0"
                  title={game.genres[0].name}
                >
                  {formatGenreName(game.genres[0].name)}
                </span>
              ) : null}
            </div>

            <Link href={getGameUrl(game)} className="block">
              <h3
                className="font-semibold text-xs sm:text-sm text-white group-hover:text-[#00E5FF] transition-colors line-clamp-2 h-8 sm:h-9 leading-snug"
                title={game.name}
              >
                {game.name}
              </h3>
            </Link>
          </div>

          {/* Mini Info de Tempo HLTB ou Horas Registradas & Avaliação */}
          <div className="pt-2 border-t border-[#222834] flex items-center justify-between text-xs font-mono">
            {/* Tempos HLTB ou Horas do Jogador */}
            <div
              className="flex items-center gap-1.5 text-neutral-400 text-[11px] tabular-nums"
              title={duration.isEstimated ? (duration.isTbd ? "Lançamento futuro / Duração a definir" : "Média de duração no HowLongToBeat") : "Suas horas dedicadas"}
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className={duration.isTbd ? "text-neutral-400 font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/5 border border-white/10" : ""}>
                {duration.text}
              </span>
            </div>

            {/* Avaliação do Usuário ou Botão */}
            <div>
              {userGame && userGame.userRating !== null ? (
                <div className="flex items-center gap-1 text-amber-400 font-mono font-bold text-xs tabular-nums">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{userGame.userRating.toFixed(1)}</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-neutral-400 hover:text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  {userGame ? "Editar" : "+ Lista"}
                </button>
              )}
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
