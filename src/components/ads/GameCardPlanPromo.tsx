"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { EyeOff, Zap, Sparkles, Crown, ArrowRight, Megaphone } from "lucide-react";
import { PromoCreativeConfig, DEFAULT_PROMO_CREATIVES } from "@/lib/ads/planAds.types";
import { getSyncedPriceNote } from "@/lib/ads/priceSync";
import { DEFAULT_PLANS_CONFIG, PlansConfig } from "@/lib/plans.types";

const ICONS_MAP = {
  EyeOff,
  Zap,
  Sparkles,
  Crown,
};

interface GameCardPlanPromoProps {
  variantIndex?: number;
  className?: string;
  isCarousel?: boolean;
  customCreatives?: PromoCreativeConfig[];
  plansConfig?: PlansConfig;
  previewCreative?: PromoCreativeConfig;
}

export default function GameCardPlanPromo({
  variantIndex,
  className = "",
  isCarousel = false,
  customCreatives,
  plansConfig = DEFAULT_PLANS_CONFIG,
  previewCreative,
}: GameCardPlanPromoProps) {
  const { user, isPremium } = useAuth();

  // Seleção de criativo: ou o previewCreative (para o painel admin), ou customCreatives, ou default
  const creative = useMemo(() => {
    if (previewCreative) return previewCreative;

    const list = (customCreatives && customCreatives.length > 0)
      ? customCreatives.filter((c) => c.enabled !== false)
      : DEFAULT_PROMO_CREATIVES;

    if (list.length === 0) return DEFAULT_PROMO_CREATIVES[0];

    if (typeof variantIndex === "number" && variantIndex >= 0) {
      return list[variantIndex % list.length];
    }
    return list[0];
  }, [variantIndex, customCreatives, previewCreative]);

  // Se o usuário já é assinante PRO/VIP ou optou por esconder anúncios, não renderiza (exceto no preview do admin)
  if (!previewCreative && (isPremium || user?.hideAds)) {
    return null;
  }

  const Icon = ICONS_MAP[creative.iconType] || Megaphone;
  const priceDisplay = getSyncedPriceNote(creative, plansConfig);

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-b ${creative.bgGradient} border ${creative.borderColor} p-3 sm:p-3.5 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/70 select-none ${
        isCarousel
          ? "flex-shrink-0 w-36 sm:w-44 aspect-[3/4]"
          : "h-full min-h-[280px] aspect-[3/4]"
      } ${className}`}
    >
      {/* Link Overlay 100% Clicável para /planos */}
      <Link
        href="/planos"
        aria-label={`Conhecer plano - ${creative.title}`}
        className="absolute inset-0 z-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-2xl"
      />

      {/* Top Header: Tag Patrocinado e Vault PRO */}
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[9px] font-mono uppercase tracking-widest text-neutral-400">
          <span className="flex items-center gap-1 font-bold text-neutral-300 truncate">
            <Megaphone className={`w-3 h-3 flex-shrink-0 ${creative.accentColor}`} />
            <span className="truncate">{creative.tag}</span>
          </span>
          <span className="text-[8px] text-neutral-500 font-bold flex-shrink-0">Vault PRO</span>
        </div>

        {/* Badge da Vantagem */}
        <div className="pt-0.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border max-w-full truncate ${creative.badgeColor}`}
          >
            <Icon className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate">{creative.badge}</span>
          </span>
        </div>

        {/* Conteúdo Principal com Densidade Compacta */}
        <div className="space-y-1 pt-0.5">
          <h4 className="text-xs sm:text-[13px] font-extrabold text-white tracking-tight leading-snug line-clamp-2 group-hover:text-white">
            {creative.title}
          </h4>
          <p className="text-[10.5px] sm:text-[11px] text-neutral-300 leading-snug line-clamp-2 sm:line-clamp-3">
            {creative.description}
          </p>
        </div>
      </div>

      {/* Rodapé com Preço Sincronizado e Botão CTA */}
      <div className="pt-1.5 border-t border-white/5 space-y-1.5 mt-auto">
        <div className="text-[9.5px] sm:text-[10px] font-mono text-neutral-400 flex items-center justify-between gap-1">
          <span className="truncate">Game Vault</span>
          <span className={`font-bold text-right truncate ${creative.accentColor}`}>{priceDisplay}</span>
        </div>

        <div
          className={`w-full py-1.5 sm:py-2 px-2 rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-md group-hover:brightness-110 group-active:scale-95 bg-gradient-to-r ${creative.btnGradient}`}
        >
          <span className="truncate">{creative.ctaText}</span>
          <ArrowRight className="w-3 h-3 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}
