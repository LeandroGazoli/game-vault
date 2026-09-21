"use client";

import React, { useState, useRef } from "react";
import { GamerGalleryItem } from "@/lib/types/profile.types";
import { Image, Upload, Heart, Plus, Sparkles, X } from "lucide-react";
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
    caption: "Night City na chuva em Ray Tracing Overdrive",
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload direto de imagem sem depender apenas de links externos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const newItem: GamerGalleryItem = {
            id: `upload_${Date.now()}`,
            gameTitle: "Screenshot Gamer",
            imageUrl: reader.result,
            caption: "Captura de gameplay enviada direto do dispositivo",
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
      {/* Header com Botão de Upload */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Image className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
              <span>Galeria de Screenshots</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                {items.length} Fotos
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">
              Capturas de momentos épicos de gameplay direto do seu jogo ou celular
            </p>
          </div>
        </div>

        {/* Input Oculto de Arquivo & Botão de Upload */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? "Enviando..." : "Upload Foto"}</span>
          </button>
        </div>
      </div>

      {/* Grid de Screenshots */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-2xl bg-[#181d28] border border-white/10 overflow-hidden shadow-md transition-all duration-300 hover:border-purple-500/40"
          >
            <div className="relative aspect-video bg-black/60 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.caption || item.gameTitle}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {/* Botão de Curtir Flutuante */}
              <button
                type="button"
                onClick={() => handleLike(item.id)}
                className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold flex items-center gap-1 hover:text-rose-400 active:scale-90 transition-all"
              >
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500/40" />
                <span>{item.likesCount || 0}</span>
              </button>

              <div className="absolute bottom-2 left-2.5 right-2.5">
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
        ))}
      </div>
    </div>
  );
}
