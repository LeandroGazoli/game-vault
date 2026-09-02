import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type PlanKey = "pro_monthly" | "pro_single_month" | "pro_annual" | "vip_lifetime";

export interface PlanItemConfig {
  id: PlanKey;
  name: string;
  description: string;
  price: number;
  formattedPrice: string;
  intervalText: string;
  priceId: string;
  mode: "subscription" | "payment";
  badge?: string;
  enabled: boolean;
  features: string[];
}

export interface PlansConfig {
  pro_monthly: PlanItemConfig;
  pro_single_month: PlanItemConfig;
  pro_annual: PlanItemConfig;
  vip_lifetime: PlanItemConfig;
  updatedAt?: string;
}

export const DEFAULT_PLANS_CONFIG: PlansConfig = {
  pro_monthly: {
    id: "pro_monthly",
    name: "GameVault PRO (Mensal)",
    description: "Acesso total a todos os recursos PRO com cobrança mensal automática. Cancele quando quiser.",
    price: 9.9,
    formattedPrice: "R$ 9,90",
    intervalText: "/mês",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "price_1UBHDW2Kf2AAuQLblxkNUioG",
    mode: "subscription",
    badge: "Recorrente",
    enabled: true,
    features: [
      "100% Livre de Anúncios e Banners",
      "Selo PRO oficial no perfil e comentários",
      "Personalização total com temas e banners",
      "Estatísticas avançadas de tempo e backlog",
      "Exportação completa (Excel, JSON e API)",
      "Roleta de backlog com filtros ilimitados",
    ],
  },
  pro_single_month: {
    id: "pro_single_month",
    name: "GameVault PRO (1 Mês Avulso)",
    description: "30 dias de acesso PRO sem renovação automática. Pague apenas 1 único mês e não se preocupe com cobranças futuras.",
    price: 9.9,
    formattedPrice: "R$ 9,90",
    intervalText: "único (30 dias)",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_SINGLE_MONTH || "price_1UBJ8C2Kf2AAuQLbQMZlsl4B",
    mode: "payment",
    badge: "Sem Renovação",
    enabled: true,
    features: [
      "30 dias de todos os benefícios PRO",
      "Pagamento único sem surpresas no cartão",
      "Zero cobranças recorrentes automáticas",
      "100% Livre de Anúncios no período",
      "Selo PRO oficial e temas desbloqueados",
      "Exportação e ferramentas liberadas",
    ],
  },
  pro_annual: {
    id: "pro_annual",
    name: "GameVault PRO (Anual)",
    description: "Economize mais de 30% com o plano anual. O melhor custo-benefício para gamers assíduos.",
    price: 79.9,
    formattedPrice: "R$ 79,90",
    intervalText: "/ano",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL || "price_1UBHDW2Kf2AAuQLblBdLv8op",
    mode: "subscription",
    badge: "Mais Popular (Economize 33%)",
    enabled: true,
    features: [
      "Tudo do plano PRO por 1 ano completo",
      "Equivalente a R$ 6,65 por mês",
      "Economia de R$ 38,90 no ano",
      "Badge dourado de Apoiador Anual",
      "Prioridade em novas funcionalidades",
    ],
  },
  vip_lifetime: {
    id: "vip_lifetime",
    name: "GameVault VIP (Membro Fundador)",
    description: "Acesso vitalício para sempre. Um único pagamento e você é VIP eterno do GameVault.",
    price: 149.9,
    formattedPrice: "R$ 149,90",
    intervalText: "vitalício",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_VIP_LIFETIME || "price_1UBHDX2Kf2AAuQLbsbuoD6ll",
    mode: "payment",
    badge: "Acesso Vitalício Eterno",
    enabled: true,
    features: [
      "Acesso PRO e VIP para toda a vida",
      "Pagamento único de R$ 149,90 sem mensalidades",
      "Selo exclusivo de Membro Fundador VIP",
      "Capa Obsidian Gold VIP exclusiva",
      "Seu nome eternizado na página de Apoiadores",
      "Todas as futuras atualizações incluídas",
    ],
  },
};

const PLANS_DOC_REF = "plans_config";

/**
 * Carrega as configurações dos planos do Firestore.
 * Em caso de erro ou se o documento não existir, retorna a configuração padrão.
 */
export async function getPlansConfig(): Promise<PlansConfig> {
  if (!db) return DEFAULT_PLANS_CONFIG;

  try {
    const docRef = doc(db, "system", PLANS_DOC_REF);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as Partial<PlansConfig>;
      return {
        pro_monthly: { ...DEFAULT_PLANS_CONFIG.pro_monthly, ...data.pro_monthly },
        pro_single_month: { ...DEFAULT_PLANS_CONFIG.pro_single_month, ...data.pro_single_month },
        pro_annual: { ...DEFAULT_PLANS_CONFIG.pro_annual, ...data.pro_annual },
        vip_lifetime: { ...DEFAULT_PLANS_CONFIG.vip_lifetime, ...data.vip_lifetime },
        updatedAt: data.updatedAt,
      };
    }
  } catch (error) {
    console.error("Erro ao buscar configurações de planos no Firestore:", error);
  }

  return DEFAULT_PLANS_CONFIG;
}

/**
 * Salva as configurações de planos atualizadas no Firestore.
 */
export async function savePlansConfig(config: PlansConfig): Promise<boolean> {
  if (!db) return false;

  try {
    const docRef = doc(db, "system", PLANS_DOC_REF);
    await setDoc(docRef, {
      ...config,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Erro ao salvar configurações de planos no Firestore:", error);
    throw error;
  }
}
