"use client";

import { useScrollRestoration } from "@/hooks/useScrollRestoration";

/**
 * Componente cliente sem renderização visual que ativa o sistema
 * global de restauração inteligente de scroll no App Router.
 */
export default function ScrollRestoration() {
  useScrollRestoration();
  return null;
}
