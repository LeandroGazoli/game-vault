"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IndieSubmissionForm } from "@/lib/types/indie.types";
import {
  Gamepad2,
  Image as ImageIcon,
  Monitor,
  Youtube,
  Send,
  Loader2,
  Sparkles,
  Layers,
  ShieldAlert,
  Globe,
  Plus,
  Trash2,
} from "lucide-react";

interface IndieFormFieldsProps {
  initialValues?: Partial<IndieSubmissionForm>;
  onSubmit: (formData: IndieSubmissionForm) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText?: string;
}

export default function IndieFormFields({
  initialValues,
  onSubmit,
  isSubmitting,
  submitButtonText = "Submeter Jogo para Moderação",
}: IndieFormFieldsProps) {
  // Identificação e Apresentação Básica
  const [title, setTitle] = useState(initialValues?.title || "");
  const [tagline, setTagline] = useState(initialValues?.tagline || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [storyline, setStoryline] = useState(initialValues?.storyline || "");
  const [developerName, setDeveloperName] = useState(initialValues?.developerName || "");
  const [developerEmail, setDeveloperEmail] = useState(initialValues?.developerEmail || "");
  const [publisherName, setPublisherName] = useState(initialValues?.publisherName || "");

  // Mídias
  const [coverImage, setCoverImage] = useState(initialValues?.coverImage || "");
  const [bannerImage, setBannerImage] = useState(initialValues?.bannerImage || "");
  const [trailerUrl, setTrailerUrl] = useState(initialValues?.trailerUrl || "");
  const [screenshotsInput, setScreenshotsInput] = useState(
    initialValues?.screenshots?.join("\n") || ""
  );

  // Ficha Técnica & Taxonomia
  const [platformsInput, setPlatformsInput] = useState(
    initialValues?.platforms?.join(", ") || "PC (Windows), Steam"
  );
  const [genresInput, setGenresInput] = useState(
    initialValues?.genres?.join(", ") || "Ação, Aventura, Indie"
  );
  const [gameModesInput, setGameModesInput] = useState(
    initialValues?.gameModes?.join(", ") || "Single-player"
  );
  const [playerPerspectivesInput, setPlayerPerspectivesInput] = useState(
    initialValues?.playerPerspectives?.join(", ") || "2D Side-scroller, Terceira Pessoa"
  );
  const [themesInput, setThemesInput] = useState(
    initialValues?.themes?.join(", ") || "Fantasia, Ficção Científica"
  );
  const [ageRating, setAgeRating] = useState(initialValues?.ageRating || "Livre");
  const [releaseDate, setReleaseDate] = useState(initialValues?.releaseDate || "");

  // Suporte a Português (Brasil)
  const [ptbrAudio, setPtbrAudio] = useState(initialValues?.ptbrSupport?.audio || false);
  const [ptbrSubtitles, setPtbrSubtitles] = useState(
    initialValues?.ptbrSupport?.subtitles ?? true
  );
  const [ptbrInterface, setPtbrInterface] = useState(
    initialValues?.ptbrSupport?.interface ?? true
  );

  // Links Externos e Requisitos
  const [steamUrl, setSteamUrl] = useState(initialValues?.steamUrl || "");
  const [itchUrl, setItchUrl] = useState(initialValues?.itchUrl || "");
  const [studioWebsite, setStudioWebsite] = useState(initialValues?.studioWebsite || "");
  const [contactDiscord, setContactDiscord] = useState(initialValues?.contactDiscord || "");
  const [minReq, setMinReq] = useState(initialValues?.systemRequirements?.minimum || "");
  const [recReq, setRecReq] = useState(initialValues?.systemRequirements?.recommended || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const screenshots = screenshotsInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const formData: IndieSubmissionForm = {
      title: title.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      storyline: storyline.trim() || undefined,
      developerName: developerName.trim(),
      developerEmail: developerEmail.trim(),
      publisherName: publisherName.trim() || undefined,
      studioWebsite: studioWebsite.trim() || undefined,
      contactDiscord: contactDiscord.trim() || undefined,
      coverImage: coverImage.trim(),
      bannerImage: bannerImage.trim() || undefined,
      trailerUrl: trailerUrl.trim() || undefined,
      platforms: platformsInput.split(",").map((p) => p.trim()).filter(Boolean),
      genres: genresInput.split(",").map((g) => g.trim()).filter(Boolean),
      gameModes: gameModesInput.split(",").map((m) => m.trim()).filter(Boolean),
      playerPerspectives: playerPerspectivesInput
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      themes: themesInput.split(",").map((t) => t.trim()).filter(Boolean),
      ageRating: ageRating || "Livre",
      releaseDate: releaseDate.trim() || undefined,
      steamUrl: steamUrl.trim() || undefined,
      itchUrl: itchUrl.trim() || undefined,
      screenshots: screenshots.length > 0 ? screenshots : undefined,
      ptbrSupport: {
        audio: ptbrAudio,
        subtitles: ptbrSubtitles,
        interface: ptbrInterface,
      },
      systemRequirements:
        minReq.trim() || recReq.trim()
          ? {
              minimum: minReq.trim() || undefined,
              recommended: recReq.trim() || undefined,
            }
          : undefined,
    };

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. DADOS PRINCIPAIS */}
      <div className="space-y-4 p-5 rounded-2xl bg-black/20 border border-white/5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <Gamepad2 className="w-4 h-4" /> 1. Identificação Básica
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Título do Jogo *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Cyber Chrono: 2099"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Frase de Efeito (Tagline) *</label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Ex.: Um metroidvania cyberpunk em pixel art."
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Desenvolvedora / Estúdio *</label>
            <input
              type="text"
              required
              value={developerName}
              onChange={(e) => setDeveloperName(e.target.value)}
              placeholder="Ex.: Neon Studios"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">E-mail de Contato *</label>
            <input
              type="email"
              required
              value={developerEmail}
              onChange={(e) => setDeveloperEmail(e.target.value)}
              placeholder="contato@neonstudios.com"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Distribuidora (Publisher)</label>
            <input
              type="text"
              value={publisherName}
              onChange={(e) => setPublisherName(e.target.value)}
              placeholder="Opcional (ex.: Auto-publicado)"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 2. MÍDIAS, CAPA, ARTWORKS E TRAILER */}
      <div className="space-y-4 p-5 rounded-2xl bg-black/20 border border-white/5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> 2. Imagens, Banner &amp; Vídeos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Capa do Jogo (Poster Vertical ou 16:9) *</label>
            <input
              type="url"
              required
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://... (Link direto para imagem JPG/PNG)"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Banner Panorâmico (Backdrop)</label>
            <input
              type="url"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              placeholder="https://... (Imagem widescreen de fundo)"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300">Link do Trailer (YouTube)</label>
          <input
            type="url"
            value={trailerUrl}
            onChange={(e) => setTrailerUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300">
            Screenshots da Galeria (uma URL por linha)
          </label>
          <textarea
            rows={3}
            value={screenshotsInput}
            onChange={(e) => setScreenshotsInput(e.target.value)}
            placeholder="https://seusite.com/screenshot1.jpg&#10;https://seusite.com/screenshot2.jpg"
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* 3. FICHA TÉCNICA COMPLETA */}
      <div className="space-y-4 p-5 rounded-2xl bg-black/20 border border-white/5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
          <Monitor className="w-4 h-4" /> 3. Ficha Técnica &amp; Classificação
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Plataformas Suportadas</label>
            <input
              type="text"
              value={platformsInput}
              onChange={(e) => setPlatformsInput(e.target.value)}
              placeholder="PC (Windows), Linux, Nintendo Switch, PS5"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Gêneros</label>
            <input
              type="text"
              value={genresInput}
              onChange={(e) => setGenresInput(e.target.value)}
              placeholder="Ação, Metroidvania, Roguelike, RPG"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Modos de Jogo</label>
            <input
              type="text"
              value={gameModesInput}
              onChange={(e) => setGameModesInput(e.target.value)}
              placeholder="Single-player, Cooperativo, PvP"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Câmera / Perspectiva</label>
            <input
              type="text"
              value={playerPerspectivesInput}
              onChange={(e) => setPlayerPerspectivesInput(e.target.value)}
              placeholder="2D Side-scroller, Isométrica, 3D"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Classificação Indicativa</label>
            <select
              value={ageRating}
              onChange={(e) => setAgeRating(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="Livre">Livre para todos os públicos</option>
              <option value="10+">Não recomendado para menores de 10 anos</option>
              <option value="12+">Não recomendado para menores de 12 anos</option>
              <option value="14+">Não recomendado para menores de 14 anos</option>
              <option value="16+">Não recomendado para menores de 16 anos</option>
              <option value="18+">Não recomendado para menores de 18 anos</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300">Localização em Português (Brasil)</label>
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={ptbrInterface}
                onChange={(e) => setPtbrInterface(e.target.checked)}
                className="rounded text-emerald-500 focus:ring-0"
              />
              <span>Interface em PT-BR 🇧🇷</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={ptbrSubtitles}
                onChange={(e) => setPtbrSubtitles(e.target.checked)}
                className="rounded text-emerald-500 focus:ring-0"
              />
              <span>Legendas em PT-BR 🇧🇷</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={ptbrAudio}
                onChange={(e) => setPtbrAudio(e.target.checked)}
                className="rounded text-emerald-500 focus:ring-0"
              />
              <span>Dublagem em PT-BR 🇧🇷</span>
            </label>
          </div>
        </div>
      </div>

      {/* 4. SINOPSE & HISTÓRIA */}
      <div className="space-y-4 p-5 rounded-2xl bg-black/20 border border-white/5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> 4. Sinopse &amp; Enredo
        </h3>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300">Descrição / Visão Geral do Jogo *</label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Apresente as principais mecânicas, estilo visual e o que torna o seu jogo imperdível..."
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300">Enredo / Storyline (Opcional)</label>
          <textarea
            rows={3}
            value={storyline}
            onChange={(e) => setStoryline(e.target.value)}
            placeholder="Aprofunde na história, lore do mundo, protagonistas e universo da aventura..."
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* 5. LINKS DE LOJAS & COMUNIDADE */}
      <div className="space-y-4 p-5 rounded-2xl bg-black/20 border border-white/5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <Globe className="w-4 h-4" /> 5. Lojas &amp; Comunidade
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Link da Steam (Wishlist)</label>
            <input
              type="url"
              value={steamUrl}
              onChange={(e) => setSteamUrl(e.target.value)}
              placeholder="https://store.steampowered.com/app/..."
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Link do Itch.io ou Demo</label>
            <input
              type="url"
              value={itchUrl}
              onChange={(e) => setItchUrl(e.target.value)}
              placeholder="https://estudio.itch.io/jogo"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Site Oficial do Estúdio</label>
            <input
              type="url"
              value={studioWebsite}
              onChange={(e) => setStudioWebsite(e.target.value)}
              placeholder="https://neonstudios.com.br"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Comunidade Discord / Link Social</label>
            <input
              type="url"
              value={contactDiscord}
              onChange={(e) => setContactDiscord(e.target.value)}
              placeholder="https://discord.gg/..."
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* BOTÃO DE SUBMISSÃO */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Salvando Dados do Jogo...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> {submitButtonText}
          </>
        )}
      </button>
    </form>
  );
}
