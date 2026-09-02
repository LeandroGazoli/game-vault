"use client";

import React, { useEffect, useRef, useState } from "react";
import { AD_SLOTS, AdSlotConfig, ADSENSE_PUB_ID, FALLBACK_GAMING_DEALS } from "@/lib/adConfig";
import { Sparkles, ExternalLink, Megaphone } from "lucide-react";

interface AdBannerProps {
  slot?: AdSlotConfig | keyof typeof AD_SLOTS;
  className?: string;
  fallbackIndex?: number;
}

export default function AdBanner({
  slot = "HOME_IN_FEED",
  className = "",
  fallbackIndex = 0,
}: AdBannerProps) {
  const adSlotConfig: AdSlotConfig =
    typeof slot === "string" ? AD_SLOTS[slot] || AD_SLOTS.HOME_IN_FEED : slot;

  const [adLoaded, setAdLoaded] = useState(false);
  const adRef = useRef<HTMLModElement | null>(null);

  const isRealAdSenseConfigured =
    Boolean(adSlotConfig?.slotId) &&
    ADSENSE_PUB_ID !== "ca-pub-0000000000000000";

  useEffect(() => {
    if (isRealAdSenseConfigured && typeof window !== "undefined") {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        setAdLoaded(true);
      } catch (err) {
        console.warn("AdSense render warning:", err);
      }
    }
  }, [isRealAdSenseConfigured]);

  const fallbackDeal =
    FALLBACK_GAMING_DEALS[fallbackIndex % FALLBACK_GAMING_DEALS.length];

  return (
    <div
      className={`relative w-full rounded-2xl sm:rounded-3xl bg-[#18191c] border border-white/10 overflow-hidden p-4 sm:p-5 shadow-xl ${className}`}
    >
      {/* Badge de Conformidade e Transparência de Anúncio */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[10px] font-mono uppercase tracking-widest text-gray-500">
        <span className="flex items-center gap-1">
          <Megaphone className="w-3 h-3 text-[#00E5FF]" /> Publicidade
        </span>
        <span>GameVault Ads</span>
      </div>

      {isRealAdSenseConfigured ? (
        /* ==========================================
           1. GOOGLE ADSENSE REAL UNIT
        ========================================== */
        <div className="min-h-[90px] flex items-center justify-center overflow-hidden">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block", textAlign: "center", minHeight: "90px", width: "100%" }}
            data-ad-client={ADSENSE_PUB_ID}
            data-ad-slot={adSlotConfig.slotId}
            data-ad-format={adSlotConfig.format}
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        /* ==========================================
           2. GAMING DEALS / AFFILIATE FALLBACK UNIT
        ========================================== */
        <a
          href={fallbackDeal.href}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="group block"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold font-mono border ${fallbackDeal.badgeColor}`}
                >
                  {fallbackDeal.tag}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-[#00E5FF] transition-colors flex items-center gap-1.5">
                  {fallbackDeal.title}
                </h4>
              </div>
              <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
                {fallbackDeal.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="px-4 py-2 rounded-full bg-white group-hover:bg-gray-200 text-black text-xs font-bold transition-all shadow-md flex items-center gap-1.5 flex-shrink-0 group-hover:scale-105">
                <span>{fallbackDeal.cta}</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        </a>
      )}
    </div>
  );
}
