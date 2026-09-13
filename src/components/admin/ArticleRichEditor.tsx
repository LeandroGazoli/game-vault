"use client";

import React, { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link2,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Code,
} from "lucide-react";

interface ArticleRichEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function ArticleRichEditor({
  content,
  onChange,
  placeholder = "Comece a escrever seu artigo... Use a barra de ferramentas para formatar títulos, listas, citações, links e imagens.",
}: ArticleRichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-emerald-400 underline underline-offset-4 hover:text-emerald-300 font-medium cursor-pointer",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "rounded-2xl max-w-full my-4 border border-white/10 shadow-lg object-cover mx-auto",
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty before:text-gray-500 before:content-[attr(data-placeholder)] before:float-left before:pointer-events-none before:h-0",
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] max-h-[500px] overflow-y-auto px-4 py-3 text-sm text-gray-200 focus:outline-none leading-relaxed prose prose-invert prose-emerald max-w-none font-sans",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Digite o URL do link:", previousUrl || "https://");

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Insira a URL da imagem:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rounded-2xl bg-black/40 border border-white/10 overflow-hidden focus-within:border-emerald-500 transition-colors">
      {/* Toolbar estilo Notion/WordPress */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#12141a] border-b border-white/10 select-none">
        {/* Desfazer / Refazer */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Desfazer (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Refazer (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-1" />

        {/* Títulos H1, H2, H3 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
            editor.isActive("heading", { level: 1 })
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
          title="Título Principal (H1)"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
          title="Subtítulo Seção (H2)"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
          title="Subtítulo Menor (H3)"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-1" />

        {/* Formatação básica: B, I, S, Code */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("bold")
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
          title="Negrito (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("italic")
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
          title="Itálico (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("strike")
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
          title="Tachado"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("code")
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
          title="Código em linha"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-1" />

        {/* Listas e Blocos */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("bulletList")
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
          title="Lista com Marcadores"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("orderedList")
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
          title="Lista Numerada"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("blockquote")
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
          title="Citação em Destaque / Callout"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Linha Divisória"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-1" />

        {/* Links e Imagens */}
        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("link")
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
          title="Inserir Link"
        >
          <Link2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Inserir Imagem via URL"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Área de Escrita */}
      <EditorContent editor={editor} />
    </div>
  );
}
