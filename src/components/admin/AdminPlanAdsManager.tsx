"use client";

import React, { useState, useEffect } from "react";
import { PlanAdsConfig, PromoCreativeConfig, DEFAULT_PLAN_ADS_CONFIG } from "@/lib/ads/planAds.types";
import { PlansConfig, DEFAULT_PLANS_CONFIG, PlanKey } from "@/lib/plans.types";
import GameCardPlanPromo from "@/components/ads/GameCardPlanPromo";
import { auth, recordAuditLog, getSystemSettings, updateSystemSettings } from "@/lib/firebase";
import {
  Megaphone,
  Save,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Eye,
  RefreshCw,
  Sparkles,
  Zap,
  Crown,
  EyeOff,
} from "lucide-react";

interface AdminPlanAdsManagerProps {
  adminEmail: string;
}

export default function AdminPlanAdsManager({ adminEmail }: AdminPlanAdsManagerProps) {
  const [adsConfig, setAdsConfig] = useState<PlanAdsConfig>(DEFAULT_PLAN_ADS_CONFIG);
  const [plansConfig, setPlansConfig] = useState<PlansConfig>(DEFAULT_PLANS_CONFIG);
  const [selectedCreativeIdx, setSelectedCreativeIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega configurações do Firestore e preços dos planos
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sysSettings, plansRes] = await Promise.all([
        getSystemSettings(),
        fetch("/api/plans").then((r) => (r.ok ? r.json() : null)),
      ]);

      if (sysSettings?.planAds) {
        setAdsConfig({
          ...DEFAULT_PLAN_ADS_CONFIG,
          ...sysSettings.planAds,
          creatives: sysSettings.planAds.creatives?.length
            ? sysSettings.planAds.creatives
            : DEFAULT_PLAN_ADS_CONFIG.creatives,
        });
      }

      if (plansRes) {
        setPlansConfig((prev) => ({ ...prev, ...plansRes }));
      }
    } catch (err: any) {
      console.error("Erro ao carregar dados de anúncios:", err);
      setError("Falha ao sincronizar parâmetros de anúncios com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateCreativeField = (index: number, field: keyof PromoCreativeConfig, value: any) => {
    setAdsConfig((prev) => {
      const updated = [...prev.creatives];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, creatives: updated };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await updateSystemSettings({ planAds: adsConfig }, adminEmail || auth.currentUser?.email || "admin");
      await recordAuditLog({
        adminEmail: adminEmail || auth.currentUser?.email || "admin",
        adminUid: auth.currentUser?.uid || "admin",
        action: "Sistema de Anúncios de Planos Atualizado",
        category: "settings",
        details: adsConfig,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error("Erro ao salvar anúncios:", err);
      setError("Não foi possível salvar as alterações no Firestore.");
    } finally {
      setIsSaving(false);
    }
  };

  const activeCreative = adsConfig.creatives[selectedCreativeIdx] || adsConfig.creatives[0];

  if (isLoading) {
    return (
      <div className="rounded-3xl bg-[#141822] border border-white/10 p-12 text-center text-xs text-gray-400 space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
        <p>Carregando gerenciador de anúncios e sincronização de planos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Configurações de anúncios salvas com sucesso! O site já reflete os novos parâmetros.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Barra de Controle Mestre */}
      <div className="rounded-3xl bg-[#141822] border border-white/10 p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <span>Controle Global de Exibição</span>
            </h3>
            <p className="text-xs text-gray-400">
              Defina se os cards promocionais aparecem nas listagens e a probabilidade de inserção.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs font-semibold text-gray-300">
                {adsConfig.enabled ? "Anúncios Ativos" : "Anúncios Desativados"}
              </span>
              <input
                type="checkbox"
                checked={adsConfig.enabled}
                onChange={(e) => setAdsConfig((p) => ({ ...p, enabled: e.target.checked }))}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </label>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Salvando..." : "Salvar Alterações"}</span>
            </button>
          </div>
        </div>

        {/* Parâmetros de Probabilidade e Frequência */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">Probabilidade de Exibição</label>
              <span className="text-xs font-mono font-black text-emerald-400">
                {adsConfig.displayProbability}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={adsConfig.displayProbability}
              onChange={(e) =>
                setAdsConfig((p) => ({ ...p, displayProbability: Number(e.target.value) }))
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[11px] text-gray-500 leading-tight">
              Chance de um visitante elegível visualizar anúncios nas posições sorteadas da listagem.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-black/40 border border-white/5">
            <label className="text-xs font-bold text-white">Mínimo de Jogos Antes do 1º Ad</label>
            <input
              type="number"
              min={2}
              max={12}
              value={adsConfig.minItemsBeforeAd}
              onChange={(e) =>
                setAdsConfig((p) => ({ ...p, minItemsBeforeAd: Math.max(1, Number(e.target.value)) }))
              }
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
            <p className="text-[11px] text-gray-500 leading-tight">
              Garante que o visitante veja jogos antes de encontrar o primeiro anúncio.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-black/40 border border-white/5">
            <label className="text-xs font-bold text-white">Máx. de Anúncios por Listagem</label>
            <input
              type="number"
              min={1}
              max={4}
              value={adsConfig.maxAdsPerList}
              onChange={(e) =>
                setAdsConfig((p) => ({ ...p, maxAdsPerList: Math.max(1, Number(e.target.value)) }))
              }
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
            <p className="text-[11px] text-gray-500 leading-tight">
              Evita poluição visual limitando o número total de ads em feeds longos.
            </p>
          </div>
        </div>
      </div>

      {/* Gerenciamento de Criativos & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Painel de Edição de Criativos (7 colunas) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#141822] border border-white/10 p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#00E5FF]" />
              <span>Personalização dos Criativos Promocionais</span>
            </h3>
            <span className="text-[10px] font-mono text-gray-400">
              {adsConfig.creatives.length} criativos configurados
            </span>
          </div>

          {/* Abas dos Criativos */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {adsConfig.creatives.map((c, idx) => (
              <button
                key={c.id || idx}
                type="button"
                onClick={() => setSelectedCreativeIdx(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCreativeIdx === idx
                    ? "bg-white text-black shadow-md"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {c.badge || `Criativo ${idx + 1}`}
              </button>
            ))}
          </div>

          {/* Formulário do Criativo Selecionado */}
          {activeCreative && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-emerald-400 font-bold">
                  Editando: {activeCreative.badge}
                </span>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs text-gray-400">Ativo na Rotação</span>
                  <input
                    type="checkbox"
                    checked={activeCreative.enabled}
                    onChange={(e) =>
                      handleUpdateCreativeField(selectedCreativeIdx, "enabled", e.target.checked)
                    }
                    className="w-4 h-4 accent-emerald-500"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-400">Tag Superior</label>
                  <input
                    type="text"
                    value={activeCreative.tag}
                    onChange={(e) =>
                      handleUpdateCreativeField(selectedCreativeIdx, "tag", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-400">Badge da Vantagem</label>
                  <input
                    type="text"
                    value={activeCreative.badge}
                    onChange={(e) =>
                      handleUpdateCreativeField(selectedCreativeIdx, "badge", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-400">Título Chamativo</label>
                <input
                  type="text"
                  value={activeCreative.title}
                  onChange={(e) =>
                    handleUpdateCreativeField(selectedCreativeIdx, "title", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-400">Descrição Curta</label>
                <textarea
                  rows={2}
                  value={activeCreative.description}
                  onChange={(e) =>
                    handleUpdateCreativeField(selectedCreativeIdx, "description", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-400">Texto do Botão CTA</label>
                  <input
                    type="text"
                    value={activeCreative.ctaText}
                    onChange={(e) =>
                      handleUpdateCreativeField(selectedCreativeIdx, "ctaText", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-400">Plano Sincronizado (Preço)</label>
                  <select
                    value={activeCreative.linkedPlanKey || "pro_annual"}
                    onChange={(e) =>
                      handleUpdateCreativeField(selectedCreativeIdx, "linkedPlanKey", e.target.value as PlanKey)
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="pro_annual">PRO Anual (calcula rateio mensal)</option>
                    <option value="pro_monthly">PRO Mensal</option>
                    <option value="pro_single_month">PRO 1 Mês Avulso</option>
                    <option value="vip_lifetime">VIP Vitalício (Membro Fundador)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview em Tempo Real (5 colunas) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#141822] border border-white/10 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Live Preview (Visão do Usuário)</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              100% Clicável
            </span>
          </div>

          <p className="text-xs text-gray-400">
            É exatamente assim que este card será renderizado intercalado no catálogo e feeds mobile/desktop:
          </p>

          <div className="flex justify-center py-4 bg-black/50 rounded-2xl border border-white/5 p-4">
            <div className="w-48 sm:w-56">
              <GameCardPlanPromo
                previewCreative={activeCreative}
                plansConfig={plansConfig}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
