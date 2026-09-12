import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import ContatoForm from "@/components/ContatoForm";
import JsonLd from "@/components/seo/JsonLd";
import { Mail, Clock, ShieldCheck, MessageSquare, Headphones, Building } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export const metadata: Metadata = {
  title: "Contato & Suporte • Central de Atendimento MyGameList",
  description:
    "Entre em contato com a equipe editorial e de suporte do MyGameList. Envie sugestões, dúvidas, relatórios de bugs e propostas de parcerias.",
  alternates: {
    canonical: "/contato",
  },
  openGraph: {
    title: "Contato & Suporte • MyGameList",
    description: "Canais oficiais de atendimento, imprensa e suporte aos jogadores do MyGameList.",
    url: `${SITE_URL}/contato`,
    siteName: "MyGameList",
    type: "website",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contato & Suporte • MyGameList",
    description: "Fale conosco pelo canal oficial de suporte do MyGameList.",
    images: ["/og-image.jpg"],
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Central de Contato MyGameList",
    description: "Canais oficiais de suporte, ouvidoria e parcerias da plataforma MyGameList.",
    url: `${SITE_URL}/contato`,
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Contato", item: `${SITE_URL}/contato` },
    ],
  },
];

export default function ContatoPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <div className="max-w-5xl mx-auto space-y-10 py-6 px-4">
        {/* Header da Página */}
        <section className="relative rounded-[32px] overflow-hidden border border-white/10 bg-[#141822] p-8 sm:p-12 shadow-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <Headphones className="w-3.5 h-3.5" />
            <span>ATENDIMENTO OFICIAL AO USUÁRIO</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Fale com a Equipe do <br />
            <span className="gamer-gradient-text">MyGameList.</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
            Valorizamos a comunicação direta e transparente com nossa comunidade. Seja para tirar dúvidas, reportar inconsistências em fichas de jogos, sugerir novos recursos ou propor parcerias institucionais, estamos prontos para atender.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-gray-400 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Tempo Médio de Resposta: até 24h úteis
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
              Conformidade LGPD
            </span>
          </div>
        </section>

        {/* Grid de Canais Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-white/10 bg-[#141822] p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Suporte Geral &amp; Dúvidas</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Ajuda com sua conta, sincronização de biblioteca ou dúvidas sobre recursos do acervo.
            </p>
            <a
              href="mailto:contato@mygameslist.com.br"
              className="inline-block text-xs font-bold text-emerald-400 hover:underline pt-1"
            >
              contato@mygameslist.com.br
            </a>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#141822] p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Imprensa &amp; Parcerias</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Oportunidades de colaboração comercial, campanhas publicitárias e contato com mídia.
            </p>
            <a
              href="mailto:parcerias@mygameslist.com.br"
              className="inline-block text-xs font-bold text-[#00E5FF] hover:underline pt-1"
            >
              parcerias@mygameslist.com.br
            </a>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#141822] p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Ideias &amp; Votação</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Vote em melhorias sugeridas pela comunidade ou envie seu relato de bug diretamente.
            </p>
            <Link
              href="/feedback"
              className="inline-block text-xs font-bold text-purple-400 hover:underline pt-1"
            >
              Acessar Mural de Feedback →
            </Link>
          </div>
        </div>

        {/* Formulário de Envio */}
        <ContatoForm />
      </div>
    </>
  );
}
