"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Game, AgeRatingItem } from "@/lib/types";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { useAuth } from "@/context/AuthContext";
import MetacriticBadge from "@/components/MetacriticBadge";
import StatusBadge from "@/components/StatusBadge";
import HltbCard from "@/components/HltbCard";
import GameModal from "@/components/GameModal";
import AdBanner from "@/components/ads/AdBanner";
import Link from "next/link";
import { getGameUrl } from "@/lib/routes";
import {
  ArrowLeft,
  Calendar,
  Monitor,
  Trophy,
  Gamepad2,
  Clock,
  Star,
  Heart,
  Edit3,
  Sparkles,
  Youtube,
  Image as ImageIcon,
  ExternalLink,
  Users,
  Layers,
  Globe,
  Building2,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Languages,
  Package,
  Maximize2,
  ShoppingCart,
  Plus,
  MessageSquare,
} from "lucide-react";
import { sanitizeTranslation } from "@/lib/translate";
import { formatPlatformShort } from "@/lib/platformUtils";

interface GalleryMediaItem {
  url: string;
  type: "artwork" | "screenshot";
  label: string;
  id: string;
}

// Helper para selo oficial de Classificação Indicativa (CLASS_IND Brasil, ESRB, PEGI)
function getAgeRatingBadge(ageRatings?: AgeRatingItem[]) {
  if (!ageRatings || ageRatings.length === 0) return null;

  // 1. Prioridade: Classificação Indicativa Brasileira (CLASS_IND)
  const classInd = ageRatings.find(
    (r) => r.organization.toUpperCase().includes("CLASS_IND") || r.organization.toUpperCase().includes("CLASSIND")
  );
  if (classInd) {
    const raw = classInd.rating.toUpperCase();
    let bg = "bg-[#0c8a3f]"; // Livre - Verde
    let text = "L";

    if (raw.includes("10") || raw === "10") {
      bg = "bg-[#0b75ba]"; // 10 anos - Azul
      text = "10";
    } else if (raw.includes("12") || raw === "12") {
      bg = "bg-[#f5a200] text-black font-black"; // 12 anos - Amarelo
      text = "12";
    } else if (raw.includes("14") || raw === "14") {
      bg = "bg-[#e5591f]"; // 14 anos - Laranja
      text = "14";
    } else if (raw.includes("16") || raw === "16") {
      bg = "bg-[#d9222a]"; // 16 anos - Vermelho
      text = "16";
    } else if (raw.includes("18") || raw === "18") {
      bg = "bg-[#111111] border border-red-500 text-red-500"; // 18 anos - Preto
      text = "18";
    }

    return (
      <div
        className={`w-6 h-6 rounded flex items-center justify-center font-black text-[11px] shadow-md tracking-tighter ${bg}`}
        title={`Classificação Indicativa Brasileira (CLASS_IND): ${text}`}
      >
        {text}
      </div>
    );
  }

  // 2. Fallback: ESRB
  const esrb = ageRatings.find((r) => r.organization.toUpperCase().includes("ESRB"));
  if (esrb) {
    return (
      <div
        className="px-2 py-0.5 rounded font-black text-[10px] bg-neutral-800 border border-white/20 text-white"
        title={`Classificação ESRB: ${esrb.rating}`}
      >
        ESRB {esrb.rating}
      </div>
    );
  }

  // 3. Fallback: PEGI
  const pegi = ageRatings.find((r) => r.organization.toUpperCase().includes("PEGI"));
  if (pegi) {
    return (
      <div
        className="px-2 py-0.5 rounded font-black text-[10px] bg-neutral-800 border border-white/20 text-white"
        title={`Classificação PEGI: ${pegi.rating}`}
      >
        PEGI {pegi.rating}
      </div>
    );
  }

  return null;
}

// Helper para verificar se a URL é de uma loja digital
function isStoreWebsite(url: string) {
  const u = url.toLowerCase();
  return (
    u.includes("steampowered.com") ||
    u.includes("playstation.com") ||
    u.includes("xbox.com") ||
    u.includes("nintendo.com") ||
    u.includes("epicgames.com") ||
    u.includes("gog.com")
  );
}

