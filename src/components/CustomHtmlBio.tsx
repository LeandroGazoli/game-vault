"use client";

import React, { useMemo } from "react";
import { sanitizeCustomHtml } from "@/lib/sanitizeHtml";
import { Code, Sparkles, Edit2 } from "lucide-react";

interface CustomHtmlBioProps {
  html?: string | null;
  className?: string;
  onEdit?: () => void;
}

export default function CustomHtmlBio({ html, className = "", onEdit }: CustomHtmlBioProps) {
  const sanitizedHtml = useMemo(() => {
    if (!html || !html.trim()) return "";
    return sanitizeCustomHtml(html);
  }, [html]);

  if (!sanitizedHtml) return null;

  return (
    <div className={`relative rounded-3xl bg-[#141518]/90 border border-white/10 p-5 sm:p-6 shadow-xl overflow-hidden ${className}`}>
      {/* Badge de Showcase */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5 text-[11px] font-mono text-gray-400">
        <span className="flex items-center gap-1.5 text-[#00E5FF] font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Destaque Customizado do Perfil
        </span>
        <div className="flex items-center gap-3">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 text-gray-300 hover:text-[#00E5FF] border border-white/10 hover:border-[#00E5FF]/30 transition-all text-xs font-sans font-semibold active:scale-95 shadow-sm"
              title="Editar bio customizada"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Editar Bio</span>
            </button>
          )}
          <span className="hidden sm:flex items-center gap-1 text-gray-500">
            <Code className="w-3 h-3" /> HTML &amp; CSS Ativo
          </span>
        </div>
      </div>

      {/* Conteúdo HTML/CSS Sanitizado */}
      <div
        className="custom-profile-bio custom-profile-html leading-normal break-words"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  );
}
