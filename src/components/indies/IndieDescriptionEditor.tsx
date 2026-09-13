"use client";

import React, { useState } from "react";
import ArticleRichEditor from "@/components/admin/ArticleRichEditor";
import IndieDescriptionRenderer from "./IndieDescriptionRenderer";
import {
  Sparkles,
  FileText,
  Code2,
  Eye,
  FileCode,
  Bold,
  Italic,
  Heading,
  List,
  ListOrdered,
  Quote,
  Table,
  Link2,
  Image as ImageIcon,
} from "lucide-react";

interface IndieDescriptionEditorProps {
  content: string;
  onChange: (content: string) => void;
  mode?: "tiptap" | "html" | "markdown" | null;
  onModeChange: (mode: "tiptap" | "html" | "markdown") => void;
  placeholder?: string;
}

export default function IndieDescriptionEditor({
  content,
  onChange,
  mode = "markdown",
  onModeChange,
  placeholder = "Apresente a história, mecânicas, ambientação e diferenciais do seu jogo...",
}: IndieDescriptionEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const currentMode = mode || "markdown";

  const insertSnippet = (prefix: string, suffix: string = "") => {
    onChange(`${content}\n${prefix}Texto${suffix}\n`);
  };

  return (
    <div className="space-y-3">
      {/* Barra superior: Escolha de Formato (3 Modos) + Toggle Edição / Preview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        {/* Seletor dos 3 Formatos */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/10 flex-wrap">
          <button
            type="button"
            onClick={() => onModeChange("tiptap")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === "tiptap"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tiptap Editor</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange("html")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === "html"
                ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>HTML &amp; CSS Puro</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange("markdown")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === "markdown"
                ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown &amp; GIFs</span>
          </button>
        </div>

        {/* Alternador Editor vs Pré-visualização */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "edit"
                ? "bg-white/20 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "preview"
                ? "bg-emerald-500 text-black shadow-sm font-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Prévia</span>
          </button>
        </div>
      </div>

      {/* Conteúdo: Pré-visualização ou Área de Escrita */}
      {activeTab === "preview" ? (
        <div className="rounded-2xl bg-black/40 border border-white/10 p-5 min-h-[220px]">
          <IndieDescriptionRenderer content={content} mode={currentMode} />
        </div>
      ) : (
        <>
          {/* MODO 1: TIPTAP RICH TEXT EDITOR */}
          {currentMode === "tiptap" && (
            <div className="space-y-2">
              <ArticleRichEditor
                content={content}
                onChange={onChange}
                placeholder={placeholder}
              />
              <p className="text-[11px] text-gray-400">
                💡 Utilize as ferramentas superiores do Tiptap para formatar títulos, listas, destaques, links e imagens com visual nativo.
              </p>
            </div>
          )}

          {/* MODO 2: HTML5 & CSS3 PURO */}
          {currentMode === "html" && (
            <div className="space-y-2">
              <textarea
                rows={10}
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder="<div style='...'>\n  <h2>Sobre o Jogo</h2>\n  <p>Conteúdo em HTML...</p>\n</div>"
                className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-emerald-300 text-xs font-mono focus:outline-none focus:border-purple-500 resize-y leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>⚡ Suporte a HTML5, tags semânticas, estilos inline e SVG.</span>
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      `<div style="display:flex; flex-direction:column; gap:16px;">\n  <h2 style="color:#10b981; font-weight:800; font-size:1.25rem;">🎮 Visão Geral do Jogo</h2>\n  <p style="color:#d1d5db; line-height:1.6;">Escreva aqui a descrição estruturada com estilos exclusivos...</p>\n</div>`
                    )
                  }
                  className="text-purple-400 hover:underline cursor-pointer"
                >
                  Inserir modelo base
                </button>
              </div>
            </div>
          )}

          {/* MODO 3: MARKDOWN & GIFS */}
          {currentMode === "markdown" && (
            <div className="space-y-2">
              {/* Barra de Ações Rápidas de Markdown */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => insertSnippet("**", "**")}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white"
                  title="Negrito"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet("*", "*")}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white"
                  title="Itálico"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(`${content}\n### Título da Seção\n`)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white"
                  title="Título H3"
                >
                  <Heading className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(`${content}\n- Item de lista 1\n- Item de lista 2\n`)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white"
                  title="Lista com marcadores"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(`${content}\n1. Primeiro passo\n2. Segundo passo\n`)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white"
                  title="Lista numerada"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(`${content}\n> "Citação marcante ou destaque do jogo."\n`)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white"
                  title="Citação / Callout"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      `${content}\n| Característica | Detalhe |\n| :--- | :--- |\n| Motor | Unity / Unreal |\n| Idiomas | Português (BR) |\n`
                    )
                  }
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white"
                  title="Tabela"
                >
                  <Table className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(`${content}\n[Texto do Link](https://seusite.com)\n`)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white"
                  title="Link"
                >
                  <Link2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange(`${content}\n![GIF ou Imagem](https://media.giphy.com/media/.../giphy.gif)\n`)
                  }
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white"
                  title="Imagem / GIF"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              <textarea
                rows={9}
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs font-sans focus:outline-none focus:border-cyan-500 resize-y leading-relaxed"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
