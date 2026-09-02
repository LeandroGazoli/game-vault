"use client";

import React, { useEffect, useRef, useState } from "react";
import { AD_SLOTS, AdSlotConfig, ADSENSE_PUB_ID } from "@/lib/adConfig";
import { useAuth } from "@/context/AuthContext";
import { Megaphone } from "lucide-react";

interface AdBannerProps {
  slot?: AdSlotConfig | keyof typeof AD_SLOTS;
  className?: string;
  slotId?: string;
}

export default function AdBanner({
  slot = "HOME_IN_FEED",
  className = "",
  slotId,
}: AdBannerProps) {
  const { user, isPremium } = useAuth();
  const adRef = useRef<HTMLModElement | null>(null);
  const [isFilled, setIsFilled] = useState(false);

  const adSlotConfig: AdSlotConfig =
    typeof slot === "string" ? AD_SLOTS[slot] || AD_SLOTS.HOME_IN_FEED : slot;

  const currentSlotId = slotId || adSlotConfig?.slotId;
  const isRealAdSenseConfigured =
    ADSENSE_PUB_ID && ADSENSE_PUB_ID !== "ca-pub-0000000000000000";

  // Sempre executa os hooks no topo respeitando as regras do React
  useEffect(() => {
    if (
      isRealAdSenseConfigured &&
      !isPremium &&
      !user?.hideAds &&
      currentSlotId &&
      typeof window !== "undefined"
    ) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        // Ignora aviso do AdSense se adblock ativo
      }
    }
  }, [isRealAdSenseConfigured, isPremium, user?.hideAds, currentSlotId]);

  // Monitora se o AdSense realmente preencheu o anúncio ou se ficou vazio (unfilled)
  useEffect(() => {
    const el = adRef.current;
    if (!el) return;

    const checkAdStatus = () => {
      const status = el.getAttribute("data-ad-status");
      const hasIframe = !!el.querySelector("iframe");
      if (status === "filled" || hasIframe) {
        setIsFilled(true);
      } else if (status === "unfilled") {
        setIsFilled(false);
      }
    };

    const observer = new MutationObserver(checkAdStatus);
    observer.observe(el, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
      childList: true,
      subtree: true,
    });

    checkAdStatus();

    return () => observer.disconnect();
  }, [currentSlotId]);

  // 1. USUÁRIO PREMIUM / PRO OU SEM SLOT CONFIGURADO: NÃO EXIBE NADA (100% INVISÍVEL)
  if (isPremium || user?.hideAds || !isRealAdSenseConfigured || !currentSlotId) {
    return null;
  }

  return (
    <div
      className={`relative w-full rounded-2xl sm:rounded-3xl bg-[#18191c]/80 border border-white/10 overflow-hidden p-3 sm:p-4 shadow-lg ${className} ${
        !isFilled ? "hidden" : "block"
      }`}
      style={{ display: isFilled ? "block" : "none" }}
    >
      {/* Rótulo de Transparência exigido pelas diretrizes do Google AdSense */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5 text-[10px] font-mono uppercase tracking-widest text-gray-500">
        <span className="flex items-center gap-1">
          <Megaphone className="w-3 h-3 text-[#00E5FF]" /> Publicidade
        </span>
        <span>GameVault</span>
      </div>

      {/* Bloco Oficial do Google AdSense */}
      <div className="min-h-[90px] flex items-center justify-center overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", textAlign: "center", minHeight: "90px", width: "100%" }}
          data-ad-client={ADSENSE_PUB_ID}
          data-ad-slot={currentSlotId}
          data-ad-format={adSlotConfig.format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
