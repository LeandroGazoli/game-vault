import { NextResponse } from "next/server";
import { getSystemSettingsServer } from "@/lib/serverData";

/**
 * Feature flags públicas, servidas por rota CACHEADA.
 *
 * Componentes client que precisam de uma flag costumavam abrir um `onSnapshot` em
 * `system/settings` — e há ~8 deles espalhados. Cada listener custa leitura por visitante,
 * e leitura feita do navegador não aparece em nenhum log do servidor.
 *
 * Aqui a leitura acontece uma vez por janela de cache e é compartilhada por todos. O preço é
 * a flag levar até 5 minutos para propagar, o que é aceitável para liga/desliga de recurso.
 */
export const revalidate = 300;

export async function GET() {
  try {
    const settings = await getSystemSettingsServer();
    return NextResponse.json(
      { features: settings.features ?? {} },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      }
    );
  } catch {
    // Falha aberta: na dúvida, recurso ligado — melhor que esconder função por erro de infra.
    return NextResponse.json({ features: {} }, { status: 200 });
  }
}
