"use client";

import React, { useState } from "react";
import { Check, X, Sparkles, Crown, Zap, Shield, ChevronDown } from "lucide-react";

interface FeatureRow {
  name: string;
  category: string;
  free: string | boolean;
  pro: string | boolean;
  vip: string | boolean;
  tooltip?: string;
}

const COMPARISON_DATA: FeatureRow[] = [
  // Categoria: Experiência & Anúncios
  {
    name: "Navegação 100% Livre de Anúncios e Banners",
    category: "Experiência & Anúncios",
    free: false,
    pro: true,
    vip: true,
  },
  {
    name: "Suporte Prioritário da Equipe",
    category: "Experiência & Anúncios",
    free: false,
    pro: "Prioritário",
    vip: "Canal VIP Direto",
  },
  // Categoria: Gamificação & Rankings
  {
    name: "Multiplicador de Ganho de XP",
    category: "Gamificação & Rankings",
    free: "1.0x (Padrão)",
    pro: "⚡ 1.5x (+50%)",
    vip: "👑 2.0x (XP Dobrado)",
  },
  {
    name: "Selo Exclusivo no Perfil e Comentários",
    category: "Gamificação & Rankings",
    free: false,
    pro: "💎 Selo PRO Neon",
    vip: "👑 Selo Ouro Fundador",
  },
  {
    name: "Criação de Insígnias e Títulos Próprios",
    category: "Gamificação & Rankings",
    free: "Padrão",
    pro: "Até 10 personalizadas",
    vip: "Até 10 + Insígnia VIP",
  },
  // Categoria: Catálogo & Coleção
  {
    name: "Catálogo Ilimitado (+150.000 jogos)",
    category: "Catálogo & Coleção",
    free: true,
    pro: true,
    vip: true,
  },
  {
    name: "Registro de Status, Notas e Tempo (HLTB)",
    category: "Catálogo & Coleção",
    free: true,
    pro: true,
    vip: true,
  },
  {
    name: "Estatísticas Gráficas de Backlog e Progresso",
    category: "Catálogo & Coleção",
    free: "Básicas",
    pro: "Avançadas & Gráficos",
    vip: "Avançadas & Gráficos",
  },
  {
    name: "Roleta de Backlog com Filtros Ilimitados",
    category: "Catálogo & Coleção",
    free: "Básica",
    pro: true,
    vip: true,
  },
  // Categoria: Personalização do Perfil & do Site
  {
    name: "Temas Visuais de Perfil & Destaques",
    category: "Personalização",
    free: "Tema Padrão",
    pro: "8 Temas Neon & Acabamentos",
    vip: "Todos + Obsidian Gold VIP",
  },
  {
    name: "Capa Personalizada e Banner de Perfil",
    category: "Personalização",
    free: "Padrão",
    pro: "Todos os Presets + URL Própria",
    vip: "Capa VIP Obsidian + URL Própria",
  },
  {
    name: "Papel de Parede do Site & Background Gamer",
    category: "Personalização",
    free: false,
    pro: "Wallpapers Oficiais + Cores OLED",
    vip: "Todos + Parallax 3D & Efeitos VIP",
  },
  {
    name: "Suporte a Estilização CSS Customizada (Scoped)",
    category: "Personalização",
    free: false,
    pro: true,
    vip: true,
  },
  {
    name: "Bio Estilizada com Suporte a HTML5 & CSS",
    category: "Personalização",
    free: "Markdown Básico",
    pro: "Markdown + HTML & CSS",
    vip: "Markdown + HTML & CSS",
  },
  // Categoria: Dados & Exportação
  {
    name: "Sincronização em Nuvem em Tempo Real",
    category: "Produtividade & Dados",
    free: true,
    pro: true,
    vip: true,
  },
  {
    name: "Exportação Completa da Coleção (Excel & JSON)",
    category: "Produtividade & Dados",
    free: false,
    pro: true,
    vip: true,
  },
  {
    name: "Nome Eternizado no Mural de Apoiadores",
    category: "Exclusivo",
    free: false,
    pro: false,
    vip: true,
  },
];

