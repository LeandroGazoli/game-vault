import React from "react";
import Link from "next/link";
import { ArrowLeft, Cookie, Info, CheckCircle2 } from "lucide-react";

import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description:
    "Saiba como o MyGameList e o Google AdSense utilizam cookies e como você pode gerenciar suas preferências no seu navegador.",
  alternates: {
    canonical: "/cookies",
  },
  openGraph: {
    title: "Política de Cookies • MyGameList",
    description:
      "Saiba como o MyGameList e serviços integrados utilizam cookies para navegação e personalização.",
    url: `${SITE_URL}/cookies`,
    siteName: "MyGameList",
    type: "website",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Política de Cookies • MyGameList",
    description: "Saiba como o MyGameList utiliza cookies e como gerenciar preferências.",
    images: ["/og-image.jpg"],
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Política de Cookies",
        item: `${SITE_URL}/cookies`,
      },
    ],
  },
];

export default function CookiesPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Início
      </Link>

      <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-8 sm:p-12 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-[#00E5FF]">
            <Cookie className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Política de Cookies
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Transparência &amp; Privacidade de Dados
            </p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-300 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">1. O que são Cookies?</h2>
            <p>
              Cookies são pequenos arquivos de texto armazenados no seu computador ou dispositivo móvel quando você visita determinados websites. Eles são amplamente utilizados para fazer os sites funcionarem com mais eficiência, além de fornecer relatórios estatísticos aos proprietários do site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">2. Como Utilizamos os Cookies</h2>
            <p>
              O <strong>MyGameList</strong> utiliza cookies por diferentes motivos descritos abaixo:
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cookies Estritamente Necessários (Sessão &amp; Autenticação)
                </h3>
                <p className="text-xs text-gray-400">
                  Essenciais para autenticar seu acesso, manter você conectado à sua biblioteca e permitir a navegação entre páginas protegidas.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E5FF]" /> Cookies de Preferências
                </h3>
                <p className="text-xs text-gray-400">
                  Lembram suas configurações visuais, modo de exibição de lista ou grade e temas personalizados.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> Cookies de Publicidade (Google AdSense)
                </h3>
                <p className="text-xs text-gray-400">
                  O Google e seus parceiros utilizam cookies para veicular anúncios personalizados com base nas visitas anteriores dos usuários a este e a outros sites na internet. Você pode optar por desativar os cookies de publicidade personalizada através das Configurações de Anúncios do Google.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">3. Como Gerenciar ou Desativar Cookies</h2>
            <p>
              Você pode alterar as configurações do seu navegador para bloquear ou receber alertas sobre cookies a qualquer momento. Note que ao desativar cookies estritamente necessários, algumas funcionalidades do MyGameList (como manter-se conectado à sua conta) podem não operar como esperado.
            </p>
            <p className="text-xs text-gray-400">
              Instruções dos principais navegadores:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs text-gray-300">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[#00E5FF] underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/pt-BR/kb/gerencie-configuracoes-de-armazenamento-local-do-site" target="_blank" rel="noopener noreferrer" className="text-[#00E5FF] underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/pt-br/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#00E5FF] underline">Apple Safari</a></li>
              <li><a href="https://support.microsoft.com/pt-br/microsoft-edge/excluir-cookies-no-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-[#00E5FF] underline">Microsoft Edge</a></li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">4. Dúvidas</h2>
            <p>
              Para esclarecimentos sobre a nossa utilização de cookies e tecnologias semelhantes, contate: <a href="mailto:privacidade@mygameslist.com.br" className="text-[#00E5FF] underline">privacidade@mygameslist.com.br</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
    </>
  );
}
