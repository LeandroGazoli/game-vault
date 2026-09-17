"use client";

import React, { useMemo } from "react";
import { useSanitizedHtml } from "@/lib/sanitizeHtml";

/**
 * Renderiza o HTML do artigo sanitizado — NO CLIENTE, de propósito.
 *
 * `sanitizeCustomHtml` usa `isomorphic-dompurify`, que no servidor recorre ao **jsdom**.
 * O jsdom depende de APIs do Node que não existem no isolate V8 do Cloudflare Workers, e a
 * página de artigo quebrava com `ReferenceError: MessagePort is not defined` seguido de
 * `TypeError: JSDOM is not a constructor` — HTTP 500 em toda `/artigos/[slug]`.
 *
 * No navegador o DOMPurify usa o DOM real e funciona. É o mesmo padrão já adotado por
 * `CustomHtmlBio` e `IndieDescriptionRenderer`.
 *
 * Nota de segurança: o conteúdo vem de `articles`, cuja escrita é restrita a admin verificado
 * nas Security Rules — então a sanitização aqui é defesa em profundidade, não a barreira
 * principal. O ideal seria sanitizar na GRAVAÇÃO (no editor admin, que já é client) e servir
 * HTML limpo; fica registrado como melhoria.
 */
export default function ArticleHtmlContent({ html }: { html: string }) {
  const clean = useSanitizedHtml(html);

  return (
    <div
      className="prose prose-invert prose-emerald max-w-none space-y-6 text-sm sm:text-base text-gray-300 leading-relaxed font-sans"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
