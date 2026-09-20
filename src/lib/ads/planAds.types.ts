import { PlanKey } from "../plans.types";

export interface PromoCreativeConfig {
  id: string;
  tag: string;
  badge: string;
  title: string;
  description: string;
  priceNote?: string;
  linkedPlanKey?: PlanKey;
  ctaText: string;
  accentColor: string;
  borderColor: string;
  badgeColor: string;
  bgGradient: string;
  btnGradient: string;
  iconType: "EyeOff" | "Zap" | "Sparkles" | "Crown";
  enabled: boolean;
}

export interface PlanAdsConfig {
  enabled: boolean;
  displayProbability: number; // 0 a 100%
  minItemsBeforeAd: number; // Mínimo de jogos antes do 1º anúncio (default: 4)
  maxAdsPerList: number; // Máximo de anúncios por listagem (default: 2)
  creatives: PromoCreativeConfig[];
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_PROMO_CREATIVES: PromoCreativeConfig[] = [
  {
    id: "no-ads",
    tag: "Patrocinado",
    badge: "100% Sem Anúncios",
    title: "Cansado de propagandas?",
    description: "Navegue pelo catálogo e feeds com zero anúncios e foco total na sua coleção.",
    priceNote: "A partir de R$ 6,65/mês",
    linkedPlanKey: "pro_annual",
    ctaText: "Remover Anúncios",
    accentColor: "text-emerald-400",
    borderColor: "border-emerald-500/30 hover:border-emerald-400/60",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    bgGradient: "from-emerald-950/50 via-[#121622] to-[#0c0d12]",
    btnGradient: "from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black",
    iconType: "EyeOff",
    enabled: true,
  },
  {
    id: "xp-boost",
    tag: "Destaque PRO",
    badge: "Boost +50% XP",
    title: "Suba rápido no ranking",
    description: "Ganhe 1.5x de XP em cada jogo concluído e lidere a tabela da comunidade.",
    priceNote: "Multiplicador 1.5x",
    linkedPlanKey: "pro_monthly",
    ctaText: "Acelerar Meu XP",
    accentColor: "text-[#00E5FF]",
    borderColor: "border-cyan-500/30 hover:border-cyan-400/60",
    badgeColor: "bg-cyan-500/15 text-[#00E5FF] border-cyan-500/30",
    bgGradient: "from-cyan-950/50 via-[#121622] to-[#0c0d12]",
    btnGradient: "from-[#00E5FF] to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black",
    iconType: "Zap",
    enabled: true,
  },
  {
    id: "profile-pro",
    tag: "Patrocinado",
    badge: "Perfil Exclusivo",
    title: "Seu perfil em destaque",
    description: "Desbloqueie o Selo PRO Neon, temas customizados e crie até 10 insígnias próprias.",
    priceNote: "Selo PRO Neon",
    linkedPlanKey: "pro_monthly",
    ctaText: "Personalizar Perfil",
    accentColor: "text-purple-400",
    borderColor: "border-purple-500/30 hover:border-purple-400/60",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    bgGradient: "from-purple-950/50 via-[#121622] to-[#0c0d12]",
    btnGradient: "from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white",
    iconType: "Sparkles",
    enabled: true,
  },
  {
    id: "vip-lifetime",
    tag: "Edição Limitada",
    badge: "VIP Vitalício",
    title: "Seja Membro Fundador",
    description: "Acesso permanente sem mensalidades com 2.0x XP em dobro para toda a vida.",
    priceNote: "Pagamento Único",
    linkedPlanKey: "vip_lifetime",
    ctaText: "Virar Membro VIP",
    accentColor: "text-amber-400",
    borderColor: "border-amber-500/40 hover:border-amber-400/70",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    bgGradient: "from-amber-950/50 via-[#121622] to-[#0c0d12]",
    btnGradient: "from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black",
    iconType: "Crown",
    enabled: true,
  },
];

export const DEFAULT_PLAN_ADS_CONFIG: PlanAdsConfig = {
  enabled: true,
  displayProbability: 70, // 70% de chance de exibição
  minItemsBeforeAd: 4, // Pelo menos 4 itens antes do primeiro ad
  maxAdsPerList: 2, // Até 2 anúncios por página/listagem
  creatives: DEFAULT_PROMO_CREATIVES,
};
