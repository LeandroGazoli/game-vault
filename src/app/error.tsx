"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro na aplicação:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl bg-[#14161e] border border-white/10 p-6 sm:p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center mx-auto text-[#00E5FF]">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">
            Algo não saiu como esperado
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Ocorreu um erro temporário no carregamento desta página.
            Você pode tentar recarregar ou retornar à página inicial.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#00E5FF] hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#00E5FF]/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recarregar</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Início</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
