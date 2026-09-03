import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, ShieldAlert } from "lucide-react";

import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Leia os termos e condições de uso da plataforma GameVault.",
  alternates: {
    canonical: "/termos",
  },
  openGraph: {
    title: "Termos de Uso • GameVault",
    description: "Leia os termos e condições de uso da plataforma GameVault.",
    url: `${SITE_URL}/termos`,
    siteName: "GameVault",
    type: "website",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Termos de Uso • GameVault",
    description: "Termos e condições de uso da plataforma GameVault.",
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
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Termos de Uso
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Última atualização: Setembro de 2026
            </p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-300 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar o site e os serviços do <strong>GameVault</strong> (acessível através de mygameslist.com.br e domínios associados), você concorda expressamente em cumprir e estar vinculado a estes Termos de Uso e a todas as leis e regulamentos aplicáveis. Se você não concordar com qualquer um destes termos, você está proibido de usar ou acessar este site.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">2. Descrição dos Serviços</h2>
            <p>
              O GameVault é uma plataforma online de catalogação, rastreamento de biblioteca de jogos eletrônicos, visualização de calendários de lançamentos, consulta de notas de crítica e tempos estimados de conclusão de campanhas. Os serviços são fornecidos de forma gratuita para uso pessoal e não comercial.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">3. Contas de Usuário e Segurança</h2>
            <p>
              Para utilizar determinadas funcionalidades, como salvar jogos em sua biblioteca pessoal e registrar avaliações, você precisará criar uma conta através de autenticação por e-mail ou provedores terceiros (Google). Você é o único responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades que ocorram sob sua conta.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">4. Propriedade Intelectual e Dados de Terceiros</h2>
            <p>
              Todas as marcas registradas, títulos de jogos, logotipos de estúdios, capas de jogos e capturas de tela exibidos na plataforma são de propriedade de seus respectivos desenvolvedores, publicadores e detentores de direitos autorais. O GameVault obtém metadados informativos por meio de APIs públicas e abertas (incluindo IGDB e HowLongToBeat) exclusivamente para fins de referência cultural, identificação e crítica, sob as normas de uso justo (*fair use*).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">5. Conduta e Conteúdo do Usuário</h2>
            <p>
              Ao publicar resenhas, comentários ou notas no GameVault, você concorda em não submeter conteúdo ofensivo, difamatório, ilegal, promocional não autorizado (spam) ou que viole direitos de propriedade de terceiros. Reservamo-nos o direito de remover qualquer conteúdo que viole estas diretrizes sem aviso prévio.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">6. Publicidade e Links de Afiliados</h2>
            <p>
              O GameVault pode veicular anúncios de terceiros (como Google AdSense) e links de afiliados para produtos e serviços gamers. O GameVault não é responsável pelo conteúdo, práticas de privacidade ou produtos oferecidos por anunciantes ou sites externos vinculados.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">7. Isenção de Garantias e Limitação de Responsabilidade</h2>
            <p>
              O serviço é fornecido no estado em que se encontra (&quot;como está&quot; e &quot;conforme disponível&quot;). O GameVault não oferece garantias de que o serviço será ininterrupto, livre de erros ou que as informações fornecidas por fontes externas estejam 100% livres de imprecisões temporárias.
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
    </div>
    </>
  );
}