// Helper para estilizar links oficiais e lojas de acordo com o domínio
function getWebsiteMeta(url: string) {
  const u = url.toLowerCase();
  if (u.includes("steampowered.com")) {
    return { label: "Steam", color: "bg-[#171a21] hover:bg-[#202530] text-[#66c0f4] border-[#66c0f4]/40 hover:border-[#66c0f4] shadow-md", isStore: true };
  }
  if (u.includes("playstation.com")) {
    return { label: "PlayStation Store", color: "bg-[#003791] hover:bg-[#004bb5] text-white border-blue-400/40 hover:border-blue-400 shadow-md", isStore: true };
  }
  if (u.includes("xbox.com")) {
    return { label: "Xbox Store", color: "bg-[#107c10] hover:bg-[#159a15] text-white border-green-400/40 hover:border-green-400 shadow-md", isStore: true };
  }
  if (u.includes("nintendo.com")) {
    return { label: "Nintendo eShop", color: "bg-[#e60012] hover:bg-[#ff1a2d] text-white border-red-400/40 hover:border-red-400 shadow-md", isStore: true };
  }
  if (u.includes("epicgames.com")) {
    return { label: "Epic Games Store", color: "bg-[#2a2a2a] hover:bg-[#383838] text-white border-white/30 hover:border-white shadow-md", isStore: true };
  }
  if (u.includes("gog.com")) {
    return { label: "GOG.com", color: "bg-[#6c2c8f] hover:bg-[#8537b0] text-white border-purple-400/40 hover:border-purple-400 shadow-md", isStore: true };
  }
  if (u.includes("discord")) {
    return { label: "Discord Oficial", color: "bg-[#5865F2]/20 hover:bg-[#5865F2]/35 text-[#818cf8] border-[#5865F2]/40", isStore: false };
  }
  if (u.includes("reddit.com")) {
    return { label: "Subreddit (Reddit)", color: "bg-[#ff4500]/20 hover:bg-[#ff4500]/35 text-[#fb923c] border-[#ff4500]/40", isStore: false };
  }
  if (u.includes("twitch.tv")) {
    return { label: "Lives na Twitch", color: "bg-[#9146FF]/20 hover:bg-[#9146FF]/35 text-[#c084fc] border-[#9146FF]/40", isStore: false };
  }
  if (u.includes("fandom.com") || u.includes("wiki")) {
    return { label: "Wiki & Guias de Troféus", color: "bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border-amber-500/40", isStore: false };
  }
  if (u.includes("wikipedia.org")) {
    return { label: "Artigo na Wikipédia", color: "bg-white/10 hover:bg-white/20 text-gray-200 border-white/20", isStore: false };
  }
  if (u.includes("youtube.com")) {
    return { label: "Canal no YouTube", color: "bg-[#ff0000]/20 hover:bg-[#ff0000]/35 text-red-300 border-red-500/40", isStore: false };
  }
  return { label: "Site Oficial", color: "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40", isStore: false };
}

interface GameDetailClientProps {
  initialGame?: Game | null;
  id: string;
}

