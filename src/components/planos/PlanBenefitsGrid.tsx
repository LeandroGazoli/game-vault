"use client";

import React from "react";
import { EyeOff, Zap, Sparkles, HeartHandshake } from "lucide-react";

interface BenefitItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge: string;
  gradient: string;
  iconColor: string;
}

const BENEFITS: BenefitItem[] = [
  {
    icon: EyeOff,
    title: "100% Sem Anúncios",
    description: "Navegue pelo catálogo, perfis e feeds com zero propagandas, interrupções ou banners visuais.",
    badge: "Foco Total",
    gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: Zap,
    title: "XP Turbinado no Ranking",
    description: "Multiplicador de 1.5x no PRO e 2.0x (XP em dobro) no VIP Fundador para cada jogo concluído.",
    badge: "1.5x a 2.0x XP",
    gradient: "from-cyan-500/15 via-cyan-500/5 to-transparent border-cyan-500/20",
    iconColor: "text-[#00E5FF]",
  },
  {
    icon: Sparkles,
    title: "Identidade & Customização Total",
    description: "Selo oficial, wallpapers de games, cores OLED de fundo, estilização CSS e até 10 insígnias customizadas.",
    badge: "Personalização",
    gradient: "from-purple-500/15 via-purple-500/5 to-transparent border-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    icon: HeartHandshake,
    title: "Apoio à Plataforma Gamer",
    description: "Sua assinatura mantém nossos servidores ativos, banco de dados atualizado e desenvolvimento contínuo.",
    badge: "Comunidade",
    gradient: "from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/20",
    iconColor: "text-amber-400",
  },
];

export default function PlanBenefitsGrid() {
  return (
    <section className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Por que fazer o upgrade para o <span className="text-emerald-400">Vault PRO</span>?
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto">
          Projetado especialmente para quem ama catalogar, compartilhar e valorizar sua jornada nos games.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {BENEFITS.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.title}
              className={`p-5 rounded-2xl bg-[#141822] border ${b.gradient} flex flex-col justify-between space-y-3 transition-all hover:border-white/20 hover:translate-y-[-2px] shadow-lg`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${b.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/5">
                    {b.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">{b.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{b.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
