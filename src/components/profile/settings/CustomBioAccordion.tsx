"use client";

import React from "react";
import { Code2, ChevronDown, Eye, FileCode } from "lucide-react";
import ProfileBioRenderer from "@/components/ProfileBioRenderer";

interface CustomBioAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  markdownContent: string;
  setMarkdownContent: React.Dispatch<React.SetStateAction<string>>;
  bioTab: "editor" | "preview";
  setBioTab: (tab: "editor" | "preview") => void;
  bioMode: "markdown" | "html";
  setBioMode: (mode: "markdown" | "html") => void;
}

const SNIPPETS = [
  { label: "+ <style>", code: "<style>\n  .vault-glow { color: #4edea3; text-shadow: 0 0 10px rgba(78,222,163,0.5); }\n</style>" },
  { label: "+ <button>", code: '<button class="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs">🎮 Meu Setup</button>' },
  { label: "+ Radio", code: '<div class="p-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono">🎵 Tocando Agora: Synthwave Radio</div>' },
  { label: "+ SVG", code: '<svg class="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2z"/></svg>' },
];

export default function CustomBioAccordion({
  isOpen,
  onToggle,
  markdownContent,
  setMarkdownContent,
  bioTab,
  setBioTab,
  bioMode,
  setBioMode,
}: CustomBioAccordionProps) {
  const insertSnippet = (snippet: string) => {
    setMarkdownContent((prev) => (prev ? `${prev}\n${snippet}` : snippet));
  };

  return (
    <div className={`rounded-2xl bg-[#141822] border transition-all duration-300 overflow-hidden shadow-sm ${
      isOpen ? "border-purple-500/40 ring-1 ring-purple-500/20" : "border-white/10"
    }`}>
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left transition-colors hover:bg-[#1a2130]/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[14px] text-white tracking-tight">
              4. Bio Estilizada (HTML/CSS &amp; MD)
            </h3>
            <p className="text-[11px] text-gray-400">
              Editor com snippets, rádio, tags e live preview
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-purple-400" : ""
          }`}
        />
      </button>

      {/* Body */}
      {isOpen && (
        <div className="p-4 space-y-3.5 border-t border-white/5 animate-fadeIn">
          {/* Format Selector: Markdown vs HTML/CSS */}
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Modo do Editor
            </label>
            <div className="flex bg-[#1a2130] p-0.5 rounded-lg border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setBioMode("markdown")}
                className={`px-3 py-1 rounded-md transition-all ${
                  bioMode === "markdown"
                    ? "bg-[#4edea3] text-black font-bold shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Markdown
              </button>
              <button
                type="button"
                onClick={() => setBioMode("html")}
                className={`px-3 py-1 rounded-md transition-all ${
                  bioMode === "html"
                    ? "bg-[#4edea3] text-black font-bold shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                HTML / CSS
              </button>
            </div>
          </div>

          {/* Sub-Tabs: Editor vs Preview */}
          <div className="flex bg-[#1a2130] p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setBioTab("editor")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                bioTab === "editor"
                  ? "bg-[#141822] text-[#4edea3] shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" /> Editor de Código
            </button>
            <button
              type="button"
              onClick={() => setBioTab("preview")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                bioTab === "preview"
                  ? "bg-[#141822] text-[#4edea3] shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Visualização Renderizada
            </button>
          </div>

          {/* Snippets Rápidos */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {SNIPPETS.map((snip) => (
              <button
                key={snip.label}
                type="button"
                onClick={() => insertSnippet(snip.code)}
                className="px-2 py-1 rounded-lg bg-[#1a2130] text-[11px] font-mono text-[#00E5FF] border border-white/10 hover:bg-[#1e2433] shrink-0 active:scale-95 transition-all"
              >
                {snip.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {bioTab === "editor" ? (
            <div className="space-y-1">
              <textarea
                rows={6}
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                placeholder="Insira código HTML/CSS estilizado ou Markdown customizado para o seu perfil..."
                className="w-full bg-[#08090d] rounded-xl p-3 font-mono text-xs text-[#4edea3] border border-white/10 focus:outline-none focus:border-[#00E5FF] leading-relaxed resize-none"
              />
              <div className="flex justify-between items-center text-[10px] text-gray-400 px-1">
                <span>Sanitização ativa contra XSS</span>
                <span className="font-mono">{markdownContent.length} caracteres</span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#1a2130] border border-[#4edea3]/30 min-h-[140px]">
              {markdownContent.trim() ? (
                <ProfileBioRenderer content={markdownContent} mode={bioMode} />
              ) : (
                <p className="text-xs text-gray-500 italic text-center py-6">
                  Nenhum conteúdo para visualizar. Digite algo no editor de código!
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
