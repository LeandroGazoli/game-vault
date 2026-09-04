"use client";

import React from "react";
import { SteamInventoryItem } from "@/lib/types";
import {
  X,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Tag,
  Crosshair,
} from "lucide-react";

interface SteamItemModalProps {
  item: SteamInventoryItem | null;
  onClose: () => void;
}

export default function SteamItemModal({ item, onClose }: SteamItemModalProps) {
  if (!item) return null;

  const marketUrl = `https://steamcommunity.com/market/listings/${item.appId}/${encodeURIComponent(
    item.marketHashName || item.marketName
  )}`;

  const rarityHex = item.rarityColor || "#00E5FF";

  return (
    <div
      className="fixed inset-0 z-[1000] !m-0 !mt-0 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative z-10 w-full max-w-lg rounded-[28px] bg-[#14161a] border border-white/15 p-5 sm:p-7 shadow-2xl space-y-5 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: `0 20px 60px ${rarityHex}25, 0 0 1px ${rarityHex}`,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {item.rarity && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${rarityHex}15`,
                    borderColor: `${rarityHex}40`,
                    color: rarityHex,
                  }}
                >
                  {item.rarity}
                </span>
              )}
              {item.exterior && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                  {item.exterior}
                </span>
              )}
              {item.weapon && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {item.weapon}
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
              {item.marketName || item.name}
            </h3>
            <p className="text-xs text-gray-400">{item.type}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Showcase Image */}
        <div className="relative aspect-video w-full rounded-2xl bg-gradient-to-b from-black/60 to-black/30 border border-white/10 flex items-center justify-center p-6 overflow-hidden">
          {/* Ambient Glow */}
          <div
            className="absolute inset-0 opacity-20 blur-3xl rounded-full"
            style={{ backgroundColor: rarityHex }}
          />
          {item.iconUrl ? (
            <img
              src={item.iconUrlLarge || item.iconUrl}
              alt={item.marketName}
              className="relative z-10 max-h-full max-w-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <Crosshair className="w-16 h-16 text-gray-600" />
          )}

          {item.marketPrice && (
            <div className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs shadow-md backdrop-blur-md">
              Est. {item.marketPrice}
            </div>
          )}
        </div>

        {/* Descriptions & Stickers */}
        <div className="overflow-y-auto space-y-3 pr-1 max-h-48 text-xs">
          {item.descriptions && item.descriptions.length > 0 ? (
            item.descriptions.map((desc, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-300 leading-relaxed break-words"
                style={{
                  color: desc.color ? `#${desc.color}` : undefined,
                }}
              >
                {desc.value}
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">Nenhuma descrição especial fornecida para este item.</p>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <span className="text-[11px] font-bold text-gray-400 block mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-[#00E5FF]" /> Tags Oficiais:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 border border-white/10 text-gray-300"
                  >
                    {t.localizedTagName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status badges: Tradable / Marketable */}
        <div className="flex items-center gap-2 pt-1">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
              item.tradable
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/15 border-red-500/30 text-red-400"
            }`}
          >
            {item.tradable ? "✓ Negociável" : "✕ Não Negociável"}
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
              item.marketable
                ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
                : "bg-gray-500/15 border-gray-500/30 text-gray-400"
            }`}
          >
            {item.marketable ? "✓ Comercializável" : "✕ Não Comercializável"}
          </span>
        </div>

        {/* Actions Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-2 sm:gap-3">
          <a
            href={marketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-[46px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#00E5FF] hover:bg-[#00c8e0] text-black font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ver no Mercado Steam</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>

          <button
            onClick={onClose}
            className="px-5 min-h-[46px] rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
