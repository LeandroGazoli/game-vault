"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, ShieldCheck } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Como funciona o cancelamento da assinatura?",
    answer:
      "Você pode cancelar sua assinatura com apenas 1 clique a qualquer momento diretamente no seu painel de perfil. Não existem multas, contratos nem carência. Você continuará com acesso PRO até o final do período já pago.",
  },
  {
    question: "Quais são as formas de pagamento aceitas?",
    answer:
      "Aceitamos cartões de crédito (Visa, Mastercard, Elo, Hipercard, American Express) e métodos digitais processados de ponta a ponta com criptografia bancária pelo Stripe Brasil.",
  },
  {
    question: "O que acontece com os meus jogos se eu cancelar?",
    answer:
      "Absolutamente nada é perdido! Toda a sua biblioteca, jogos cadastrados, horas de gameplay, avaliações e listas permanecem 100% salvos e intactos na sua conta gratuita para sempre.",
  },
  {
    question: "Quando o meu acesso PRO ou VIP é ativado?",
    answer:
      "A ativação é instantânea e automática. Assim que a operadora aprova a transação, seu perfil recebe o selo exclusivo, o multiplicador de XP entra em vigor e todos os anúncios são removidos no mesmo segundo.",
  },
  {
    question: "O que é o Plano VIP Fundador?",
    answer:
      "É a nossa modalidade vitalícia comemorativa de pagamento único (sem renovações recorrentes). Você garante acesso eterno a todos os recursos atuais e futuros do PRO, além do Boost Supremo de 2.0x XP e o Selo Dourado Fundador.",
  },
  {
    question: "Qual é a diferença entre a Assinatura Mensal e o Mês Avulso?",
    answer:
      "A assinatura mensal se renova automaticamente a cada 30 dias para você não se preocupar. Já o Mês Avulso é um pagamento único de 30 dias de acesso completo sem renovação automática.",
  },
];

export default function PlanFaqAccordion() {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleItem = (idx: number) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <section className="rounded-3xl bg-[#141822] border border-white/10 p-5 sm:p-7 md:p-8 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#00E5FF]">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Perguntas Frequentes
            </h3>
            <p className="text-xs text-neutral-400">Tire todas as suas dúvidas sobre os planos</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>Garantia de Satisfação</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndices.includes(idx);
          return (
            <div
              key={item.question}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "bg-[#181d2a] border-cyan-500/30 shadow-md"
                  : "bg-white/[0.02] border-white/5 hover:border-white/15"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(idx)}
                className="w-full text-left p-4 flex items-center justify-between gap-3 cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="text-xs sm:text-sm font-bold text-white leading-snug">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 text-neutral-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-[#00E5FF]" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-neutral-300 leading-relaxed border-t border-white/5 animate-fadeIn">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
