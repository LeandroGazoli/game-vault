"use client";

import React, { useState, useEffect } from "react";
import { SystemSettings } from "@/lib/types";
import { getSystemSettings, updateSystemSettings, recordAuditLog } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  Settings,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Flame,
  Sparkles,
  Bot,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await getSystemSettings();
      setSettings(data);
    } catch (e) {
      console.error("Erro ao carregar configurações:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !user) return;
    setIsSaving(true);
    try {
      await updateSystemSettings(settings, user.email);
      await recordAuditLog({
        adminEmail: user.email,
        adminUid: user.uid,
        action: "Parâmetros do Sistema Atualizados",
        category: "settings",
        details: settings,
      });
      setToastMessage("Configurações salvas com sucesso!");
      setTimeout(() => setToastMessage(null), 3500);
    } catch (e) {
      console.error("Erro ao salvar configurações:", e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-12 text-center text-xs text-gray-400">
        Carregando parâmetros do sistema...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Header com Salvar */}
        <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#00E5FF]" />
              <h2 className="text-xl font-black text-white tracking-tight">
                Configurações da Plataforma &amp; Feature Flags
              </h2>
            </div>
            <p className="text-xs text-gray-400">
              Controle o comportamento global, ative o Modo Manutenção e gerencie avisos de topo.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#00E5FF] hover:bg-[#00cbe3] text-black font-bold text-xs transition-all shadow-lg shadow-[#00E5FF]/20 min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Salvando..." : "Salvar Alterações"}</span>
          </button>
        </div>

        {/* Card: Modo Manutenção */}
        <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Modo de Manutenção Geral</span>
              </h3>
              <p className="text-xs text-gray-400">
                Bloqueia o acesso de usuários regulares exibindo uma tela de manutenção elegante.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  setSettings({ ...settings, maintenanceMode: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[12px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {settings.maintenanceMode && (
            <div className="pt-2">
              <label className="text-xs font-mono text-gray-400 uppercase block mb-1">
                Aviso aos Visitantes
              </label>
              <textarea
                rows={2}
                value={settings.maintenanceNotice || ""}
                onChange={(e) =>
                  setSettings({ ...settings, maintenanceNotice: e.target.value })
                }
                className="w-full bg-[#0d0f14] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          )}
        </div>

        {/* Card: Banner Global de Notificação */}
        <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400" />
                <span>Banner Superior de Destaque</span>
              </h3>
              <p className="text-xs text-gray-400">
                Fixa um banner com mensagem promocional ou comunicado no topo de todas as páginas.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={settings.announcementBanner?.enabled || false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcementBanner: {
                      ...settings.announcementBanner,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[12px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {settings.announcementBanner?.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-mono text-gray-400 uppercase block mb-1">
                  Texto do Banner
                </label>
                <input
                  type="text"
                  value={settings.announcementBanner.text}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcementBanner: {
                        ...settings.announcementBanner,
                        text: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#0d0f14] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 uppercase block mb-1">
                  Link de Destino (opcional)
                </label>
                <input
                  type="text"
                  placeholder="/planos"
                  value={settings.announcementBanner.linkUrl || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcementBanner: {
                        ...settings.announcementBanner,
                        linkUrl: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#0d0f14] border border-white/10 rounded-2xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400 min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 uppercase block mb-1">
                  Texto do Botão
                </label>
                <input
                  type="text"
                  placeholder="Conhecer Agora"
                  value={settings.announcementBanner.linkLabel || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcementBanner: {
                        ...settings.announcementBanner,
                        linkLabel: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#0d0f14] border border-white/10 rounded-2xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400 min-h-[44px]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Card: Feature Flags */}
        <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00E5FF]" />
            <span>Feature Flags da Plataforma</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Recomendações com IA</div>
                <div className="text-[11px] text-gray-400">Habilita o assistente inteligente na busca</div>
              </div>
              <input
                type="checkbox"
                checked={settings.features?.aiRecommendations || false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    features: {
                      ...settings.features,
                      aiRecommendations: e.target.checked,
                    },
                  })
                }
                className="w-5 h-5 accent-[#00E5FF] cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Sistema de Bounties</div>
                <div className="text-[11px] text-gray-400">Recompensas para feedbacks e bugs</div>
              </div>
              <input
                type="checkbox"
                checked={settings.features?.bountiesEnabled || false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    features: {
                      ...settings.features,
                      bountiesEnabled: e.target.checked,
                    },
                  })
                }
                className="w-5 h-5 accent-[#00E5FF] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
