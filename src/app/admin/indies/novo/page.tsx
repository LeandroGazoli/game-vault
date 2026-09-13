"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { submitIndieGame } from "@/lib/indieService";
import { triggerSuccessHaptic, triggerWarningHaptic } from "@/lib/capacitor";
import IndieFormFields from "@/components/indies/IndieFormFields";
import { IndieSubmissionForm } from "@/lib/types/indie.types";
import { ArrowLeft, Gamepad2, CheckCircle2 } from "lucide-react";

export default function AdminNovoIndiePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCreate = async (formData: IndieSubmissionForm) => {
    setIsSubmitting(true);
    try {
      await submitIndieGame(formData, user?.uid || "admin", {
        initialStatus: "approved",
        isSpotlight: false,
        spotlightLocations: [],
      });
      triggerSuccessHaptic();
      setToastMessage(`Jogo "${formData.title}" cadastrado e publicado com sucesso!`);
      setTimeout(() => {
        router.push("/admin/indies");
      }, 1200);
    } catch (err) {
      console.error("Erro ao cadastrar jogo indie pelo admin:", err);
      triggerWarningHaptic();
      alert("Falha ao cadastrar jogo indie. Verifique o console para mais detalhes.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 flex-1 w-full min-w-0 pb-16">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-black font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navegação de Volta */}
      <Link
        href="/admin/indies"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Gestão de Jogos Indies
      </Link>

      {/* Cabeçalho */}
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-8 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>ADMINISTRAÇÃO • NOVO JOGO</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Cadastrar Novo Jogo Independente
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Preencha a ficha técnica completa, galeria de imagens, trailer, sinopse formatada e notas do desenvolvedor.
        </p>
      </div>

      {/* Formulário Modular em Página Completa */}
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-10 shadow-2xl">
        <IndieFormFields
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
          submitButtonText="Cadastrar e Publicar Jogo no Acervo"
        />
      </div>
    </div>
  );
}
