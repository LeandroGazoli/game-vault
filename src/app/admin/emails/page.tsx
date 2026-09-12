"use client";

import React, { useState, useEffect } from "react";
import { EmailTemplateConfig, SystemSettings } from "@/lib/types";
import { getSystemSettings, updateSystemSettings, auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  Mail,
  Send,
  Eye,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Crown,
  Zap,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";

export default function AdminEmailsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<"vipWelcome" | "proWelcome">("vipWelcome");

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

  // Preview e Disparo de Teste
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
      console.error("Erro ao carregar configurações de e-mail:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const loadTemplateData = (cfg: SystemSettings, tKey: "vipWelcome" | "proWelcome") => {
    const t = cfg.emailTemplates?.[tKey];
    if (tKey === "vipWelcome") {
      setSubject(t?.subject || "👑 Você recebeu acesso VIP no MyGameList!");
      setBadgeText(t?.badgeText || "👑 ACESSO VIP CONCEDIDO");
      setHeading(t?.heading || "Parabéns, {username}!");
      setSubheading(t?.subheading || "Você acabou de receber acesso exclusivo de nível VIP Vitalício no MyGameList.");
      setDefaultMessage(t?.defaultMessage || "Concedemos a você acesso de Membro VIP no MyGameList com 2.0x XP em dobro, sem anúncios e todos os recursos liberados.");
      setCtaText(t?.ctaText || "Acessar Meu Perfil VIP →");
      setCtaUrl(t?.ctaUrl || "https://www.mygameslist.com.br/perfil");
      setAccentColor(t?.accentColor || "#F59E0B");
      setBenefits(t?.benefits || [
        "Zero Anúncios em toda a plataforma",
        "2.0x de XP em Dobro para subir de nível",
        "Insígnia Dourada e destaque exclusivo no seu perfil",
        "Estatísticas Avançadas e backup total da sua biblioteca",
      ]);
    } else {
      setSubject(t?.subject || "⚡ Seu acesso PRO foi ativado no MyGameList!");
      setBadgeText(t?.badgeText || "⚡ ACESSO PRO ATIVADO");
      setHeading(t?.heading || "Parabéns, {username}!");
      setSubheading(t?.subheading || "Você acabou de receber acesso exclusivo de nível PRO no MyGameList.");
      setDefaultMessage(t?.defaultMessage || "Seu acesso PRO está liberado com 1.5x de XP Boost e navegação 100% livre de anúncios.");
      setCtaText(t?.ctaText || "Acessar Plataforma →");
      setCtaUrl(t?.ctaUrl || "https://www.mygameslist.com.br/perfil");
      setAccentColor(t?.accentColor || "#00E5FF");
      setBenefits(t?.benefits || [
        "Zero Anúncios em toda a plataforma",
        "1.5x de XP Boost nas atividades",
        "Insígnia Ciano PRO no seu perfil",
        "Acesso antecipado a novos recursos",
      ]);
    }
  };

  const handleTemplateSwitch = (key: "vipWelcome" | "proWelcome") => {
    setSelectedTemplate(key);
    if (settings) {
      loadTemplateData(settings, key);
    }
  };

  // Carrega preview do HTML sempre que o formulário for alterado
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
          userName: user?.displayName || user?.username || "Gamer",
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
    }, 400);
    return () => clearTimeout(timer);
  }, [subject, badgeText, heading, subheading, defaultMessage, ctaText, ctaUrl, accentColor, benefits, selectedTemplate]);

  // Salva o template no Firestore
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

      setToastMessage({ type: "success", text: "Template salvo com sucesso no sistema!" });
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      console.error("Erro ao salvar template:", err);
      setToastMessage({ type: "error", text: err?.message || "Falha ao salvar template." });
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  // Dispara e-mail de teste para o e-mail informado
  const handleSendTest = async () => {
    const target = testEmail.trim() || user?.email;
    if (!target || !target.includes("@")) {
      setToastMessage({ type: "error", text: "Informe um e-mail válido para o teste." });
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
      if (!res.ok) throw new Error(data.error || "Erro no envio de teste.");

      setToastMessage({ type: "success", text: `E-mail de teste enviado para ${target}!` });
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage({ type: "error", text: err?.message || "Falha ao despachar e-mail." });
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
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn border ${
            toastMessage.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/15 border-rose-500/30 text-rose-300"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Principal */}
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            <span>Templates de E-mail (Resend)</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Personalize textos, cores e vantagens dos e-mails automáticos e visualize em tempo real antes de enviar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveTemplate}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#10B981] hover:bg-emerald-400 text-black font-bold text-xs active:scale-95 transition-all shadow-lg shadow-emerald-500/20 min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Salvando..." : "Salvar Template"}</span>
          </button>
        </div>
      </div>

      {/* Seletor de Templates */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleTemplateSwitch("vipWelcome")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all min-h-[44px] ${
            selectedTemplate === "vipWelcome"
              ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/10"
              : "bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Boas-vindas VIP</span>
        </button>

        <button
          onClick={() => handleTemplateSwitch("proWelcome")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all min-h-[44px] ${
            selectedTemplate === "proWelcome"
              ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10"
              : "bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>Boas-vindas PRO</span>
        </button>
      </div>

      {/* Grid: Editor na Esquerda e Preview em Tempo Real na Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna 1: Editor de Campos */}
        <div className="lg:col-span-6 space-y-5 rounded-[32px] bg-[#14161d] border border-white/10 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Configuração do Conteúdo</span>
            </span>
            <span className="text-[10px] text-gray-500 font-mono">Variável: {"{username}"}</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Assunto do E-mail:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#0d0f14] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 min-h-[40px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Badge Superior:</label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full bg-[#0d0f14] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 min-h-[40px]"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Cor de Destaque (HEX):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 bg-[#0d0f14] border border-white/10 rounded-xl px-3 py-2 text-white font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Título Principal (Heading):</label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                className="w-full bg-[#0d0f14] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 min-h-[40px]"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Subtítulo / Descrição Inicial:</label>
              <textarea
                value={subheading}
                onChange={(e) => setSubheading(e.target.value)}
                rows={2}
                className="w-full bg-[#0d0f14] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Mensagem Padrão da Moderação:</label>
              <textarea
                value={defaultMessage}
                onChange={(e) => setDefaultMessage(e.target.value)}
                rows={3}
                className="w-full bg-[#0d0f14] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            {/* Vantagens / Benefícios */}
            <div>
              <label className="block text-gray-400 mb-1.5 font-semibold">Vantagens Listadas no E-mail:</label>
              <div className="space-y-2 mb-2">
                {benefits.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2">
                    <span className="text-gray-200 flex-1">{b}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(idx)}
                      className="text-gray-500 hover:text-rose-400 p-1"
                      title="Remover vantagem"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Adicionar nova vantagem..."
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())}
                  className="flex-1 bg-[#0d0f14] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={addBenefit}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Texto do Botão (CTA):</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full bg-[#0d0f14] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Link do Botão:</label>
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className="w-full bg-[#0d0f14] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 2: Preview em Tempo Real e Envio de Teste */}
        <div className="lg:col-span-6 space-y-5">
          {/* Caixa de Disparo de Teste */}
          <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>Testar Disparo Real (Resend)</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">mygameslist.com.br</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="email"
                placeholder={user?.email || "seu-email@gmail.com"}
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full sm:flex-1 bg-[#0d0f14] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-400 min-h-[44px]"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSendingTest}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs active:scale-95 transition-all shadow-md min-h-[44px] shrink-0"
              >
                <Send className={`w-3.5 h-3.5 ${isSendingTest ? "animate-pulse" : ""}`} />
                <span>{isSendingTest ? "Enviando..." : "Enviar Teste"}</span>
              </button>
            </div>
          </div>

          {/* Iframe de Pré-Visualização */}
          <div className="rounded-[32px] bg-[#14161d] border border-white/10 overflow-hidden shadow-2xl space-y-3 p-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Preview em Tempo Real</span>
              </span>
              {previewLoading && (
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Atualizando...
                </span>
              )}
            </div>

            <div className="w-full rounded-2xl overflow-hidden border border-white/5 bg-[#0b0d12]">
              <iframe
                title="Email Preview"
                srcDoc={previewHtml}
                className="w-full h-[640px] border-0"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
