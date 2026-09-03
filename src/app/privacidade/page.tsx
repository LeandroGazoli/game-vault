import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, CheckCircle2 } from "lucide-react";

import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export const metadata: Metadata = {
  title: "Política de Privacidade • GameVault",
  description:
    "Conheça como o GameVault coleta, utiliza e protege os dados dos usuários em conformidade com a LGPD e o Google AdSense.",
  alternates: {
    canonical: "/privacidade",
  },
  openGraph: {
    title: "Política de Privacidade • GameVault",
    description:
      "Conheça as práticas de privacidade, tratamento de dados e conformidade com a LGPD no GameVault.",
    url: `${SITE_URL}/privacidade`,
    siteName: "GameVault",
    type: "website",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Política de Privacidade • GameVault",
    description: "Conheça como o GameVault protege seus dados e respeita a LGPD.",
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
        name: "Política de Privacidade",
        item: `${SITE_URL}/privacidade`,
      },
    ],
  },
];

export default function PrivacidadePage() {
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
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Política de Privacidade
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Conformidade LGPD (Lei nº 13.709/2018) &amp; Google AdSense Policy
            </p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-300 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">1. Visão Geral</h2>
            <p>
              A sua privacidade é fundamental para o <strong>GameVault</strong>. Esta Política de Privacidade descreve de forma clara e transparente quais informações coletamos, como as utilizamos, como as protegemos e quais são os seus direitos como titular dos dados.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">2. Informações que Coletamos</h2>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                <strong>Informações de Cadastro:</strong> Nome de exibição, endereço de e-mail e foto de perfil fornecidos voluntariamente no momento do registro ou login social com o Google.
              </li>
              <li>
                <strong>Dados da Biblioteca Gamer:</strong> Jogos adicionados, status de progresso (zerado, jogando, backlog), notas atribuídas, resenhas escritas e tempos de jogo registrados.
              </li>
              <li>
                <strong>Dados Técnicos e de Navegação:</strong> Endereço IP aproximado, tipo de navegador, sistema operacional e páginas visitadas para fins de segurança, estabilidade e análise de métricas agregadas.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">3. Finalidade do Tratamento de Dados</h2>
            <p>Os dados coletados são utilizados estritamente para:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Autenticar e manter sua sessão ativa na plataforma.</li>
              <li>Sincronizar e salvar sua biblioteca de jogos na sua biblioteca com segurança.</li>
              <li>Calcular estatísticas de tempo de jogo e jogos zerados do seu perfil.</li>
              <li>Garantir a segurança técnica e prevenir fraudes ou abusos no sistema.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">4. Google AdSense e Cookies de Terceiros</h2>
            <p>
              Utilizamos provedores de anúncios terceirizados, incluindo o <strong>Google AdSense</strong>, para veicular anúncios quando você visita nosso site:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                O Google utiliza cookies para veicular anúncios com base em visitas anteriores dos usuários ao GameVault ou a outros sites na internet.
              </li>
              <li>
                O uso de cookies de publicidade pelo Google permite que ele e seus parceiros veiculem anúncios para nossos usuários com base em sua navegação na Web.
              </li>
              <li>
                Você pode optar por desativar a publicidade personalizada acessando as <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-[#00E5FF] underline">Configurações de Anúncios do Google</a> ou através do site <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-[#00E5FF] underline">aboutads.info</a>.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">5. Armazenamento e Segurança dos Dados</h2>
            <p>
              Adotamos práticas avançadas de segurança digital, incluindo criptografia de tráfego HTTPS/TLS, regras de segurança estritas no banco de dados e isolamento de dados por usuário autenticado. Não vendemos nem compartilhamos seus dados pessoais individuais com terceiros para fins de marketing direto.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">6. Seus Direitos (LGPD)</h2>
            <p>
              Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você possui o direito de confirmar a existência de tratamento, acessar seus dados, corrigir dados incompletos ou solicitar a exclusão definitiva de sua conta e histórico a qualquer momento.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">7. Contato do Encarregado de Dados</h2>
            <p>
              Caso tenha dúvidas sobre esta política ou queira exercer seus direitos de titular dos dados, entre em contato com nosso time pelo e-mail: <a href="mailto:privacidade@mygameslist.com.br" className="text-[#00E5FF] underline">privacidade@gamevault.app</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
    </>
  );
}
