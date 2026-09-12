"use client";

import React, { useState } from "react";
import { EmailTemplateConfig } from "@/lib/types";
import {
  Plus,
  Trash2,
  Palette,
  Sparkles,
  Mail,
  MessageSquare,
  Link as LinkIcon,
  HelpCircle,
  GripVertical,
  CheckCircle2,
  ExternalLink,
  Type,
  FileText,
  SlidersHorizontal,
} from "lucide-react";

interface EmailTemplateEditorProps {
  config: EmailTemplateConfig;
  onChange: (updated: EmailTemplateConfig) => void;
  newBenefit: string;
  setNewBenefit: (val: string) => void;
  onAddBenefit: () => void;
  onRemoveBenefit: (index: number) => void;
}

export function EmailTemplateEditor({
  config,
  onChange,
  newBenefit,
  setNewBenefit,
  onAddBenefit,
  onRemoveBenefit,
}: EmailTemplateEditorProps) {
  const [showMetadata, setShowMetadata] = useState(true);

  const updateField = <K extends keyof EmailTemplateConfig>(field: K, value: EmailTemplateConfig[K]) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  const updateBenefit = (index: number, value: string) => {
    const updated = [...(config.benefits || [])];
    updated[index] = value;
    updateField("benefits", updated);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Barra de Propriedades do Documento / Notion Document Header */}
      <div className="bg-[#12141d] border border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-gray-300">Propriedades de Entrega do Template</span>
          </div>
          <button
            type="button"
            onClick={() => setShowMetadata(!showMetadata)}
            className="text-[11px] text-gray-400 hover:text-white transition-colors underline font-mono"
          >
            {showMetadata ? "Ocultar propriedades" : "Exibir propriedades"}
          </button>
        </div>

        {showMetadata && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs pt-1 border-t border-white/5">
            {/* Subject */}
            <div className="md:col-span-12 flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-gray-500 font-mono text-[11px] w-28 shrink-0 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Assunto:
              </span>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={config.subject || ""}
                  onChange={(e) => updateField("subject", e.target.value)}
                  placeholder="Assunto do e-mail..."
                  className="w-full bg-[#0a0b10] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Preheader */}
            <div className="md:col-span-12 flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-gray-500 font-mono text-[11px] w-28 shrink-0 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Preheader:
              </span>
              <input
                type="text"
                value={config.preheader || ""}
                onChange={(e) => updateField("preheader", e.target.value)}
                placeholder="Texto pré-visualizado no app de email..."
                className="flex-1 bg-[#0a0b10] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Imagem / Logo do Perfil do Site */}
            <div className="md:col-span-12 flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-gray-500 font-mono text-[11px] w-28 shrink-0 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Imagem / Logo:
              </span>
              <div className="flex-1 flex items-center gap-2">
                <img
                  src={config.logoUrl || "https://www.mygameslist.com.br/icon-192.png"}
                  alt="Logo Preview"
                  className="w-7 h-7 rounded-lg object-cover border border-white/10 shrink-0 bg-black/40"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "https://www.mygameslist.com.br/icon-192.png";
                  }}
                />
                <input
                  type="text"
                  value={config.logoUrl || ""}
                  onChange={(e) => updateField("logoUrl", e.target.value)}
                  placeholder="https://www.mygameslist.com.br/icon-192.png"
                  className="flex-1 bg-[#0a0b10] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500/50 font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Cor de Acento */}
            <div className="md:col-span-6 flex items-center gap-2">
              <span className="text-gray-500 font-mono text-[11px] w-28 shrink-0 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Cor de Acento:
              </span>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="color"
                  value={config.accentColor || "#10B981"}
                  onChange={(e) => updateField("accentColor", e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 shrink-0"
                />
                <input
                  type="text"
                  value={config.accentColor || "#10B981"}
                  onChange={(e) => updateField("accentColor", e.target.value)}
                  className="w-full bg-[#0a0b10] border border-white/10 rounded-lg px-2.5 py-1 text-white font-mono uppercase text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Variável Help */}
            <div className="md:col-span-6 flex items-center text-[11px] text-gray-500 gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Use <code>&#123;username&#125;</code> para inserir o nome do jogador.</span>
            </div>
          </div>
        )}
      </div>

      {/* Editor Estilo Notion / Tela Canvas WYSIWYG */}
      <div className="bg-[#12141e] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Top bar decorativo estilo documento Notion */}
        <div className="flex items-center justify-between text-gray-500 text-xs pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="font-mono text-[11px] text-gray-400">canvas / template</span>
          </div>
          <span className="text-[11px] text-gray-500 font-mono">Clique nos blocos para editar</span>
        </div>

        {/* Topo: Logo & Identidade Visual do Site */}
        <div className="flex items-center gap-3 pb-2">
          <img
            src={config.logoUrl || "https://www.mygameslist.com.br/icon-192.png"}
            alt="Site Logo"
            className="w-10 h-10 rounded-xl object-cover border border-white/15 shadow-md shrink-0 bg-[#0c0d12]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "https://www.mygameslist.com.br/icon-192.png";
            }}
          />
          <div>
            <span className="text-base font-black tracking-tight text-white block">
              MYGAME<span className="text-emerald-400">LIST</span>
            </span>
            <span className="text-[11px] text-gray-500 font-mono">Ícone de perfil oficial</span>
          </div>
        </div>

        {/* Bloco 1: Badge / Pílula Flutuante */}
        <div className="group relative">
          <div className="inline-flex items-center gap-2">
            <input
              type="text"
              value={config.badgeText || ""}
              onChange={(e) => updateField("badgeText", e.target.value)}
              placeholder="Ex: 👑 ACESSO VIP EXCLUSIVO"
              style={{ color: config.accentColor || "#10B981" }}
              className="bg-white/5 hover:bg-white/10 focus:bg-[#0c0d12] border border-white/10 focus:border-emerald-500/50 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider focus:outline-none transition-all cursor-text min-w-[220px]"
            />
          </div>
        </div>

        {/* Bloco 2: Título Principal H1 (Notion Page Title) */}
        <div className="group relative">
          <textarea
            rows={1}
            value={config.heading || ""}
            onChange={(e) => updateField("heading", e.target.value)}
            placeholder="Título do Email (Ex: Parabéns, {username}!)"
            className="w-full bg-transparent hover:bg-white/[0.02] focus:bg-[#0c0d12]/50 border-0 focus:border border-white/10 rounded-xl px-2 py-1 text-2xl sm:text-3xl font-black text-white tracking-tight focus:outline-none transition-all resize-none placeholder:text-gray-600 leading-tight"
            style={{ minHeight: "44px" }}
          />
        </div>

        {/* Bloco 3: Subtítulo / Introdução (Notion Body Text) */}
        <div className="group relative">
          <textarea
            rows={2}
            value={config.subheading || ""}
            onChange={(e) => updateField("subheading", e.target.value)}
            placeholder="Subtítulo ou introdução (suporta <strong>tags</strong> HTML)..."
            className="w-full bg-transparent hover:bg-white/[0.02] focus:bg-[#0c0d12]/50 border-0 focus:border border-white/10 rounded-xl px-2 py-1 text-sm text-gray-300 leading-relaxed focus:outline-none transition-all resize-none placeholder:text-gray-600"
          />
        </div>

        {/* Bloco 4: Callout Box da Nota da Equipe (Notion Callout Block) */}
        <div className="group rounded-2xl bg-[#0b0d13] border border-white/10 p-5 space-y-2 relative transition-all focus-within:border-emerald-500/40">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>Nota da Equipe (Mensagem Padrão)</span>
          </div>
          <textarea
            rows={3}
            value={config.defaultMessage || ""}
            onChange={(e) => updateField("defaultMessage", e.target.value)}
            placeholder="Escreva a mensagem padrão de boas-vindas do moderador..."
            className="w-full bg-transparent border-0 text-xs sm:text-sm text-gray-200 leading-relaxed focus:outline-none resize-none placeholder:text-gray-600 p-0"
          />
          <p className="text-[10px] text-gray-500 pt-1 border-t border-white/5 font-mono">
            💡 Esta mensagem será substituída caso você digite um recado individual ao conceder VIP.
          </p>
        </div>

        {/* Bloco 5: Checklist Interativo de Benefícios (Notion To-do List) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 pb-1 border-b border-white/5">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>O que está incluso no seu acesso (Checklist Notion)</span>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">{config.benefits?.length || 0} itens</span>
          </div>

          <div className="space-y-2">
            {config.benefits?.map((benefit, index) => (
              <div
                key={index}
                className="group flex items-center gap-2.5 bg-[#0b0d13]/60 hover:bg-[#0b0d13] border border-white/5 hover:border-white/15 rounded-xl px-3 py-2 transition-all"
              >
                <GripVertical className="w-3.5 h-3.5 text-gray-600 cursor-grab shrink-0 opacity-40 group-hover:opacity-100" />
                <span
                  style={{ color: config.accentColor || "#10B981" }}
                  className="font-bold text-sm shrink-0"
                >
                  ✓
                </span>
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => updateBenefit(index, e.target.value)}
                  className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-gray-200 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => onRemoveBenefit(index)}
                  className="text-gray-600 hover:text-rose-400 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  title="Remover este item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Adicionar novo benefício inline */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="+ Adicionar novo benefício ao checklist (Pressione Enter)..."
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAddBenefit())}
              className="flex-1 bg-[#0b0d13] border border-dashed border-white/15 hover:border-white/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
            <button
              type="button"
              onClick={onAddBenefit}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>
        </div>

        {/* Bloco 6: Botões de Ação CTA (Notion Action Block) */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Botões de Conversão (Call to Action)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Botão Primário */}
            <div className="flex items-center gap-1.5 bg-[#0b0d13] border border-white/10 rounded-xl p-1.5">
              <input
                type="text"
                value={config.ctaText || ""}
                onChange={(e) => updateField("ctaText", e.target.value)}
                placeholder="Texto do Botão Primário"
                style={{ backgroundColor: config.accentColor || "#10B981" }}
                className="rounded-lg px-4 py-2 text-xs font-bold text-black focus:outline-none shrink-0"
              />
              <input
                type="text"
                value={config.ctaUrl || ""}
                onChange={(e) => updateField("ctaUrl", e.target.value)}
                placeholder="https://destino..."
                className="bg-transparent border-0 text-xs text-gray-300 px-2 py-1 focus:outline-none w-48 sm:w-60"
              />
            </div>

            {/* Botão Secundário Opcional */}
            <div className="flex items-center gap-1.5 bg-[#0b0d13] border border-white/10 rounded-xl p-1.5">
              <input
                type="text"
                value={config.secondaryCtaText || ""}
                onChange={(e) => updateField("secondaryCtaText", e.target.value)}
                placeholder="+ Botão Secundário (opcional)"
                className="bg-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none shrink-0"
              />
              <input
                type="text"
                value={config.secondaryCtaUrl || ""}
                onChange={(e) => updateField("secondaryCtaUrl", e.target.value)}
                placeholder="https://destino-secundario..."
                className="bg-transparent border-0 text-xs text-gray-300 px-2 py-1 focus:outline-none w-40 sm:w-52"
              />
            </div>
          </div>
        </div>

        {/* Bloco 7: Rodapé Discreto (Notion Footer Block) */}
        <div className="pt-6 border-t border-white/5 space-y-2">
          <div className="text-[11px] text-gray-500 font-mono flex items-center justify-between">
            <span>Rodapé Legal &amp; Unsubscribe</span>
            <span>Suporta HTML simples</span>
          </div>
          <textarea
            rows={2}
            value={config.footerText || ""}
            onChange={(e) => updateField("footerText", e.target.value)}
            placeholder="Você recebeu esta notificação porque sua conta foi atualizada..."
            className="w-full bg-[#0b0d13] border border-white/5 rounded-xl p-3 text-xs text-gray-400 focus:outline-none focus:border-white/20 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
