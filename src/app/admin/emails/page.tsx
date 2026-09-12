"use client";

import React, { useState, useEffect, useMemo } from "react";
import { EmailTemplateConfig, SystemSettings } from "@/lib/types";
import { getSystemSettings, updateSystemSettings, auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  Mail,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Crown,
  Zap,
  RefreshCw,
  Smartphone,
  Monitor,
  Check,
  Plus,
  Trash2,
  Copy,
} from "lucide-react";

type TemplateType = "vipWelcome" | "proWelcome";

export default function AdminEmailsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("vipWelcome");

  // Formulário do template ativo
  const [subject, setSubject] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [defaultMessage, setDefaultMessage] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [accentColor, setAccentColor] = useState("");
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState("");

  // Preview, Viewport e Teste
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await getSystemSettings();
      setSettings(data);
      loadTemplateData(data, selectedTemplate);
    } catch (e) {
      console.error("Erro ao carregar configurações:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const loadTemplateData = (cfg: SystemSettings, tKey: TemplateType) => {
    const t = cfg.emailTemplates?.[tKey];
    if (tKey === "vipWelcome") {
      setSubject(t?.subject || "👑 Seu acesso VIP foi ativado no MyGameList");
      setBadgeText(t?.badgeText || "👑 ACESSO VIP EXCLUSIVO");
      setHeading(t?.heading || "Parabéns, {username}!");
      setSubheading(t?.subheading || "Você agora faz parte do nível <strong>Membro VIP</strong> com todas as funcionalidades premium desbloqueadas.");
      setDefaultMessage(t?.defaultMessage || "Concedemos a você acesso exclusivo de Membro VIP no MyGameList com 2.0x XP em dobro, sem anúncios e todos os recursos liberados.");
      setCtaText(t?.ctaText || "Acessar Meu Painel →");
      setCtaUrl(t?.ctaUrl || "https://www.mygameslist.com.br/perfil");
      setAccentColor(t?.accentColor || "#F59E0B");
      setBenefits(t?.benefits || [
        "Zero anúncios em toda a plataforma e aplicativo",
        "2.0x de XP em Dobro em todas as atividades",
        "Insígnia exclusiva e destaque brilhante no perfil",
        "Estatísticas avançadas e backup completo da biblioteca",
      ]);
    } else {
      setSubject(t?.subject || "⚡ Seu acesso PRO foi ativado no MyGameList");
      setBadgeText(t?.badgeText || "⚡ PLANO PRO ATIVADO");
      setHeading(t?.heading || "Parabéns, {username}!");
      setSubheading(t?.subheading || "Você agora faz parte do nível <strong>Membro PRO</strong> com velocidade de progressão turbinada.");
      setDefaultMessage(t?.defaultMessage || "Seu acesso PRO está liberado com 1.5x de XP Boost e navegação 100% livre de anúncios.");
      setCtaText(t?.ctaText || "Acessar Meu Painel →");
      setCtaUrl(t?.ctaUrl || "https://www.mygameslist.com.br/perfil");
      setAccentColor(t?.accentColor || "#10B981");
      setBenefits(t?.benefits || [
        "Zero anúncios em toda a plataforma e aplicativo",
        "1.5x de XP Boost de progressão",
        "Insígnia PRO em destaque no perfil",
        "Acesso antecipado a novos recursos da plataforma",
      ]);
    }
  };

  const handleTemplateSwitch = (key: TemplateType) => {
    setSelectedTemplate(key);
    if (settings) {
      loadTemplateData(settings, key);
    }
  };

  // Atualização em tempo real do preview
  const refreshPreview = async () => {
    setPreviewLoading(true);
    try {
      if (!auth?.currentUser) return;
      const token = await auth.currentUser.getIdToken();
      const currentConfig: EmailTemplateConfig = {
        subject,
        badgeText,
        heading,
        subheading,
        defaultMessage,
        ctaText,
        ctaUrl,
        accentColor,
        benefits,
      };

      const res = await fetch("/api/admin/emails/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          plan: selectedTemplate === "vipWelcome" ? "vip" : "pro",
          userName: user?.displayName || user?.username || "Leandro",
          template: currentConfig,
        }),
      });

      const data = await res.json();
      if (res.ok && data.html) {
        setPreviewHtml(data.html);
      }
    } catch (err) {
      console.error("Erro ao gerar preview:", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshPreview();
    }, 300);
    return () => clearTimeout(timer);
  }, [subject, badgeText, heading, subheading, defaultMessage, ctaText, ctaUrl, accentColor, benefits, selectedTemplate]);

  // Salvar no Firestore
  const handleSaveTemplate = async () => {
    if (!settings || !user) return;
    setIsSaving(true);
    try {
      const currentConfig: EmailTemplateConfig = {
        subject,
        badgeText,
        heading,
        subheading,
        defaultMessage,
        ctaText,
        ctaUrl,
        accentColor,
        benefits,
      };

      const updatedTemplates = {
        ...(settings.emailTemplates || {}),
        [selectedTemplate]: currentConfig,
      };

      await updateSystemSettings({ emailTemplates: updatedTemplates }, user.email);
      setSettings((prev) => (prev ? { ...prev, emailTemplates: updatedTemplates } : null));

      setToastMessage({ type: "success", text: "Alterações salvas com sucesso!" });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      setToastMessage({ type: "error", text: err?.message || "Falha ao salvar template." });
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  // Enviar Teste
  const handleSendTest = async () => {
    const target = testEmail.trim() || user?.email;
    if (!target || !target.includes("@")) {
      setToastMessage({ type: "error", text: "Digite um e-mail válido para testar." });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsSendingTest(true);
    try {
      if (!auth?.currentUser) throw new Error("Sessão expirada.");
      const token = await auth.currentUser.getIdToken();
      const currentConfig: EmailTemplateConfig = {
        subject,
        badgeText,
        heading,
        subheading,
        defaultMessage,
        ctaText,
        ctaUrl,
        accentColor,
        benefits,
      };

      const res = await fetch("/api/admin/emails/test", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          to: target,
          userName: user?.displayName || "Admin",
          plan: selectedTemplate === "vipWelcome" ? "vip" : "pro",
          template: currentConfig,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no disparo.");

      setToastMessage({ type: "success", text: `E-mail de teste enviado para ${target}` });
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage({ type: "error", text: err?.message || "Erro ao enviar e-mail." });
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsSendingTest(false);
    }
  };

  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    setBenefits((prev) => [...prev, newBenefit.trim()]);
    setNewBenefit("");
  };

  const removeBenefit = (index: number) => {
    setBenefits((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notificação */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-2xl border transition-all ${
            toastMessage.type === "success"
              ? "bg-[#10B981] text-black border-emerald-400"
              : "bg-rose-600 text-white border-rose-500"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header Bar — Padrão Linear / Stripe */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Templates de E-mail
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-semibold">
              Resend Ativo
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Personalize os comunicados transacionais enviados aos jogadores da plataforma.
          </p>
        </div>

        {/* Ações Globais: Seleção de Template e Salvar */}
        <div className="flex items-center gap-2">
          {/* Seletor Segmentado Linear */}
          <div className="bg-[#14161f] border border-white/10 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => handleTemplateSwitch("vipWelcome")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTemplate === "vipWelcome"
                  ? "bg-amber-500/20 text-amber-300 shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>VIP Welcome</span>
            </button>
            <button
              onClick={() => handleTemplateSwitch("proWelcome")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTemplate === "proWelcome"
                  ? "bg-emerald-500/20 text-emerald-300 shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>PRO Welcome</span>
            </button>
          </div>

          <button
            onClick={handleSaveTemplate}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-black font-semibold text-xs active:scale-95 transition-all shadow min-h-[38px]"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: Formulário à Esquerda e Live Preview à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Lado Esquerdo: Formulário Compacto em Seções Acordeon / Grupos */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Grupo 1: Assunto e Cabeçalho */}
          <div className="rounded-2xl bg-[#13161f] border border-white/10 p-5 space-y-4">
            <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
              Cabeçalho &amp; Assunto
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-gray-300 font-medium">Assunto da Mensagem</label>
                  <span className="text-[10px] text-gray-500 font-mono">{"{username}"}</span>
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white/30 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Selo / Badge</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Cor do Selo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-2.5 py-1.5 text-white font-mono uppercase text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Título Hero (Heading)</label>
                <input
                  type="text"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white/30 text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Subtítulo de Introdução</label>
                <textarea
                  value={subheading}
                  onChange={(e) => setSubheading(e.target.value)}
                  rows={2}
                  className="w-full bg-[#0c0d12] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/30 text-xs resize-none"
                />
              </div>
            </div>
          </div>

          {/* Grupo 2: Mensagem Padrão da Moderação */}
          <div className="rounded-2xl bg-[#13161f] border border-white/10 p-5 space-y-3">
            <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
              Nota Padrão da Equipe
            </h2>
            <p className="text-[11px] text-gray-400">
              Esta mensagem aparece na caixa de destaque do e-mail caso você não digite um recado customizado no envio.
            </p>
            <textarea
              value={defaultMessage}
              onChange={(e) => setDefaultMessage(e.target.value)}
              rows={3}
              className="w-full bg-[#0c0d12] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/30 text-xs resize-none"
            />
          </div>

          {/* Grupo 3: Benefícios & Botão CTA */}
          <div className="rounded-2xl bg-[#13161f] border border-white/10 p-5 space-y-4">
            <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
              Benefícios &amp; Chamada para Ação
            </h2>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="block text-gray-300 font-medium">Lista de Vantagens (Checklist)</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 bg-[#0c0d12] border border-white/5 rounded-xl px-3 py-2 text-gray-200"
                    >
                      <span className="text-xs truncate">{benefit}</span>
                      <button
                        type="button"
                        onClick={() => removeBenefit(idx)}
                        className="text-gray-500 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Adicionar novo benefício..."
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())}
                    className="flex-1 bg-[#0c0d12] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/30 text-xs"
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Texto do Botão</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Destino do Botão</label>
                  <input
                    type="text"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/30 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Live Preview Interativo (Desktop & Mobile) + Envio de Teste */}
        <div className="lg:col-span-7 space-y-4 sticky top-24">
          
          {/* Barra de Ferramentas do Preview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#13161f] border border-white/10 px-4 py-2.5 rounded-2xl">
            {/* Seletor de Viewport (Desktop vs Mobile) */}
            <div className="flex items-center gap-1 bg-[#0c0d12] p-1 rounded-xl border border-white/5 self-start">
              <button
                type="button"
                onClick={() => setPreviewViewport("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  previewViewport === "desktop" ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewViewport("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  previewViewport === "mobile" ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>

            {/* Caixa de Disparo de Teste Integrada */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder={user?.email || "seu-email@gmail.com"}
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full sm:w-56 bg-[#0c0d12] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSendingTest}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors shrink-0 disabled:opacity-50"
                title="Disparar e-mail de teste real pelo Resend"
              >
                {isSendingTest ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                <span>Testar</span>
              </button>
            </div>
          </div>

          {/* Janela de Preview com Suporte a Mobile Frame */}
          <div className="rounded-3xl bg-[#0c0d12] border border-white/10 p-4 sm:p-6 flex justify-center shadow-2xl min-h-[640px] overflow-hidden">
            <div
              className={`transition-all duration-300 w-full ${
                previewViewport === "mobile"
                  ? "max-w-[375px] rounded-3xl border border-white/15 shadow-2xl overflow-hidden bg-black"
                  : "max-w-[600px]"
              }`}
            >
              {/* Moldura de topo estilo browser/app */}
              {previewViewport === "mobile" && (
                <div className="bg-[#14161f] border-b border-white/10 px-4 py-2 flex items-center justify-between text-[11px] text-gray-400">
                  <div className="w-10 h-3 rounded-full bg-white/10" />
                  <span className="font-mono text-[10px]">9:41</span>
                  <div className="w-4 h-2.5 rounded-sm border border-white/20" />
                </div>
              )}

              <iframe
                title="Email Preview"
                srcDoc={previewHtml}
                className="w-full h-[620px] border-0 bg-[#0c0d12]"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
