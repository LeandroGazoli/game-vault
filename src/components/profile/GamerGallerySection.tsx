"use client";

import React, { useState, useRef } from "react";
import { GamerGalleryItem } from "@/lib/types/profile.types";
import { Image, Upload, Heart, Plus, Sparkles, X, Video, Eye, EyeOff, Film } from "lucide-react";
import { triggerSelectionHaptic, triggerSuccessHaptic } from "@/lib/capacitor";

interface GamerGallerySectionProps {
  initialItems?: GamerGalleryItem[];
  isOwner?: boolean;
}

const DEFAULT_GALLERY: GamerGalleryItem[] = [
  {
    id: "g1",
    gameTitle: "Elden Ring: Shadow of the Erdtree",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
    caption: "Derrotando o Consorte Prometido em NG+7",
    likesCount: 24,
    uploadedAt: "2026-09-18",
  },
  {
    id: "g2",
    gameTitle: "Cyberpunk 2077",
    imageUrl: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800",
    caption: "Final secreto da expansão (Momento épico)",
    isSpoiler: true,
    likesCount: 19,
    uploadedAt: "2026-09-12",
  },
  {
    id: "g3",
    gameTitle: "Persona 5 Royal",
    imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800",
    caption: "All-Out Attack final em Shido",
    likesCount: 31,
    uploadedAt: "2026-09-02",
  },
];

export default function GamerGallerySection({
  initialItems = DEFAULT_GALLERY,
  isOwner = false,
}: GamerGallerySectionProps) {
  const [items, setItems] = useState<GamerGalleryItem[]>(initialItems);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadAsSpoiler, setUploadAsSpoiler] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSpoiler = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerSelectionHaptic();
    setRevealedSpoilers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Upload direto de arquivo (foto ou clipe de vídeo até 90s)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const isVideo = file.type.startsWith("video/");
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const newItem: GamerGalleryItem = {
            id: `upload_${Date.now()}`,
            gameTitle: isVideo ? "Clipe de Gameplay" : "Screenshot Gamer",
            imageUrl: reader.result,
            mediaType: isVideo ? "video" : "image",
            videoUrl: isVideo ? reader.result : undefined,
            isSpoiler: uploadAsSpoiler,
            caption: isVideo
              ? "Clipe de até 90s capturado diretamente"
              : "Captura de gameplay enviada direto do dispositivo",
            likesCount: 0,
            uploadedAt: new Date().toISOString().split("T")[0],
          };
          setItems((prev) => [newItem, ...prev]);
          triggerSuccessHaptic();
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLike = (id: string) => {
    triggerSelectionHaptic();
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, likesCount: (it.likesCount || 0) + 1 } : it))
    );
  };

  return (
    <div className="rounded-3xl bg-[#141822] border border-white/10 p-4 sm:p-5 shadow-lg space-y-3">
      {/* Header com Botão de Upload e Checkbox de Spoiler */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
              <span>Galeria de Clipes &amp; Screenshots</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                {items.length} Mídias
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">
              Fotos e clipes de gameplay (até 90s) com suporte a proteção anti-spoiler
            </p>
          </div>
        </div>

        {/* Input Oculto de Arquivo & Ação de Upload */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <label className="flex items-center gap-1.5 text-[11px] text-amber-300 font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={uploadAsSpoiler}
              onChange={(e) => setUploadAsSpoiler(e.target.checked)}
              className="rounded accent-amber-500"
            />
            <span>Marcar Spoiler</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? "Enviando..." : "Upload Foto/Clipe"}</span>
          </button>
        </div>
      </div>

      {/* Grid de Mídias */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {items.map((item) => {
          const isSpoilerHidden = item.isSpoiler && !revealedSpoilers[item.id];

          return (
            <div
              key={item.id}
              className="group relative rounded-2xl bg-[#181d28] border border-white/10 overflow-hidden shadow-md transition-all duration-300 hover:border-purple-500/40"
            >
              <div className="relative aspect-video bg-black/60 overflow-hidden flex items-center justify-center">
                {item.mediaType === "video" && item.videoUrl ? (
                  <video
                    src={item.videoUrl}
                    controls
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      isSpoilerHidden ? "blur-xl scale-105 pointer-events-none" : ""
                    }`}
                  />
                ) : (
                  <img
                    src={item.imageUrl}
                    alt={item.caption || item.gameTitle}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      isSpoilerHidden ? "blur-xl scale-110" : ""
                    }`}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800";
                    }}
                  />
                )}

                {/* Camada Anti-Spoiler */}
                {isSpoilerHidden && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-3 text-center space-y-1.5 z-20">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                      ⚠️ Contém Spoiler
                    </span>
                    <button
                      type="button"
                      onClick={(e) => toggleSpoiler(item.id, e)}
                      className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold flex items-center gap-1 transition-colors active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Revelar</span>
                    </button>
                  </div>
                )}

                {item.isSpoiler && !isSpoilerHidden && (
                  <button
                    type="button"
                    onClick={(e) => toggleSpoiler(item.id, e)}
                    className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full bg-black/70 text-[10px] font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1 hover:bg-black"
                  >
                    <EyeOff className="w-3 h-3" />
                    <span>Ocultar</span>
                  </button>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* Botão de Curtir Flutuante */}
                <button
                  type="button"
                  onClick={() => handleLike(item.id)}
                  className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold flex items-center gap-1 hover:text-rose-400 active:scale-90 transition-all z-20"
                >
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500/40" />
                  <span>{item.likesCount || 0}</span>
                </button>

                <div className="absolute bottom-2 left-2.5 right-2.5 z-10 pointer-events-none">
                  <span className="text-[10px] font-mono text-purple-300 font-bold block truncate">
                    {item.gameTitle}
                  </span>
                  {item.caption && (
                    <p className="text-xs font-semibold text-white truncate drop-shadow-sm">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
