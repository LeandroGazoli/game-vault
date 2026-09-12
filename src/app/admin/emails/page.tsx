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
  Sliders,
  Eye,
  RotateCcw,
} from "lucide-react";
import { EmailTemplateEditor } from "@/components/admin/EmailTemplateEditor";

type TemplateType = "vipWelcome" | "proWelcome";

export default function AdminEmailsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("vipWelcome");

  // Aba principal de navegação: "editor" vs "preview"
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  // Estado do template em edição
  const [templateConfig, setTemplateConfig] = useState<EmailTemplateConfig>({
    subject: "",
    preheader: "",
    logoUrl: "https://www.mygameslist.com.br/icon-192.png",
    badgeText: "",
    heading: "",
    subheading: "",
    defaultMessage: "",
    ctaText: "",
    ctaUrl: "",
    secondaryCtaText: "",
    secondaryCtaUrl: "",
    accentColor: "#F59E0B",
    benefits: [],
    footerText: "",
  });

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
      setTemplateConfig({
        subject: t?.subject || "👑 Seu acesso VIP foi ativado no MyGameList",
        preheader: t?.preheader || "Aproveite 2.0x XP em dobro, sem anúncios e recursos exclusivos liberados.",
        logoUrl: t?.logoUrl || "https://www.mygameslist.com.br/icon-192.png",
        badgeText: t?.badgeText || "👑 ACESSO VIP EXCLUSIVO",
        heading: t?.heading || "Parabéns, {username}!",
        subheading: t?.subheading || "Você agora faz parte do nível <strong>Membro VIP</strong> com todas as funcionalidades premium desbloqueadas.",
        defaultMessage: t?.defaultMessage || "Concedemos a você acesso exclusivo de Membro VIP no MyGameList com 2.0x XP em dobro, sem anúncios e todos os recursos liberados.",
        ctaText: t?.ctaText || "Acessar Meu Painel →",
        ctaUrl: t?.ctaUrl || "https://www.mygameslist.com.br/perfil",
        secondaryCtaText: t?.secondaryCtaText || "Ver Conquistas VIP",
        secondaryCtaUrl: t?.secondaryCtaUrl || "https://www.mygameslist.com.br/perfil#badges",
        accentColor: t?.accentColor || "#F59E0B",
        benefits: t?.benefits || [
          "Zero anúncios em toda a plataforma e aplicativo",
          "2.0x de XP em Dobro em todas as atividades",
          "Insígnia exclusiva e destaque brilhante no perfil",
          "Estatísticas avançadas e backup completo da biblioteca",
        ],
        footerText: t?.footerText || "Você recebeu esta notificação porque sua conta foi atualizada no <a href=\"https://www.mygameslist.com.br\" style=\"color: #6b7280; text-decoration: underline;\">MyGameList</a>.",
      });
    } else {
      setTemplateConfig({
        subject: t?.subject || "⚡ Seu acesso PRO foi ativado no MyGameList",
        preheader: t?.preheader || "Aproveite 1.5x XP Boost e navegação sem anúncios.",
        logoUrl: t?.logoUrl || "https://www.mygameslist.com.br/icon-192.png",
        badgeText: t?.badgeText || "⚡ PLANO PRO ATIVADO",
        heading: t?.heading || "Parabéns, {username}!",
        subheading: t?.subheading || "Você agora faz parte do nível <strong>Membro PRO</strong> com velocidade de progressão turbinada.",
        defaultMessage: t?.defaultMessage || "Seu acesso PRO está liberado com 1.5x de XP Boost e navegação 100% livre de anúncios.",
        ctaText: t?.ctaText || "Acessar Meu Painel →",
        ctaUrl: t?.ctaUrl || "https://www.mygameslist.com.br/perfil",
        secondaryCtaText: t?.secondaryCtaText || "Explorar Recursos",
        secondaryCtaUrl: t?.secondaryCtaUrl || "https://www.mygameslist.com.br/planos",
        accentColor: t?.accentColor || "#10B981",
        benefits: t?.benefits || [
          "Zero anúncios em toda a plataforma e aplicativo",
          "1.5x de XP Boost de progressão",
          "Insígnia PRO em destaque no perfil",
          "Acesso antecipado a novos recursos da plataforma",
        ],
        footerText: t?.footerText || "Você recebeu esta notificação porque sua conta foi atualizada no <a href=\"https://www.mygameslist.com.br\" style=\"color: #6b7280; text-decoration: underline;\">MyGameList</a>.",
      });
    }
  };

  const handleTemplateSwitch = (key: TemplateType) => {
    setSelectedTemplate(key);
    if (settings) {
      loadTemplateData(settings, key);
    }
  };

  // Atualização do preview em tempo real
  const refreshPreview = async () => {
    setPreviewLoading(true);
    try {
      if (!auth?.currentUser) return;
      const token = await auth.currentUser.getIdToken();

      const res = await fetch("/api/admin/emails/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          plan: selectedTemplate === "vipWelcome" ? "vip" : "pro",
          userName: user?.displayName || user?.username || "Leandro",
          template: templateConfig,
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
    }, 250);
    return () => clearTimeout(timer);
  }, [templateConfig, selectedTemplate]);

  // Salvar alterações
  const handleSaveTemplate = async () => {
    if (!settings || !user) return;
    setIsSaving(true);
    try {
      const updatedTemplates = {
        ...(settings.emailTemplates || {}),
        [selectedTemplate]: templateConfig,
      };

      await updateSystemSettings({ emailTemplates: updatedTemplates }, user.email);
      setSettings((prev) => (prev ? { ...prev, emailTemplates: updatedTemplates } : null));

      setToastMessage({ type: "success", text: "Template salvo com sucesso!" });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      setToastMessage({ type: "error", text: err?.message || "Falha ao salvar template." });
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  // Enviar Teste Real
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

      const res = await fetch("/api/admin/emails/test", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          to: target,
          userName: user?.displayName || "Admin",
          plan: selectedTemplate === "vipWelcome" ? "vip" : "pro",
          template: templateConfig,
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

  const handleAddBenefit = () => {
    if (!newBenefit.trim()) return;
    setTemplateConfig((prev) => ({
      ...prev,
      benefits: [...(prev.benefits || []), newBenefit.trim()],
    }));
    setNewBenefit("");
  };

  const handleRemoveBenefit = (index: number) => {
    setTemplateConfig((prev) => ({
      ...prev,
      benefits: (prev.benefits || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
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

      {/* Header Principal: Seletor de Templates e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Central de E-mails
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-semibold">
              Resend Integrado
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Personalize os templates e visualize exatamente o que o usuário receberá na caixa de entrada.
          </p>
        </div>

        {/* Alternância de Template + Botão Salvar */}
        <div className="flex items-center gap-2.5 flex-wrap">
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

      {/* Abas Principais de Modo: [Editor de Template] vs [Preview em Tempo Real] */}
      <div className="flex items-center justify-between gap-4 bg-[#14161f] border border-white/10 p-1.5 rounded-2xl">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "editor"
                ? "bg-white/15 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Editor de Template</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "preview"
                ? "bg-white/15 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Visualização &amp; Teste (Preview)</span>
          </button>
        </div>

        {/* Caixa de disparo rápido de teste no canto da aba */}
        <div className="hidden md:flex items-center gap-2 pr-1">
          <input
            type="email"
            placeholder={user?.email || "seu-email@gmail.com"}
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="bg-[#0c0d12] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 w-52"
          />
          <button
            type="button"
            onClick={handleSendTest}
            disabled={isSendingTest}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors shrink-0 disabled:opacity-50"
            title="Disparar e-mail de teste real via Resend"
          >
            {isSendingTest ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            <span>Enviar Teste</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Dinâmico com Base na Aba Ativa */}
      {activeTab === "editor" ? (
        <div className="animate-in fade-in duration-200">
          <EmailTemplateEditor
            config={templateConfig}
            onChange={setTemplateConfig}
            newBenefit={newBenefit}
            setNewBenefit={setNewBenefit}
            onAddBenefit={handleAddBenefit}
            onRemoveBenefit={handleRemoveBenefit}
          />
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Barra de controle do Preview: Alternância Desktop/Mobile & Disparo Mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#13161f] border border-white/10 px-4 py-3 rounded-2xl">
            <div className="flex items-center gap-1.5 bg-[#0c0d12] p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setPreviewViewport("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  previewViewport === "desktop" ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (600px)</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewViewport("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  previewViewport === "mobile" ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (iPhone)</span>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:hidden">
              <input
                type="email"
                placeholder={user?.email || "seu-email@gmail.com"}
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 bg-[#0c0d12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSendingTest}
                className="px-3 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs"
              >
                {isSendingTest ? "..." : "Testar"}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              {previewLoading ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Atualizando preview...
                </span>
              ) : (
                <span className="text-[11px] text-gray-500">Preview atualizado em tempo real</span>
              )}
            </div>
          </div>

          {/* Janela de Visualização do Preview com Moldura */}
          <div className="rounded-3xl bg-[#0c0d12] border border-white/10 p-4 sm:p-8 flex justify-center shadow-2xl min-h-[680px]">
            <div
              className={`transition-all duration-300 w-full ${
                previewViewport === "mobile"
                  ? "max-w-[390px] rounded-3xl border border-white/15 shadow-2xl overflow-hidden bg-black"
                  : "max-w-[620px]"
              }`}
            >
              {previewViewport === "mobile" && (
                <div className="bg-[#14161f] border-b border-white/10 px-4 py-2.5 flex items-center justify-between text-[11px] text-gray-400 select-none">
                  <div className="w-12 h-3.5 rounded-full bg-white/10" />
                  <span className="font-mono text-[10px]">9:41</span>
                  <div className="w-4 h-2.5 rounded-sm border border-white/20" />
                </div>
              )}

              <iframe
                title="Email Preview"
                srcDoc={previewHtml}
                className="w-full h-[680px] border-0 bg-[#0c0d12]"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
