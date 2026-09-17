import React from "react";

interface JsonLdProps {
  data: Record<string, any> | Record<string, any>[];
}

/**
 * `JSON.stringify` NÃO escapa `<`, `>` nem `/`. Dentro de um `<script>` isso é uma via de
 * XSS armazenado: basta um campo controlado pelo usuário conter `</script>` para fechar a
 * tag e injetar HTML arbitrário na página.
 *
 * Caminho real que existia aqui: `bio` e `displayName` do perfil são gravados pelo próprio
 * usuário e entram neste componente em /perfil/[username]. Uma bio com
 * `</script><img src=x onerror=...>` executaria para todo visitante daquele perfil — e a CSP
 * do projeto tem `script-src 'unsafe-inline'`, então não haveria rede de proteção.
 *
 * Escapar como `\u003c` mantém o JSON-LD válido: qualquer parser decodifica de volta, e os
 * rastreadores do Google leem normalmente.
 */
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    // U+2028/U+2029 são quebras de linha válidas em JSON mas ILEGAIS em literal JS,
    // o que quebraria o parse do bloco inteiro.
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
