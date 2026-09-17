import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export * from "./plans.types";
import { DEFAULT_PLANS_CONFIG, type PlansConfig } from "./plans.types";

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
