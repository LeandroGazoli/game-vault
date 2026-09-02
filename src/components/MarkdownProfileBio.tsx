"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { sanitizeCustomHtml } from "@/lib/sanitizeHtml";
import { Sparkles, FileText } from "lucide-react";

interface MarkdownProfileBioProps {
  content?: string | null;
  className?: string;
}

export default function MarkdownProfileBio({
  content,
  className = "",
}: MarkdownProfileBioProps) {
  const sanitizedContent = useMemo(() => {
    if (!content || !content.trim()) return "";
    return sanitizeCustomHtml(content);
  }, [content]);

  if (!sanitizedContent) return null;

  return (
    <div
      className={`relative rounded-3xl bg-[#141518]/95 border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden ${className}`}
    >
      {/* Header do Showcase */}
      <div className="flex items-center justify-between pb-3 mb-5 border-b border-white/5 text-[11px] font-mono text-gray-400">
        <span className="flex items-center gap-1.5 text-[#00E5FF] font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Bio &amp; Showcase do Jogador
        </span>
        <span className="flex items-center gap-1 text-gray-500">
          <FileText className="w-3.5 h-3.5" /> Markdown &amp; HTML Híbrido
        </span>
      </div>

      {/* Renderização do Markdown */}
      <div className="prose prose-invert max-w-none space-y-4 text-xs sm:text-sm text-gray-200 leading-relaxed break-words font-sans">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight pb-2 border-b border-white/10 mt-4 mb-2 text-[#00E5FF]" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight pb-1.5 border-b border-white/5 mt-3 mb-2 text-cyan-300" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-base sm:text-lg font-bold text-white mt-3 mb-1.5 text-purple-300" {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h4 className="text-sm sm:text-base font-bold text-gray-100 mt-2 mb-1" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-[#00E5FF] bg-cyan-500/5 px-4 py-2.5 rounded-r-2xl my-3 italic text-gray-300 font-serif text-xs sm:text-sm" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-inside space-y-1 my-2 text-gray-300 pl-2" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-inside space-y-1 my-2 text-gray-300 pl-2" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="text-xs sm:text-sm text-gray-300 leading-relaxed" {...props} />
            ),
            a: ({ node, ...props }) => (
              <a className="text-[#00E5FF] hover:underline font-semibold transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
            ),
            img: ({ node, ...props }) => (
              <img className="rounded-2xl max-w-full my-3 border border-white/10 shadow-lg object-cover" {...props} />
            ),
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-4 rounded-2xl border border-white/10 bg-black/40">
                <table className="w-full text-left text-xs divide-y divide-white/10" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => (
              <thead className="bg-white/5 text-[11px] font-mono uppercase tracking-wider text-[#00E5FF]" {...props} />
            ),
            th: ({ node, ...props }) => (
              <th className="px-4 py-2.5 font-bold" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="px-4 py-2 border-t border-white/5 text-gray-300" {...props} />
            ),
            code: ({ node, ...props }) => (
              <code className="bg-white/10 text-cyan-300 px-1.5 py-0.5 rounded-md font-mono text-[11px]" {...props} />
            ),
            pre: ({ node, ...props }) => (
              <pre className="bg-[#101114] border border-white/10 p-4 rounded-2xl overflow-x-auto font-mono text-xs text-cyan-200 my-3" {...props} />
            ),
            hr: ({ node, ...props }) => (
              <hr className="border-white/10 my-4" {...props} />
            ),
          }}
        >
          {sanitizedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
