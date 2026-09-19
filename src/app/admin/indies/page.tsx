"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  IndieGame,
  IndieSpotlightLocation,
  IndieGameStatus,
} from "@/lib/types/indie.types";
import {
  fetchAllIndiesAdmin,
  updateIndieStatus,
  updateIndieSpotlight,
  deleteIndieGame,
  submitIndieGame,
  updateIndieGame,
} from "@/lib/indieService";
import { useAuth } from "@/context/AuthContext";
import { triggerSuccessHaptic, triggerWarningHaptic } from "@/lib/capacitor";
import { SOMETHING_MEANINGFUL_DRIVE_DATA } from "@/lib/constants/somethingMeaningfulData";
import { getGameUrl } from "@/lib/routes";
import AdminPromoteCatalogModal from "@/components/indies/AdminPromoteCatalogModal";
import {
  Gamepad2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Edit3,
  Eye,
  Star,
  Clock,
} from "lucide-react";

export default function AdminIndiesPage() {
  const { user } = useAuth();
  const [indies, setIndies] = useState<IndieGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);

  const loadIndies = async () => {
    setIsLoading(true);
    try {
      let data = await fetchAllIndiesAdmin();

      // Se o jogo 'Something Meaningful' do Google Drive ainda não existir, cria-o automaticamente como Rascunho (pending)
      const existingDriveGame = data.find(
        (g) => g.title.toLowerCase() === SOMETHING_MEANINGFUL_DRIVE_DATA.title.toLowerCase()
      );

      if (!existingDriveGame && user?.uid) {
        try {
          await submitIndieGame(SOMETHING_MEANINGFUL_DRIVE_DATA, user.uid, {
            initialStatus: "pending",
            isSpotlight: true,
            spotlightLocations: ["home", "search", "game_detail"],
          });
          data = await fetchAllIndiesAdmin();
        } catch (seedErr) {
          console.error("Erro ao provisionar jogo rascunho Something Meaningful:", seedErr);
        }
      } else if (existingDriveGame && (!existingDriveGame.devNotes || !existingDriveGame.steamUrl)) {
        // Atualiza os novos metadados completos (redes sociais, dev notes, steam)
        try {
          await updateIndieGame(existingDriveGame.id, {
            steamUrl: SOMETHING_MEANINGFUL_DRIVE_DATA.steamUrl,
            contactDiscord: SOMETHING_MEANINGFUL_DRIVE_DATA.contactDiscord,
            youtubeUrl: SOMETHING_MEANINGFUL_DRIVE_DATA.youtubeUrl,
            tiktokUrl: SOMETHING_MEANINGFUL_DRIVE_DATA.tiktokUrl,
            twitterUrl: SOMETHING_MEANINGFUL_DRIVE_DATA.twitterUrl,
            instagramUrl: SOMETHING_MEANINGFUL_DRIVE_DATA.instagramUrl,
            devNotes: SOMETHING_MEANINGFUL_DRIVE_DATA.devNotes,
            devNotesMode: SOMETHING_MEANINGFUL_DRIVE_DATA.devNotesMode,
            description: SOMETHING_MEANINGFUL_DRIVE_DATA.description,
            descriptionMode: SOMETHING_MEANINGFUL_DRIVE_DATA.descriptionMode,
          });
          data = await fetchAllIndiesAdmin();
        } catch (updateErr) {
          console.error("Erro ao sincronizar metadados do Something Meaningful:", updateErr);
        }
      }

      setIndies(data);
    } catch (err) {
      console.error("Erro ao carregar indies para admin:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIndies();
  }, [user?.uid]);

  const handleStatusChange = async (gameId: string, status: IndieGameStatus) => {
    try {
      await updateIndieStatus(gameId, status);
      triggerSuccessHaptic();
      setToastMessage(`Status alterado para "${status}"!`);
      setTimeout(() => setToastMessage(null), 3000);
      loadIndies();
    } catch (err) {
      console.error("Erro ao alterar status:", err);
      triggerWarningHaptic();
      alert("Falha ao atualizar status do jogo.");
    }
  };

  const handleToggleSpotlight = async (
    game: IndieGame,
    location: IndieSpotlightLocation
  ) => {
    const currentLocs = game.spotlightLocations || [];
    const hasLocation = currentLocs.includes(location);
    const updatedLocations = hasLocation
      ? currentLocs.filter((l) => l !== location)
      : [...currentLocs, location];

    const isSpotlight = updatedLocations.length > 0;

    try {
      await updateIndieSpotlight(game.id, isSpotlight, updatedLocations);
      triggerSuccessHaptic();
      setToastMessage("Locais de exibição do banner atualizados!");
      setTimeout(() => setToastMessage(null), 3000);
      loadIndies();
    } catch (err) {
      console.error("Erro ao atualizar spotlight:", err);
      triggerWarningHaptic();
    }
  };

  const handleUpdatePriority = async (game: IndieGame, priority: number) => {
    try {
      await updateIndieSpotlight(
        game.id,
        game.isSpotlight,
        game.spotlightLocations || [],
        { priority }
      );
      triggerSuccessHaptic();
      setToastMessage(`Prioridade do destaque alterada para ${priority}!`);
      setTimeout(() => setToastMessage(null), 3000);
      loadIndies();
    } catch (err) {
      console.error("Erro ao atualizar prioridade:", err);
      triggerWarningHaptic();
    }
  };

  const handleDelete = async (game: IndieGame) => {
    if (!window.confirm(`Excluir permanentemente o jogo "${game.title}"?`)) return;
    try {
      await deleteIndieGame(game.id);
      triggerSuccessHaptic();
      setToastMessage("Jogo excluído com sucesso!");
      setTimeout(() => setToastMessage(null), 3000);
      loadIndies();
    } catch (err) {
      console.error("Erro ao excluir jogo:", err);
      triggerWarningHaptic();
    }
  };

  const filteredIndies = indies.filter((g) => {
    if (statusFilter === "all") return true;
    return g.status === statusFilter;
  });

  return (
    <div className="space-y-6 flex-1 w-full min-w-0">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-black font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header com Botão de Cadastro do Admin */}
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>MODERAÇÃO &amp; DESTAQUES INDIE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Jogos Independentes &amp; Banners
          </h2>
          <p className="text-xs text-gray-400">
            Cadastre novos jogos como Admin, aprove solicitações de criadores e configure os banners.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPromoteModalOpen(true)}
            className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Star className="w-4 h-4 fill-black" />
            <span>Destacar Jogo do Catálogo</span>
          </button>

          <Link
            href="/admin/indies/novo"
            className="px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Jogo</span>
          </Link>

          <button
            onClick={loadIndies}
            disabled={isLoading}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors cursor-pointer"
            title="Recarregar lista"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filtro de Status */}
      <div className="flex items-center gap-2">
        {["all", "pending", "approved", "rejected"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === st
                ? "bg-emerald-500 text-black shadow-md"
                : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {st === "all"
              ? "Todos"
              : st === "pending"
              ? "Pendentes"
              : st === "approved"
              ? "Aprovados"
              : "Rejeitados"}
          </button>
        ))}
      </div>

      {/* Listagem de Jogos Cadastrados */}
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 shadow-xl space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400 text-xs font-mono">
            Carregando projetos indie...
          </div>
        ) : filteredIndies.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            Nenhum jogo indie encontrado para o filtro selecionado.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredIndies.map((game) => (
              <div
                key={game.id}
                className="py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                {/* Info do Jogo */}
                <div className="flex items-center gap-4 min-w-0">
                  {game.coverImage ? (
                    <img
                      src={game.coverImage}
                      alt={game.title}
                      className="w-16 h-20 rounded-2xl object-cover border border-white/10 shrink-0 shadow"
                    />
                  ) : (
                    <div className="w-16 h-20 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                      <Gamepad2 className="w-6 h-6 text-gray-500" />
                    </div>
                  )}

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white truncate">
                        {game.title}
                      </h4>
                      {game.isCatalogGame && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-amber-500/10 border-amber-500/30 text-amber-400">
                          CATÁLOGO IGDB
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          game.status === "approved"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : game.status === "rejected"
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}
                      >
                        {game.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate max-w-md">
                      {game.tagline}
                    </p>
                    <p className="text-[10px] font-mono text-gray-500">
                      Dev: <strong className="text-gray-300">{game.developerName}</strong> • {game.developerEmail} • {game.votesCount || 0} votos
                    </p>
                  </div>
                </div>

                {/* Controles de Banner & Ações */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                  {/* Seletor de Locais do Banner & Prioridade de Rodízio */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase block">
                        Exibir no Banner:
                      </span>
                      {game.isSpotlight && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdatePriority(
                              game,
                              ((game.spotlightPriority || 0) + 1) % 3
                            )
                          }
                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 cursor-pointer"
                          title="Clique para alternar prioridade no rodízio (0: Padrão, 1: Alta, 2: Máxima)"
                        >
                          <Star className="w-2.5 h-2.5 fill-amber-300" />
                          <span>
                            {(game.spotlightPriority || 0) === 2
                              ? "Prio: Máxima"
                              : (game.spotlightPriority || 0) === 1
                              ? "Prio: Alta"
                              : "Prio: Normal"}
                          </span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono">
                      {[
                        { id: "search", label: "Busca" },
                        { id: "game_detail", label: "Detalhes" },
                        { id: "home", label: "Home" },
                      ].map((loc) => {
                        const isChecked =
                          game.spotlightLocations?.includes(loc.id as any);
                        return (
                          <button
                            key={loc.id}
                            onClick={() =>
                              handleToggleSpotlight(game, loc.id as any)
                            }
                            className={`px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                              isChecked
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                                : "bg-black/30 border-white/10 text-gray-500 hover:text-white"
                            }`}
                          >
                            {loc.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Moderação de Status e Edição */}
                  <div className="flex items-center gap-1.5">
                    {game.status !== "approved" && (
                      <button
                        onClick={() => handleStatusChange(game.id, "approved")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow cursor-pointer"
                        title="Aprovar Projeto & Conceder Título"
                      >
                        Aprovar
                      </button>
                    )}
                    {game.status !== "rejected" && (
                      <button
                        onClick={() => handleStatusChange(game.id, "rejected")}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 text-xs font-bold cursor-pointer"
                        title="Rejeitar Projeto"
                      >
                        Rejeitar
                      </button>
                    )}
                    <Link
                      href={`/admin/indies/${game.id}/editar`}
                      className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 transition-colors"
                      title="Editar Ficha Técnica Completa em Página Dedicada"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <Link
                      href={
                        game.isCatalogGame && game.linkedGameId
                          ? getGameUrl({
                              id: game.linkedGameId,
                              name: game.linkedGameName || game.title,
                              slug: game.linkedGameSlug,
                            })
                          : `/indies/${game.slug}`
                      }
                      target="_blank"
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        game.status !== "approved"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                          : "bg-white/5 hover:bg-white/10 text-gray-300"
                      }`}
                      title={
                        game.isCatalogGame
                          ? "Ver Ficha no Catálogo Oficial"
                          : game.status !== "approved"
                          ? "Visualizar Preview do Rascunho"
                          : "Ver Página do Jogo"
                      }
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{game.isCatalogGame ? "Ficha" : game.status !== "approved" ? "Preview" : "Ver"}</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(game)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Destaque de Jogos do Catálogo IGDB */}
      <AdminPromoteCatalogModal
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        onSuccess={() => {
          setToastMessage("Jogo do catálogo destacado com sucesso!");
          setTimeout(() => setToastMessage(null), 3000);
          loadIndies();
        }}
        userId={user?.uid || "admin"}
      />
    </div>
  );
}
