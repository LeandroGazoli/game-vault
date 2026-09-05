"use client";

import React, { useState, useRef, useEffect } from "react";
import { UserProfile, LibraryStats, UserGame, calculateGamerLevel } from "@/lib/types";
import AdaptiveModal from "@/components/ui/AdaptiveModal";
import {
  Download,
  Share2,
  Sparkles,
  Trophy,
  Clock,
  Star,
  Gamepad2,
  Check,
  Smartphone,
  Copy,
  Layers,
  Palette,
} from "lucide-react";
import { triggerSelectionHaptic } from "@/lib/capacitor";

interface ShareGamerCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  stats?: LibraryStats | null;
  library?: UserGame[];
}

type CardTheme = "neon" | "gold" | "midnight";
type CardFormat = "story" | "landscape";

export default function ShareGamerCardModal({
  isOpen,
  onClose,
  user,
  stats,
  library = [],
}: ShareGamerCardModalProps) {
  const [theme, setTheme] = useState<CardTheme>("neon");
  const [format, setFormat] = useState<CardFormat>("story");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const gamerLevelInfo = calculateGamerLevel(stats);
  const displayLevel = user.gamerLevel || gamerLevelInfo.level;
  const rankTitle = gamerLevelInfo.rankTitle;

  const completedCount = stats?.completedCount || 0;
  const totalHours = Math.floor(stats?.totalPlaytimeHours || 0);
  const totalGames = (stats?.libraryCount ?? 0) + (stats?.totalGames || 0);
  const avgRating = stats?.averageRating ? stats.averageRating.toFixed(1) : "-";

  // Top jogos para exibir no card
  const topGames = library
    .filter((g) => g.status === "completed" || g.isFavorite || (g.userRating && g.userRating >= 8))
    .slice(0, 3);

  // Fallback caso não haja 3 jogos filtrados
  const displayGames = topGames.length > 0 ? topGames : library.slice(0, 3);

  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/perfil/${user.username}`
    : `https://www.mygameslist.com.br/perfil/${user.username}`;

  const renderCanvasCard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isStory = format === "story";
    const width = isStory ? 1080 : 1200;
    const height = isStory ? 1920 : 675;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Fundo Base
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    if (theme === "neon") {
      bgGradient.addColorStop(0, "#0a0d14");
      bgGradient.addColorStop(0.5, "#0d1322");
      bgGradient.addColorStop(1, "#08090f");
    } else if (theme === "gold") {
      bgGradient.addColorStop(0, "#141008");
      bgGradient.addColorStop(0.5, "#1c160b");
      bgGradient.addColorStop(1, "#0a0805");
    } else {
      bgGradient.addColorStop(0, "#0d0e12");
      bgGradient.addColorStop(0.5, "#14151c");
      bgGradient.addColorStop(1, "#07080a");
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Grade de linhas sutis gamer
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    const gridSize = 60;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 3. Efeitos de Luz Glow
    const glowColor = theme === "neon" ? "rgba(0, 229, 255, 0.15)" : theme === "gold" ? "rgba(245, 158, 11, 0.15)" : "rgba(168, 85, 247, 0.12)";
    const glow1 = ctx.createRadialGradient(width * 0.8, height * 0.2, 50, width * 0.8, height * 0.2, 450);
    glow1.addColorStop(0, glowColor);
    glow1.addColorStop(1, "transparent");
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, width, height);

    const glow2 = ctx.createRadialGradient(width * 0.2, height * 0.8, 50, width * 0.2, height * 0.8, 450);
    glow2.addColorStop(0, glowColor);
    glow2.addColorStop(1, "transparent");
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, width, height);

    // 4. Borda Tecnológica Holográfica
    ctx.strokeStyle = theme === "neon" ? "rgba(0, 229, 255, 0.4)" : theme === "gold" ? "rgba(245, 158, 11, 0.4)" : "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // 5. Marca d'Água Topo
    ctx.fillStyle = theme === "neon" ? "#00E5FF" : theme === "gold" ? "#F59E0B" : "#FFFFFF";
    ctx.font = "bold 26px monospace";
    ctx.fillText("MYGAMELIST // GAMER CARD PASSPORT", 70, 95);

    // 6. Header: Avatar e Nomes
    const avatarY = isStory ? 220 : 160;
    const avatarRadius = isStory ? 75 : 55;
    const avatarX = 70 + avatarRadius;

    // Desenhar Círculo do Avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#1e2230";
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = theme === "neon" ? "#00E5FF" : theme === "gold" ? "#F59E0B" : "#A855F7";
    ctx.stroke();

    // Iniciais do Usuário no Avatar
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${isStory ? 48 : 36}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const initials = (user.displayName || user.username || "G").substring(0, 2).toUpperCase();
    ctx.fillText(initials, avatarX, avatarY);
    ctx.restore();

    // Nome e Username
    const textStartX = avatarX + avatarRadius + 40;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `900 ${isStory ? 54 : 42}px sans-serif`;
    ctx.fillText(user.displayName || user.username, textStartX, avatarY - 5);

    ctx.fillStyle = theme === "neon" ? "#00E5FF" : theme === "gold" ? "#FBBF24" : "#94A3B8";
    ctx.font = `bold ${isStory ? 28 : 22}px monospace`;
    ctx.fillText(`@${user.username}`, textStartX, avatarY + (isStory ? 35 : 30));

    // Badge de Nível e Prestígio
    const badgeX = isStory ? 70 : width - 360;
    const badgeY = isStory ? 370 : 110;
    const badgeWidth = isStory ? width - 140 : 290;
    const badgeHeight = isStory ? 100 : 90;

    // Fundo do Badge de Nível
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.strokeStyle = theme === "neon" ? "rgba(0, 229, 255, 0.3)" : theme === "gold" ? "rgba(245, 158, 11, 0.3)" : "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 20);
    ctx.fill();
    ctx.stroke();

    // Texto do Nível
    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 20px monospace";
    ctx.fillText("NÍVEL GAMER", badgeX + 30, badgeY + 40);

    ctx.fillStyle = theme === "neon" ? "#00E5FF" : theme === "gold" ? "#F59E0B" : "#FFFFFF";
    ctx.font = "900 36px monospace";
    ctx.fillText(`LV. ${displayLevel}`, badgeX + 30, badgeY + 75);

    ctx.fillStyle = "#E2E8F0";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(rankTitle, badgeX + badgeWidth - 30, badgeY + 60);
    ctx.textAlign = "left";

    // 7. Grid de Estatísticas Principais (4 Caixas)
    const statsY = isStory ? 520 : 250;
    const statBoxWidth = isStory ? (width - 140 - 20) / 2 : (width - 140 - 60) / 4;
    const statBoxHeight = isStory ? 150 : 130;

    const statItems = [
      { label: "JOGOS ZERADOS", value: `${completedCount}`, color: "#34D399" },
      { label: "HORAS JOGADAS", value: `${totalHours}h`, color: "#00E5FF" },
      { label: "TOTAL NO VAULT", value: `${totalGames}`, color: "#A855F7" },
      { label: "XP ACUMULADO", value: `${gamerLevelInfo.xp.toLocaleString("pt-BR")}`, color: "#F59E0B" },
    ];

    statItems.forEach((st, idx) => {
      let boxX: number;
      let boxY: number;

      if (isStory) {
        boxX = 70 + (idx % 2) * (statBoxWidth + 20);
        boxY = statsY + Math.floor(idx / 2) * (statBoxHeight + 20);
      } else {
        boxX = 70 + idx * (statBoxWidth + 20);
        boxY = statsY;
      }

      ctx.fillStyle = "rgba(18, 22, 34, 0.85)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, statBoxWidth, statBoxHeight, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#94A3B8";
      ctx.font = "bold 16px monospace";
      ctx.fillText(st.label, boxX + 24, boxY + 40);

      ctx.fillStyle = st.color;
      ctx.font = `900 ${isStory ? 42 : 36}px monospace`;
      ctx.fillText(st.value, boxX + 24, boxY + (isStory ? 100 : 90));
    });

    // 8. Seção de Jogos em Destaque (Apenas no formato Story ou espaço extra)
    if (isStory) {
      const showcaseY = 900;
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText("DESTAQUES DO VAULT", 70, showcaseY);

      const gameCardsY = showcaseY + 40;
      const gameCardW = (width - 140 - 40) / 3;
      const gameCardH = 460;

      displayGames.forEach((gm, gIdx) => {
        const gx = 70 + gIdx * (gameCardW + 20);
        ctx.fillStyle = "#151926";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(gx, gameCardH ? gameCardsY : 0, gameCardW, gameCardH, 16);
        ctx.fill();
        ctx.stroke();

        // Título do Jogo
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 20px sans-serif";
        const title = gm.gameTitle.length > 22 ? gm.gameTitle.substring(0, 20) + "..." : gm.gameTitle;
        ctx.fillText(title, gx + 15, gameCardsY + gameCardH - 40);

        // Status ou Horas
        ctx.fillStyle = "#00E5FF";
        ctx.font = "14px monospace";
        const subtitle = gm.userPlaytimeHours ? `${gm.userPlaytimeHours}h jogadas` : gm.status === "completed" ? "Zerado ✓" : "Na lista";
        ctx.fillText(subtitle, gx + 15, gameCardsY + gameCardH - 18);
      });
    }

    // 9. Rodapé / Assinatura
    const footerY = height - 80;
    ctx.fillStyle = "#64748B";
    ctx.font = "bold 20px monospace";
    ctx.fillText("mygameslist.com.br", 70, footerY);

    ctx.textAlign = "right";
    ctx.fillStyle = theme === "neon" ? "#00E5FF" : theme === "gold" ? "#F59E0B" : "#FFFFFF";
    ctx.fillText("COMPARTILHE SEU VAULT", width - 70, footerY);
    ctx.textAlign = "left";
  };

  useEffect(() => {
    if (isOpen) {
      // Pequeno delay para garantir que o modal montou
      const timer = setTimeout(() => {
        renderCanvasCard();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, theme, format]);

  const handleDownloadPng = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    triggerSelectionHaptic();
    setIsGenerating(true);

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `gamer-card-${user.username}-${format}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Erro ao gerar imagem PNG:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareNative = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    triggerSelectionHaptic();
    setIsGenerating(true);

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `gamer-card-${user.username}.png`, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Card Gamer de ${user.displayName || user.username}`,
            text: `Confira minhas estatísticas de jogos no MyGameList! 🎮✨`,
            files: [file],
          });
        } else {
          // Fallback para download direto
          handleDownloadPng();
        }
      }, "image/png");
    } catch (err) {
      console.error("Erro ao compartilhar nativo:", err);
      handleDownloadPng();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar link:", err);
    }
  };

  return (
    <AdaptiveModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.25)]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Gerador de Card Gamer</span>
                <Sparkles className="w-4 h-4 text-[#00E5FF]" />
              </h3>
              <p className="text-xs text-gray-400">
                Gere uma imagem estilizada para Instagram Stories ou redes sociais
              </p>
            </div>
          </div>
        </div>

        {/* Controles de Formato e Tema */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#12151f] p-3 rounded-2xl border border-white/5">
          {/* Seletor de Formato */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-mono font-bold text-gray-400">Formato:</span>
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 flex-1 sm:flex-none">
              <button
                onClick={() => {
                  triggerSelectionHaptic();
                  setFormat("story");
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  format === "story"
                    ? "bg-[#00E5FF] text-black shadow-md shadow-cyan-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Story 9:16
              </button>
              <button
                onClick={() => {
                  triggerSelectionHaptic();
                  setFormat("landscape");
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  format === "landscape"
                    ? "bg-[#00E5FF] text-black shadow-md shadow-cyan-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Card 16:9
              </button>
            </div>
          </div>

          {/* Seletor de Tema Visual */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-mono font-bold text-gray-400">Tema:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  triggerSelectionHaptic();
                  setTheme("neon");
                }}
                className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer bg-cyan-500 ${
                  theme === "neon" ? "border-white scale-110 ring-2 ring-cyan-400" : "border-white/20 opacity-70"
                }`}
                title="Cyber Neon"
              />
              <button
                onClick={() => {
                  triggerSelectionHaptic();
                  setTheme("gold");
                }}
                className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer bg-amber-500 ${
                  theme === "gold" ? "border-white scale-110 ring-2 ring-amber-400" : "border-white/20 opacity-70"
                }`}
                title="Golden Vault"
              />
              <button
                onClick={() => {
                  triggerSelectionHaptic();
                  setTheme("midnight");
                }}
                className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer bg-slate-700 ${
                  theme === "midnight" ? "border-white scale-110 ring-2 ring-purple-400" : "border-white/20 opacity-70"
                }`}
                title="Midnight Minimal"
              />
            </div>
          </div>
        </div>

        {/* Pré-visualização do Canvas em tempo real */}
        <div className="flex justify-center items-center bg-black/40 rounded-2xl p-4 border border-white/5 overflow-hidden">
          <canvas
            ref={canvasRef}
            className={`rounded-2xl shadow-2xl border border-white/10 max-h-[380px] w-auto object-contain transition-all duration-300 ${
              format === "story" ? "aspect-[9/16]" : "aspect-[16/9]"
            }`}
          />
        </div>

        {/* Botões de Ação */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Botão Baixar Imagem PNG */}
            <button
              onClick={handleDownloadPng}
              disabled={isGenerating}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#00E5FF] to-cyan-500 hover:from-white hover:to-gray-200 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(0,229,255,0.3)] cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isGenerating ? "Renderizando..." : "Baixar Imagem PNG (HD)"}</span>
            </button>

            {/* Compartilhamento Nativo */}
            <button
              onClick={handleShareNative}
              className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-[#00E5FF]" />
              <span>Enviar para o Instagram / Zap</span>
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Link Copiado com Sucesso!" : "Copiar Link do Perfil"}</span>
          </button>
        </div>
      </div>
    </AdaptiveModal>
  );
}
