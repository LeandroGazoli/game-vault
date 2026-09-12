"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { submitIndieGame } from "@/lib/indieService";
import { triggerSuccessHaptic, triggerWarningHaptic } from "@/lib/capacitor";
import AuthModal from "@/components/AuthModal";
import {
  Gamepad2,
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Heart,
  ShieldCheck,
} from "lucide-react";

export default function CadastrarIndiePage() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [developerName, setDeveloperName] = useState("");
  const [developerEmail, setDeveloperEmail] = useState("");
  const [studioWebsite, setStudioWebsite] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [platformsInput, setPlatformsInput] = useState("PC, Steam");
  const [genresInput, setGenresInput] = useState("Ação, Aventura, Indie");
  const [steamUrl, setSteamUrl] = useState("");
  const [itchUrl, setItchUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (!title.trim() || !tagline.trim() || !description.trim() || !coverImage.trim()) {
      triggerWarningHaptic();
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitIndieGame(
        {
          title: title.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          developerName: developerName.trim() || user.displayName || "Desenvolvedor Independente",
          developerEmail: developerEmail.trim() || user.email || "",
          studioWebsite: studioWebsite.trim() || undefined,
          coverImage: coverImage.trim(),
          platforms: platformsInput.split(",").map((p) => p.trim()).filter(Boolean),
          genres: genresInput.split(",").map((g) => g.trim()).filter(Boolean),
          steamUrl: steamUrl.trim() || undefined,
          itchUrl: itchUrl.trim() || undefined,
        },
        user.uid
      );
      triggerSuccessHaptic();
      setIsSuccess(true);
    } catch (err) {
      console.error("Erro ao submeter jogo indie:", err);
      triggerWarningHaptic();
      alert("Falha ao submeter projeto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6 px-4">
      <Link
        href="/indies"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Indie Hub
      </Link>

      <div className="rounded-[32px] border border-white/10 bg-[#141822] p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>DIVULGAÇÃO GRATUITA DE GAMES</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Divulgue Seu Jogo Independente
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Cadastre seu jogo gratuitamente no <strong>MyGameList</strong>. Seu projeto ganha uma página exclusiva, entra na rotação da busca e participa da votação comunitária.
          </p>
        </div>

        {isSuccess ? (
          <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white">Projeto Submetido com Sucesso!</h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
              Sua solicitação foi enviada para a moderação da equipe do MyGameList. Assim que aprovada, ela entrará no Indie Hub e poderá ser destacada nos banners!
            </p>
            <div className="pt-2">
              <Link
                href="/indies"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 text-black font-extrabold text-xs shadow-lg"
              >
                Voltar para o Indie Hub
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Título do Jogo *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Chrono Echoes, Aventura Pixelada"
                className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Frase de Efeito (Tagline) *</label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Um RPG de ação desafiador inspirado nos clássicos dos anos 90."
                className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Nome do Desenvolvedor / Estúdio *</label>
                <input
                  type="text"
                  required
                  value={developerName}
                  onChange={(e) => setDeveloperName(e.target.value)}
                  placeholder="Ex.: Estúdio Pixel Byte"
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">E-mail para Contato *</label>
                <input
                  type="email"
                  required
                  value={developerEmail}
                  onChange={(e) => setDeveloperEmail(e.target.value)}
                  placeholder="dev@estudio.com.br"
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">URL da Imagem de Capa (Poster Vertical ou 16:9) *</label>
              <input
                type="url"
                required
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://... (Link direto para imagem JPG/PNG)"
                className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Plataformas (separadas por vírgula)</label>
                <input
                  type="text"
                  value={platformsInput}
                  onChange={(e) => setPlatformsInput(e.target.value)}
                  placeholder="PC, Steam, Switch"
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Gêneros (separados por vírgula)</label>
                <input
                  type="text"
                  value={genresInput}
                  onChange={(e) => setGenresInput(e.target.value)}
                  placeholder="RPG, Metroidvania, Soulslike"
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Link da Steam (Wishlist)</label>
                <input
                  type="url"
                  value={steamUrl}
                  onChange={(e) => setSteamUrl(e.target.value)}
                  placeholder="https://store.steampowered.com/app/..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Link do Itch.io ou Demo</label>
                <input
                  type="url"
                  value={itchUrl}
                  onChange={(e) => setItchUrl(e.target.value)}
                  placeholder="https://seujogo.itch.io/demo"
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Descrição Completa e Diferenciais *</label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Conte sobre a história, mecânicas inovadoras e o que torna o seu jogo especial..."
                className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Enviando Projeto...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submeter Jogo para Moderação
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
