import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, ShieldAlert } from "lucide-react";

import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Leia os termos e condições de uso da plataforma MyGameList.",
  alternates: {
    canonical: "/termos",
  },
  openGraph: {
    title: "Termos de Uso • MyGameList",
    description: "Leia os termos e condições de uso da plataforma MyGameList.",
    url: `${SITE_URL}/termos`,
    siteName: "MyGameList",
    type: "website",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Termos de Uso • MyGameList",
    description: "Termos e condições de uso da plataforma MyGameList.",
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
        name: "Termos de Uso",
        item: `${SITE_URL}/termos`,
      },
    ],
  },
];

export default function TermosPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Botão Voltar */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Início
      </Link>

      {/* Header */}
      <div className="space-y-3 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] text-xs font-mono font-semibold">
          <FileText className="w-3.5 h-3.5" />
          <span>LEGAL // TERMOS DE SERVIÇO</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Termos de Uso
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Última atualização: Setembro de 2026 • Versão 2.1
        </p>
      </div>

      {/* Conteúdo */}
      <div className="space-y-8 text-xs sm:text-sm text-gray-300 leading-relaxed">
        {/* Seção 1 */}
        <section className="rounded-3xl border border-white/10 bg-[#18191c] p-6 sm:p-8 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#00E5FF] font-mono">01.</span> Aceitação dos Termos
          </h2>
          <p className="text-gray-400">
            Ao acessar e utilizar o site e os serviços do <strong>MyGameList</strong> (acessível através de mygameslist.com.br e domínios associados), você concorda expressamente em cumprir e estar vinculado a estes Termos de Uso e a todas as leis e regulamentos aplicáveis. Se você não concordar com qualquer um destes termos, você está proibido de usar ou acessar este site.
          </p>
        </section>

        {/* Seção 2 */}
        <section className="rounded-3xl border border-white/10 bg-[#18191c] p-6 sm:p-8 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#00E5FF] font-mono">02.</span> Descrição do Serviço
          </h2>
          <p className="text-gray-400">
            O MyGameList é uma plataforma online de catalogação, rastreamento de biblioteca de jogos eletrônicos, visualização de calendários de lançamentos, consulta de notas de crítica e tempos estimados de conclusão de campanhas. Os serviços são fornecidos de forma gratuita para uso pessoal e não comercial.
          </p>
        </section>

        {/* Seção 3 */}
        <section className="rounded-3xl border border-white/10 bg-[#18191c] p-6 sm:p-8 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#00E5FF] font-mono">03.</span> Propriedade Intelectual &amp; Direitos Autorais
          </h2>
          <p className="text-gray-400">
            Todas as marcas registradas, títulos de jogos, logotipos de estúdios, capas de jogos e capturas de tela exibidos na plataforma são de propriedade de seus respectivos desenvolvedores, publicadores e detentores de direitos autorais. O MyGameList obtém metadados informativos por meio de APIs públicas e abertas (incluindo IGDB e HowLongToBeat) exclusivamente para fins de referência cultural, identificação e crítica, sob as normas de uso justo (*fair use*).
          </p>
        </section>

        {/* Seção 4 */}
        <section className="rounded-3xl border border-white/10 bg-[#18191c] p-6 sm:p-8 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#00E5FF] font-mono">04.</span> Conduta do Usuário
          </h2>
          <p className="text-gray-400">
            Ao publicar resenhas, comentários ou notas no MyGameList, você concorda em não submeter conteúdo ofensivo, difamatório, ilegal, promocional não autorizado (spam) ou que viole direitos de propriedade de terceiros. Reservamo-nos o direito de remover qualquer conteúdo que viole estas diretrizes sem aviso prévio.
          </p>
        </section>

        {/* Seção 5 */}
        <section className="rounded-3xl border border-white/10 bg-[#18191c] p-6 sm:p-8 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#00E5FF] font-mono">05.</span> Publicidade e Serviços de Terceiros
          </h2>
          <p className="text-gray-400">
            O MyGameList pode veicular anúncios de terceiros (como Google AdSense) e links de afiliados para produtos e serviços gamers. O MyGameList não é responsável pelo conteúdo, práticas de privacidade ou produtos oferecidos por anunciantes ou sites externos vinculados.
          </p>
        </section>

        {/* Seção 6 */}
        <section className="rounded-3xl border border-white/10 bg-[#18191c] p-6 sm:p-8 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#00E5FF] font-mono">06.</span> Limitação de Responsabilidade
          </h2>
          <p className="text-gray-400">
            O serviço é fornecido no estado em que se encontra (&quot;como está&quot; e &quot;conforme disponível&quot;). O MyGameList não oferece garantias de que o serviço será ininterrupto, livre de erros ou que as informações fornecidas por fontes externas estejam 100% livres de imprecisões temporárias.
          </p>
        </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">8. Modificações dos Termos</h2>
            <p>
              Podemos revisar e atualizar estes Termos de Uso periodicamente. Quaisquer alterações entrarão em vigor imediatamente após sua publicação nesta página. O uso continuado da plataforma após alterações constitui aceitação dos novos termos.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
