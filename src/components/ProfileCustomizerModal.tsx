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
} from "lucide-react";

interface ProfileCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpgrade: () => void;
  games?: UserGame[];
}

const THEME_OPTIONS: { id: ProfileTheme; name: string; color: string; ring: string; badge: string; isVip?: boolean }[] = [
  { id: "cyan", name: "Cyberpunk Cyan", color: "bg-[#00E5FF]", ring: "ring-[#00E5FF]", badge: "border-cyan-500/40 text-[#00E5FF] bg-cyan-500/10" },
  { id: "gold", name: "Obsidian Gold VIP", color: "bg-amber-400", ring: "ring-amber-400", badge: "border-amber-500/40 text-amber-300 bg-amber-500/10", isVip: true },
  { id: "purple", name: "Midnight Purple", color: "bg-purple-500", ring: "ring-purple-500", badge: "border-purple-500/40 text-purple-300 bg-purple-500/10" },
  { id: "crimson", name: "Crimson Matrix", color: "bg-rose-500", ring: "ring-rose-500", badge: "border-rose-500/40 text-rose-300 bg-rose-500/10" },
  { id: "emerald", name: "Emerald Forest", color: "bg-emerald-400", ring: "ring-emerald-400", badge: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10" },
];

const GAMER_TITLES = [
  "🏆 Caçador de Platinas",
  "⚔️ Mestre dos RPGs",
  "🕹️ Maratonista de Backlog",
  "💎 Colecionador Veterano",
  "🎯 Estrategista Implacável",
  "🌌 Explorador de Mundos",
  "⚡ Speedrunner Dedicado",
  "🛡️ Guardião da Biblioteca",
];

export default function ProfileCustomizerModal({
  isOpen,
  onClose,
  onOpenUpgrade,
  games = [],
}: ProfileCustomizerModalProps) {
  const { user, isPremium } = useAuth();

  const [activeSection, setActiveSection] = useState<"appearance" | "markdown" | "socials" | "showcase" | "visibility">("appearance");

  // Estados de Personalização
  const [selectedBanner, setSelectedBanner] = useState<string>(user?.bannerURL || PRESET_BANNERS[0].url);
  const [customBannerUrl, setCustomBannerUrl] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<ProfileTheme>(user?.theme || "cyan");
  const [selectedTitle, setSelectedTitle] = useState<string>(user?.customTitle || GAMER_TITLES[0]);
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

  if (!isOpen || !user) return null;

  const insertMarkdown = (prefix: string, suffix = "") => {
    setMarkdownContent((prev) => `${prev}\n${prefix}Texto${suffix}\n`);
  };

  const handleSave = async () => {
    if (!isPremium) {
      onClose();
      onOpenUpgrade();
      return;
    }

    setIsSaving(true);
    try {
      const banner = customBannerUrl.trim() || selectedBanner;
      await saveUserProfile(user.uid, {
        bannerURL: banner,
        theme: selectedTheme,
        customTitle: selectedTitle,
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
            { id: "appearance", label: "Visual & Temas", icon: Palette },
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${THEME_OPTIONS.find(t => t.id === selectedTheme)?.badge}`}>
                      {selectedTitle}
                    </span>
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

            {/* Título Gamer */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Título / Insígnia Gamer
              </label>

              <div className="flex flex-wrap gap-2">
                {GAMER_TITLES.map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => setSelectedTitle(title)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedTitle === title
                        ? "bg-white text-black font-bold shadow-md"
                        : "bg-white/5 hover:bg-white/10 text-gray-300"
                    }`}
                  >
                    {title}
                  </button>
                ))}
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
                  placeholder="ex: @GameVaultCanal"
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
            {isPremium ? (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#00E5FF] hover:bg-cyan-400 text-black font-bold text-xs transition-all shadow-lg hover:scale-105 flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? "Salvando..." : successToast ? "Salvo com Sucesso!" : "Salvar Toda a Personalização"}
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenUpgrade();
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-extrabold text-xs transition-all shadow-lg hover:scale-105 flex items-center justify-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5" />
                Desbloquear com o PRO
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
