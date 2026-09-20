"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { EyeOff, Zap, Sparkles, Crown, ArrowRight, Megaphone, ExternalLink } from "lucide-react";

interface PromoCreative {
  id: string;
  tag: string;
  badge: string;
  title: string;
  description: string;
  priceNote: string;
  ctaText: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  borderColor: string;
  badgeColor: string;
  bgGradient: string;
  btnGradient: string;
}

const CREATIVES: PromoCreative[] = [
  {
    id: "no-ads",
    tag: "Patrocinado",
    badge: "100% Sem Anúncios",
    title: "Cansado de propagandas?",
    description: "Navegue pelo catálogo e feeds com zero anúncios e foco total na sua coleção.",
    priceNote: "A partir de R$ 6,65/mês",
    ctaText: "Remover Anúncios",
    icon: EyeOff,
    accentColor: "text-emerald-400",
    borderColor: "border-emerald-500/30 hover:border-emerald-400/60",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    bgGradient: "from-emerald-950/50 via-[#121622] to-[#0c0d12]",
    btnGradient: "from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black",
  },
  {
    id: "xp-boost",
    tag: "Destaque PRO",
    badge: "Boost +50% XP",
    title: "Suba rápido no ranking",
    description: "Ganhe 1.5x de XP em cada jogo concluído e lidere a tabela da comunidade.",
    priceNote: "Multiplicador 1.5x",
    ctaText: "Acelerar Meu XP",
    icon: Zap,
    accentColor: "text-[#00E5FF]",
    borderColor: "border-cyan-500/30 hover:border-cyan-400/60",
    badgeColor: "bg-cyan-500/15 text-[#00E5FF] border-cyan-500/30",
    bgGradient: "from-cyan-950/50 via-[#121622] to-[#0c0d12]",
    btnGradient: "from-[#00E5FF] to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black",
  },
  {
    id: "profile-pro",
    tag: "Patrocinado",
    badge: "Perfil Exclusivo",
    title: "Seu perfil em destaque",
    description: "Desbloqueie o Selo PRO Neon, temas customizados e crie até 10 insígnias próprias.",
    priceNote: "Selo PRO Neon",
    ctaText: "Personalizar Perfil",
    icon: Sparkles,
    accentColor: "text-purple-400",
    borderColor: "border-purple-500/30 hover:border-purple-400/60",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    bgGradient: "from-purple-950/50 via-[#121622] to-[#0c0d12]",
    btnGradient: "from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white",
  },
  {
    id: "vip-lifetime",
    tag: "Edição Limitada",
    badge: "VIP Vitalício",
    title: "Seja Membro Fundador",
    description: "Acesso permanente sem mensalidades com 2.0x XP em dobro para toda a vida.",
    priceNote: "Pagamento Único",
    ctaText: "Virar Membro VIP",
    icon: Crown,
    accentColor: "text-amber-400",
    borderColor: "border-amber-500/40 hover:border-amber-400/70",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    bgGradient: "from-amber-950/50 via-[#121622] to-[#0c0d12]",
    btnGradient: "from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black",
  },
];

interface GameCardPlanPromoProps {
  variantIndex?: number;
  className?: string;
  isCarousel?: boolean;
}

export default function GameCardPlanPromo({
  variantIndex,
  className = "",
  isCarousel = false,
}: GameCardPlanPromoProps) {
  const { user, isPremium } = useAuth();

  // Seleciona um criativo aleatório ou baseado no índice fornecido
  const creative = useMemo(() => {
    if (typeof variantIndex === "number" && variantIndex >= 0) {
      return CREATIVES[variantIndex % CREATIVES.length];
    }
    const randomIdx = Math.floor(Math.random() * CREATIVES.length);
    return CREATIVES[randomIdx];
  }, [variantIndex]);

  // Se o usuário já é assinante PRO/VIP ou optou por esconder anúncios, não renderiza
  if (isPremium || user?.hideAds) {
    return null;
  }

  const Icon = creative.icon;

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-b ${creative.bgGradient} border ${creative.borderColor} p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/70 select-none ${
        isCarousel
          ? "flex-shrink-0 w-36 sm:w-44 aspect-[3/4]"
          : "h-full min-h-[290px] aspect-[3/4]"
      } ${className}`}
    >
      {/* Top Header estilo Anúncio do Google AdSense / In-Feed Sponsored */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-[9px] font-mono uppercase tracking-widest text-neutral-400">
          <span className="flex items-center gap-1 font-bold text-neutral-300">
            <Megaphone className={`w-3 h-3 ${creative.accentColor}`} />
            <span>{creative.tag}</span>
          </span>
          <span className="text-[8px] text-neutral-500">Vault PRO</span>
        </div>

        {/* Badge da Vantagem */}
        <div className="pt-0.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${creative.badgeColor}`}
          >
            <Icon className="w-2.5 h-2.5" />
            <span>{creative.badge}</span>
          </span>
        </div>

        {/* Conteúdo Principal */}
        <div className="space-y-1 pt-1">
          <h4 className="text-xs sm:text-sm font-extrabold text-white tracking-tight leading-snug group-hover:text-white">
            {creative.title}
          </h4>
          <p className="text-[11px] text-neutral-300 leading-relaxed line-clamp-3">
            {creative.description}
          </p>
        </div>
      </div>

      {/* Rodapé com Preço e Botão de Ação Direta para /planos */}
      <div className="pt-2 border-t border-white/5 space-y-2">
        <div className="text-[10px] font-mono text-neutral-400 flex items-center justify-between">
          <span>Game Vault</span>
          <span className={`font-bold ${creative.accentColor}`}>{creative.priceNote}</span>
        </div>

        <Link
          href="/planos"
          className={`w-full py-2 px-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 bg-gradient-to-r ${creative.btnGradient}`}
        >
          <span>{creative.ctaText}</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
