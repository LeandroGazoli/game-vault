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

        {/* Card: Carrossel Hero Widescreen 16:9 (Controle do Administrador) */}
        <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Carrossel Hero Widescreen 16:9 (Destaques da Home)</span>
              </h3>
              <p className="text-xs text-gray-400">
                Escolha quais jogos aparecem no carrossel de capa, a ordem e o limite de itens exibidos.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-gray-300 font-medium">Habilitado</span>
                <input
                  type="checkbox"
                  checked={settings.heroCarousel?.enabled ?? true}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      heroCarousel: {
                        enabled: e.target.checked,
                        maxItems: settings.heroCarousel?.maxItems || 5,
                        items: settings.heroCarousel?.items || [],
                      },
                    })
                  }
                  className="w-5 h-5 accent-[#00E5FF] cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono text-gray-400 uppercase block mb-1">
                Limite Máximo de Jogos
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={settings.heroCarousel?.maxItems || 5}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    heroCarousel: {
                      enabled: settings.heroCarousel?.enabled ?? true,
                      maxItems: Number(e.target.value) || 5,
                      items: settings.heroCarousel?.items || [],
                    },
                  })
                }
                className="w-full bg-[#0d0f14] border border-white/10 rounded-2xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF] min-h-[44px]"
              />
            </div>
          </div>

          {/* Lista de Jogos Configurados no Carrossel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400 uppercase">
                Jogos em Destaque ({settings.heroCarousel?.items?.length || 0})
              </span>
              <button
                type="button"
                onClick={() => {
                  const newItem = {
                    id: `game-${Date.now()}`,
                    title: "Novo Jogo em Destaque",
                    subtitle: "Descrição do jogo em destaque",
                    bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80",
                    linkUrl: "/search",
                    tag: "DESTAQUE",
                  };
                  setSettings({
                    ...settings,
                    heroCarousel: {
                      enabled: settings.heroCarousel?.enabled ?? true,
                      maxItems: settings.heroCarousel?.maxItems || 5,
                      items: [...(settings.heroCarousel?.items || []), newItem],
                    },
                  });
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-bold hover:bg-[#00E5FF]/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>+ Adicionar Jogo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(settings.heroCarousel?.items || []).map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="rounded-2xl bg-[#0d0f14] border border-white/10 p-4 space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white/10 text-[10px] font-mono font-bold flex items-center justify-center text-gray-300">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white truncate max-w-[200px]">
                        {item.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = (settings.heroCarousel?.items || []).filter((_, i) => i !== idx);
                        setSettings({
                          ...settings,
                          heroCarousel: {
                            enabled: settings.heroCarousel?.enabled ?? true,
                            maxItems: settings.heroCarousel?.maxItems || 5,
                            items: updated,
                          },
                        });
                      }}
                      className="text-gray-500 hover:text-rose-400 p-1 text-xs transition-colors"
                      title="Remover do Carrossel"
                    >
                      Remover
                    </button>
                  </div>

                  {/* Preview do Banner 16:9 */}
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/50 border border-white/10 relative">
                    <img
                      src={item.bannerUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80";
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#00E5FF] text-black font-extrabold text-[9px]">
                      {item.tag || "DESTAQUE"}
                    </div>
                  </div>

                  {/* Campos Editáveis */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Título do Jogo"
                      value={item.title}
                      onChange={(e) => {
                        const items = [...(settings.heroCarousel?.items || [])];
                        items[idx] = { ...items[idx], title: e.target.value };
                        setSettings({
                          ...settings,
                          heroCarousel: {
                            enabled: settings.heroCarousel?.enabled ?? true,
                            maxItems: settings.heroCarousel?.maxItems || 5,
                            items,
                          },
                        });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                    />

                    <input
                      type="text"
                      placeholder="Subtítulo ou descrição curta"
                      value={item.subtitle || ""}
                      onChange={(e) => {
                        const items = [...(settings.heroCarousel?.items || [])];
                        items[idx] = { ...items[idx], subtitle: e.target.value };
                        setSettings({
                          ...settings,
                          heroCarousel: {
                            enabled: settings.heroCarousel?.enabled ?? true,
                            maxItems: settings.heroCarousel?.maxItems || 5,
                            items,
                          },
                        });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#00E5FF]"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Tag (ex: GOTY)"
                        value={item.tag || ""}
                        onChange={(e) => {
                          const items = [...(settings.heroCarousel?.items || [])];
                          items[idx] = { ...items[idx], tag: e.target.value };
                          setSettings({
                            ...settings,
                            heroCarousel: {
                              enabled: settings.heroCarousel?.enabled ?? true,
                              maxItems: settings.heroCarousel?.maxItems || 5,
                              items,
                            },
                          });
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                      />

                      <input
                        type="text"
                        placeholder="Link (ex: /search?q=gta)"
                        value={item.linkUrl}
                        onChange={(e) => {
                          const items = [...(settings.heroCarousel?.items || [])];
                          items[idx] = { ...items[idx], linkUrl: e.target.value };
                          setSettings({
                            ...settings,
                            heroCarousel: {
                              enabled: settings.heroCarousel?.enabled ?? true,
                              maxItems: settings.heroCarousel?.maxItems || 5,
                              items,
                            },
                          });
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="URL da Imagem 16:9 (Banner Widescreen)"
                      value={item.bannerUrl}
                      onChange={(e) => {
                        const items = [...(settings.heroCarousel?.items || [])];
                        items[idx] = { ...items[idx], bannerUrl: e.target.value };
                        setSettings({
                          ...settings,
                          heroCarousel: {
                            enabled: settings.heroCarousel?.enabled ?? true,
                            maxItems: settings.heroCarousel?.maxItems || 5,
                            items,
                          },
                        });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[11px] font-mono text-gray-400 focus:outline-none focus:border-[#00E5FF]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
