"use client";

import React from "react";
import { EmailTemplateConfig } from "@/lib/types";
import { Plus, Trash2, Palette, Sparkles, Layout, MessageSquare, Link as LinkIcon } from "lucide-react";

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
  const updateField = <K extends keyof EmailTemplateConfig>(field: K, value: EmailTemplateConfig[K]) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Bloco 1: Assunto & Entregabilidade */}
      <div className="rounded-2xl bg-[#13161f] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Cabeçalho &amp; Caixa de Entrada</h3>
          </div>
          <span className="text-[11px] text-gray-500 font-mono">Resend Delivery</span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-200">Linha de Assunto</label>
              <span className="text-[10px] text-emerald-400/80 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                tag: &#123;username&#125;
              </span>
            </div>
            <input
              type="text"
              value={config.subject || ""}
              onChange={(e) => updateField("subject", e.target.value)}
              placeholder="Ex: 👑 Seu acesso VIP foi ativado no MyGameList"
              className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-white/30 transition-colors"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              O que o usuário vê na lista de e-mails antes de abrir.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-200">Pré-cabeçalho (Preheader Oculto)</label>
              <span className="text-[10px] text-gray-500">Inbox Snippet</span>
            </div>
            <input
              type="text"
              value={config.preheader || ""}
              onChange={(e) => updateField("preheader", e.target.value)}
              placeholder="Ex: Seus benefícios exclusivos de membro já estão ativos..."
              className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-white/30 transition-colors"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Texto de resumo que aparece logo após o assunto em clientes como Gmail e Apple Mail.
            </p>
          </div>
        </div>
      </div>

      {/* Bloco 2: Hero Visual e Tipografia */}
      <div className="rounded-2xl bg-[#13161f] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Conteúdo Hero do E-mail</h3>
          </div>
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] text-gray-400">Estilo Visual</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <label className="block text-xs font-semibold text-gray-200 mb-1.5">Texto da Pílula / Selo (Badge)</label>
              <input
                type="text"
                value={config.badgeText || ""}
                onChange={(e) => updateField("badgeText", e.target.value)}
                placeholder="Ex: 👑 ACESSO VIP EXCLUSIVO"
                className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-gray-200 mb-1.5">Cor de Acento</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.accentColor || "#10B981"}
                  onChange={(e) => updateField("accentColor", e.target.value)}
                  className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0 shrink-0"
                />
                <input
                  type="text"
                  value={config.accentColor || "#10B981"}
                  onChange={(e) => updateField("accentColor", e.target.value)}
                  className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-3 py-2 text-white font-mono uppercase text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-200 mb-1.5">Título Principal (Heading)</label>
            <input
              type="text"
              value={config.heading || ""}
              onChange={(e) => updateField("heading", e.target.value)}
              placeholder="Ex: Parabéns, {username}!"
              className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-200 mb-1.5">Subtítulo / Introdução (Aceita HTML)</label>
            <textarea
              rows={2}
              value={config.subheading || ""}
              onChange={(e) => updateField("subheading", e.target.value)}
              placeholder="Ex: Você agora faz parte do nível <strong>Membro VIP</strong>..."
              className="w-full bg-[#0c0d12] border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-white/30 resize-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Bloco 3: Nota Padrão da Moderação */}
      <div className="rounded-2xl bg-[#13161f] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Nota Padrão da Equipe</h3>
          </div>
          <span className="text-[11px] text-gray-500">Opcional no Envio Manual</span>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          Esta mensagem é apresentada em um card escuro de destaque no corpo do e-mail. Se o administrador preencher uma mensagem personalizada ao conceder VIP na tabela de usuários, aquela mensagem substituirá esta nota padrão.
        </p>

        <textarea
          rows={3}
          value={config.defaultMessage || ""}
          onChange={(e) => updateField("defaultMessage", e.target.value)}
          placeholder="Ex: Concedemos a você acesso exclusivo com 2.0x XP em dobro..."
          className="w-full bg-[#0c0d12] border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-white/30 resize-none transition-colors"
        />
      </div>

      {/* Bloco 4: Benefícios e Checklist */}
      <div className="rounded-2xl bg-[#13161f] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Lista de Benefícios Inclusos</h3>
          </div>
          <span className="text-[11px] text-gray-500">{config.benefits?.length || 0} itens configurados</span>
        </div>

        <div className="space-y-2">
          {config.benefits?.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 bg-[#0c0d12] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-gray-200 group hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span style={{ color: config.accentColor || "#10B981" }} className="font-bold shrink-0">
                  ✓
                </span>
                <span className="truncate">{item}</span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveBenefit(idx)}
                className="text-gray-500 hover:text-rose-400 p-1 rounded-lg transition-colors opacity-80 group-hover:opacity-100"
                title="Remover benefício"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            placeholder="Adicionar novo benefício (ex: Desconto exclusivo em parceiros)..."
            value={newBenefit}
            onChange={(e) => setNewBenefit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAddBenefit())}
            className="flex-1 bg-[#0c0d12] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-white/30 transition-colors"
          />
          <button
            type="button"
            onClick={onAddBenefit}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>

      {/* Bloco 5: Botões de Chamada para Ação (CTA) e Rodapé */}
      <div className="rounded-2xl bg-[#13161f] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Botões de Ação (CTA) &amp; Rodapé</h3>
          </div>
          <span className="text-[11px] text-gray-500">Conversão</span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-200 mb-1.5">Texto do Botão Primário</label>
              <input
                type="text"
                value={config.ctaText || ""}
                onChange={(e) => updateField("ctaText", e.target.value)}
                placeholder="Ex: Acessar Meu Painel →"
                className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-200 mb-1.5">Link de Destino Primário</label>
              <input
                type="text"
                value={config.ctaUrl || ""}
                onChange={(e) => updateField("ctaUrl", e.target.value)}
                placeholder="https://www.mygameslist.com.br/perfil"
                className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <div>
              <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                Botão Secundário (Opcional)
              </label>
              <input
                type="text"
                value={config.secondaryCtaText || ""}
                onChange={(e) => updateField("secondaryCtaText", e.target.value)}
                placeholder="Ex: Ver Minhas Conquistas"
                className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-200 mb-1.5">Link do Botão Secundário</label>
              <input
                type="text"
                value={config.secondaryCtaUrl || ""}
                onChange={(e) => updateField("secondaryCtaUrl", e.target.value)}
                placeholder="https://www.mygameslist.com.br/perfil#badges"
                className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            <label className="block text-xs font-semibold text-gray-200 mb-1.5">Texto de Rodapé (HTML permitido)</label>
            <input
              type="text"
              value={config.footerText || ""}
              onChange={(e) => updateField("footerText", e.target.value)}
              placeholder="Ex: Você recebeu esta notificação porque sua conta foi atualizada..."
              className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
