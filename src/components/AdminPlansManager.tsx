"use client";

import React, { useState, useEffect } from "react";
import { PlansConfig, PlanKey, DEFAULT_PLANS_CONFIG, savePlansConfig } from "@/lib/plans";
import {
  CreditCard,
  RefreshCw,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Zap,
  Crown,
  Calendar,
  Layers,
  X,
} from "lucide-react";

interface StripeProduct {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

interface StripePrice {
  id: string;
  productId: string;
  productName: string;
  unit_amount: number;
  amountInReais: number;
  formattedPrice: string;
  currency: string;
  type: "recurring" | "one_time";
  interval: "month" | "year" | null;
  active: boolean;
}

interface AdminPlansManagerProps {
  adminEmail: string;
}

export default function AdminPlansManager({ adminEmail }: AdminPlansManagerProps) {
  const [plansConfig, setPlansConfig] = useState<PlansConfig>(DEFAULT_PLANS_CONFIG);
  const [stripeProducts, setStripeProducts] = useState<StripeProduct[]>([]);
  const [stripePrices, setStripePrices] = useState<StripePrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal para criar novo preço no Stripe
  const [isCreatePriceOpen, setIsCreatePriceOpen] = useState(false);
  const [createProductId, setCreateProductId] = useState("");
  const [createAmount, setCreateAmount] = useState<string>("9.90");
  const [createType, setCreateType] = useState<"recurring" | "one_time">("recurring");
  const [createInterval, setCreateInterval] = useState<"month" | "year">("month");
  const [isCreatingPrice, setIsCreatingPrice] = useState(false);
  const [createSuccessMsg, setCreateSuccessMsg] = useState<string | null>(null);

  // Carrega dados iniciais do Stripe e do Firestore
  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Carrega planos do Firestore via API
      const plansRes = await fetch("/api/plans");
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlansConfig((prev) => ({ ...prev, ...plansData }));
      }

