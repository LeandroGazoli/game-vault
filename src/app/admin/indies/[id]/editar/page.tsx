"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchIndieBySlug, updateIndieGame } from "@/lib/indieService";
import { triggerSuccessHaptic, triggerWarningHaptic } from "@/lib/capacitor";
import IndieFormFields from "@/components/indies/IndieFormFields";
import { IndieGame, IndieSubmissionForm } from "@/lib/types/indie.types";
import { ArrowLeft, Gamepad2, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function AdminEditarIndiePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [game, setGame] = useState<IndieGame | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadGame() {
      setIsLoading(true);
      try {
        const found = await fetchIndieBySlug(id);
        if (found) {
          setGame(found);
        } else {
          setErrorMessage("Jogo não encontrado ou excluído.");
        }
      } catch (err) {
        console.error("Erro ao carregar jogo para edição:", err);
        setErrorMessage("Erro ao buscar dados do jogo no servidor.");
      } finally {
        setIsLoading(false);
      }
    }
    loadGame();
  }, [id]);

  const handleUpdate = async (formData: IndieSubmissionForm) => {
    if (!game) return;
    setIsSubmitting(true);
    try {
      await updateIndieGame(game.id, formData);
      triggerSuccessHaptic();
      setToastMessage(`Jogo "${formData.title}" atualizado com sucesso!`);
      setTimeout(() => {
        router.push("/admin/indies");
      }, 1200);
    } catch (err) {
      console.error("Erro ao atualizar jogo indie pelo admin:", err);
      triggerWarningHaptic();
      alert("Falha ao atualizar jogo. Verifique o console para mais detalhes.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-xs font-mono text-gray-400">Carregando dados completos do jogo...</p>
      </div>
    );
  }

  if (errorMessage || !game) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Não foi possível carregar o jogo</h2>
        <p className="text-xs text-gray-400">{errorMessage || "Jogo inexistente."}</p>
        <Link
          href="/admin/indies"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para a listagem
        </Link>
      </div>
    );
  }

  const initialValues: Partial<IndieSubmissionForm> = {
    title: game.title,
    tagline: game.tagline,
    description: game.description,
    descriptionMode: game.descriptionMode,
    storyline: game.storyline,
    developerName: game.developerName,
    developerEmail: game.developerEmail,
    publisherName: game.publisherName,
    studioWebsite: game.studioWebsite,
    contactDiscord: game.contactDiscord,
    coverImage: game.coverImage,
    bannerImage: game.bannerImage,
    trailerUrl: game.trailerUrl,
    platforms: game.platforms,
    genres: game.genres,
    gameModes: game.gameModes,
    playerPerspectives: game.playerPerspectives,
    themes: game.themes,
    ageRating: game.ageRating,
    releaseDate: game.releaseDate,
    steamUrl: game.steamUrl,
    itchUrl: game.itchUrl,
    youtubeUrl: game.youtubeUrl,
    tiktokUrl: game.tiktokUrl,
    twitterUrl: game.twitterUrl,
    instagramUrl: game.instagramUrl,
    linkedGameId: game.linkedGameId,
    linkedGameName: game.linkedGameName,
    linkedGameSlug: game.linkedGameSlug,
    devNotes: game.devNotes,
    devNotesMode: game.devNotesMode,
    screenshots: game.screenshots,
    ptbrSupport: game.ptbrSupport,
    systemRequirements: game.systemRequirements,
  };

  return (
    <div className="space-y-6 flex-1 w-full min-w-0 pb-16">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-black font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navegação de Volta */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href="/admin/indies"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Gestão de Jogos Indies
        </Link>
        <Link
          href={`/indies/${game.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-colors"
        >
          <span>Visualizar Página do Jogo</span>
        </Link>
      </div>

      {/* Cabeçalho */}
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-8 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>ADMINISTRAÇÃO • EDIÇÃO DE JOGO</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Editar: {game.title}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Modifique a sinopse, mídias, redes sociais, notas do desenvolvedor ou vínculo com o catálogo principal.
        </p>
      </div>

      {/* Formulário Modular em Página Completa */}
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-10 shadow-2xl">
        <IndieFormFields
          initialValues={initialValues}
          onSubmit={handleUpdate}
          isSubmitting={isSubmitting}
          submitButtonText="Salvar Alterações no Jogo"
        />
      </div>
    </div>
  );
}
