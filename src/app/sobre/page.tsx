import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import {
  Gamepad2,
  Sparkles,
  Trophy,
  Clock,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Mail,
  Heart,
} from "lucide-react";

import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export const metadata: Metadata = {
  title: "Sobre o MyGameList • Plataforma de Rastreamento de Jogos",
  description:
    "Conheça o MyGameList, o seu acervo gamer definitivo com catálogo em tempo real, notas do Metacritic, tempos do HowLongToBeat e calendário de lançamentos.",
  alternates: {
    canonical: "/sobre",
  },
  openGraph: {
    title: "Sobre o MyGameList • Plataforma de Rastreamento de Jogos",
    description:
      "Conheça a história, recursos e missão do MyGameList para a comunidade gamer brasileira.",
    url: `${SITE_URL}/sobre`,
    siteName: "MyGameList",
    type: "website",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre o MyGameList • Plataforma de Rastreamento de Jogos",
    description: "Conheça o MyGameList, o seu acervo definitivo de jogos.",
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
        name: "Sobre o MyGameList",
        item: `${SITE_URL}/sobre`,
      },
    ],
  },
];

export default function SobrePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6 px-4">
      <JsonLd data={structuredData} />
      {/* Hero / Apresentação */}
      <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-[#18191c] p-8 sm:p-12 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Logo size="lg" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          A sua biblioteca definitiva de <br />
          <span className="gamer-gradient-text">Jogos, Avaliações e Estatísticas.</span>
        </h1>

        <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
          O <strong>MyGameList</strong> nasceu com a missão de oferecer aos jogadores de todas as plataformas uma experiência centralizada, rápida e visualmente incrível para registrar seus jogos zerados, acompanhar lançamentos e descobrir novos títulos.
        </p>
      </div>

      {/* Pilares da Plataforma */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pilar 1 */}
        <div className="rounded-3xl border border-white/10 bg-[#18191c] p-6 space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00E5FF]">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Catálogo Vivo IGDB</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Mais de centenas de milhares de jogos catalogados com capas em alta definição, plataformas, estúdios e datas de lançamento sincronizadas em tempo real.
          </p>
        </div>

        {/* Pilar 2 */}
        <div className="rounded-3xl border border-white/10 bg-[#18191c] p-6 space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Metacritic & Crítica</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Notas consolidadas da crítica especializada e da comunidade mundial para ajudar você a decidir sua próxima grande aventura.
          </p>
        </div>

        {/* Pilar 3 */}
        <div className="rounded-3xl border border-white/10 bg-[#18191c] p-6 space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">HowLongToBeat Integrado</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Descubra quanto tempo leva para zerar a campanha principal, completar extras ou platinar 100% qualquer jogo com base em dados de milhares de jogadores.
          </p>
        </div>
      </div>

      {/* Detalhes Técnicos & Recursos */}
      <div className="rounded-3xl border border-white/10 bg-[#18191c] p-8 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#00E5FF]" /> Nossos Principais Recursos
        </h2>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300">
          <li className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong>Cloud Sync Seguro:</strong> Seus registros sincronizados na nuvem e acessíveis de qualquer dispositivo.</span>
          </li>
          <li className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong>Calendário de Lançamentos:</strong> Navegue pelos lançamentos mês a mês e nunca perca uma estreia.</span>
          </li>
          <li className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong>PWA Instalável:</strong> Instale o MyGameList no seu celular ou computador como um app nativo com suporte offline.</span>
          </li>
          <li className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong>Tradução Automática:</strong> Sinopses e informações traduzidas em tempo real para o português.</span>
          </li>
        </ul>
      </div>

      {/* Linha Editorial & Metodologia E-E-A-T */}
      <div className="rounded-3xl border border-white/10 bg-[#18191c] p-8 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Linha Editorial &amp; Metodologia de Dados
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          No <strong>MyGameList</strong>, prezamos pelo rigor técnico e transparência na agregação e curadoria de dados:
        </p>
        <ul className="space-y-2 text-xs text-gray-400 list-disc list-inside">
          <li><strong>Curadoria Humana:</strong> Todas as informações catalogadas passam por revisão e triagem contínua para evitar duplicidades ou dados corrompidos.</li>
          <li><strong>Consolidação de Crítica:</strong> As notas do Metacritic refletem a média ponderada de dezenas de veículos especializados internacionais, sem viés editorial unilateral.</li>
          <li><strong>Precisão em Horas de Jogo:</strong> Os tempos do HowLongToBeat são calibrados a partir de milhares de envios de jogadores reais, divididos entre narrativa principal, missões extras e conclusão total (100%).</li>
          <li><strong>Autoria e Responsabilidade:</strong> O projeto é liderado por <strong>Leandro Gazoli</strong> (Fundador e Desenvolvedor Principal) e conta com a colaboração ativa dos membros da comunidade gamer.</li>
        </ul>
      </div>

      {/* Contato & Transparência */}
      <div className="rounded-3xl border border-white/10 bg-[#18191c] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-white">Dúvidas, sugestões ou parcerias?</h3>
          <p className="text-xs text-gray-400">
            Estamos sempre abertos ao feedback da comunidade gamer para evoluir a plataforma.
          </p>
        </div>
        <Link
          href="/contato"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg transition-transform hover:scale-105"
        >
          <Mail className="w-4 h-4" /> Ir para Página de Contato
        </Link>
      </div>
    </div>
  );
}