export default function GameDetailClient({ initialGame, id }: GameDetailClientProps) {
  const router = useRouter();

  const { user } = useAuth();
  const { getGameInLibrary } = useGameLibrary();

  const [game, setGame] = useState<Game | null>(initialGame || null);
  const [loading, setLoading] = useState(!initialGame);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalGame, setModalGame] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Filtros de Websites por Categoria
  const storeWebsites = useMemo(() => {
    return (game?.websites || []).filter((w) => isStoreWebsite(w.url));
  }, [game?.websites]);

  const communityWebsites = useMemo(() => {
    return (game?.websites || []).filter((w) => !isStoreWebsite(w.url));
  }, [game?.websites]);

  // Estados de Mídia Rica & Galeria
  const [activeVideoId, setActiveVideoId] = useState<string | null>(
    initialGame?.videos && initialGame.videos.length > 0 ? initialGame.videos[0].video_id : null
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mediaFilter, setMediaFilter] = useState<"all" | "artworks" | "screenshots">("all");
  const [mediaTab, setMediaTab] = useState<"gallery" | "videos">("gallery");
  const [bannerError, setBannerError] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const activeThumbnailRef = useRef<HTMLButtonElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const userGame = game ? getGameInLibrary(game.id) : undefined;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialGame) {
      setGame(initialGame);
      setLoading(false);
      if (initialGame.videos && initialGame.videos.length > 0) {
        setActiveVideoId((prev) => prev || initialGame.videos![0].video_id);
      }
      return;
    }

    async function loadGame() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/games/${id}`);
        if (res.ok) {
          const data: Game = await res.json();
          setGame(data);
          if (data.videos && data.videos.length > 0 && !activeVideoId) {
            setActiveVideoId(data.videos[0].video_id);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes do jogo:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGame();
  }, [id, initialGame]);

  // Montar lista unificada de todas as mídias (Key Art 1080p + Screenshots 1080p)
  const allMediaItems = useMemo<GalleryMediaItem[]>(() => {
    if (!game) return [];
    const items: GalleryMediaItem[] = [];

    // 1. Artes Oficiais (Key Art em 1080p do IGDB)
    if (game.artworks && game.artworks.length > 0) {
      game.artworks.forEach((url, i) => {
        items.push({
          url,
          type: "artwork",
          label: `Arte Oficial #${i + 1}`,
          id: `artwork-${i}`,
        });
      });
    }

    // 2. Capturas de Tela (Screenshots em 1080p do IGDB)
    if (game.screenshots && game.screenshots.length > 0) {
      game.screenshots.forEach((url, i) => {
        items.push({
          url,
          type: "screenshot",
          label: `Captura de Tela #${i + 1}`,
          id: `screenshot-${i}`,
        });
      });
    }

    return items;
  }, [game]);

  const artworksCount = useMemo(() => {
    return allMediaItems.filter((m) => m.type === "artwork").length;
  }, [allMediaItems]);

  const screenshotsCount = useMemo(() => {
    return allMediaItems.filter((m) => m.type === "screenshot").length;
  }, [allMediaItems]);

  const displayedMediaItems = useMemo(() => {
    if (mediaFilter === "artworks") {
      return allMediaItems.filter((m) => m.type === "artwork");
    }
    if (mediaFilter === "screenshots") {
      return allMediaItems.filter((m) => m.type === "screenshot");
    }
    return allMediaItems;
  }, [allMediaItems, mediaFilter]);

  const currentLightboxItem =
    lightboxIndex !== null && displayedMediaItems[lightboxIndex]
      ? displayedMediaItems[lightboxIndex]
      : null;

  const goToPrevImage = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return prev > 0 ? prev - 1 : displayedMediaItems.length - 1;
    });
  }, [displayedMediaItems.length]);

  const goToNextImage = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return prev < displayedMediaItems.length - 1 ? prev + 1 : 0;
    });
  }, [displayedMediaItems.length]);

  const scrollGallery = (direction: "left" | "right") => {
    if (!galleryScrollRef.current) return;
    const scrollAmount = galleryScrollRef.current.clientWidth * 0.75;
    galleryScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Navegação no lightbox com Teclado (←, →, Esc)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        goToPrevImage();
      } else if (e.key === "ArrowRight") {
        goToNextImage();
      }
    },
    [goToPrevImage, goToNextImage]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        goToNextImage();
      } else {
        goToPrevImage();
      }
    }
    setTouchStartX(null);
  };

  useEffect(() => {
    if (lightboxIndex !== null) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [lightboxIndex, handleKeyDown]);

  // Auto-scroll da miniatura ativa no lightbox
  useEffect(() => {
    if (activeThumbnailRef.current) {
      activeThumbnailRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [lightboxIndex]);

  // Backdrop Banner: prioriza Key Art oficial (artwork em 1080p), fallback para screenshot 1080p e capa
  const backdropImage =
    game?.backdrop_image ||
    (game?.artworks && game.artworks[0]) ||
    (game?.screenshots && game.screenshots[0]) ||
    game?.background_image;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-80 rounded-[32px] bg-[#18191c]" />
        <div className="h-40 rounded-[32px] bg-[#18191c]" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Jogo não encontrado</h2>
        <p className="text-xs text-gray-400">
          Não conseguimos carregar as informações deste título.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-gray-200 text-black text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Início
        </Link>
      </div>
    );
  }

  const allDlcsRaw = [
    ...(game.dlcs || []),
    ...(game.expansions || []),
  ];
  const uniqueDlcs = Array.from(new Map(allDlcsRaw.map((d) => [d.id, d])).values());

  return (
    <div className="space-y-8 pb-16">
      {/* Botão Voltar */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Banner Informativo se o título for uma DLC / Expansão Oficial */}
      {game.parent_game && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-amber-300/80 font-bold uppercase tracking-wider">
                Conteúdo Adicional / Expansão Oficial
              </p>
              <h4 className="text-sm font-bold text-white">
                Este título é uma DLC/Expansão oficial de{" "}
                <Link
                  href={getGameUrl(game.parent_game)}
                  className="text-amber-400 hover:underline hover:text-amber-300 font-extrabold"
                >
                  {game.parent_game.name}
                </Link>
              </h4>
            </div>
          </div>

          <Link
            href={getGameUrl(game.parent_game)}
            className="px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all shadow-md flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0"
          >
            <span>Ver Jogo Base</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Hero Header do Jogo */}
      <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-[#18191c] shadow-2xl">
        {/* Backdrop Banner */}
        <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-neutral-950">
          {backdropImage && !bannerError ? (
            <img
              src={backdropImage}
              alt=""
              loading="eager"
              decoding="async"
              onError={() => setBannerError(true)}
              className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-cyan-950 via-[#18191c] to-black" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#18191c] via-[#18191c]/60 to-transparent" />
        </div>

        {/* Informações Principais sobrepostas */}
        <div className="relative -mt-28 sm:-mt-36 p-6 sm:p-8 flex flex-col md:flex-row items-start gap-6 sm:gap-8">
          {/* Capa Poster */}
          <div className="w-36 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 bg-neutral-900 flex-shrink-0 group">
            {game.background_image && !posterError ? (
              <img
                src={game.background_image}
                alt=""
                decoding="async"
                onError={() => setPosterError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-[#1c222e] to-[#0f1218] text-gray-500">
                <Sparkles className="w-8 h-8 text-[#00E5FF]/40 mb-2" />
                <span className="text-xs font-semibold text-gray-300 line-clamp-2">{game.name}</span>
              </div>
            )}
          </div>

          {/* Dados do Jogo */}
          <div className="flex-1 min-w-0 space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Selo Oficial de Classificação Indicativa (CLASS_IND Brasil / ESRB) */}
              {getAgeRatingBadge(game.age_ratings)}

              {game.released && (
                <span className="flex items-center gap-1 text-xs font-mono text-gray-300 bg-black/60 border border-white/10 px-3 py-1 rounded-full">
                  <Calendar className="w-3 h-3 text-[#00E5FF]" />
                  {game.released.substring(0, 4)}
                </span>
              )}

              {/* Franquia / Coleção Oficial */}
              {(game.franchises?.[0] || game.collections?.[0]) && (
                <Link
                  href={`/search?q=${encodeURIComponent(game.franchises?.[0] || game.collections?.[0] || "")}`}
                  className="flex items-center gap-1 text-xs text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full hover:bg-amber-900/60 transition-colors"
                  title="Ver todos os jogos desta franquia"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {game.franchises?.[0] || game.collections?.[0]}
                </Link>
              )}

              {/* Destaque de Localização PT-BR */}
              {game.ptbrSupport?.audio && (
                <span className="flex items-center gap-1 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full font-medium" title="Possui Dublagem em Português do Brasil">
                  🇧🇷 Dublado
                </span>
              )}
              {game.ptbrSupport?.subtitles && !game.ptbrSupport?.audio && (
                <span className="flex items-center gap-1 text-xs text-blue-300 bg-blue-950/60 border border-blue-500/30 px-3 py-1 rounded-full font-medium" title="Possui Legendas em Português do Brasil">
                  🇧🇷 Legendado
                </span>
              )}

              {game.genres?.map((g) => (
                <span
                  key={g.id}
                  className="text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {game.name}
            </h1>

            {/* Desenvolvedoras e Distribuidoras Clicáveis */}
            {(game.developers?.length || game.publishers?.length) ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400 font-medium">
                {game.developers && game.developers.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    Dev:{" "}
                    {game.developers.map((dev, idx) => (
                      <Link
                        key={dev}
                        href={`/search?q=${encodeURIComponent(dev)}`}
                        className="text-gray-200 hover:text-cyan-300 hover:underline font-bold transition-colors"
                        title={`Buscar todos os jogos desenvolvidos por ${dev}`}
                      >
                        {dev}{idx < game.developers!.length - 1 ? ", " : ""}
                      </Link>
                    ))}
                  </span>
                )}
                {game.publishers && game.publishers.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-purple-400" />
                    Pub:{" "}
                    {game.publishers.map((pub, idx) => (
                      <Link
                        key={pub}
                        href={`/search?q=${encodeURIComponent(pub)}`}
                        className="text-gray-200 hover:text-purple-300 hover:underline font-bold transition-colors"
                        title={`Buscar todos os jogos publicados por ${pub}`}
                      >
                        {pub}{idx < game.publishers!.length - 1 ? ", " : ""}
                      </Link>
                    ))}
                  </span>
                )}
              </div>
            ) : null}

            {/* Badges de Notas: Metacritic & Comunidade */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {game.metacritic && (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  <MetacriticBadge score={game.metacritic} size="md" showLabel />
                </div>
              )}

              {game.rating && (
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-mono">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-white font-bold">{game.rating.toFixed(1)}</span>
                  <span className="text-gray-400">/ 10</span>
                </div>
              )}

              {userGame && (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  <span className="text-xs text-gray-400 font-medium">Seu Status:</span>
                  <StatusBadge status={userGame.status} completionType={userGame.completionType} size="md" />
                </div>
              )}
            </div>

            {/* Botão de Ação: Registrar / Editar */}
            <div className="pt-2 w-full sm:w-auto flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-gray-200 text-black text-xs sm:text-sm font-bold shadow-xl transition-all active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                {userGame ? "Atualizar Meu Registro / Resenha" : "+ Adicionar ao Meu Perfil"}
              </button>
            </div>

            {/* Acesso Imediato: Onde Jogar & Lojas Oficiais */}
            {storeWebsites.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5 mr-1">
                  <ShoppingCart className="w-3.5 h-3.5 text-cyan-400" /> Onde Jogar:
                </span>
                {storeWebsites.map((w) => {
                  const meta = getWebsiteMeta(w.url);
                  return (
                    <a
                      key={w.id}
                      href={w.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 active:scale-95 ${meta.color}`}
                      title={`Página oficial do jogo em ${meta.label}`}
                    >
                      <span>{meta.label}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          GRID DE 2 COLUNAS: CONTEÚDO PRINCIPAL (ESQ) & PAINEL LATERAL (DIR)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* =====================================================================
            COLUNA PRINCIPAL (2 COLUNAS / ~65%)
        ===================================================================== */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. HUB DE MÍDIA UNIFICADO (TRAILERS & GALERIA 1080P) */}
          {(allMediaItems.length > 0 || (game.videos && game.videos.length > 0)) && (
            <section className="rounded-[32px] border border-white/10 bg-[#18191c] p-6 sm:p-8 space-y-5 shadow-2xl">
              {/* Barra de Abas de Mídia */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div className="flex items-center gap-2 bg-[#121316] p-1 rounded-2xl border border-white/10 text-xs w-fit">
                  {allMediaItems.length > 0 && (
                    <button
                      onClick={() => setMediaTab("gallery")}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                        mediaTab === "gallery"
                          ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Galeria de Imagens</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                          mediaTab === "gallery" ? "bg-black/30 text-black" : "bg-white/10 text-gray-400"
                        }`}
                      >
                        {allMediaItems.length}
                      </span>
                    </button>
                  )}

                  {game.videos && game.videos.length > 0 && (
                    <button
                      onClick={() => setMediaTab("videos")}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                        mediaTab === "videos"
                          ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Youtube className="w-3.5 h-3.5" />
                      <span>Trailers &amp; Vídeos</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                          mediaTab === "videos" ? "bg-black/30 text-white" : "bg-white/10 text-gray-400"
                        }`}
                      >
                        {game.videos.length}
                      </span>
                    </button>
                  )}
                </div>

                {/* Controles da Galeria (Filtros e Setas) se estiver na aba Galeria */}
                {mediaTab === "gallery" && allMediaItems.length > 0 && (
                  <div className="flex items-center gap-2">
                    {artworksCount > 0 && screenshotsCount > 0 && (
                      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-[11px]">
                        <button
                          onClick={() => setMediaFilter("all")}
                          className={`px-2.5 py-0.5 rounded-lg font-medium transition-all ${
                            mediaFilter === "all" ? "bg-white/20 text-white font-bold" : "text-gray-400 hover:text-white"
                          }`}
                        >
                          Todas
                        </button>
                        <button
                          onClick={() => setMediaFilter("artworks")}
                          className={`px-2.5 py-0.5 rounded-lg font-medium transition-all ${
                            mediaFilter === "artworks" ? "bg-white/20 text-white font-bold" : "text-gray-400 hover:text-white"
                          }`}
                        >
                          Artes
                        </button>
                        <button
                          onClick={() => setMediaFilter("screenshots")}
                          className={`px-2.5 py-0.5 rounded-lg font-medium transition-all ${
                            mediaFilter === "screenshots" ? "bg-white/20 text-white font-bold" : "text-gray-400 hover:text-white"
                          }`}
                        >
                          Screenshots
                        </button>
                      </div>
                    )}

                    <div className="hidden sm:flex items-center gap-1">
                      <button
                        onClick={() => scrollGallery("left")}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white border border-white/5 transition-colors"
                        title="Rolar para esquerda"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => scrollGallery("right")}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white border border-white/5 transition-colors"
                        title="Rolar para direita"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Conteúdo da Aba Galeria */}
              {mediaTab === "gallery" && allMediaItems.length > 0 && (
                <div
                  ref={galleryScrollRef}
                  className="flex gap-3.5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-1 -mx-2 px-2 sm:mx-0 sm:px-0"
                >
                  {displayedMediaItems.map((item, idx) => {
                    if (failedImages.has(item.url)) return null;

                    return (
                      <div
                        key={item.id || idx}
                        onClick={() => setLightboxIndex(idx)}
                        className="w-[260px] sm:w-[320px] md:w-[360px] flex-shrink-0 snap-start group relative aspect-video rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 cursor-pointer shadow-lg hover:border-cyan-400/60 transition-all hover:scale-[1.01]"
                      >
                        <img
                          src={item.url}
                          alt={item.label}
                          loading="lazy"
                          decoding="async"
                          onError={() => {
                            setFailedImages((prev) => new Set(prev).add(item.url));
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 pointer-events-none">
                          {item.type === "artwork" ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 backdrop-blur-md shadow-sm">
                              Arte Oficial
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-gray-300 border border-white/15 backdrop-blur-md shadow-sm">
                              Screenshot
                            </span>
                          )}
                        </div>

                        <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-black/70 text-gray-300 border border-white/10 backdrop-blur-md">
                            {idx + 1}/{displayedMediaItems.length}
                          </span>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-black/85 px-4 py-2 rounded-full border border-white/25 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" /> Ampliar no Slide
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Conteúdo da Aba Vídeos */}
              {mediaTab === "videos" && game.videos && game.videos.length > 0 && (
                <div className="space-y-4 animate-fadeIn">
                  {activeVideoId && (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?rel=0&modestbranding=1`}
                        title={game.name}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full border-0"
                      />
                    </div>
                  )}

                  {game.videos.length > 1 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-xs font-semibold text-gray-400 block">
                        Outros Vídeos Disponíveis ({game.videos.length}):
                      </span>
                      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2">
                        {game.videos.map((vid) => {
                          const isActive = activeVideoId === vid.video_id;
                          return (
                            <button
                              key={vid.id}
                              onClick={() => setActiveVideoId(vid.video_id)}
                              className={`flex-shrink-0 w-44 sm:w-48 rounded-xl overflow-hidden text-left border transition-all group ${
                                isActive
                                  ? "border-[#00E5FF] shadow-lg shadow-[#00E5FF]/10 bg-cyan-950/40"
                                  : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
                              }`}
                            >
                              <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                                <img
                                  src={`https://img.youtube.com/vi/${vid.video_id}/mqdefault.jpg`}
                                  alt={vid.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <div className={`p-1.5 rounded-full ${isActive ? "bg-[#00E5FF] text-black" : "bg-black/70 text-white"}`}>
                                    <Youtube className="w-3.5 h-3.5 fill-current" />
                                  </div>
                                </div>
                              </div>
                              <div className="p-2">
                                <p className="text-xs font-medium text-gray-200 line-clamp-1 group-hover:text-white">
                                  {vid.name}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* 2. SOBRE O JOGO (SINOPSE) */}
          <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-6 sm:p-8 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00E5FF]" /> Sobre o Jogo
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {sanitizeTranslation(game.description_raw) || "Descrição não disponível para este jogo."}
            </p>
          </div>

          {/* 3. ENREDO & NARRATIVA (STORYLINE SE HOUVER) */}
          {game.storyline && (
            <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-6 sm:p-8 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" /> Enredo &amp; Narrativa
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {sanitizeTranslation(game.storyline)}
              </p>
            </div>
          )}

          {/* 4. DURAÇÃO & RITMO DE ZERAMENTO (HOWLONGTOBEAT + CALCULADORA) */}
          <HltbCard hltb={game.hltb} userPlaytimeHours={userGame?.userPlaytimeHours} />
        </div>

        {/* =====================================================================
            COLUNA LATERAL (1 COLUNA / ~35%)
        ===================================================================== */}
        <div className="space-y-6">
          {/* PAINEL DO JOGADOR (SEU REGISTRO NO VAULT) */}
          <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Seu Registro no Vault
            </h3>

            {userGame ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-gray-400">Status atual:</span>
                  <StatusBadge status={userGame.status} size="md" />
                </div>

                {userGame.userRating !== null && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-gray-400">Sua Nota:</span>
                    <span className="font-bold text-amber-400 text-sm">
                      ⭐ {userGame.userRating.toFixed(1)} / 10
                    </span>
                  </div>
                )}

                {userGame.userPlaytimeHours !== null && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-gray-400">Tempo jogado:</span>
                    <span className="font-bold text-cyan-300 text-sm">
                      {userGame.userPlaytimeHours}h
                    </span>
                  </div>
                )}

                {userGame.platformPlayed && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-gray-400">Plataforma:</span>
                    <span className="font-semibold text-gray-200">
                      {userGame.platformPlayed}
                    </span>
                  </div>
                )}

                {userGame.userReview && (
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500 font-sans">
                      Sua Resenha
                    </span>
                    <p className="text-xs text-gray-300 italic whitespace-pre-line font-sans">
                      &quot;{userGame.userReview}&quot;
                    </p>
                  </div>
                )}

                {/* DLCs Concluídas ou Vinculadas */}
                {userGame.dlcs && userGame.dlcs.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-1.5 font-sans">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-cyan-400">
                      <span className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" /> DLCs Vinculadas
                      </span>
                      <span className="font-mono">
                        {userGame.dlcs.filter((d) => d.status === "completed").length}/{userGame.dlcs.length} Zeradas
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {userGame.dlcs.map((d) => (
                        <span
                          key={d.id}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                            d.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : d.status === "playing"
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                              : "bg-white/5 text-gray-300 border border-white/10"
                          }`}
                          title={`${d.name} (${d.status})`}
                        >
                          {d.name.length > 22 ? `${d.name.substring(0, 20)}...` : d.name}
                          {d.playtimeHours ? ` (${d.playtimeHours}h)` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-white transition-colors mt-2"
                >
                  Editar Registro
                </button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <Gamepad2 className="w-10 h-10 text-gray-600 mx-auto" />
                <p className="text-xs text-gray-400">
                  Você ainda não registrou este jogo.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-3 rounded-full bg-white hover:bg-gray-200 text-black text-xs font-bold transition-all shadow-md"
                >
                  + Adicionar ao Meu Perfil
                </button>
              </div>
            )}
          </div>

          {/* FICHA TÉCNICA RÁPIDA CONSOLIDADA */}
          <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-6 space-y-5 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Monitor className="w-4 h-4 text-cyan-400" /> Ficha Técnica
            </h3>

            {/* Plataformas */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-400 block">Plataformas Disponíveis:</span>
              <div className="flex flex-wrap gap-1.5">
                {game.platforms && game.platforms.length > 0 ? (
                  game.platforms.map((p) => (
                    <span
                      key={p.platform.id}
                      className="text-xs font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300"
                    >
                      {p.platform.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">Múltiplas plataformas</span>
                )}
              </div>
            </div>

            {/* Suporte a Português do Brasil */}
            {game.ptbrSupport && (
              <div className="space-y-1.5 pt-3 border-t border-white/5">
                <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-emerald-400" /> Português (Brasil):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {game.ptbrSupport.audio && (
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-500/20 font-medium">
                      Áudio Dublado 🇧🇷
                    </span>
                  )}
                  {game.ptbrSupport.subtitles && (
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-950/40 text-blue-300 border border-blue-500/20 font-medium">
                      Legendas
                    </span>
                  )}
                  {game.ptbrSupport.interface && (
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-purple-950/40 text-purple-300 border border-purple-500/20 font-medium">
                      Interface &amp; Menus
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Modos de Jogo & Perspectiva */}
            {((game.game_modes && game.game_modes.length > 0) || (game.player_perspectives && game.player_perspectives.length > 0)) && (
              <div className="space-y-3 pt-3 border-t border-white/5">
                {game.game_modes && game.game_modes.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" /> Modos de Jogo:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {game.game_modes.map((m) => (
                        <span key={m} className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-950/40 text-cyan-300 border border-cyan-500/20">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {game.player_perspectives && game.player_perspectives.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-400" /> Câmera / Perspectiva:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {game.player_perspectives.map((p) => (
                        <span key={p} className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-500/20">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ambientação & Temas */}
            {game.themes && game.themes.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t border-white/5">
                <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" /> Ambientação:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {game.themes.map((t) => (
                    <span key={t} className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-950/40 text-purple-300 border border-purple-500/20">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* COMUNIDADES, WIKIS & REDES */}
          {communityWebsites.length > 0 && (
            <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <Globe className="w-4 h-4 text-emerald-400" /> Comunidade &amp; Guias
              </h3>
              <div className="flex flex-col gap-2">
                {communityWebsites.map((w) => {
                  const meta = getWebsiteMeta(w.url);
                  return (
                    <a
                      key={w.id}
                      href={w.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all ${meta.color}`}
                      title={`Acessar ${meta.label}`}
                    >
                      <span>{meta.label}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* BANNER DE ANÚNCIO NA SIDEBAR */}
          <AdBanner slot="GAME_DETAIL_IN_CONTENT" />
        </div>
      </div>

      {/* =========================================================================
          SEÇÃO DE EXPANSÕES & DLCS OFICIAIS
      ========================================================================= */}
      {uniqueDlcs.length > 0 && (
        <section className="rounded-[32px] border border-white/10 bg-[#18191c] p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-[#00E5FF]" /> Expansões &amp; DLCs Oficiais ({uniqueDlcs.length})
              </h3>
              <p className="text-xs text-gray-400">
                Conteúdos adicionais, expansões de história e DLCs lançadas para {game.name}.
              </p>
            </div>

            {userGame?.dlcs && userGame.dlcs.length > 0 && (
              <span className="px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs text-[#00E5FF] font-mono font-bold w-fit">
                {userGame.dlcs.filter((d) => d.status === "completed").length} de {uniqueDlcs.length} DLCs Zeradas
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {uniqueDlcs.map((dlc) => {
              const userDlc = userGame?.dlcs?.find((d) => d.id === dlc.id);

              return (
                <div
                  key={dlc.id}
                  className={`group rounded-2xl border transition-all hover:scale-[1.02] flex flex-col justify-between overflow-hidden ${
                    userDlc?.status === "completed"
                      ? "bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500"
                      : userDlc?.status === "playing"
                      ? "bg-cyan-950/20 border-cyan-500/40 hover:border-cyan-500"
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  <Link href={getGameUrl(dlc)} className="block">
                    <div className="relative aspect-[3/4] w-full bg-neutral-900 overflow-hidden">
                      {dlc.coverUrl ? (
                        <img
                          src={dlc.coverUrl}
                          alt={dlc.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-600 font-mono">
                          DLC
                        </div>
                      )}

                      {/* Selo se o usuário já jogou */}
                      {userDlc && (
                        <div className="absolute top-2 right-2 z-10">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono shadow-md ${
                              userDlc.status === "completed"
                                ? "bg-emerald-500 text-black"
                                : userDlc.status === "playing"
                                ? "bg-cyan-500 text-black"
                                : "bg-amber-500 text-black"
                            }`}
                          >
                            {userDlc.status === "completed"
                              ? "Zerada"
                              : userDlc.status === "playing"
                              ? "Jogando"
                              : "Quero"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 space-y-1">
                      <h4
                        className="text-xs font-bold text-white group-hover:text-[#00E5FF] transition-colors line-clamp-2"
                        title={dlc.name}
                      >
                        {dlc.name}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                        <span>{dlc.releaseDate ? dlc.releaseDate.substring(0, 4) : "DLC"}</span>
                        {userDlc?.playtimeHours && (
                          <span className="text-cyan-300 font-bold">{userDlc.playtimeHours}h</span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="p-2 pt-0">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-[10px] font-semibold text-gray-300 hover:text-white transition-all border border-white/5"
                    >
                      {userDlc ? "Editar no Jogo" : "+ Anexar / Registrar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =========================================================================
          SEÇÃO DE FRANQUIA & UNIVERSO DA SAGA
      ========================================================================= */}
      {(game.franchises?.[0] || game.collections?.[0]) && (
        <section className="rounded-[32px] border border-amber-500/25 bg-gradient-to-r from-amber-950/20 via-[#18191c] to-black p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Universo &amp; Linha do Tempo
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Saga {game.franchises?.[0] || game.collections?.[0]}
              </h3>
              <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                Quer mergulhar na cronologia completa? Encontre todos os títulos, edições e expansões desta franquia no acervo.
              </p>
            </div>

            <Link
              href={`/search?q=${encodeURIComponent(game.franchises?.[0] || game.collections?.[0] || "")}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all shadow-lg self-start sm:self-auto flex-shrink-0"
            >
              <span>Ver Todos os Jogos da Saga</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* =========================================================================
          SEÇÃO DE JOGOS SEMELHANTES / RECOMENDAÇÕES
      ========================================================================= */}
      {game.similar_games && game.similar_games.length > 0 && (
        <section className="rounded-[32px] border border-white/10 bg-[#18191c] p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="space-y-1 border-b border-white/5 pb-4">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Títulos Semelhantes Recomendados
            </h3>
            <p className="text-xs text-gray-400">
              Se você curte {game.name}, talvez também vá gostar destes títulos selecionados pelo IGDB.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {game.similar_games.slice(0, 12).map((sg) => (
              <div
                key={sg.id}
                className="group rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-cyan-500/40 transition-all hover:scale-[1.03] flex flex-col justify-between"
              >
                <Link
                  href={getGameUrl(sg)}
                  className="block flex-1 flex flex-col"
                >
                  <div className="relative aspect-[3/4] w-full bg-neutral-900 overflow-hidden">
                    {sg.coverUrl ? (
                      <img
                        src={sg.coverUrl}
                        alt={sg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                        Sem Capa
                      </div>
                    )}
                    {sg.rating && (
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold font-mono text-amber-400 border border-amber-400/30">
                        ★ {sg.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-bold text-white group-hover:text-[#00E5FF] transition-colors line-clamp-2">
                      {sg.name}
                    </h4>
                  </div>
                </Link>

                <div className="p-2 pt-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setModalGame({
                        id: sg.id,
                        name: sg.name,
                        background_image: sg.coverUrl,
                        slug: String(sg.id),
                        rating: sg.rating ? Number((sg.rating * 10).toFixed(0)) : undefined,
                      });
                      setIsModalOpen(true);
                    }}
                    className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-cyan-500 hover:text-black text-[10px] font-bold text-gray-200 transition-all flex items-center justify-center gap-1 border border-white/10 shadow-sm active:scale-95"
                    title="Salvar ou registrar este jogo no seu perfil"
                  >
                    <Plus className="w-3 h-3 text-cyan-400 group-hover:text-black" />
                    <span>+ Salvar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal de Registro / Atualização */}
      <GameModal
        game={modalGame || game}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalGame(null);
        }}
      />

      {/* Lightbox Modal Estilo Slide Fullscreen com Navegação e Miniaturas */}
      {lightboxIndex !== null && currentLightboxItem && mounted && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[999] !m-0 !mt-0 flex flex-col justify-between p-3 sm:p-6 bg-black/95 backdrop-blur-2xl animate-fadeIn select-none"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Barra Superior do Lightbox */}
          <div
            className="flex items-center justify-between w-full max-w-7xl mx-auto z-20 pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              {currentLightboxItem.type === "artwork" ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm">
                  Arte Oficial (Key Art 1080p)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-gray-200 border border-white/20 shadow-sm">
                  Captura de Tela (1080p)
                </span>
              )}

              <span className="text-xs font-mono font-medium text-gray-400">
                {lightboxIndex + 1} de {displayedMediaItems.length}
              </span>
            </div>

            <button
              onClick={() => setLightboxIndex(null)}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 border border-white/10 hover:border-white/25"
              title="Fechar (Esc)"
            >
              <span className="text-xs font-semibold hidden sm:inline">Fechar</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Área Central de Visualização com Botões de Slide */}
          <div
            className="relative flex-1 flex items-center justify-center my-auto overflow-hidden px-2"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Botão Anterior */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevImage();
              }}
              className="absolute left-1 sm:left-4 z-30 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 hover:border-cyan-400/60 transition-all shadow-2xl hover:scale-110 active:scale-95"
              title="Foto anterior (←)"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Imagem Principal em Alta Definição */}
            <div
              className="max-w-full max-h-[72vh] sm:max-h-[76vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                key={currentLightboxItem.url}
                src={currentLightboxItem.url}
                alt={currentLightboxItem.label}
                loading="lazy"
                decoding="async"
                className="max-w-[94vw] max-h-[72vh] sm:max-h-[76vh] rounded-2xl object-contain border border-white/15 shadow-2xl transition-all duration-300 animate-fadeIn"
              />
            </div>

            {/* Botão Próximo */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNextImage();
              }}
              className="absolute right-1 sm:right-4 z-30 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 hover:border-cyan-400/60 transition-all shadow-2xl hover:scale-110 active:scale-95"
              title="Próxima foto (→)"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Faixa Inferior de Miniaturas para Navegação Direta */}
          <div
            className="w-full max-w-5xl mx-auto z-20 pt-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto scrollbar-none py-2 px-3 bg-[#121316]/80 backdrop-blur-md rounded-2xl border border-white/10">
              {displayedMediaItems.map((thumb, idx) => (
                <button
                  key={thumb.id || idx}
                  ref={idx === lightboxIndex ? activeThumbnailRef : null}
                  onClick={() => setLightboxIndex(idx)}
                  className={`flex-shrink-0 w-14 sm:w-20 aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    idx === lightboxIndex
                      ? "border-cyan-400 ring-2 ring-cyan-400/40 scale-105 opacity-100 shadow-md"
                      : "border-transparent opacity-40 hover:opacity-80"
                  }`}
                  title={thumb.label}
                >
                  <img
                    src={thumb.url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

