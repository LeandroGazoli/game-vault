"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SystemSettings } from "@/lib/types";
import { Sparkles, AlertCircle, Info, ChevronRight, X } from "lucide-react";

export default function AnnouncementBanner() {
  const [banner, setBanner] = useState<SystemSettings["announcementBanner"] | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!db) return;

    // Escuta em tempo real as configurações do sistema para atualizar o banner instantaneamente
    const unsub = onSnapshot(doc(db, "system", "settings"), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as SystemSettings;
        if (data.announcementBanner?.enabled && data.announcementBanner?.text?.trim()) {
          setBanner(data.announcementBanner);
        } else {
          setBanner(null);
        }
      }
    });

    return () => unsub();
  }, []);

  if (!banner || !banner.enabled || isDismissed) return null;

  const isPromo = banner.variant === "promo";
  const isWarning = banner.variant === "warning";

  return (
    <div
      role="alert"
      className={`relative z-40 w-full transition-all animate-fadeIn ${
        isPromo
          ? "bg-gradient-to-r from-cyan-950/90 via-indigo-950/90 to-purple-950/90 border-b border-cyan-500/30 text-cyan-100"
          : isWarning
          ? "bg-gradient-to-r from-amber-950/90 via-orange-950/90 to-yellow-950/90 border-b border-amber-500/30 text-amber-100"
          : "bg-[#14161d] border-b border-white/10 text-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-2 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isPromo ? (
            <Sparkles className="w-4 h-4 text-[#00E5FF] shrink-0 animate-pulse" />
          ) : isWarning ? (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-[#00E5FF] shrink-0" />
          )}

          <p className="truncate font-medium">
            {banner.text}
          </p>

          {banner.linkUrl && (
            <Link
              href={banner.linkUrl}
              className={`hidden sm:inline-flex items-center gap-1 font-bold text-xs hover:underline shrink-0 ${
                isPromo
                  ? "text-[#00E5FF]"
                  : isWarning
                  ? "text-amber-300"
                  : "text-white"
              }`}
            >
              <span>{banner.linkLabel || "Saiba mais"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {banner.linkUrl && (
            <Link
              href={banner.linkUrl}
              className={`sm:hidden inline-flex items-center gap-0.5 text-[11px] font-bold ${
                isPromo ? "text-[#00E5FF]" : "text-amber-300"
              }`}
            >
              <span>{banner.linkLabel || "Ver"}</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Fechar comunicado"
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
