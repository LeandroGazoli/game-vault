"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { saveUserProfile } from "@/lib/firebase";
import { triggerSelectionHaptic, triggerSuccessHaptic } from "@/lib/capacitor";
import {
  PRESET_BANNERS,
  ProfileTheme,
  MARKDOWN_PRESETS,
  HTML_BIO_PRESETS,
  SocialLinks,
  ProfileVisibility,
  UserGame,
  DEFAULT_GAMER_TITLES,
  GAMER_EMOJI_SUGGESTIONS,
  ProfileLayout,
} from "@/lib/types";
import ProfileBioRenderer from "@/components/ProfileBioRenderer";
import UserAvatar from "@/components/UserAvatar";
import { isPureHtmlBio } from "@/lib/sanitizeHtml";
import { calculateAge } from "@/lib/gameUtils";
import {
  X,
  Palette,
  Image as ImageIcon,
  Sparkles,
  Check,
  Crown,
  Lock,
  Save,
  Link as LinkIcon,
  Code2,
  Eye,
  Trash2,
  ShieldCheck,
  FileCode,
  Gamepad2,
  Trophy,
  Share2,
  EyeOff,
  Globe,
  Bold,
  Italic,
  Heading,
  List,
  Quote,
  Table,
  ArrowLeft,
  ArrowRight,
  Plus,
  LayoutGrid,
  Radio,
  MousePointer,
  FileText,
  AlertCircle,
  AlertTriangle,
  Calendar,
  User,
  Heart,
  SlidersHorizontal,
  Maximize2,
} from "lucide-react";

export interface ProfileEditViewProps {
  isPage?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenUpgrade?: () => void;
  games?: UserGame[];
  initialTab?: "info" | "appearance" | "titles" | "markdown" | "socials" | "showcase" | "visibility";
}

