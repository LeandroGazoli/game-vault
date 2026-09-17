"use client";

import { useEffect, useState } from "react";
import type { SystemSettings } from "@/lib/types";

/**
 * Configurações do sistema para componentes client, vindas de uma ROTA CACHEADA.
 *
 * Substitui o padrão que havia espalhado por ~8 componentes: cada um abria seu próprio
 * `onSnapshot(doc(db, "system", "settings"))`. Três deles vivem no layout, ou seja, montam
 * em toda página — e leitura feita do navegador não aparece em `wrangler tail` nem no
 * contador do servidor, só na fatura.
 *
 * Troca deliberada: perde-se o tempo real (a mudança leva até 5 min para propagar) em favor
 * de custo previsível. Para banner, aviso e carrossel — conteúdo editorial — isso é
 * irrelevante. O bloqueio de manutenção de verdade acontece no middleware, na borda, e não
 * depende disto.
 */
export function useSystemSettings(): { settings: SystemSettings | null; loaded: boolean } {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/system/settings")
      .then((r) => (r.ok ? (r.json() as Promise<{ settings?: SystemSettings | null }>) : null))
      .then((data) => {
        if (cancelled) return;
        setSettings(data?.settings ?? null);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loaded };
}
