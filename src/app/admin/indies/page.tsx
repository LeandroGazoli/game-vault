"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  IndieGame,
  IndieSpotlightLocation,
  IndieGameStatus,
  IndieSubmissionForm,
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
import IndieAdminModal from "@/components/indies/IndieAdminModal";
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
} from "lucide-react";

export default function AdminIndiesPage() {
  const { user } = useAuth();
  const [indies, setIndies] = useState<IndieGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal de criação / edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameToEdit, setGameToEdit] = useState<IndieGame | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadIndies = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllIndiesAdmin();
      setIndies(data);
    } catch (err) {
      console.error("Erro ao carregar indies para admin:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIndies();
  }, []);

  const handleOpenCreate = () => {
    setGameToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (game: IndieGame) => {
    setGameToEdit(game);
    setIsModalOpen(true);
  };

  const handleSaveGame = async (formData: IndieSubmissionForm) => {
    setIsSaving(true);
    try {
      if (gameToEdit) {
        await updateIndieGame(gameToEdit.id, formData);
        triggerSuccessHaptic();
        setToastMessage(`Jogo "${formData.title}" atualizado com sucesso!`);
      } else {
        await submitIndieGame(formData, user?.uid || "admin", {
          initialStatus: "approved",
          isSpotlight: false,
          spotlightLocations: [],
        });
        triggerSuccessHaptic();
        setToastMessage(`Jogo "${formData.title}" cadastrado e publicado com sucesso!`);
      }
      setTimeout(() => setToastMessage(null), 3000);
      setIsModalOpen(false);
      loadIndies();
    } catch (err) {
      console.error("Erro ao salvar jogo indie pelo admin:", err);
      triggerWarningHaptic();
      alert("Falha ao salvar jogo indie.");
    } finally {
      setIsSaving(false);
    }
  };

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

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Jogo</span>
          </button>

          <button
            onClick={loadIndies}
            disabled={isLoading}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
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

      {/* Tabela de Jogos */}
      <div className="rounded-3xl bg-[#14161d] border border-white/10 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-400 font-mono animate-pulse">
            Carregando projetos indie...
          </div>
        ) : filteredIndies.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">
            Nenhum projeto encontrado com este filtro.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredIndies.map((game) => (
              <div
                key={game.id}
                className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    className="w-14 h-18 rounded-xl object-cover shrink-0 border border-white/10"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                          game.status === "approved"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : game.status === "pending"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {game.status}
                      </span>
                      <span className="text-xs font-bold text-white truncate">
                        {game.title}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400">
                      Dev: <strong className="text-gray-300">{game.developerName}</strong> ({game.developerEmail})
                    </p>

                    <p className="text-[11px] text-gray-500 line-clamp-1">
                      {game.tagline}
                    </p>
                  </div>
                </div>

                {/* Controles de Banner & Ações */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                  {/* Seletor de Locais do Banner */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase block">
                      Exibir no Banner:
                    </span>
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
                            className={`px-2 py-1 rounded-lg border transition-all ${
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
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow"
                        title="Aprovar Projeto & Conceder Título"
                      >
                        Aprovar
                      </button>
                    )}
                    {game.status !== "rejected" && (
                      <button
                        onClick={() => handleStatusChange(game.id, "rejected")}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 text-xs font-bold"
                        title="Rejeitar Projeto"
                      >
                        Rejeitar
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(game)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300"
                      title="Editar Ficha Técnica Completa"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/indies/${game.slug}`}
                      target="_blank"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300"
                      title="Ver Página do Jogo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(game)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400"
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

      {/* Modal de Criação / Edição do Admin */}
      <IndieAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        gameToEdit={gameToEdit}
        onSave={handleSaveGame}
        isSubmitting={isSaving}
      />
    </div>
  );
}
