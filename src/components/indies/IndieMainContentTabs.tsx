"use client";

import React, { useState } from "react";
import IndieDescriptionRenderer from "./IndieDescriptionRenderer";
import { Sparkles, BookOpen, Film, Image as ImageIcon, MessageSquare } from "lucide-react";
import { IndieGame } from "@/lib/types/indie.types";

interface IndieMainContentTabsProps {
  game: IndieGame;
  embedUrl: string | null;
}

export default function IndieMainContentTabs({ game, embedUrl }: IndieMainContentTabsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "dev_notes" | "media">("overview");

  const hasDevNotes = Boolean(game.devNotes && game.devNotes.trim());
  const hasMedia = Boolean(embedUrl || (game.screenshots && game.screenshots.length > 0));

  return (
    <div className="space-y-6">
      {/* Barra de Abas Estilizada */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#141822] border border-white/10 overflow-x-auto select-none">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "overview"
              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Visão Geral &amp; Projeto</span>
        </button>

        {hasDevNotes && (
          <button
            type="button"
            onClick={() => setActiveTab("dev_notes")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "dev_notes"
                ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-black"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Notas do Desenvolvedor</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-black/40 text-cyan-300 font-mono">
              Devlog
            </span>
          </button>
        )}

        {hasMedia && (
          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "media"
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20 font-black"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Trailer &amp; Galeria</span>
            {game.screenshots && (
              <span className="text-[10px] opacity-75 font-mono">
                ({game.screenshots.length})
              </span>
            )}
          </button>
        )}
      </div>

      {/* CONTEÚDO DA ABA 1: VISÃO GERAL */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Sinopse & Apresentação */}
          <section className="rounded-3xl border border-white/10 bg-[#141822] p-6 sm:p-8 space-y-4 shadow-xl">
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight border-b border-white/10 pb-3">
              Sobre o Projeto &amp; Visão do Desenvolvedor
            </h2>
            <IndieDescriptionRenderer
              content={game.description}
              mode={game.descriptionMode}
            />
          </section>

          {/* Enredo e História */}
          {game.storyline && (
            <section className="rounded-3xl border border-white/10 bg-[#141822] p-6 sm:p-8 space-y-4 shadow-xl">
              <h2 className="text-lg font-bold text-white tracking-tight border-b border-white/10 pb-3">
                Universo &amp; Enredo
              </h2>
              <div className="text-sm text-gray-300 leading-relaxed space-y-4 whitespace-pre-line">
                {game.storyline}
              </div>
            </section>
          )}

          {/* Prévia do Trailer na Visão Geral se existir */}
          {embedUrl && (
            <section className="rounded-3xl border border-white/10 bg-[#141822] p-6 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-emerald-400" /> Trailer Oficial de Gameplay
              </h2>
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/5 shadow-xl">
                <iframe
                  src={embedUrl}
                  title={`${game.title} Trailer`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: NOTAS DO DESENVOLVEDOR (DEVLOG) */}
      {activeTab === "dev_notes" && hasDevNotes && (
        <div className="space-y-6 animate-fadeIn">
          <section className="rounded-3xl border border-cyan-500/20 bg-[#141822] p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Notas do Desenvolvedor &amp; Bastidores
                </h2>
                <p className="text-xs text-cyan-300 font-mono">
                  Publicado diretamente pelo estúdio {game.developerName}
                </p>
              </div>
            </div>

            <IndieDescriptionRenderer
              content={game.devNotes}
              mode={game.devNotesMode || "markdown"}
            />
          </section>
        </div>
      )}

      {/* CONTEÚDO DA ABA 3: MÍDIAS & SCREENSHOTS */}
      {activeTab === "media" && (
        <div className="space-y-6 animate-fadeIn">
          {embedUrl && (
            <section className="rounded-3xl border border-white/10 bg-[#141822] p-6 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-emerald-400" /> Trailer Oficial de Gameplay
              </h2>
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/5 shadow-xl">
                <iframe
                  src={embedUrl}
                  title={`${game.title} Trailer`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          )}

          {game.screenshots && game.screenshots.length > 0 && (
            <section className="rounded-3xl border border-white/10 bg-[#141822] p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" /> Galeria de Screenshots &amp; Capturas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {game.screenshots.map((sUrl, idx) => (
                  <a
                    key={idx}
                    href={sUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl overflow-hidden aspect-video bg-black/40 border border-white/10 group relative block shadow-lg"
                  >
                    <img
                      src={sUrl}
                      alt={`${game.title} Screenshot ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