const THEME_OPTIONS: { id: ProfileTheme; name: string; color: string; ring: string; badge: string; isVip?: boolean }[] = [
  { id: "cyan", name: "Cyberpunk Cyan", color: "bg-[#00E5FF]", ring: "ring-[#00E5FF]", badge: "border-cyan-500/40 text-[#00E5FF] bg-cyan-500/10" },
  { id: "gold", name: "Obsidian Gold VIP", color: "bg-amber-400", ring: "ring-amber-400", badge: "border-amber-500/40 text-amber-300 bg-amber-500/10", isVip: true },
  { id: "purple", name: "Midnight Purple", color: "bg-purple-500", ring: "ring-purple-500", badge: "border-purple-500/40 text-purple-300 bg-purple-500/10" },
  { id: "crimson", name: "Crimson Matrix", color: "bg-rose-500", ring: "ring-rose-500", badge: "border-rose-500/40 text-rose-300 bg-rose-500/10" },
  { id: "emerald", name: "Emerald Forest", color: "bg-emerald-400", ring: "ring-emerald-400", badge: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10" },
];

const LAYOUT_OPTIONS: {
  id: ProfileLayout;
  name: string;
  badge: string;
  desc: string;
}[] = [
  {
    id: "default",
    name: "Cyber Vault (Padrão)",
    badge: "Equilibrado",
    desc: "Hero clean, insígnias em 100% da largura e botões simétricos.",
  },
  {
    id: "cinematic",
    name: "Cinematic Pass",
    badge: "Showcase Console",
    desc: "Capa cinematográfica expansiva com avatar sobreposto estilo PlayStation/Steam.",
  },
  {
    id: "gamer_id",
    name: "Gamer ID Card",
    badge: "Cyberpunk ID",
    desc: "Estilo crachá holográfico com faixa de prestígio e chips de conquista sci-fi.",
  },
  {
    id: "minimal",
    name: "Editorial Minimal",
    badge: "Clean & Puro",
    desc: "Visual monocromático, linhas finas e foco absoluto nos jogos e estatísticas.",
  },
];

const GAMER_TITLES = DEFAULT_GAMER_TITLES;

export default function ProfileEditView({
  isPage = false,
  isOpen = true,
  onClose,
  onOpenUpgrade,
  games = [],
  initialTab,
}: ProfileEditViewProps) {
  const { user, isPremium, updateUserProfile } = useAuth();

  const [activeSection, setActiveSection] = useState<"info" | "appearance" | "titles" | "markdown" | "socials" | "showcase" | "visibility">(initialTab || "info");

  // Dados Básicos do Perfil
  const [displayNameInput, setDisplayNameInput] = useState<string>(user?.displayName || "");
  const [photoUrlInput, setPhotoUrlInput] = useState<string>(user?.photoURL || "");
  const [bioInput, setBioInput] = useState<string>(user?.bio || "");
  const [favGameInput, setFavGameInput] = useState<string>(user?.favoriteGame || "");
  const [birthDateInput, setBirthDateInput] = useState<string>(user?.birthDate || "");

  // Estados de Personalização
  const [selectedBanner, setSelectedBanner] = useState<string>(user?.bannerURL || PRESET_BANNERS[0].url);
  const [customBannerUrl, setCustomBannerUrl] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<ProfileTheme>(user?.theme || "cyan");
  const [selectedLayout, setSelectedLayout] = useState<ProfileLayout>(user?.profileLayout || "default");

  // Títulos e Insígnias
  const [equippedTitles, setEquippedTitles] = useState<string[]>(() => {
    if (user?.customTitles && Array.isArray(user.customTitles) && user.customTitles.length > 0) {
      return user.customTitles.slice(0, 3);
    }
    if (user?.customTitle) {
      return [user.customTitle];
    }
    return [DEFAULT_GAMER_TITLES[0]];
  });
  const [createdTitles, setCreatedTitles] = useState<string[]>(() => {
    return Array.isArray(user?.createdCustomTitles) ? user.createdCustomTitles : [];
  });
  const [newTitleInput, setNewTitleInput] = useState<string>("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [titlesNotice, setTitlesNotice] = useState<string | null>(null);

  const [markdownContent, setMarkdownContent] = useState<string>(user?.customMarkdown || user?.customHtml || "");
  const [markdownTab, setMarkdownTab] = useState<"edit" | "preview">("edit");
  const [bioMode, setBioMode] = useState<"markdown" | "html">(() => {
    if (user?.customBioMode) return user.customBioMode;
    const initialBio = user?.customMarkdown || user?.customHtml || "";
    return isPureHtmlBio(initialBio) ? "html" : "markdown";
  });

  // Redes Sociais / Gamertags
  const [socials, setSocials] = useState<SocialLinks>(user?.socialLinks || {});

  // Jogo em Destaque
  const [showcaseGameId, setShowcaseGameId] = useState<number | null>(user?.showcaseGameId || null);

  // Visibilidade
  const [visibility, setVisibility] = useState<ProfileVisibility>(
    user?.visibility || {
      isPublic: user?.isPublic ?? true,
      showStats: true,
      showPlaytime: true,
      showRatings: true,
      showDropped: true,
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  // Sincroniza dados sempre que o modal abre ou a página carrega
  React.useEffect(() => {
    if (isOpen || isPage) {
      if (initialTab) {
        setActiveSection(initialTab);
      }
    }
    if (user && (isOpen || isPage)) {
      setDisplayNameInput(user.displayName || "");
      setPhotoUrlInput(user.photoURL || "");
      setBioInput(user.bio || "");
      setFavGameInput(user.favoriteGame || "");
      setBirthDateInput(user.birthDate || "");
      setSelectedBanner(user.bannerURL || PRESET_BANNERS[0].url);
      setSelectedTheme(user.theme || "cyan");
      if (user.customTitles && Array.isArray(user.customTitles) && user.customTitles.length > 0) {
        setEquippedTitles(user.customTitles.slice(0, 3));
      } else if (user.customTitle) {
        setEquippedTitles([user.customTitle]);
      } else {
        setEquippedTitles([DEFAULT_GAMER_TITLES[0]]);
      }
      setCreatedTitles(Array.isArray(user.createdCustomTitles) ? user.createdCustomTitles : []);
      const bioContent = user.customMarkdown || user.customHtml || "";
      setMarkdownContent(bioContent);
      setBioMode(user.customBioMode || (isPureHtmlBio(bioContent) ? "html" : "markdown"));
      setSocials(user.socialLinks || {});
      setShowcaseGameId(user.showcaseGameId || null);
      setVisibility({
        isPublic: user.isPublic ?? user.visibility?.isPublic ?? true,
        showStats: user.visibility?.showStats ?? true,
        showPlaytime: user.visibility?.showPlaytime ?? true,
        showRatings: user.visibility?.showRatings ?? true,
        showDropped: user.visibility?.showDropped ?? true,
      });
    }
  }, [user, isOpen, isPage, initialTab]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloqueio de scroll do body e listener para tecla Escape (apenas em modo modal)
  useEffect(() => {
    if (isPage || !isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isPage, onClose]);

  if (!user) {
    if (isPage) {
      return (
        <div className="min-h-screen bg-[#0c0e14] text-white flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md p-8 rounded-3xl bg-[#14161e] border border-white/10 shadow-2xl">
            <User className="w-12 h-12 text-[#00E5FF] mx-auto" />
            <h2 className="text-xl font-bold">Faça login para editar seu perfil</h2>
            <p className="text-xs text-gray-400">
              Você precisa estar autenticado para personalizar suas insígnias, banners e configurações.
            </p>
            <Link
              href="/perfil"
              className="inline-block px-6 py-3 rounded-full bg-[#00E5FF] hover:bg-cyan-400 text-black font-bold text-xs transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
            >
              Voltar ao Perfil
            </Link>
          </div>
        </div>
      );
    }
    return null;
  }

  if (!isPage && !isOpen) return null;

  const insertMarkdown = (prefix: string, suffix = "") => {
    setMarkdownContent((prev) => `${prev}\n${prefix}Texto${suffix}\n`);
  };

  const insertHtmlSnippet = (snippet: string) => {
    setMarkdownContent((prev) => (prev ? `${prev}\n${snippet}\n` : `${snippet}\n`));
  };

  // Reordenação Direcional Instantânea (Sem Digitar Números)
  const moveEquippedTitle = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= equippedTitles.length) return;
    const updated = [...equippedTitles];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setEquippedTitles(updated);
  };

  const unequipTitle = (title: string) => {
    setEquippedTitles((prev) => prev.filter((t) => t !== title));
  };

  const toggleEquipTitle = (title: string) => {
    if (equippedTitles.includes(title)) {
      unequipTitle(title);
    } else {
      if (equippedTitles.length >= 3) {
        setTitlesNotice("Máximo de 3 insígnias no perfil atingido. Remova uma para adicionar esta.");
        setTimeout(() => setTitlesNotice(null), 3500);
        return;
      }
      setEquippedTitles((prev) => [...prev, title]);
    }
  };

  const handleCreateCustomTitle = () => {
    if (!isPremium) {
      if (onClose) onClose();
      if (onOpenUpgrade) onOpenUpgrade();
      return;
    }
    const cleanTitle = newTitleInput.trim();
    if (!cleanTitle) {
      setCreateError("Digite o nome da sua insígnia.");
      return;
    }
    if (cleanTitle.length > 32) {
      setCreateError("O nome da insígnia pode ter no máximo 32 caracteres.");
      return;
    }
    if (createdTitles.length >= 10) {
      setCreateError("Limite de 10 insígnias customizadas atingido. Exclua uma para liberar espaço.");
      return;
    }
    if (createdTitles.includes(cleanTitle) || DEFAULT_GAMER_TITLES.includes(cleanTitle)) {
      setCreateError("Uma insígnia com este nome já existe.");
      return;
    }

    const updatedCreated = [...createdTitles, cleanTitle];
    setCreatedTitles(updatedCreated);
    setNewTitleInput("");
    setCreateError(null);

    // Se o usuário tem menos de 3 no perfil, já equipa automaticamente para conveniência
    if (equippedTitles.length < 3) {
      setEquippedTitles((prev) => [...prev, cleanTitle]);
    }
  };

  const handleDeleteCustomTitle = (titleToDelete: string) => {
    setCreatedTitles((prev) => prev.filter((t) => t !== titleToDelete));
    setEquippedTitles((prev) => prev.filter((t) => t !== titleToDelete));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const banner = customBannerUrl.trim() || selectedBanner;
      const cleanDisplayName = displayNameInput.trim() || user.displayName || user.username;
      const cleanPhotoUrl = photoUrlInput.trim() || null;
      const cleanBio = bioInput.trim();
      const cleanFavGame = favGameInput.trim();

      await updateUserProfile({
        displayName: cleanDisplayName,
        photoURL: cleanPhotoUrl,
        bio: cleanBio,
        favoriteGame: cleanFavGame,
        birthDate: birthDateInput.trim() || null,
        bannerURL: banner,
        theme: selectedTheme,
        profileLayout: selectedLayout,
        customTitle: equippedTitles[0] || null, // Mantém compatibilidade com leitura legada
        customTitles: equippedTitles,
        createdCustomTitles: createdTitles,
        customMarkdown: markdownContent.trim(),
        customHtml: markdownContent.trim(), // Compatibilidade retroativa
        customBioMode: bioMode,
        socialLinks: socials,
        showcaseGameId: showcaseGameId,
        isPublic: visibility.isPublic !== false,
        visibility: {
          ...visibility,
          isPublic: visibility.isPublic !== false,
        },
      });
      setSuccessToast(true);
      triggerSuccessHaptic();
      setTimeout(() => {
        setSuccessToast(false);
        if (onClose) onClose();
      }, 1200);
    } catch (e) {
      console.error("Erro ao salvar perfil e personalização:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const headerContent = (
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1 min-w-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00E5FF] text-xs font-semibold">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Central de Edição &amp; Personalização
        </div>
        <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 truncate">
          <span>Editar &amp; Personalizar Perfil</span>
          {!isPremium && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 hidden sm:flex items-center gap-1 font-medium">
              <Crown className="w-3 h-3" /> Modo Free &amp; PRO
            </span>
          )}
        </h2>
        <p className="text-xs text-gray-400 hidden sm:block">
          Ajuste seus dados básicos, bio, foto, capa panorâmica, paleta de cores, insígnias gamer e configurações públicas.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 pt-0.5">
        {isPage ? (
          <Link
            href="/perfil"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-colors flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Voltar ao Perfil</span>
          </Link>
        ) : (
          <>
            <Link
              href="/perfil/editar"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
              title="Abrir página cheia de edição"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xs:inline">Página Cheia</span>
            </Link>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors active:scale-95 cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );

  const tabsBar = (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
      {[
        { id: "info", label: "Dados do Perfil", icon: User },
        { id: "appearance", label: "Capa & Cores", icon: Palette },
        { id: "titles", label: `Insígnias (${equippedTitles.length}/3)`, icon: Sparkles },
        { id: "markdown", label: "Bio Estilizada", icon: Code2 },
        { id: "socials", label: "Gamertags", icon: Share2 },
        { id: "showcase", label: "Destaque", icon: Trophy },
        { id: "visibility", label: "Privacidade", icon: EyeOff },
      ].map((tab) => {
        const Icon = tab.icon;
        const isActive = activeSection === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              triggerSelectionHaptic();
              setActiveSection(tab.id as any);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer min-h-[40px] touch-manipulation ${
              isActive
                ? "bg-[#00E5FF] text-black shadow-md scale-105"
                : "text-gray-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );

  const footerContent = (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="text-xs text-gray-400 hidden sm:block">
        {isPremium ? (
          <span className="text-emerald-400 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Recursos desbloqueados com seu plano PRO/VIP
          </span>
        ) : (
          <span className="text-amber-300 flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 text-amber-400" /> Seja PRO para desbloquear layouts alternativos, insígnias ilimitadas e bio HTML5
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 sm:flex-none px-7 py-3 rounded-2xl sm:rounded-full bg-amber-400 hover:bg-amber-300 text-black font-black text-sm transition-all shadow-xl shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer min-h-[48px] touch-manipulation"
        >
          <Save className="w-4 h-4 text-black" />
          <span>{isSaving ? "Salvando..." : successToast ? "Salvo com Sucesso!" : "Salvar Alterações"}</span>
        </button>

        {!isPremium && onOpenUpgrade && (
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              onOpenUpgrade();
            }}
            className="px-4 py-3 rounded-2xl sm:rounded-full bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs transition-all border border-amber-400/30 flex items-center justify-center gap-1.5 active:scale-95 min-h-[48px]"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Seja PRO</span>
          </button>
        )}
      </div>
    </div>
  );

  const renderSections = () => (
    <>

        {/* CONTEÚDO DA ABA 0: INFORMAÇÕES BÁSICAS DO PERFIL */}
        {activeSection === "info" && (
          <div className="space-y-5 animate-fadeIn">
            {/* Foto / Avatar */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#00E5FF]" /> Foto de Perfil / Avatar
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative shrink-0">
                  <UserAvatar
                    photoURL={photoUrlInput || user.photoURL}
                    name={displayNameInput || user.displayName}
                    size="xl"
                    className="border-2 border-[#00E5FF]/50 shadow-xl"
                  />
                </div>

                <div className="space-y-2 flex-1 w-full">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <input
                      type="url"
                      placeholder="Cole a URL da sua foto ou avatar (ex: Discord, Steam, Imgur)..."
                      value={photoUrlInput}
                      onChange={(e) => setPhotoUrlInput(e.target.value)}
                      className="flex-1 bg-[#101114] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00E5FF]"
                    />
                    {photoUrlInput && (
                      <button
                        type="button"
                        onClick={() => setPhotoUrlInput("")}
                        className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-gray-400 hover:text-white transition-colors"
                        title="Remover foto personalizada"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Insira o link direto de uma imagem ou GIF para usar como foto de perfil. Se vazio, usará sua inicial estilizada.
                  </p>
                </div>
              </div>
            </div>

            {/* Nome de Exibição & Nome de Usuário */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 flex items-center justify-between">
                  <span>Nome de Exibição</span>
                  <span className="text-[10px] text-gray-500 font-mono font-normal">
                    {displayNameInput.length}/40
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={40}
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  placeholder="Seu Nome Gamer"
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                />
                <p className="text-[10px] text-gray-400">
                  Como os outros jogadores verão você na plataforma.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 flex items-center justify-between">
                  <span>Identificador (@username)</span>
                  <span className="text-[10px] text-gray-500 font-mono font-normal">Permanente</span>
                </label>
                <div className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-gray-400 font-mono flex items-center gap-1">
                  <span className="text-gray-500">@</span>
                  <span>{user.username}</span>
                </div>
                <p className="text-[10px] text-gray-500 font-mono">
                  Link público: /perfil/{user.username}
                </p>
              </div>
            </div>

            {/* Bio / Apresentação Curta */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-300">
                  Bio Curta / Apresentação
                </label>
                <span className="text-[10px] text-gray-500 font-mono">
                  {bioInput.length}/280
                </span>
              </div>
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                maxLength={280}
                rows={3}
                placeholder="Conte brevemente sobre seus gêneros favoritos, plataformas que joga ou o que está jogando atualmente..."
                className="w-full bg-[#101114] border border-white/10 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-[#00E5FF] resize-none leading-relaxed"
              />
              <p className="text-[11px] text-gray-400">
                Apresentação direta exibida no card principal do seu perfil. Para bio rica com formatação, use a aba &quot;Bio Estilizada&quot;.
              </p>
            </div>

            {/* Jogo Favorito */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-pink-400" /> Jogo Favorito de Todos os Tempos
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={favGameInput}
                  onChange={(e) => setFavGameInput(e.target.value)}
                  placeholder="Ex: Elden Ring, The Witcher 3, Chrono Trigger, Zelda BOTW..."
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Sugestões Rápidas a partir da Biblioteca do Usuário */}
              {games && games.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                    Ou clique para selecionar da sua biblioteca:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {games
                      .filter((g) => g.status === "completed" || (g.userRating && g.userRating >= 8))
                      .slice(0, 10)
                      .map((g) => (
                        <button
                          key={g.gameId}
                          type="button"
                          onClick={() => setFavGameInput(g.gameTitle)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] transition-all flex items-center gap-1 border ${
                            favGameInput === g.gameTitle
                              ? "bg-pink-500/20 border-pink-500/50 text-pink-300 font-bold"
                              : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                          }`}
                        >
                          <span>{g.gameTitle}</span>
                          {g.userRating && (
                            <span className="text-[10px] text-amber-400">★{g.userRating}</span>
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Data de Nascimento & Controle Etário (+18) */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" /> Data de Nascimento &amp; Controle Etário
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                  +18
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5">
                  <input
                    type="date"
                    value={birthDateInput}
                    onChange={(e) => setBirthDateInput(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    min="1920-01-01"
                    className="w-full bg-[#101114] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
                  />
                  <p className="text-[10px] text-gray-400">
                    Sua data é privada e serve para desbloquear com segurança a visualização de jogos com classificação adulta (+18).
                  </p>
                </div>

                <div>
                  {birthDateInput ? (
                    (() => {
                      const age = calculateAge(birthDateInput);
                      const isAdult = age >= 18;
                      return (
                        <div
                          className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                            isAdult
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                              : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                          }`}
                        >
                          {isAdult ? (
                            <>
                              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              <div>
                                <p className="font-bold">Maior de 18 anos ({age} anos) ✅</p>
                                <p className="text-[10px] opacity-80">Acesso a jogos e filtros +18 liberado.</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                              <div>
                                <p className="font-bold">Menor de 18 anos ({age} anos) ⚠️</p>
                                <p className="text-[10px] opacity-80">Jogos e filtros +18 permanecem bloqueados.</p>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="p-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-xs text-gray-400 flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-300">Data não informada</p>
                        <p className="text-[10px] text-gray-500">Jogos adultos permanecem ocultos por padrão.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 1: VISUAL & TEMAS */}
        {activeSection === "appearance" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Banner Preview */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#00E5FF]" /> Capa / Banner Panorâmico
              </label>

              <div className="relative h-32 sm:h-40 w-full rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                <img
                  src={customBannerUrl.trim() || selectedBanner}
                  alt="Banner Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {equippedTitles.length > 0 ? (
                      equippedTitles.map((t, idx) => (
                        <span
                          key={idx}
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-sm ${
                            idx === 0
                              ? THEME_OPTIONS.find((th) => th.id === selectedTheme)?.badge
                              : "border-white/20 text-gray-200 bg-white/15"
                          }`}
                        >
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">Nenhuma insígnia selecionada</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Galeria de Banners */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                {PRESET_BANNERS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBanner(b.url);
                      setCustomBannerUrl("");
                    }}
                    className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all group ${
                      selectedBanner === b.url && !customBannerUrl
                        ? "border-[#00E5FF] ring-2 ring-[#00E5FF]/40 scale-105"
                        : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={b.preview} alt={b.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                      <span className="text-[10px] font-bold text-white truncate w-full">{b.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Campo de URL */}
              <div className="pt-2 flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
                <input
                  type="url"
                  placeholder="Ou cole a URL de um papel de parede personalizado..."
                  value={customBannerUrl}
                  onChange={(e) => setCustomBannerUrl(e.target.value)}
                  className="flex-1 bg-[#121316] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
            </div>

            {/* Tema de Cores */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" /> Paleta de Cores do Perfil
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {THEME_OPTIONS.map((t) => {
                  const isLocked = Boolean(t.isVip && !isPremium && user?.plan !== "vip");
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (isLocked) {
                          if (onClose) onClose();
                          if (onOpenUpgrade) onOpenUpgrade();
                          return;
                        }
                        setSelectedTheme(t.id);
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                        selectedTheme === t.id
                          ? "bg-white/10 border-white/40 ring-2 " + t.ring
                          : "bg-white/5 border-white/5 hover:bg-white/10"
                      } ${isLocked ? "opacity-70" : ""}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-3.5 h-3.5 rounded-full ${t.color} flex-shrink-0 shadow-md`} />
                        <span className="text-xs font-bold text-white truncate">{t.name}</span>
                      </div>
                      {isLocked ? (
                        <span title="Exclusivo VIP / PRO">
                          <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        </span>
                      ) : selectedTheme === t.id ? (
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Estilo do Layout do Perfil (Exclusivo PRO / VIP) */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" /> Estilo do Layout do Perfil
                  </label>
                  <p className="text-[11px] text-gray-400">
                    Escolha como seu perfil será exibido para você e para os visitantes.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500/20 to-cyan-500/20 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" /> Exclusivo PRO
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {LAYOUT_OPTIONS.map((lo) => {
                  const isSelected = selectedLayout === lo.id;
                  const isLocked = !isPremium && lo.id !== "default";

                  return (
                    <button
                      key={lo.id}
                      type="button"
                      onClick={() => {
                        if (isLocked) {
                          if (onClose) onClose();
                          if (onOpenUpgrade) onOpenUpgrade();
                          return;
                        }
                        setSelectedLayout(lo.id);
                      }}
                      className={`relative p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? "bg-cyan-500/15 border-[#00E5FF] ring-2 ring-[#00E5FF]/40 shadow-lg shadow-cyan-500/10"
                          : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                      } ${isLocked ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{lo.name}</span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-white/10 text-gray-300">
                            {lo.badge}
                          </span>
                        </div>
                        {isLocked ? (
                          <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        ) : isSelected ? (
                          <Check className="w-4 h-4 text-[#00E5FF] flex-shrink-0" />
                        ) : null}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                        {lo.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TÍTULOS & INSÍGNIAS NO PERFIL (Acesso Direto) */}
            <div className="space-y-4 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Títulos &amp; Insígnias no Perfil ({equippedTitles.length}/3)
                  </label>
                  <p className="text-[11px] text-gray-400">
                    Equipe até 3 insígnias e troque a ordem com 1 clique.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSection("titles")}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Criar Customizadas (PRO/VIP)</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Slots Ativos com Reordenação */}
              <div className="p-3.5 rounded-2xl bg-[#121316] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-semibold text-gray-300">Ordem de exibição no perfil:</span>
                  <span className="text-[11px]">Setas trocam a ordem sem digitar</span>
                </div>

                {equippedTitles.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">
                    Nenhuma insígnia equipada. Clique nas opções abaixo para equipar!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {equippedTitles.map((t, idx) => (
                      <div
                        key={t + idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                          idx === 0
                            ? "bg-cyan-500/15 border-cyan-500/40 text-[#00E5FF]"
                            : "bg-white/5 border-white/10 text-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-[10px] font-black bg-black/50 px-1.5 py-0.5 rounded font-mono">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-bold truncate">{t}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => moveEquippedTitle(idx, "left")}
                            disabled={idx === 0}
                            className="p-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white text-xs"
                            title="Mover para a esquerda"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveEquippedTitle(idx, "right")}
                            disabled={idx === equippedTitles.length - 1}
                            className="p-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white text-xs"
                            title="Mover para a direita"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => unequipTitle(t)}
                            className="p-1 rounded text-gray-400 hover:text-rose-400 hover:bg-rose-500/10"
                            title="Remover do perfil"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Insígnias Oficiais para Equipar com 1 Clique */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Clique para equipar ou desequipar:
                </label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_GAMER_TITLES.map((title) => {
                    const isEquipped = equippedTitles.includes(title);
                    const equippedIndex = equippedTitles.indexOf(title);
                    return (
                      <button
                        key={title}
                        type="button"
                        onClick={() => toggleEquipTitle(title)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          isEquipped
                            ? "bg-white text-black font-bold shadow-md scale-105"
                            : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 hover:border-white/15"
                        }`}
                      >
                        <span>{title}</span>
                        {isEquipped && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-cyan-500 text-black">
                            #{equippedIndex + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA: TÍTULOS & INSÍGNIAS */}
        {activeSection === "titles" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header explicativo da aba */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Gerenciador de Títulos &amp; Insígnias
                </h4>
                <p className="text-xs text-gray-400">
                  Equipe até 3 insígnias no seu perfil público e organize a ordem exibida usando as setas. Usuários PRO e VIP podem criar até 10 insígnias customizadas exclusivas.
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
                <span className="text-[10px] font-bold uppercase text-gray-400">Slots:</span>
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                  equippedTitles.length === 3
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                    : "bg-white/5 border-white/10 text-gray-300"
                }`}>
                  {equippedTitles.length} / 3 equipadas
                </span>
              </div>
            </div>

            {/* SEÇÃO 1: INSÍGNIAS EQUIPADAS NO PERFIL */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#121316] border border-white/10 space-y-4 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-[#00E5FF] flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      Insígnias Ativas no Perfil
                      <span className="text-[10px] font-mono text-[#00E5FF] font-semibold">({equippedTitles.length}/3)</span>
                    </h5>
                    <p className="text-[11px] text-gray-400">
                      Use as setas para trocar a prioridade com 1 clique (sem digitar números).
                    </p>
                  </div>
                </div>
              </div>

              {titlesNotice && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs animate-fadeIn">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{titlesNotice}</span>
                </div>
              )}

              {equippedTitles.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs border border-dashed border-white/10 rounded-2xl bg-white/[0.02] space-y-1">
                  <p className="font-bold text-gray-300">Nenhuma insígnia selecionada para o perfil.</p>
                  <p className="text-[11px]">Escolha ou crie insígnias nas seções abaixo para começar!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {equippedTitles.map((title, idx) => (
                    <div
                      key={title + idx}
                      className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                        idx === 0
                          ? "bg-gradient-to-br from-cyan-950/40 to-black/60 border-[#00E5FF]/40 shadow-lg shadow-cyan-500/5 ring-1 ring-[#00E5FF]/20"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      {/* Topo do Card de Slot */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                          idx === 0
                            ? "bg-[#00E5FF] text-black"
                            : idx === 1
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-white/10 text-gray-300 border border-white/10"
                        }`}>
                          {idx === 0 ? "★ 1º Principal" : idx === 1 ? "2º Secundário" : "3º Terceiro"}
                        </span>

                        <button
                          type="button"
                          onClick={() => unequipTitle(title)}
                          className="p-1 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-90"
                          title="Desequipar do perfil"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Nome da Insígnia */}
                      <div className="text-xs sm:text-sm font-bold text-white truncate py-1" title={title}>
                        {title}
                      </div>

                      {/* Controles de Reordenação Sem Digitar Números */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-gray-400">
                        <span className="text-[10px] text-gray-500 font-medium">Posição:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => moveEquippedTitle(idx, "left")}
                            disabled={idx === 0}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed text-white text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95"
                            title="Mover para a esquerda (posição anterior)"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Antes</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => moveEquippedTitle(idx, "right")}
                            disabled={idx === equippedTitles.length - 1}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed text-white text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95"
                            title="Mover para a direita (próxima posição)"
                          >
                            <span>Depois</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SEÇÃO 2: CRIAR INSÍGNIA CUSTOMIZADA (X/10) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#121316] border border-white/10 space-y-4 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      Minhas Insígnias Customizadas
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">
                        PRO / VIP
                      </span>
                    </h5>
                    <p className="text-[11px] text-gray-400">
                      Crie até 10 insígnias customizadas com seus apelidos, títulos e conquistas.
                    </p>
                  </div>
                </div>

                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                  createdTitles.length >= 10
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    : "bg-white/5 text-gray-300 border border-white/10"
                }`}>
                  {createdTitles.length} / 10 criadas
                </span>
              </div>

              {!isPremium ? (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-amber-400" /> Criação Exclusiva para Assinantes PRO e VIP
                    </p>
                    <p className="text-xs text-gray-300 max-w-xl">
                      Desbloqueie a criação de até 10 insígnias customizadas com seus próprios emojis e textos para se destacar no MyGameList.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onClose) onClose();
                      if (onOpenUpgrade) onOpenUpgrade();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black transition-all flex items-center gap-1.5 shadow-lg flex-shrink-0 active:scale-95"
                  >
                    <Crown className="w-4 h-4" />
                    Fazer Upgrade
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Seletor Rápido de Emojis */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Clique em um emoji para adicionar ao início:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {GAMER_EMOJI_SUGGESTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            if (newTitleInput.startsWith(emoji)) return;
                            setNewTitleInput((prev) => `${emoji} ${prev}`.trim());
                          }}
                          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-sm transition-transform hover:scale-110 active:scale-95"
                          title={`Adicionar emoji ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Campo de Texto e Botão de Criação */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newTitleInput}
                        onChange={(e) => {
                          setNewTitleInput(e.target.value);
                          if (createError) setCreateError(null);
                        }}
                        maxLength={32}
                        disabled={createdTitles.length >= 10}
                        placeholder="Ex: 👑 Rei dos Soulslikes ou Caçador Noturno"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00E5FF] disabled:opacity-50 disabled:cursor-not-allowed"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCreateCustomTitle();
                          }
                        }}
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] text-gray-500 font-mono">
                        {newTitleInput.length}/32
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCreateCustomTitle}
                      disabled={createdTitles.length >= 10 || !newTitleInput.trim()}
                      className="px-5 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md flex-shrink-0 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Criar Insígnia</span>
                    </button>
                  </div>

                  {createError && (
                    <div className="text-rose-400 text-xs flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{createError}</span>
                    </div>
                  )}

                  {/* Lista de Insígnias Customizadas do Usuário */}
                  {createdTitles.length > 0 ? (
                    <div className="pt-2 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Insígnias Customizadas Salvas ({createdTitles.length}/10):
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {createdTitles.map((title) => {
                          const isEquipped = equippedTitles.includes(title);
                          const equippedIndex = equippedTitles.indexOf(title);
                          return (
                            <div
                              key={title}
                              className={`flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                                isEquipped
                                  ? "bg-cyan-500/15 border-cyan-500/40 text-[#00E5FF] shadow-sm"
                                  : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => toggleEquipTitle(title)}
                                className="flex items-center gap-1.5 text-left truncate max-w-[220px]"
                                title={isEquipped ? "Clique para desequipar do perfil" : "Clique para equipar no perfil"}
                              >
                                <span>{title}</span>
                                {isEquipped && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#00E5FF] text-black">
                                    #{equippedIndex + 1}
                                  </span>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteCustomTitle(title)}
                                className="p-1 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Excluir esta insígnia customizada"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-gray-400 text-xs bg-white/[0.02] border border-dashed border-white/10 rounded-xl">
                      Você ainda não criou nenhuma insígnia personalizada. Digite acima e crie sua primeira!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SEÇÃO 3: INSÍGNIAS OFICIAIS GAMEVAULT */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#121316] border border-white/10 space-y-3.5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                    Insígnias Oficiais MyGameList
                  </h5>
                  <p className="text-[11px] text-gray-400">
                    Insígnias clássicas prontas para equipar. Clique para equipar ou desequipar (máximo 3 no perfil).
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {DEFAULT_GAMER_TITLES.map((title) => {
                  const isEquipped = equippedTitles.includes(title);
                  const equippedIndex = equippedTitles.indexOf(title);
                  return (
                    <button
                      key={title}
                      type="button"
                      onClick={() => toggleEquipTitle(title)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isEquipped
                          ? "bg-white text-black font-bold shadow-md scale-105"
                          : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 hover:border-white/15"
                      }`}
                    >
                      <span>{title}</span>
                      {isEquipped && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-cyan-500 text-black">
                          #{equippedIndex + 1}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 2: BIO & SHOWCASE (MARKDOWN OU HTML5/CSS) */}
        {activeSection === "markdown" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Topo: Título + Seletor de Modo (Markdown vs HTML) + Toggle Editor/Preview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-[#00E5FF]" /> Personalização da Bio &amp; Showcase
                </h4>
                <p className="text-xs text-gray-400">
                  Escolha como prefere estilizar seu perfil: usando Markdown leve com GIFs ou HTML5 &amp; CSS3 completo.
                </p>
              </div>

              {/* Toggle Editor vs Prévia */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setMarkdownTab("edit")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    markdownTab === "edit"
                      ? "bg-white/20 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" /> Editor
                </button>
                <button
                  type="button"
                  onClick={() => setMarkdownTab("preview")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    markdownTab === "preview"
                      ? "bg-[#00E5FF] text-black font-bold shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Pré-visualizar
                </button>
              </div>
            </div>

            {/* SELETOR EXCLUSIVO DE FORMATO: MARKDOWN vs HTML5 & CSS */}
            <div className="flex items-center gap-2 p-1 bg-[#101114] rounded-2xl border border-white/10 w-fit">
              <button
                type="button"
                onClick={() => setBioMode("markdown")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  bioMode === "markdown"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Modo Markdown &amp; GIFs
              </button>
              <button
                type="button"
                onClick={() => setBioMode("html")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  bioMode === "html"
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md shadow-purple-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" /> Modo HTML5 &amp; CSS3 Puro
              </button>
            </div>

            {/* BARRA DE FERRAMENTAS DO MODO MARKDOWN */}
            {bioMode === "markdown" && (
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-[#121316] border border-white/10">
                <button
                  type="button"
                  onClick={() => insertMarkdown("**", "**")}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                  title="Negrito"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("*", "*")}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                  title="Itálico"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("### ")}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                  title="Título"
                >
                  <Heading className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("- ")}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                  title="Lista com marcadores"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("> ")}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                  title="Citação"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("| Jogo | Platina |\n| --- | :---: |\n| Elden Ring | 🥇 |")}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                  title="Tabela"
                >
                  <Table className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("![GIF Gamer](https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif)")}
                  className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00E5FF] text-[11px] font-bold transition-colors"
                  title="Inserir GIF animado"
                >
                  + GIF / Imagem
                </button>

                <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

                {/* Modelos Prontos Markdown */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] text-gray-500 uppercase font-mono">Modelos:</span>
                  {MARKDOWN_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setMarkdownContent(p.markdown);
                        setMarkdownTab("preview");
                      }}
                      className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[11px] text-gray-300 font-mono transition-colors"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* BARRA DE FERRAMENTAS DO MODO HTML5 & CSS */}
            {bioMode === "html" && (
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-[#121316] border border-white/10">
                <button
                  type="button"
                  onClick={() => insertHtmlSnippet("<style>\n.custom-box {\n  background: #18191c;\n  border: 1px solid #00E5FF;\n  border-radius: 16px;\n  padding: 16px;\n}\n</style>")}
                  className="px-2 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-[11px] font-mono font-bold transition-colors"
                  title="Inserir bloco de estilo CSS"
                >
                  + &lt;style&gt;
                </button>
                <button
                  type="button"
                  onClick={() => insertHtmlSnippet('<button type="button" style="cursor: pointer; background: #00E5FF; color: #000; padding: 8px 18px; border-radius: 999px; font-weight: bold; border: none; transition: transform 0.2s;">Clique Aqui</button>')}
                  className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00E5FF] text-[11px] font-bold transition-colors"
                  title="Inserir botão estilizado"
                >
                  + &lt;button&gt;
                </button>
                <button
                  type="button"
                  onClick={() => insertHtmlSnippet('<div style="display: flex; gap: 8px; align-items: center;">\n  <input type="radio" id="tab1" name="tabs" checked style="cursor: pointer;">\n  <label for="tab1" style="cursor: pointer; color: #00E5FF; font-size: 12px; font-weight: bold;">Aba 1</label>\n  <input type="radio" id="tab2" name="tabs" style="cursor: pointer;">\n  <label for="tab2" style="cursor: pointer; color: #aaa; font-size: 12px; font-weight: bold;">Aba 2</label>\n</div>')}
                  className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  title="Inserir inputs de rádio para abas/seletores"
                >
                  <Radio className="w-3 h-3" /> + Radio
                </button>
                <button
                  type="button"
                  onClick={() => insertHtmlSnippet('<svg width="24" height="24" viewBox="0 0 24 24" fill="#00E5FF"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" stroke="#000" stroke-width="2"/></svg>')}
                  className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold transition-colors"
                  title="Inserir elemento SVG"
                >
                  + SVG
                </button>
                <button
                  type="button"
                  onClick={() => insertHtmlSnippet('<div style="cursor: pointer; padding: 12px; border: 1px dashed rgba(0, 229, 255, 0.4); border-radius: 12px; text-align: center; color: #00E5FF;">\n  Passe o mouse (Cursor Pointer Ativo)\n</div>')}
                  className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  title="Inserir elemento com cursor interativo"
                >
                  <MousePointer className="w-3 h-3" /> + Cursor
                </button>
                <button
                  type="button"
                  onClick={() => insertHtmlSnippet('<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" alt="Pixel Art Base64" style="border-radius: 8px; width: 32px; height: 32px;">')}
                  className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-bold transition-colors"
                  title="Inserir imagem Base64 (protocolo data:)"
                >
                  + Imagem data:
                </button>

                <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

                {/* Modelos Prontos HTML5 */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] text-purple-400 uppercase font-mono">Modelos:</span>
                  {HTML_BIO_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setMarkdownContent(p.html);
                        setMarkdownTab("preview");
                      }}
                      className="px-2 py-0.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-[11px] text-purple-300 font-mono transition-colors"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ÁREA DE EDIÇÃO OU PRÉVIA */}
            {markdownTab === "edit" ? (
              <div className="space-y-1.5">
                <textarea
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  placeholder={
                    bioMode === "html"
                      ? "Escreva ou cole seu código HTML5 e CSS3 personalizado com <style>, <button>, <input type='radio'>, <svg>, imagens data: e cursores. O Markdown não interferirá no seu layout!"
                      : "Escreva sua bio gamer em Markdown (# títulos, **negrito**, listas, tabelas e links para GIFs)..."
                  }
                  rows={9}
                  className="w-full bg-[#101114] border border-white/15 rounded-2xl p-4 font-mono text-xs text-cyan-100 placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF] leading-relaxed resize-y selection:bg-cyan-500/30"
                />
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {bioMode === "html"
                      ? "Modo HTML5 & CSS3 Puro ativo: botões, inputs, radios, svgs, imagens base64 e cursores liberados. Scripts bloqueados."
                      : "Modo Markdown ativo: tabelas, formatação e GIFs liberados. Scripts bloqueados."}
                  </span>
                  <span>{markdownContent.length} caracteres</span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[#101114] p-4 min-h-[160px]">
                {markdownContent ? (
                  <ProfileBioRenderer content={markdownContent} mode={bioMode} />
                ) : (
                  <div className="py-8 text-center text-xs text-gray-500">
                    Nenhum conteúdo digitado. Alterne para a aba &quot;Editor&quot; para começar.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CONTEÚDO DA ABA 3: GAMERTAGS & REDES */}
        {activeSection === "socials" && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-[#00E5FF]" /> Gamertags &amp; Redes Sociais
              </h4>
              <p className="text-xs text-gray-400">
                Conecte seus identificadores de jogos para outros jogadores adicionarem você facilmente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Steam */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-blue-300">Steam Profile / ID</label>
                <input
                  type="text"
                  placeholder="ex: gabe_newell ou link completo"
                  value={socials.steam || ""}
                  onChange={(e) => setSocials({ ...socials, steam: e.target.value })}
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* PSN ID */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-blue-400">PlayStation Network (PSN ID)</label>
                <input
                  type="text"
                  placeholder="ex: KratosGamer99"
                  value={socials.psn || ""}
                  onChange={(e) => setSocials({ ...socials, psn: e.target.value })}
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Xbox Gamertag */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-emerald-400">Xbox Gamertag</label>
                <input
                  type="text"
                  placeholder="ex: MasterChief_BR"
                  value={socials.xbox || ""}
                  onChange={(e) => setSocials({ ...socials, xbox: e.target.value })}
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Nintendo Switch */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-rose-400">Nintendo Switch Friend Code</label>
                <input
                  type="text"
                  placeholder="ex: SW-1234-5678-9012"
                  value={socials.switch || ""}
                  onChange={(e) => setSocials({ ...socials, switch: e.target.value })}
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Discord */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-indigo-300">Discord Username</label>
                <input
                  type="text"
                  placeholder="ex: gamer_leandro"
                  value={socials.discord || ""}
                  onChange={(e) => setSocials({ ...socials, discord: e.target.value })}
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Twitch */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-purple-300">Twitch Channel</label>
                <input
                  type="text"
                  placeholder="ex: leandro_streamer"
                  value={socials.twitch || ""}
                  onChange={(e) => setSocials({ ...socials, twitch: e.target.value })}
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* YouTube */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-rose-300">YouTube Channel</label>
                <input
                  type="text"
                  placeholder="ex: @MyGameListCanal"
                  value={socials.youtube || ""}
                  onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Twitter / X */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Twitter / X Handle</label>
                <input
                  type="text"
                  placeholder="ex: leandrogazoli"
                  value={socials.twitter || ""}
                  onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 4: JOGO EM DESTAQUE */}
        {activeSection === "showcase" && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" /> Escolha o Jogo em Destaque do Perfil
              </h4>
              <p className="text-xs text-gray-400">
                Fixe o jogo mais marcante da sua vida ou a sua maior platina no topo do seu perfil.
              </p>
            </div>

            {games.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center space-y-2">
                <Gamepad2 className="w-8 h-8 text-gray-500 mx-auto" />
                <p className="text-xs text-gray-400">
                  Você ainda não tem jogos na sua biblioteca. Adicione jogos para fixar um destaque!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={showcaseGameId || ""}
                  onChange={(e) => setShowcaseGameId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-[#101114] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                >
                  <option value="">Nenhum jogo em destaque (Desativado)</option>
                  {games.map((g) => (
                    <option key={g.gameId} value={g.gameId}>
                      {g.gameTitle} {g.userRating ? `(Nota: ${g.userRating}/10)` : ""} {g.status === "completed" ? "• Zerado" : ""}
                    </option>
                  ))}
                </select>

                {showcaseGameId && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Jogo selecionado! O card panorâmico aparecerá no topo do seu perfil.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CONTEÚDO DA ABA 5: PRIVACIDADE & VISIBILIDADE */}
        {activeSection === "visibility" && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> Configurações de Privacidade do Perfil
              </h4>
              <p className="text-xs text-gray-400">
                Defina se seu perfil e biblioteca podem ser visualizados publicamente ao compartilhar seu link.
              </p>
            </div>

            {/* SELETOR MESTRE: PÚBLICO vs PRIVADO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opção Público */}
              <div
                onClick={() =>
                  setVisibility((prev) => ({
                    ...prev,
                    isPublic: true,
                  }))
                }
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                  visibility.isPublic !== false
                    ? "bg-cyan-500/10 border-[#00E5FF] shadow-lg shadow-cyan-500/10 ring-1 ring-[#00E5FF]/50"
                    : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      visibility.isPublic !== false ? "bg-cyan-500/20 text-[#00E5FF]" : "bg-white/10 text-gray-400"
                    }`}>
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                        Perfil Público
                      </h5>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        Recomendado
                      </span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    visibility.isPublic !== false
                      ? "border-[#00E5FF] bg-[#00E5FF] text-black"
                      : "border-gray-500 bg-transparent"
                  }`}>
                    {visibility.isPublic !== false && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Qualquer pessoa com o link (<span className="text-[#00E5FF] font-mono">@{user.username}</span>) pode ver sua biblioteca, personalizações e conquistas. Permite compartilhar em redes sociais.
                </p>
              </div>

              {/* Opção Privado */}
              <div
                onClick={() =>
                  setVisibility((prev) => ({
                    ...prev,
                    isPublic: false,
                  }))
                }
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                  visibility.isPublic === false
                    ? "bg-amber-500/10 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50"
                    : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      visibility.isPublic === false ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-gray-400"
                    }`}>
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                        Perfil Privado
                      </h5>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        Oculto
                      </span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    visibility.isPublic === false
                      ? "border-amber-400 bg-amber-400 text-black"
                      : "border-gray-500 bg-transparent"
                  }`}>
                    {visibility.isPublic === false && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Sua biblioteca, notas e horas de jogo ficam ocultas para visitantes. Ao compartilhar seu link, visitantes verão uma tela de perfil privado.
                </p>
              </div>
            </div>

            {/* OPÇÕES GRANULARES (QUANDO PÚBLICO) OU AVISO (QUANDO PRIVADO) */}
            {visibility.isPublic !== false ? (
              <div className="space-y-3 pt-1">
                <div className="border-t border-white/10 pt-3">
                  <h5 className="text-xs font-bold text-gray-200 mb-1 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#00E5FF]" /> Opções de Exibição no Perfil Público
                  </h5>
                  <p className="text-[11px] text-gray-400 mb-3">
                    Personalize quais métricas e seções ficam visíveis aos visitantes.
                  </p>
                </div>

                {[
                  { key: "showStats", title: "Exibir Painel de Estatísticas Gerais", desc: "Mostra contadores de jogos zerados, backlog e média de notas." },
                  { key: "showPlaytime", title: "Exibir Horas Jogadas", desc: "Mostra o total de horas registradas por jogo e no perfil." },
                  { key: "showRatings", title: "Exibir Notas Pessoais dadas aos Jogos", desc: "Permite que outros vejam suas avaliações de 0 a 10." },
                  { key: "showDropped", title: "Exibir Jogos Dropados / Pausados", desc: "Mostra a aba de jogos que você desistiu de jogar." },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visibility[item.key as keyof ProfileVisibility] ?? true}
                      onChange={(e) =>
                        setVisibility({
                          ...visibility,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="mt-0.5 w-4 h-4 rounded border-gray-700 bg-neutral-900 text-[#00E5FF] focus:ring-[#00E5FF]"
                    />
                    <div>
                      <h5 className="text-xs font-bold text-white">{item.title}</h5>
                      <p className="text-[11px] text-gray-400">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Com o modo Privado ativo, sua biblioteca de jogos, histórico, notas e horas estarão completamente ocultos para visitantes e amigos.</span>
              </div>
            )}
          </div>
        )}
    </>
  );

  if (isPage) {
    return (
      <div className="min-h-screen bg-[#0c0e14] text-white flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#101217]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 pt-[max(env(safe-area-inset-top,0px)+10px,14px)]">
          <div className="max-w-4xl mx-auto">
            {headerContent}
          </div>
        </header>

        {/* Sticky Tabs Bar */}
        <div className="sticky top-[69px] z-30 px-4 sm:px-8 py-2.5 bg-[#14161e]/95 backdrop-blur-md border-b border-white/10">
          <div className="max-w-4xl mx-auto">
            {tabsBar}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 pb-32 space-y-6">
          {renderSections()}
        </main>

        {/* Fixed Footer Bar */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-[#101217]/95 backdrop-blur-xl border-t border-white/10 px-4 sm:px-8 py-3.5 pb-[max(env(safe-area-inset-bottom,0px)+12px,16px)] shadow-2xl">
          <div className="max-w-4xl mx-auto">
            {footerContent}
          </div>
        </div>
      </div>
    );
  }

  const modalContent = (
    <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden">
      {/* Backdrop com desfoque e fechamento por toque */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Caixa do Diálogo: Bottom Sheet no mobile (<768px), Dialog centralizado no desktop (>=768px) */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative z-[100] w-full max-w-4xl rounded-t-[28px] md:rounded-[32px] bg-[#14161e] border-t border-x md:border border-white/10 shadow-2xl flex flex-col max-h-[92dvh] md:max-h-[88vh] overflow-hidden text-white transition-transform duration-200 ease-out animate-fadeIn"
      >
        {/* Barra de arraste no mobile */}
        <div className="md:hidden pt-3 pb-1 flex justify-center flex-shrink-0 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 rounded-full bg-white/25 hover:bg-white/40 transition-colors" />
        </div>

        {/* Header Fixo */}
        <div className="px-5 sm:px-8 pt-3 md:pt-5 pb-3 border-b border-white/10 flex-shrink-0">
          {headerContent}
        </div>

        {/* Barra Fixa de Abas */}
        <div className="px-5 sm:px-8 py-2.5 bg-white/[0.02] border-b border-white/5 flex-shrink-0">
          {tabsBar}
        </div>

        {/* Corpo com Scroll Interno */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-8 py-5 space-y-6">
          {renderSections()}
        </div>

        {/* Rodapé Fixo */}
        <div className="px-5 sm:px-8 py-3.5 pb-[max(env(safe-area-inset-bottom,0px)+12px,16px)] md:pb-4 border-t border-white/10 bg-[#101217]/95 backdrop-blur-md flex-shrink-0">
          {footerContent}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
