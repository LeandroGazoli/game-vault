"use client";

import React, { useMemo } from "react";
import MarkdownProfileBio from "./MarkdownProfileBio";
import CustomHtmlBio from "./CustomHtmlBio";
import { isPureHtmlBio } from "@/lib/sanitizeHtml";

interface ProfileBioRendererProps {
  content?: string | null;
  mode?: "markdown" | "html" | null;
  className?: string;
  onEdit?: () => void;
}

/**
 * Renderizador inteligente de bio para perfis.
 * Separa a renderização de Markdown e HTML puro para garantir que
 * o compilador de Markdown não envolva elementos em <p>, não altere
 * indentação nem force classes prose em layouts HTML/CSS personalizados.
 */
export default function ProfileBioRenderer({
  content,
  mode,
  className = "",
  onEdit,
}: ProfileBioRendererProps) {
  const isHtml = useMemo(() => {
    if (mode === "html") return true;
    if (mode === "markdown") return false;
    return isPureHtmlBio(content);
  }, [content, mode]);

  if (!content || !content.trim()) return null;

  if (isHtml) {
    return <CustomHtmlBio html={content} className={className} onEdit={onEdit} />;
  }

  return <MarkdownProfileBio content={content} className={className} onEdit={onEdit} />;
}
