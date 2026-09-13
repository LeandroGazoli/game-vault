"use client";

import React, { useState } from "react";
import { IndieGame, IndieSubmissionForm } from "@/lib/types/indie.types";
import IndieFormFields from "./IndieFormFields";
import { X, Gamepad2 } from "lucide-react";

interface IndieAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameToEdit?: IndieGame | null;
  onSave: (formData: IndieSubmissionForm) => Promise<void>;
  isSubmitting: boolean;
}

export default function IndieAdminModal({
  isOpen,
  onClose,
  gameToEdit,
  onSave,
  isSubmitting,
}: IndieAdminModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#14161d] border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl overflow-y-auto space-y-6">
        {/* Header do Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>PAINEL ADMINISTRATIVO</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {gameToEdit ? `Editar Jogo: ${gameToEdit.title}` : "Cadastrar Novo Jogo Indie"}
            </h2>
            <p className="text-xs text-gray-400">
              Preencha todos os dados da ficha técnica e metadados completos do jogo.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário Modular Completo */}
        <IndieFormFields
          initialValues={
            gameToEdit
              ? {
                  title: gameToEdit.title,
                  tagline: gameToEdit.tagline,
                  description: gameToEdit.description,
                  storyline: gameToEdit.storyline,
                  developerName: gameToEdit.developerName,
                  developerEmail: gameToEdit.developerEmail,
                  publisherName: gameToEdit.publisherName,
                  studioWebsite: gameToEdit.studioWebsite,
                  contactDiscord: gameToEdit.contactDiscord,
                  coverImage: gameToEdit.coverImage,
                  bannerImage: gameToEdit.bannerImage,
                  trailerUrl: gameToEdit.trailerUrl,
                  platforms: gameToEdit.platforms,
                  genres: gameToEdit.genres,
                  gameModes: gameToEdit.gameModes,
                  playerPerspectives: gameToEdit.playerPerspectives,
                  themes: gameToEdit.themes,
                  ageRating: gameToEdit.ageRating,
                  releaseDate: gameToEdit.releaseDate,
                  steamUrl: gameToEdit.steamUrl,
                  itchUrl: gameToEdit.itchUrl,
                  screenshots: gameToEdit.screenshots,
                  ptbrSupport: gameToEdit.ptbrSupport,
                  systemRequirements: gameToEdit.systemRequirements,
                }
              : undefined
          }
          onSubmit={onSave}
          isSubmitting={isSubmitting}
          submitButtonText={gameToEdit ? "Salvar Alterações no Jogo" : "Cadastrar e Publicar Jogo"}
        />
      </div>
    </div>
  );
}
