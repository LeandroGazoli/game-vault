import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Calendar, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { calculateAge, isUserAdult } from "@/lib/gameUtils";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import AuthModal from "@/components/AuthModal";
import AgeVerificationModal from "@/components/AgeVerificationModal";
import AdultContentModal from "@/components/AdultContentModal";

interface GameAgeGateProps {
  children: React.ReactNode;
  isAdult: boolean;
}

export default function GameAgeGate({ children, isAdult }: GameAgeGateProps) {
  const router = useRouter();
  const handleBack = useBackNavigation("/search");
  const { user, isLoading: authLoading, updateUserProfile } = useAuth();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);
  const [isAdultWarningOpen, setIsAdultWarningOpen] = useState(false);
  const [adultConfirmedLocally, setAdultConfirmedLocally] = useState(false);

  if (!isAdult) {
    return <>{children}</>;
  }

  if (authLoading) {
    return null;
  }

  // 1. Não logado -> Age Gate de Login
  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-black to-black -z-10" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-lg w-full bg-[#16181f]/90 border-2 border-red-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
            <ShieldAlert className="w-9 h-9 text-red-400" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-950/80 border border-red-500/40 text-red-400">
              Classificação Restrita (+18)
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Conteúdo Adulto Restrito
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Este jogo possui classificação indicativa exclusiva para maiores de 18 anos.
              Para visualizar a ficha técnica e informações deste título, é necessário estar conectado a uma conta e comprovar sua maioridade.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 inline mr-1.5" />
              Voltar
            </button>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full sm:w-auto px-7 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              Fazer Login / Cadastrar
            </button>
          </div>
        </div>

        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        )}
      </div>
    );
  }

  // 2. Logado, mas sem data de nascimento informada
  if (!user.birthDate) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-black to-black -z-10" />
        <div className="max-w-lg w-full bg-[#16181f]/90 border-2 border-amber-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Calendar className="w-9 h-9 text-amber-400" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-950/80 border border-amber-500/40 text-amber-400">
              Confirmação de Idade Requerida
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Informe sua Data de Nascimento
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Para visualizar jogos classificados para adultos (+18), é necessário confirmar sua data de nascimento para verificar que você tem 18 anos ou mais.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 inline mr-1.5" />
              Voltar
            </button>
            <button
              type="button"
              onClick={() => setIsAgeModalOpen(true)}
              className="w-full sm:w-auto px-7 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-lg shadow-amber-500/30 transition-all cursor-pointer"
            >
              Confirmar Data de Nascimento
            </button>
          </div>
        </div>

        {isAgeModalOpen && (
          <AgeVerificationModal
            isOpen={isAgeModalOpen}
            onClose={() => setIsAgeModalOpen(false)}
            onVerified={() => {
              setIsAdultWarningOpen(true);
            }}
          />
        )}

        {isAdultWarningOpen && (
          <AdultContentModal
            isOpen={isAdultWarningOpen}
            onClose={() => setIsAdultWarningOpen(false)}
            onConfirm={() => {
              setAdultConfirmedLocally(true);
            }}
          />
        )}
      </div>
    );
  }

  // 3. Logado, mas menor de 18 anos
  if (!isUserAdult(user.birthDate)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 sm:p-12 relative overflow-hidden">
        <div className="max-w-lg w-full bg-[#16181f]/90 border-2 border-red-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
            <Lock className="w-9 h-9 text-red-400" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-950/80 border border-red-500/40 text-red-400">
              Acesso Bloqueado
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Conteúdo Restrito (+18)
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              De acordo com a data de nascimento cadastrada no seu perfil ({calculateAge(user.birthDate)} anos),
              você não possui a idade mínima necessária para visualizar este título.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-7 py-2.5 rounded-full bg-white hover:bg-gray-200 text-black font-black text-xs transition-colors cursor-pointer"
            >
              Voltar para o Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Logado maior de idade que ainda não confirmou o aviso
  const hasConfirmedWarning = Boolean(
    user.adultContentConfirmedAt ||
    adultConfirmedLocally ||
    (typeof window !== "undefined" && localStorage.getItem("mgl_adult_confirmed") === "true")
  );

  if (!hasConfirmedWarning) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 sm:p-12 relative overflow-hidden">
        <div className="max-w-lg w-full bg-[#16181f]/90 border-2 border-red-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
            <ShieldAlert className="w-9 h-9 text-red-400" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-950/80 border border-red-500/40 text-red-400">
              Aviso de Conteúdo Adulto (+18)
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Confirmar Acesso a Título Adulto
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Este jogo possui classificação para maiores de 18 anos e pode conter cenas explícitas ou temas sensíveis.
              Deseja confirmar sua entrada e visualizar o conteúdo completo deste jogo?
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 inline mr-1.5" />
              Voltar
            </button>
            <button
              type="button"
              onClick={async () => {
                if (user) {
                  await updateUserProfile({ adultContentConfirmedAt: new Date().toISOString() });
                }
                try {
                  localStorage.setItem("mgl_adult_confirmed", "true");
                } catch {}
                setAdultConfirmedLocally(true);
              }}
              className="w-full sm:w-auto px-7 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              Confirmar e Acessar Jogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
