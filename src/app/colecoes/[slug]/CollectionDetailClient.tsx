"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";
import { Game } from "@/lib/types";
import GameCard from "@/components/GameCard";
import AuthModal from "@/components/AuthModal";
import { getCollectionBySlug } from "@/lib/collectionsData";
import {
  ArrowLeft,
  Sparkles,
  Bookmark,
  ChevronRight,
  Gamepad2,
  Trophy,
} from "lucide-react";

interface CollectionDetailClientProps {
  slug: string;
}

export default function CollectionDetailClient({ slug }: CollectionDetailClientProps) {
  const collection = getCollectionBySlug(slug);

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    async function loadCollectionGames() {
      setLoading(true);
      try {
        const res = await fetch(`/api/games/collections?slug=${slug}&limit=40`);
        if (res.ok) {
          const data = await res.json();
          setGames(data.games || []);
        }
      } catch (err) {
        console.error("Erro ao carregar jogos da coleção:", err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadCollectionGames();
    }
  }, [slug]);

  if (!collection) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Coleção não encontrada</h2>
        <p className="text-sm text-neutral-400">A coleção que você tentou acessar não existe.</p>
        <Link
          href="/colecoes"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para todas as coleções
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 pt-2">
      {/* Breadcrumb e Retorno */}
      <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
        <Link href="/" className="hover:text-white transition-colors">
          Início
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/colecoes" className="hover:text-white transition-colors">
          Coleções
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-amber-300 font-semibold">{collection.title}</span>
      </div>

      {/* Banner Principal da Coleção */}
      <section
        className={`relative overflow-hidden rounded-3xl border ${collection.borderAccent} bg-gradient-to-b ${collection.accent} p-6 sm:p-10 shadow-2xl`}
      >
        <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
          <img
            src={collection.coverImage}
            alt={collection.title}
            className="w-full h-full object-cover object-center filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-black/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-bold text-neutral-200 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{collection.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
            {collection.title}
          </h1>

          <p className="text-sm sm:text-base text-neutral-200 leading-relaxed max-w-2xl">
            {collection.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-300">
            <span className="text-neutral-400 font-mono">Destaques selecionados:</span>
            {collection.highlightTitles.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-lg bg-black/50 border border-white/10 text-neutral-200 font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Cabeçalho da Lista de Jogos */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Jogos Selecionados na Coleção
          </h2>
          {!loading && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 font-mono font-semibold">
              {games.length} títulos
            </span>
          )}
        </div>
      </div>

      {/* Grid de Jogos da Coleção */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-2xl bg-white/5 border border-white/10 animate-pulse"
            />
          ))}
        </div>
      ) : games.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onOpenAuthModal={() => setIsAuthOpen(true)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4 rounded-3xl border border-white/5 bg-[#0f1218]/50 p-8">
          <Gamepad2 className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Nenhum jogo encontrado no momento</h3>
          <p className="text-xs text-neutral-400">
            Aguarde alguns instantes ou explore outras coleções disponíveis.
          </p>
          <Link
            href="/colecoes"
            className="inline-block px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20"
          >
            Ver outras coleções
          </Link>
        </div>
      )}

      {/* Modal de Autenticação */}
      {isAuthOpen && (
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      )}
    </div>
  );
}
