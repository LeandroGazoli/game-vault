"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { saveUserProfile } from "@/lib/firebase";
import { PRESET_BANNERS, ProfileTheme, HTML_PRESETS } from "@/lib/types";
import CustomHtmlBio from "./CustomHtmlBio";
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
} from "lucide-react";

interface ProfileCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpgrade: () => void;
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
}: ProfileCustomizerModalProps) {
  const { user, isPremium } = useAuth();

  const [selectedBanner, setSelectedBanner] = useState<string>(user?.bannerURL || PRESET_BANNERS[0].url);
  const [customBannerUrl, setCustomBannerUrl] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<ProfileTheme>(user?.theme || "cyan");
  const [selectedTitle, setSelectedTitle] = useState<string>(user?.customTitle || GAMER_TITLES[0]);
  const [customHtml, setCustomHtml] = useState<string>(user?.customHtml || "");
  const [htmlTab, setHtmlTab] = useState<"edit" | "preview">("edit");
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  if (!isOpen || !user) return null;

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
        customHtml: customHtml.trim(),
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-[32px] bg-[#18191c] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[92vh] overflow-y-auto"
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
            Personalização do Perfil &amp; HTML/CSS
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Estilize seu Perfil Gamer
            {!isPremium && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Exclusivo PRO
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-400">
            Personalize sua capa, tema de cores, título e adicione blocos ricos com **HTML, CSS, Imagens e GIFs**.
          </p>
        </div>

        {/* Banner Preview ao Vivo */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#00E5FF]" /> 1. Escolha sua Capa / Banner
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

          {/* Galeria de Banners Pré-definidos */}
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

          {/* Campo de URL de Banner Customizado */}
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

        {/* Seção 2: Tema de Cores */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-cyan-400" /> 2. Tema de Cores do Perfil
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

        {/* Seção 3: Título Gamer */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 3. Título / Insígnia Gamer
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

        {/* Seção 4: Customizador de HTML, CSS, Imagens & GIFs */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#00E5FF]" /> 4. Showcase Customizado (HTML, CSS, Imagens &amp; GIFs)
            </label>

            {/* Alternador Código vs Preview */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setHtmlTab("edit")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  htmlTab === "edit"
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" /> Código
              </button>
              <button
                type="button"
                onClick={() => setHtmlTab("preview")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  htmlTab === "preview"
                    ? "bg-[#00E5FF] text-black font-bold shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Prévia
              </button>
            </div>
          </div>

          {/* Presets Rápidos de HTML */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-gray-400">Modelos Prontos:</span>
            {HTML_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setCustomHtml(preset.html);
                  setHtmlTab("preview");
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-mono text-cyan-300 transition-colors"
              >
                {preset.name}
              </button>
            ))}
            {customHtml && (
              <button
                type="button"
                onClick={() => setCustomHtml("")}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[11px] text-rose-300 transition-colors flex items-center gap-1"
                title="Limpar Código HTML"
              >
                <Trash2 className="w-3 h-3" /> Limpar
              </button>
            )}
          </div>

          {/* Área de Edição ou Prévia */}
          {htmlTab === "edit" ? (
            <div className="space-y-1.5">
              <textarea
                value={customHtml}
                onChange={(e) => setCustomHtml(e.target.value)}
                placeholder="Escreva seu código HTML e CSS aqui... Ex: <div style='border: 1px solid cyan; padding: 15px;'><h3>Meu Título</h3><img src='https://...' /></div>"
                rows={6}
                className="w-full bg-[#101114] border border-white/15 rounded-2xl p-4 font-mono text-xs text-cyan-100 placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF] leading-relaxed resize-y selection:bg-cyan-500/30"
              />
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> HTML, CSS e GIFs permitidos (JavaScript e scripts bloqueados por segurança).
                </span>
                <span>{customHtml.length} caracteres</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#101114] p-4 min-h-[140px]">
              {customHtml ? (
                <CustomHtmlBio html={customHtml} />
              ) : (
                <div className="py-8 text-center text-xs text-gray-500">
                  Nenhum código HTML inserido. Digite na aba &quot;Código&quot; ou clique em um modelo pronto acima.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer com Salvar ou CTA Upgrade */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-400">
            {isPremium ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Recursos desbloqueados com seu plano PRO/VIP
              </span>
            ) : (
              <span className="text-amber-300 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" /> Assine o PRO para aplicar capas, temas e HTML personalizado
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
                {isSaving ? "Salvando..." : successToast ? "Salvo com Sucesso!" : "Salvar Personalização"}
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