export default function PlanComparisonTable() {
  const [selectedMobileTab, setSelectedMobileTab] = useState<"free" | "pro" | "vip">("pro");

  const renderValue = (val: string | boolean, highlightColor?: string) => {
    if (val === true) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400">
          <Check className="w-4 h-4" />
        </span>
      );
    }
    if (val === false) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/5 text-neutral-500">
          <X className="w-4 h-4" />
        </span>
      );
    }
    return (
      <span className={`text-xs font-bold ${highlightColor || "text-neutral-200"}`}>
        {val}
      </span>
    );
  };

  return (
    <section className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Comparativo Completo: <span className="text-emerald-400">O Que Tem e O Que Não Tem</span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto">
          Transparência total sobre os recursos disponíveis em cada modalidade do MyGameList.
        </p>
      </div>

      {/* Seletor Mobile de Colunas */}
      <div className="flex md:hidden p-1 rounded-2xl bg-[#141822] border border-white/10 gap-1">
        <button
          type="button"
          onClick={() => setSelectedMobileTab("free")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedMobileTab === "free"
              ? "bg-white/15 text-white shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Gratuito
        </button>
        <button
          type="button"
          onClick={() => setSelectedMobileTab("pro")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedMobileTab === "pro"
              ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          PRO (Destaque)
        </button>
        <button
          type="button"
          onClick={() => setSelectedMobileTab("vip")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedMobileTab === "vip"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          VIP Fundador
        </button>
      </div>

      {/* Visualização Mobile: Cards condensados */}
      <div className="md:hidden space-y-2">
        {COMPARISON_DATA.map((row) => {
          const val =
            selectedMobileTab === "free"
              ? row.free
              : selectedMobileTab === "pro"
              ? row.pro
              : row.vip;
          const color =
            selectedMobileTab === "pro"
              ? "text-[#00E5FF]"
              : selectedMobileTab === "vip"
              ? "text-amber-300"
              : "text-neutral-200";

          return (
            <div
              key={row.name}
              className="p-3.5 rounded-2xl bg-[#141822] border border-white/5 flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">{row.category}</span>
                <p className="font-semibold text-white leading-snug">{row.name}</p>
              </div>
              <div className="shrink-0 text-right">{renderValue(val, color)}</div>
            </div>
          );
        })}
      </div>

      {/* Visualização Desktop: Tabela completa */}
      <div className="hidden md:block rounded-3xl bg-[#141822] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-black/40">
                <th className="p-4 pl-6 text-neutral-400 font-mono uppercase tracking-wider text-[11px] w-5/12">
                  Recurso & Benefício
                </th>
                <th className="p-4 text-center font-bold text-white w-2/12">
                  Modo Gratuito
                </th>
                <th className="p-4 text-center font-black text-[#00E5FF] bg-cyan-500/10 border-x border-cyan-500/20 w-2.5/12">
                  <div className="inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Plano PRO</span>
                  </div>
                </th>
                <th className="p-4 pr-6 text-center font-black text-amber-300 w-2.5/12">
                  <div className="inline-flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>VIP Fundador</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {COMPARISON_DATA.map((row) => (
                <tr key={row.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 pl-6">
                    <span className="text-[10px] font-mono text-neutral-500 block mb-0.5 uppercase tracking-wide">
                      {row.category}
                    </span>
                    <span className="font-medium text-neutral-200">{row.name}</span>
                  </td>
                  <td className="p-4 text-center">{renderValue(row.free)}</td>
                  <td className="p-4 text-center bg-cyan-500/[0.04] border-x border-cyan-500/10">
                    {renderValue(row.pro, "text-[#00E5FF]")}
                  </td>
                  <td className="p-4 pr-6 text-center">
                    {renderValue(row.vip, "text-amber-300")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
