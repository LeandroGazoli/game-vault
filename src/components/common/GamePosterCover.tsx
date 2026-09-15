"use client";

import React, { useState } from "react";
import { Gamepad2, ImageOff } from "lucide-react";

export interface GamePosterCoverProps {
  /** URL da imagem da capa (estática, WebP, GIF ou APNG) */
  src?: string | null;
  /** Texto alternativo para acessibilidade */
  alt: string;
  /** Proporção do poster: padrão 3:4 ou 2:3 */
  aspectRatio?: "3/4" | "2/3";
  /** Classes adicionais para o container externo */
  className?: string;
  /** Classes para a imagem interna */
  imgClassName?: string;
  /** Habilita lazy loading nativo (desative para o LCP se for elemento de topo) */
  priority?: boolean;
  /** Conteúdo ou badges para sobreposição na capa */
  overlayContent?: React.ReactNode;
  /** Callback ao clicar na capa */
  onClick?: () => void;
}

/**
 * Componente padronizado de capa vertical estilo poster para jogos.
 * Garante proporção consistente (3:4 ou 2:3), sem distorção anamórfica,
 * com suporte a imagens animadas (GIF, APNG, WebP) e fallback resiliente.
 */
export default function GamePosterCover({
  src,
  alt,
  aspectRatio = "3/4",
  className = "",
  imgClassName = "",
  priority = false,
  overlayContent,
  onClick,
}: GamePosterCoverProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(src));

  const aspectClass = aspectRatio === "2/3" ? "aspect-[2/3]" : "aspect-[3/4]";

  const isAnimated = Boolean(
    src && (src.endsWith(".gif") || src.includes(".gif?") || src.endsWith(".apng"))
  );

  return (
    <div
      onClick={onClick}
      className={`game-poster-cover relative w-full overflow-hidden rounded-2xl bg-[#121620] border border-white/5 select-none ${aspectClass} ${
        onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""
      } ${className}`}
      role={onClick ? "button" : "img"}
      aria-label={alt}
    >
      {/* Imagem da Capa */}
      {src && !hasError ? (
        <>
          <img
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
            className={`w-full h-full object-cover object-center transition-all duration-300 ${
              isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"
            } ${isAnimated ? "motion-reduce:brightness-90" : ""} ${imgClassName}`}
          />

          {/* Skeleton de carregamento */}
          {isLoading && (
            <div className="absolute inset-0 bg-[#161a26] animate-pulse flex items-center justify-center">
              <Gamepad2 className="w-8 h-8 text-white/10" />
            </div>
          )}
        </>
      ) : (
        /* Fallback elegante quando não há capa ou em falha de rede */
        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-[#151924] via-[#0f121a] to-[#0a0c10] border border-white/5">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 mb-2 shadow-inner">
            {hasError ? <ImageOff className="w-5 h-5 text-gray-400" /> : <Gamepad2 className="w-5 h-5 text-gray-500" />}
          </div>
          <span className="text-[11px] font-bold text-gray-400 line-clamp-2 leading-tight px-1 font-sans">
            {alt || "Sem Capa"}
          </span>
        </div>
      )}

      {/* Gradiente sutil inferior para legibilidade de títulos sobrepostos */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 pointer-events-none" />

      {/* Conteúdo sobreposto (Badges de Metacritic, Status, etc.) */}
      {overlayContent && (
        <div className="absolute inset-0 z-10 p-2 pointer-events-none [&>*]:pointer-events-auto">
          {overlayContent}
        </div>
      )}
    </div>
  );
}
