"use client";

import React, { useState } from "react";
import { FeedbackCategory, FEEDBACK_CATEGORIES, UserProfile, FeedbackItem } from "@/lib/types";
import {
  validateFeedbackSpam,
  checkFeedbackCooldown,
  recordFeedbackSubmission,
  checkDuplicateFeedback,
} from "@/lib/antiSpam";
import {
  X,
  Plus,
  Lightbulb,
  Bug,
  Zap,
  MessageSquare,
  Gift,
  Sparkles,
  AlertCircle,
  Loader2,
  Send,
  ShieldCheck,
} from "lucide-react";

interface NewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    category: FeedbackCategory;
  }) => Promise<void>;
  user: UserProfile | null;
  onRequireAuth: () => void;
  existingFeedbacks?: FeedbackItem[];
}

export default function NewFeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  onRequireAuth,
  existingFeedbacks = [],
}: NewFeedbackModalProps) {
  const [category, setCategory] = useState<FeedbackCategory>("idea");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }

    const cleanTitle = title.trim();
    const cleanDesc = description.trim();

    // 1. Verificação de Cooldown / Limite Diário (Anti-Spam)
    const cooldown = checkFeedbackCooldown(user.uid);
    if (!cooldown.allowed) {
      setError(cooldown.reason || "Por favor, aguarde alguns segundos antes de postar novamente.");
      return;
    }

    // 2. Verificação de Duplicidade (Anti-Spam)
    if (existingFeedbacks && existingFeedbacks.length > 0) {
      const dup = checkDuplicateFeedback(user.uid, cleanTitle, existingFeedbacks);
      if (dup.isDuplicate) {
        setError(dup.reason || "Você já postou uma sugestão idêntica anteriormente.");
        return;
      }
    }

    // 3. Validação Profunda Anti-Fraude e Anti-Spam
    const validation = validateFeedbackSpam(cleanTitle, cleanDesc, honeypot);
    if (!validation.isValid) {
      setError(validation.error || "Conteúdo rejeitado pelo sistema de segurança.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: cleanTitle,
        description: cleanDesc,
        category,
      });
      // Registra timestamp no anti-spam
      recordFeedbackSubmission(user.uid);
      setTitle("");
      setDescription("");
      setCategory("idea");
      setHoneypot("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Erro ao publicar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlaceholder = () => {
    switch (category) {
      case "bug":
        return "Descreva detalhadamente o erro:\n1. O que você estava fazendo quando o erro ocorreu?\n2. O que aconteceu de inesperado?\n3. Qual seu navegador/dispositivo? (Ex: Safari iPhone, Chrome PC)";
      case "improvement":
        return "Descreva qual parte do site você gostaria de ver melhorada, mais rápida ou mais intuitiva e o porquê...";
      case "idea":
        return "Explique sua ideia de recurso novo:\n- Qual funcionalidade você gostaria de ver no MyGameList?\n- Como você imagina que ela funcionaria na prática?";
      case "feedback":
      default:
        return "Escreva aqui sua mensagem, sugestão ou elogio para a equipe de desenvolvimento...";
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] !m-0 !mt-0 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#14161e] border border-white/10 p-5 sm:p-8 shadow-2xl space-y-6 text-white max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00E5FF] text-xs font-semibold">
            <Lightbulb className="w-3.5 h-3.5" />
            Voz da Comunidade MyGameList
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Enviar Ideia, Recurso ou Reportar Bug
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Sua sugestão ficará visível para toda a comunidade votar. Propostas mais votadas e bugs críticos analisados são recompensados com vantagens reais!
          </p>
        </div>

        {/* Banner de Incentivo de Recompensas */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/30 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-amber-300">Programa Oficial de Recompensas</h4>
            <p className="text-neutral-300 leading-relaxed text-[11px] sm:text-xs">
              Usuários que identificarem falhas/erros ou derem ideias de alto impacto que forem implementadas recebem <strong>Acesso VIP Vitalício</strong>, <strong>Plano PRO</strong> ou <strong>Tags Customizadas Exclusivas</strong> no perfil!
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seletor de Categoria em Grade de Botões */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
              Selecione o Tipo da Publicação
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FEEDBACK_CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 active:scale-95 ${
                      isSelected
                        ? "bg-cyan-500/15 border-[#00E5FF] ring-2 ring-[#00E5FF]/40 text-white"
                        : "bg-white/5 border-white/10 hover:border-white/20 text-neutral-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      {cat.id === "idea" && <Lightbulb className={`w-4 h-4 ${isSelected ? "text-[#00E5FF]" : "text-neutral-400"}`} />}
                      {cat.id === "bug" && <Bug className={`w-4 h-4 ${isSelected ? "text-rose-400" : "text-neutral-400"}`} />}
                      {cat.id === "improvement" && <Zap className={`w-4 h-4 ${isSelected ? "text-amber-400" : "text-neutral-400"}`} />}
                      {cat.id === "feedback" && <MessageSquare className={`w-4 h-4 ${isSelected ? "text-purple-400" : "text-neutral-400"}`} />}
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />}
                    </div>
                    <span className="text-xs font-bold">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campo de Título */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-neutral-300">
                Título Curto e Objetivo <span className="text-[#00E5FF]">*</span>
              </label>
              <span className={`text-[10px] font-mono ${title.length > 110 ? "text-amber-400" : "text-neutral-400"}`}>
                {title.length}/120
              </span>
            </div>
            <input
              type="text"
              placeholder="Ex: Adicionar filtro de lançamentos por mês no calendário"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              required
              className="w-full bg-[#0e1015] border border-white/10 focus:border-[#00E5FF] rounded-2xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Campo de Descrição */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-neutral-300">
                Explicação Detalhada <span className="text-[#00E5FF]">*</span>
              </label>
              <span className={`text-[10px] font-mono ${description.length > 2800 ? "text-amber-400" : "text-neutral-400"}`}>
                {description.length}/3000
              </span>
            </div>
            <textarea
              placeholder={getPlaceholder()}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={3000}
              rows={6}
              required
              className="w-full bg-[#0e1015] border border-white/10 focus:border-[#00E5FF] rounded-2xl p-4 text-sm text-white placeholder:text-neutral-500 focus:outline-none transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Campo Invisível Honeypot Anti-Bot */}
          <div aria-hidden="true" style={{ display: "none", position: "absolute", left: "-9999px" }}>
            <label htmlFor="website_url_hp">Deixe em branco se for humano</label>
            <input
              id="website_url_hp"
              type="text"
              name="website_url_hp"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botões de Ação & Selo de Segurança */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5 pt-4">
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Protegido por Anti-Spam &amp; Anti-Fraude</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-[#00E5FF] hover:from-cyan-300 hover:to-cyan-200 text-black text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publicar para Votação</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
