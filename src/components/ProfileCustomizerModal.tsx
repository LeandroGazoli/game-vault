"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { saveUserProfile } from "@/lib/firebase";
import {
  PRESET_BANNERS,
  ProfileTheme,
  MARKDOWN_PRESETS,
  SocialLinks,
  ProfileVisibility,
  UserGame,
  DEFAULT_GAMER_TITLES,
  GAMER_EMOJI_SUGGESTIONS,
} from "@/lib/types";
import MarkdownProfileBio from "./MarkdownProfileBio";
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
  Bold,
  Italic,
  Heading,
  List,
  Quote,
  Table,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Plus,
} from "lucide-react";

interface ProfileCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpgrade: () => void;
  games?: UserGame[];
  initialTab?: "appearance" | "titles" | "markdown" | "socials" | "showcase" | "visibility";
}

const THEME_OPTIONS: { id: ProfileTheme; name: string; color: string; ring: string; badge: string; isVip?: boolean }[] = [
  { id: "cyan", name: "Cyberpunk Cyan", color: "bg-[#00E5FF]", ring: "ring-[#00E5FF]", badge: "border-cyan-500/40 text-[#00E5FF] bg-cyan-500/10" },
  { id: "gold", name: "Obsidian Gold VIP", color: "bg-amber-400", ring: "ring-amber-400", badge: "border-amber-500/40 text-amber-300 bg-amber-500/10", isVip: true },
  { id: "purple", name: "Midnight Purple", color: "bg-purple-500", ring: "ring-purple-500", badge: "border-purple-500/40 text-purple-300 bg-purple-500/10" },
  { id: "crimson", name: "Crimson Matrix", color: "bg-rose-500", ring: "ring-rose-500", badge: "border-rose-500/40 text-rose-300 bg-rose-500/10" },
  { id: "emerald", name: "Emerald Forest", color: "bg-emerald-400", ring: "ring-emerald-400", badge: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10" },
];

const GAMER_TITLES = DEFAULT_GAMER_TITLES;

export default function ProfileCustomizerModal({
  isOpen,
  onClose,
  onOpenUpgrade,
  games = [],
  initialTab,
}: ProfileCustomizerModalProps) {
  const { user, isPremium } = useAuth();

  const [activeSection, setActiveSection] = useState<"appearance" | "titles" | "markdown" | "socials" | "showcase" | "visibility">(initialTab || "titles");

  // Estados de Personalização
  const [selectedBanner, setSelectedBanner] = useState<string>(user?.bannerURL || PRESET_BANNERS[0].url);
  const [customBannerUrl, setCustomBannerUrl] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<ProfileTheme>(user?.theme || "cyan");

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

  // Redes Sociais / Gamertags
  const [socials, setSocials] = useState<SocialLinks>(user?.socialLinks || {});

  // Jogo em Destaque
  const [showcaseGameId, setShowcaseGameId] = useState<number | null>(user?.showcaseGameId || null);

  // Visibilidade
  const [visibility, setVisibility] = useState<ProfileVisibility>(
    user?.visibility || {
      showStats: true,
      showPlaytime: true,
      showRatings: true,
      showDropped: true,
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  // Sincroniza dados sempre que o modal abre ou o usuário atualiza
  React.useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveSection(initialTab);
      }
    }
    if (user && isOpen) {
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
      setMarkdownContent(user.customMarkdown || user.customHtml || "");
      setSocials(user.socialLinks || {});
      setShowcaseGameId(user.showcaseGameId || null);
      if (user.visibility) setVisibility(user.visibility);
    }
  }, [user, isOpen, initialTab]);

  if (!isOpen || !user) return null;

  const insertMarkdown = (prefix: string, suffix = "") => {
    setMarkdownContent((prev) => `${prev}\n${prefix}Texto${suffix}\n`);
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
      onClose();
      onOpenUpgrade();
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
      await saveUserProfile(user.uid, {
        bannerURL: banner,
        theme: selectedTheme,
        customTitle: equippedTitles[0] || null, // Mantém compatibilidade com leitura legada
        customTitles: equippedTitles,
        createdCustomTitles: createdTitles,
        customMarkdown: markdownContent.trim(),
        customHtml: markdownContent.trim(), // Compatibilidade retroativa
        socialLinks: socials,
        showcaseGameId: showcaseGameId,
        visibility: visibility,
      });
      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
        onClose();
      }, 1500);
    } catch (e) {
      console.error("Erro ao salvar customização do perfil:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] !m-0 !mt-0 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-[32px] bg-[#18191c] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header do Modal */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00E5FF] text-xs font-semibold">
            <Palette className="w-3.5 h-3.5" />
            Central de Customização do Perfil Público
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Personalize seu Perfil Gamer
            {!isPremium && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Exclusivo PRO
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-400">
            Customize temas visuais, capas, Markdown com GIFs, gamertags e escolha o que exibir no seu perfil público.
          </p>
        </div>

        {/* Barra de Abas de Configuração */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/5">
          {[
            { id: "appearance", label: "Capa & Cores", icon: Palette },
            { id: "titles", label: `Títulos & Insígnias (${equippedTitles.length}/3)`, icon: Sparkles },
            { id: "markdown", label: "Bio em Markdown & GIFs", icon: Code2 },
            { id: "socials", label: "Gamertags & Redes", icon: Share2 },
            { id: "showcase", label: "Jogo em Destaque", icon: Trophy },
            { id: "visibility", label: "Privacidade & Exibição", icon: EyeOff },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
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
                {THEME_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTheme(t.id)}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all ${
                      selectedTheme === t.id
                        ? "bg-white/10 border-white/40 ring-2 " + t.ring
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${t.color} flex-shrink-0 shadow-md`} />
                    <span className="text-xs font-bold text-white truncate">{t.name}</span>
                  </button>
                ))}
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
                      onClose();
                      onOpenUpgrade();
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

        {/* CONTEÚDO DA ABA 2: MARKDOWN & GIFS */}
        {activeSection === "markdown" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-[#00E5FF]" /> Editor de Bio em Markdown &amp; GIFs
                </h4>
                <p className="text-xs text-gray-400">
                  Escreva textos formatados, metas, tabelas de conquistas e adicione GIFs animados no seu perfil.
                </p>
              </div>

              {/* Toggle Editor vs Prévia */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 self-start">
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

            {/* Barra de Ferramentas de Markdown */}
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

              {/* Modelos Prontos */}
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

            {/* Área de Edição ou Prévia */}
            {markdownTab === "edit" ? (
              <div className="space-y-1.5">
                <textarea
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  placeholder="Escreva sua bio gamer em Markdown ou use os modelos acima... Você pode incluir formatação, listas, tabelas e links para GIFs!"
                  rows={8}
                  className="w-full bg-[#101114] border border-white/15 rounded-2xl p-4 font-mono text-xs text-cyan-100 placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF] leading-relaxed resize-y selection:bg-cyan-500/30"
                />
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Markdown &amp; HTML Híbrido com GIFs permitidos (Scripts bloqueados).
                  </span>
                  <span>{markdownContent.length} caracteres</span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[#101114] p-4 min-h-[160px]">
                {markdownContent ? (
                  <MarkdownProfileBio content={markdownContent} />
                ) : (
                  <div className="py-8 text-center text-xs text-gray-500">
                    Nenhum conteúdo em Markdown digitado. Alterne para a aba &quot;Editor&quot; para começar.
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
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <EyeOff className="w-4 h-4 text-cyan-400" /> Controle de Exibição das Seções Públicas
              </h4>
              <p className="text-xs text-gray-400">
                Escolha o que visitantes e amigos podem ver ao acessar sua página pública.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { key: "showStats", title: "Exibir Painel de Estatísticas Gerais", desc: "Mostra os contadores de jogos zerados, backlog e média de notas." },
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
          </div>
        )}

        {/* Footer com Salvar ou CTA Upgrade */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-400">
            {isPremium ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Recursos desbloqueados com seu plano PRO/VIP
              </span>
            ) : (
              <span className="text-amber-300 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" /> Assine o PRO para aplicar capas, Markdown e destaques
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#00E5FF] hover:bg-cyan-400 text-black font-bold text-xs transition-all shadow-lg hover:scale-105 flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? "Salvando..." : successToast ? "Salvo com Sucesso!" : "Salvar Toda a Personalização"}
            </button>

            {!isPremium && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUpgrade();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs transition-all shadow-md hover:scale-105 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Crown className="w-3.5 h-3.5" />
                Seja PRO
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