      // 2. Carrega produtos e preços reais do Stripe
      const stripeRes = await fetch(
        `/api/admin/stripe/prices?adminEmail=${encodeURIComponent(adminEmail)}`
      );
      if (stripeRes.ok) {
        const stripeData = await stripeRes.json();
        setStripeProducts(stripeData.products || []);
        setStripePrices(stripeData.prices || []);
        if (stripeData.products?.length > 0 && !createProductId) {
          setCreateProductId(stripeData.products[0].id);
        }
      } else {
        const errData = await stripeRes.json();
        setError(errData.error || "Erro ao consultar produtos do Stripe.");
      }
    } catch (err: any) {
      console.error("Erro ao carregar dados do admin:", err);
      setError(err.message || "Erro de conexão ao carregar dados.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [adminEmail]);

  // Atualiza um campo de um plano específico
  const handleUpdateField = (planKey: PlanKey, field: string, value: any) => {
    setPlansConfig((prev) => ({
      ...prev,
      [planKey]: {
        ...prev[planKey],
        [field]: value,
      },
    }));
  };

  // Quando o admin seleciona um novo Stripe Price ID no dropdown
  const handleSelectStripePrice = (planKey: PlanKey, priceId: string) => {
    const matched = stripePrices.find((p) => p.id === priceId);
    if (matched) {
      setPlansConfig((prev) => ({
        ...prev,
        [planKey]: {
          ...prev[planKey],
          priceId: matched.id,
          price: matched.amountInReais,
          formattedPrice: matched.formattedPrice,
          mode: matched.type === "recurring" ? "subscription" : "payment",
          intervalText:
            matched.type === "recurring"
              ? matched.interval === "year"
                ? "/ano"
                : "/mês"
              : planKey === "vip_lifetime"
              ? "vitalício"
              : "único (30 dias)",
        },
      }));
    } else {
      handleUpdateField(planKey, "priceId", priceId);
    }
  };

  // Salva no Firestore
  const handleSaveConfig = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // 1. Salva diretamente pelo cliente autenticado no Firestore (com credencial do Google do Admin)
      await savePlansConfig(plansConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.warn("Tentativa de salvar via cliente falhou, tentando rota da API...", err);
      try {
        const res = await fetch("/api/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adminEmail,
            config: plansConfig,
          }),
        });

        if (res.ok) {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 4000);
          return;
        } else {
          const errData = await res.json();
          setError(errData.error || "Erro ao salvar planos.");
        }
      } catch (apiErr: any) {
        setError(err.message || apiErr.message || "Erro ao salvar planos.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Cria um novo preço diretamente no Stripe
  const handleCreateNewPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingPrice(true);
    setError(null);

    const parsedAmount = parseFloat(createAmount.replace(",", "."));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Por favor, digite um valor monetário válido.");
      setIsCreatingPrice(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/stripe/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail,
          productId: createProductId,
          amount: parsedAmount,
          type: createType,
          interval: createType === "recurring" ? createInterval : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreateSuccessMsg(`Preço ${data.price.formattedPrice} (${data.price.id}) criado com sucesso no Stripe!`);
        await loadData();
        setTimeout(() => {
          setCreateSuccessMsg(null);
          setIsCreatePriceOpen(false);
        }, 2000);
      } else {
        setError(data.error || "Não foi possível criar o preço no Stripe.");
      }
    } catch (err: any) {
      console.error("Erro ao criar preço:", err);
      setError(err.message || "Erro de comunicação.");
    } finally {
      setIsCreatingPrice(false);
    }
  };

  const planKeys: { key: PlanKey; title: string; icon: any; defaultBadge: string }[] = [
    { key: "pro_monthly", title: "PRO Mensal (Assinatura Recorrente)", icon: RefreshCw, defaultBadge: "Recorrente" },
    { key: "pro_single_month", title: "PRO 1 Mês Avulso (Pagamento Único)", icon: Zap, defaultBadge: "Sem Renovação" },
    { key: "pro_annual", title: "PRO Anual (Assinatura Recorrente)", icon: Sparkles, defaultBadge: "Mais Popular" },
    { key: "vip_lifetime", title: "VIP Vitalício (Membro Fundador)", icon: Crown, defaultBadge: "Vitalício" },
  ];

  if (isLoading) {
    return (
      <div className="rounded-[32px] bg-[#18191c] border border-white/10 p-8 sm:p-12 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-[#00E5FF] animate-spin mx-auto" />
        <p className="text-sm text-gray-300">Carregando catálogo ao vivo do Stripe e configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de Ações Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Stripe Live Conectado</span>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                PRODUÇÃO
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {stripeProducts.length} produtos e {stripePrices.length} preços cadastrados na conta oficial.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-gray-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Sincronizar
          </button>

          <button
            onClick={() => setIsCreatePriceOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 text-xs font-bold text-purple-300 transition-all shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            Criar Preço no Stripe
          </button>

          <button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#00E5FF] hover:bg-cyan-300 text-black text-xs font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Salvando..." : "Salvar Configurações no Site"}
          </button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Configurações salvas no Firestore com sucesso! O site já está exibindo os novos valores.</span>
        </div>
      )}

      {/* Cards de Edição dos 4 Planos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {planKeys.map(({ key, title, icon: Icon, defaultBadge }) => {
          const plan = plansConfig[key];

          return (
            <div
              key={key}
              className={`rounded-3xl border transition-all p-6 space-y-5 bg-[#18191c] shadow-xl ${
                plan.enabled ? "border-white/15" : "border-white/5 opacity-60"
              }`}
            >
              {/* Cabeçalho do Card */}
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00E5FF]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{title}</h3>
                    <span className="text-[11px] font-mono text-gray-400">
                      Modo Stripe: <strong className="text-cyan-300">{plan.mode === "subscription" ? "Assinatura (subscription)" : "Pagamento Único (payment)"}</strong>
                    </span>
                  </div>
                </div>

                {/* Switch Ativo/Inativo */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs text-gray-400 font-medium">
                    {plan.enabled ? "Ativo" : "Oculto"}
                  </span>
                  <input
                    type="checkbox"
                    checked={plan.enabled}
                    onChange={(e) => handleUpdateField(key, "enabled", e.target.checked)}
                    className="w-4 h-4 accent-[#00E5FF] cursor-pointer"
                  />
                </label>
              </div>

              {/* Seletor do Preço Oficial do Stripe */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                  <span>Preço Vinculado do Stripe:</span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    ID atual: {plan.priceId || "Nenhum"}
                  </span>
                </label>
                <select
                  value={plan.priceId}
                  onChange={(e) => handleSelectStripePrice(key, e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:border-[#00E5FF] focus:outline-none"
                >
                  <option value="">-- Selecione um preço da sua conta Stripe --</option>
                  {stripePrices.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      [{pr.type === "recurring" ? `Recorrente/${pr.interval}` : "Pagamento Único"}] {pr.productName} — {pr.formattedPrice} ({pr.id})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500">
                  Ao trocar o preço acima, o valor numérico e formatado é atualizado automaticamente.
                </p>
              </div>

              {/* Campos Editáveis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Nome de Exibição no Site</label>
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => handleUpdateField(key, "name", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Preço Formatado (Exibição)</label>
                  <input
                    type="text"
                    value={plan.formattedPrice}
                    onChange={(e) => handleUpdateField(key, "formattedPrice", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Texto do Intervalo</label>
                  <input
                    type="text"
                    value={plan.intervalText}
                    onChange={(e) => handleUpdateField(key, "intervalText", e.target.value)}
                    placeholder="/mês, único (30 dias), /ano"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Badge de Destaque</label>
                  <input
                    type="text"
                    value={plan.badge || ""}
                    onChange={(e) => handleUpdateField(key, "badge", e.target.value)}
                    placeholder="Ex: Mais Popular, Sem Renovação"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Descrição Curta</label>
                <textarea
                  value={plan.description}
                  rows={2}
                  onChange={(e) => handleUpdateField(key, "description", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-[#00E5FF] focus:outline-none resize-none"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL PARA CRIAR NOVO PREÇO NO STRIPE */}
      {isCreatePriceOpen && (
        <div
          className="fixed inset-0 z-[999] !m-0 !mt-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsCreatePriceOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-[#18191c] border border-white/15 p-6 sm:p-7 shadow-2xl space-y-5 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Criar Novo Preço no Stripe</h3>
              </div>
              <button
                onClick={() => setIsCreatePriceOpen(false)}
                className="p-1.5 rounded-full bg-white/10 text-gray-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{createSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateNewPrice} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Produto do Stripe:</label>
                <select
                  value={createProductId}
                  onChange={(e) => setCreateProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:border-purple-400 focus:outline-none"
                  required
                >
                  {stripeProducts.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({prod.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Valor em R$:</label>
                  <input
                    type="text"
                    value={createAmount}
                    onChange={(e) => setCreateAmount(e.target.value)}
                    placeholder="9.90"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:border-purple-400 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Tipo de Cobrança:</label>
                  <select
                    value={createType}
                    onChange={(e) => setCreateType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:border-purple-400 focus:outline-none"
                  >
                    <option value="recurring">Recorrente (Assinatura)</option>
                    <option value="one_time">Pagamento Único (Avulso)</option>
                  </select>
                </div>
              </div>

              {createType === "recurring" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Frequência da Recorrência:</label>
                  <select
                    value={createInterval}
                    onChange={(e) => setCreateInterval(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:border-purple-400 focus:outline-none"
                  >
                    <option value="month">Mensal (a cada 1 mês)</option>
                    <option value="year">Anual (a cada 1 ano)</option>
                  </select>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreatePriceOpen(false)}
                  className="px-4 py-2 rounded-full text-xs text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPrice}
                  className="px-5 py-2 rounded-full bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isCreatingPrice ? "Criando no Stripe..." : "Confirmar & Criar Preço"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
