"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { submitIndieGame } from "@/lib/indieService";
import { triggerSuccessHaptic, triggerWarningHaptic } from "@/lib/capacitor";
import AuthModal from "@/components/AuthModal";
import IndieFormFields from "@/components/indies/IndieFormFields";
import { IndieSubmissionForm } from "@/lib/types/indie.types";
import {
  Gamepad2,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles,
  Trophy,
} from "lucide-react";

export default function CadastrarIndiePage() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSubmit = async (formData: IndieSubmissionForm) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitIndieGame(
        {
          ...formData,
          developerName: formData.developerName || user.displayName || "Desenvolvedor Independente",
          developerEmail: formData.developerEmail || user.email || "",
        },
        user.uid
      );
      triggerSuccessHaptic();
      setIsSuccess(true);
    } catch (err) {
      console.error("Erro ao submeter jogo indie:", err);
      triggerWarningHaptic();
      alert("Falha ao submeter projeto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 px-4">
      <Link
        href="/indies"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Indie Hub
      </Link>

      <div className="rounded-[32px] border border-white/10 bg-[#141822] p-6 sm:p-10 shadow-2xl space-y-6">
        {/* Topo / Apresentação */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>DIVULGAÇÃO GRATUITA DE GAMES INDIE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Divulgue Seu Jogo Independente
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Cadastre seu jogo com ficha técnica completa no <strong>MyGameList</strong>. Seu projeto ganha uma página exclusiva no padrão dos grandes títulos, entra na rotação da busca e concorre na votação da comunidade.
          </p>

          {/* Banner de Título Exclusivo */}
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-white block">Título Gamer Exclusivo ao ser Aprovado</span>
              <span className="text-purple-300">
                Ao ter sua publicação aprovada pela moderação, seu perfil recebe automaticamente a insígnia exclusiva{" "}
                <strong className="text-white">👾 Criador Indie MyGameList</strong>!
              </span>
            </div>
          </div>
        </div>

        {/* Bloqueio para Usuários Não Autenticados */}
        {!user ? (
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Login Necessário para Solicitar Divulgação</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Apenas usuários cadastrados e conectados podem solicitar a divulgação de jogos no acervo do MyGameList.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              Fazer Login ou Criar Conta
            </button>
          </div>
        ) : isSuccess ? (
          <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white">Projeto Submetido com Sucesso!</h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
              Sua solicitação foi enviada para a moderação da equipe do MyGameList. Assim que aprovada, você receberá seu título de <strong>👾 Criador Indie MyGameList</strong> e seu jogo estará disponível publicamente!
            </p>
            <div className="pt-2">
              <Link
                href="/indies"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 text-black font-extrabold text-xs shadow-lg"
              >
                Voltar para o Indie Hub
              </Link>
            </div>
          </div>
        ) : (
          <IndieFormFields
            initialValues={{
              developerName: user.displayName || "",
              developerEmail: user.email || "",
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Submeter Jogo para Moderação"
          />
        )}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
