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

export const metadata = {
  title: "Sobre o GameVault • Plataforma de Rastreamento de Jogos",
  description:
    "Conheça o GameVault, o seu acervo gamer definitivo com catálogo em tempo real, notas do Metacritic, tempos do HowLongToBeat e calendário de lançamentos.",
};

export default function SobrePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Botão Voltar */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Início
      </Link>

      {/* Header Principal */}
      <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-[#18191c] p-8 sm:p-12 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Logo size="lg" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          A sua biblioteca definitiva de <br />
          <span className="gamer-gradient-text">Jogos, Avaliações e Estatísticas.</span>
        </h1>

        <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
          O <strong>GameVault</strong> nasceu com a missão de oferecer aos jogadores de todas as plataformas uma experiência centralizada, rápida e visualmente incrível para registrar seus jogos zerados, acompanhar lançamentos e descobrir novos títulos.
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
            <span><strong>Cloud Sync Seguro:</strong> Seus registros salvos na nuvem pelo Firebase e acessíveis de qualquer dispositivo.</span>
          </li>
          <li className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong>Calendário de Lançamentos:</strong> Navegue pelos lançamentos mês a mês e nunca perca uma estreia.</span>
          </li>
          <li className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong>PWA Instalável:</strong> Instale o GameVault no seu celular ou computador como um app nativo com suporte offline.</span>
          </li>
          <li className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong>Tradução Automática:</strong> Sinopses e informações traduzidas em tempo real para o português.</span>
          </li>
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
        <a
          href="mailto:contato@gamevault.app"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-gray-200 text-black font-bold text-xs shadow-lg transition-transform hover:scale-105"
        >
          <Mail className="w-4 h-4" /> Entrar em Contato
        </a>
      </div>
    </div>
  );
}
