"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  MessageCircle,
  Twitter,
  Send,
  Smartphone,
  Lock,
  Globe,
  Sparkles,
} from "lucide-react";
import AdaptiveModal from "./ui/AdaptiveModal";

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  displayName: string;
  isPublic?: boolean;
  onMakePublic?: () => Promise<void> | void;
  onOpenGamerCard?: () => void;
}

export default function ShareProfileModal({
  isOpen,
  onClose,
  username,
  displayName,
  isPublic = true,
  onMakePublic,
  onOpenGamerCard,
}: ShareProfileModalProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/perfil/${username}`
    : `https://www.mygameslist.com.br/perfil/${username}`;

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanNativeShare(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Erro ao copiar link:", e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName} (@${username}) • MyGameList`,
          text: `Confira meu perfil gamer e minha biblioteca de jogos no MyGameList! 🎮`,
          url: profileUrl,
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Erro no compartilhamento nativo:", err);
        }
      }
    }
  };

  const shareText = `Confira o perfil gamer de ${displayName} (@${username}) no MyGameList! 🎮`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${profileUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText}\n${profileUrl}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(shareText)}`;

  // QR Code URL estilizado
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(profileUrl)}&bgcolor=14161a&color=00e5ff&margin=1`;

  return (
    <AdaptiveModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Compartilhar Perfil
              </h3>
              <p className="text-xs text-gray-400">
                @{username}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aviso caso o perfil esteja configurado como Privado */}
        {isPublic === false && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="text-white font-bold block">Seu perfil está Privado</strong>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Amigos e visitantes que abrirem este link não verão seus jogos nem conquistas.
                </p>
              </div>
            </div>
            {onMakePublic && (
              <button
                onClick={async () => {
                  await onMakePublic();
                }}
                className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-amber-500/20"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Liberar Perfil Público Agora</span>
              </button>
            )}
          </div>
        )}

        {/* Botão de Gerar Card Gamer Estilizado */}
        {onOpenGamerCard && (
          <button
            onClick={() => {
              onClose();
              onOpenGamerCard();
            }}
            className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600/30 via-[#00E5FF]/20 to-cyan-500/30 border border-[#00E5FF]/50 text-white font-black text-xs flex items-center justify-center gap-2 hover:bg-[#00E5FF]/20 active:scale-95 transition-all shadow-lg shadow-[#00E5FF]/10 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#00E5FF] animate-pulse" />
            <span>Gerar Card Gamer para Instagram &amp; Stories</span>
          </button>
        )}

        {/* Botão de Compartilhamento Nativo do Celular (se disponível) */}
        {canNativeShare && (
          <button
            onClick={handleNativeShare}
            className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-[#00E5FF]/20 to-blue-500/20 border border-[#00E5FF]/40 text-[#00E5FF] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#00E5FF]/30 active:scale-95 transition-all shadow-md shadow-cyan-500/10"
          >
            <Smartphone className="w-4 h-4" />
            <span>Compartilhar pelo Celular (Menu Nativo)</span>
          </button>
        )}

        {/* Link direto para copiar */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">
            Link Direto do Perfil
          </label>
          <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-white/5 border border-white/10 focus-within:border-[#00E5FF] transition-all">
            <input
              type="text"
              readOnly
              value={profileUrl}
              className="bg-transparent text-xs text-gray-200 font-mono flex-1 outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                copied
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                  : "bg-white text-black hover:bg-gray-200 active:scale-95"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Compartilhar nas Redes Sociais */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-gray-300">
            Compartilhar nas Redes
          </span>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[46px] p-2.5 rounded-2xl bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-500/30 flex flex-col items-center justify-center gap-1 text-emerald-400 font-bold text-[11px] transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[46px] p-2.5 rounded-2xl bg-blue-950/30 hover:bg-blue-950/60 border border-blue-500/30 flex flex-col items-center justify-center gap-1 text-blue-400 font-bold text-[11px] transition-all active:scale-95"
            >
              <Twitter className="w-4 h-4" />
              <span>X / Twitter</span>
            </a>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[46px] p-2.5 rounded-2xl bg-sky-950/30 hover:bg-sky-950/60 border border-sky-500/30 flex flex-col items-center justify-center gap-1 text-sky-400 font-bold text-[11px] transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Telegram</span>
            </a>
          </div>
        </div>

        {/* Toggle QR Code */}
        <div className="pt-1">
          <button
            onClick={() => setShowQr(!showQr)}
            className="w-full py-2.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 flex items-center justify-center gap-2 transition-all"
          >
            <QrCode className="w-4 h-4 text-[#00E5FF]" />
            <span>{showQr ? "Ocultar QR Code" : "Mostrar QR Code para Escanear"}</span>
          </button>

          {showQr && (
            <div className="mt-3 p-4 rounded-2xl bg-black/60 border border-[#00E5FF]/30 flex flex-col items-center justify-center space-y-2 animate-fadeIn">
              <img
                src={qrCodeUrl}
                alt={`QR Code para o perfil de ${username}`}
                className="w-44 h-44 rounded-xl border border-white/15 p-2 bg-[#14161a]"
              />
              <p className="text-[10px] text-gray-400 text-center">
                Aponte a câmera do celular para abrir o perfil diretamente.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </AdaptiveModal>
  );
}
