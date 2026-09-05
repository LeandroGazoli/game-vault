"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export interface AdaptiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string; // e.g. "max-w-md", "max-w-lg", "max-w-xl", "max-w-2xl", "max-w-4xl"
  className?: string;
  contentClassName?: string;
  hideCloseButton?: boolean;
  showHandle?: boolean;
  zIndexBackdrop?: string;
  zIndexContent?: string;
}

export default function AdaptiveModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  headerAction,
  children,
  footer,
  maxWidth = "max-w-xl",
  className = "",
  contentClassName = "",
  hideCloseButton = false,
  showHandle = true,
  zIndexBackdrop = "z-[90]",
  zIndexContent = "z-[100]",
}: AdaptiveModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloqueio de scroll do body e listener para tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || typeof document === "undefined") {
    return null;
  }

  const modalContent = (
    <div className={`fixed inset-0 ${zIndexBackdrop} flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden`}>
      {/* Backdrop com desfoque total e fechamento ao clicar */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Caixa do Diálogo: Bottom Sheet no mobile (<768px), Dialog centralizado no desktop (>=768px) */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`relative ${zIndexContent} w-full ${maxWidth} rounded-t-[28px] md:rounded-[32px] bg-[#14161e] border-t border-x md:border border-white/10 shadow-2xl flex flex-col max-h-[92dvh] md:max-h-[88vh] overflow-hidden text-white transition-transform duration-200 ease-out animate-fadeIn ${className}`}
      >
        {/* Barra de arraste (Drag Handle) no mobile */}
        {showHandle && (
          <div className="md:hidden pt-3 pb-1 flex justify-center flex-shrink-0 cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1.5 rounded-full bg-white/25 hover:bg-white/40 transition-colors" />
          </div>
        )}

        {/* Cabeçalho opcional */}
        {(title || icon || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-3 px-5 sm:px-7 pt-4 pb-3 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {icon && (
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white shrink-0 shadow-inner">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <div className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
                    {title}
                  </div>
                )}
                {subtitle && (
                  <div className="text-xs text-neutral-400 mt-0.5 line-clamp-2">
                    {subtitle}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              {headerAction}
              {!hideCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors active:scale-95"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Corpo com scroll interno suave */}
        <div className={`flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7 py-4 ${contentClassName}`}>
          {children}
        </div>

        {/* Rodapé opcional com padding seguro para navegação por gestos */}
        {footer && (
          <div className="px-5 sm:px-7 pt-3 pb-[max(env(safe-area-inset-bottom,0px)+12px,16px)] md:pb-5 border-t border-white/10 bg-[#12141a]/90 backdrop-blur-md flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
