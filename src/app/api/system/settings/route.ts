import { NextResponse } from "next/server";
import { getSystemSettingsServer } from "@/lib/serverData";

/**
 * Configurações públicas do sistema (banner, carrossel, avisos), servidas por rota CACHEADA.
 *
 * Há ~8 componentes client que abriam `onSnapshot` em `system/settings`, incluindo a home.
 * Cada um custa leitura do Firestore por visitante — e por acontecer no navegador, não
 * aparece em nenhum log de servidor. Aqui a leitura é uma por janela de cache, compartilhada.
 *
 * Campos sensíveis NÃO saem daqui: as chaves de API de terceiros vivem em secrets do Worker
 * desde a correção de exposição, e não neste documento.
 */
export const revalidate = 300;

export async function GET() {
  try {
    const settings = await getSystemSettingsServer();
    return NextResponse.json(
      { settings },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("[api/system/settings] Erro:", error);
    return NextResponse.json({ settings: null }, { status: 200 });
  }
}
