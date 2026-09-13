"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { sanitizeCustomHtml, isPureHtmlBio } from "@/lib/sanitizeHtml";

interface IndieDescriptionRendererProps {
  content?: string | null;
  mode?: "tiptap" | "html" | "markdown" | null;
  className?: string;
}

/**
 * Renderizador de Conteúdo Polimórfico para Jogos Indie.
 * Suporta:
 * 1. Tiptap Rich Text (HTML estilizado com tipografia moderna e Tailwind Typography)
 * 2. HTML5 & CSS3 Puro (Sanitizado com DOMPurify e suporte a tags customizadas)
 * 3. Markdown com suporte a tabelas, links, listas e imagens GFM
 */
export default function IndieDescriptionRenderer({
  content,
  mode,
  className = "",
}: IndieDescriptionRendererProps) {
  const detectedMode = useMemo(() => {
    if (mode) return mode;
    if (isPureHtmlBio(content)) return "html";
    if (content && /<(p|h[1-6]|ul|ol|li|strong|em|blockquote|img|a)\b/i.test(content)) {
      return "tiptap";
    }
    return "markdown";
  }, [content, mode]);

  const sanitizedHtml = useMemo(() => {
    if (!content || !content.trim()) return "";
    return sanitizeCustomHtml(content);
  }, [content]);

  if (!content || !content.trim()) {
    return (
      <p className="text-xs text-gray-500 italic">
        Nenhuma descrição detalhada informada.
      </p>
    );
  }

  // Modo HTML Puro ou Tiptap Rich Text
  if (detectedMode === "html" || detectedMode === "tiptap") {
    return (
      <div
        className={`custom-profile-bio custom-profile-html prose prose-invert prose-emerald max-w-none text-sm text-gray-300 leading-relaxed font-sans break-words ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  // Modo Markdown (Padrão)
  return (
    <div
      className={`prose prose-invert prose-emerald max-w-none text-sm text-gray-300 leading-relaxed font-sans break-words ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-xl sm:text-2xl font-black text-white tracking-tight pb-2 border-b border-white/10 mt-6 mb-3 text-emerald-400"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-lg sm:text-xl font-extrabold text-white tracking-tight pb-1.5 border-b border-white/5 mt-5 mb-2.5 text-cyan-300"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-base sm:text-lg font-bold text-white tracking-tight mt-4 mb-2 text-white"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="text-gray-300 leading-relaxed my-2.5" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-1 my-3 text-gray-300" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-1 my-3 text-gray-300" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-gray-300" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-emerald-500/60 pl-4 py-1.5 my-3.5 bg-emerald-500/5 rounded-r-xl text-gray-300 italic"
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors font-medium cursor-pointer"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          img: ({ node, ...props }) => (
            <img
              className="rounded-2xl max-w-full my-4 border border-white/10 shadow-lg object-cover mx-auto"
              loading="lazy"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-white/10">
              <table className="w-full text-left text-xs border-collapse" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="bg-white/5 p-2.5 font-bold text-white border-b border-white/10" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="p-2.5 border-b border-white/10 text-gray-300" {...props} />
          ),
          code: ({ node, ...props }) => (
            <code
              className="px-1.5 py-0.5 rounded bg-black/40 text-emerald-300 font-mono text-xs border border-white/10"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-white/10" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
