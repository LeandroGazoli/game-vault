"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Game } from "@/lib/types";
import GameCard from "@/components/GameCard";
import AuthModal from "@/components/AuthModal";
import { getCategoryBySlug } from "@/lib/categoriesData";
import {
  ArrowLeft,
  Filter,
  Sparkles,
  Flame,
  Star,
  Clock,
  Layers,
  Gamepad2,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

const PLATFORM_FILTERS = [
  { id: "all", label: "Todas as Plataformas" },
  { id: "PC", label: "💻 PC" },
  { id: "PlayStation 5", label: "🎮 PS5" },
  { id: "Xbox Series", label: "🟢 Xbox Series" },
  { id: "Nintendo Switch", label: "🔴 Switch" },
  { id: "Retro", label: "🕹️ Retrô" },
];

const SORT_OPTIONS = [
  { id: "popular", label: "Mais Populares", icon: Flame },
  { id: "top_rated", label: "Melhores Notas", icon: Star },
  { id: "recent", label: "Lançamentos", icon: Clock },
];

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "mundo-aberto";
  const category = getCategoryBySlug(slug);

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedSort, setSelectedSort] = useState("popular");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const fetchCategoryGames = useCallback(
    async (pageNum = 1, append = false) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const platformParam = selectedPlatform !== "all" ? `&platform=${encodeURIComponent(selectedPlatform)}` : "";
        const url = `/api/games/category?slug=${slug}&sort=${selectedSort}${platformParam}&page=${pageNum}&limit=30`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const items: Game[] = data.games || [];
          if (append) {
            setGames((prev) => {
              const existingIds = new Set(prev.map((g) => g.id));
              const uniqueNew = items.filter((g) => !existingIds.has(g.id));
              return [...prev, ...uniqueNew];
            });
          } else {
            setGames(items);
          }
          setHasMore(data.hasMore ?? items.length >= 30);
          setPage(pageNum);
        }
      } catch (err) {
        console.error("Erro ao carregar jogos da categoria:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [slug, selectedSort, selectedPlatform]
  );

  useEffect(() => {
    fetchCategoryGames(1, false);
  }, [fetchCategoryGames]);

  if (!category) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Categoria não encontrada</h2>
        <p className="text-sm text-neutral-400">A categoria que você tentou acessar não existe.</p>
        <Link
          href="/categorias"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para todas as categorias
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
        <Link href="/categorias" className="hover:text-white transition-colors">
          Categorias
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-cyan-300 font-semibold">{category.name}</span>
      </div>

      {/* Banner Principal da Categoria */}
      <section
        className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b ${category.accent} p-6 sm:p-10 shadow-2xl`}
      >
        <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
          <img
            src={category.coverImage}
            alt={category.name}
            className="w-full h-full object-cover object-center filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-black/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-xl bg-white text-black font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl select-none">
            {category.badgeLabel}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
            {category.name}
          </h1>

          <p className="text-sm sm:text-base text-neutral-200 leading-relaxed max-w-2xl">
            {category.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-300">
            <span className="text-neutral-400">Títulos de referência:</span>
            {category.featuredTitles.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-neutral-200 font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Barra de Filtros e Ordenação */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0f1218] border border-white/10 shadow-lg">
        {/* Filtro por Plataforma */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto py-0.5">
          <span className="text-xs font-mono font-bold uppercase text-neutral-400 shrink-0 mr-1 flex items-center gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" /> Plataforma:
          </span>
          {PLATFORM_FILTERS.map((pf) => (
            <button
              key={pf.id}
              onClick={() => setSelectedPlatform(pf.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedPlatform === pf.id
                  ? "bg-white text-black shadow-md font-bold scale-105"
                  : "bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5"
              }`}
            >
              {pf.label}
            </button>
          ))}
        </div>

        {/* Ordenação */}
        <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
          <span className="text-xs font-mono font-bold uppercase text-neutral-400 mr-1 hidden md:inline">
            Ordenar:
          </span>
          {SORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedSort === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedSort(opt.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                    : "bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-neutral-200 border border-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Jogos */}
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
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onOpenAuthModal={() => setIsAuthOpen(true)}
              />
            ))}
          </div>

          {/* Botão de Carregar Mais Jogos */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => fetchCategoryGames(page + 1, true)}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white hover:bg-neutral-200 text-black font-bold text-xs sm:text-sm shadow-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loadingMore ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Carregando mais títulos...</span>
                  </>
                ) : (
                  <span>Carregar Mais Jogos</span>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4 rounded-3xl border border-white/5 bg-[#0f1218]/50 p-8">
          <Gamepad2 className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Nenhum jogo encontrado com esses filtros</h3>
          <p className="text-xs text-neutral-400">
            Tente mudar a plataforma ou método de ordenação selecionado.
          </p>
          <button
            onClick={() => {
              setSelectedPlatform("all");
              setSelectedSort("popular");
            }}
            className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Modal de Autenticação se necessário */}
      {isAuthOpen && (
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      )}
    </div>
  );
}
