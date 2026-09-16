import React, { Suspense } from "react";
import type { Metadata } from "next";
import ConquistasClient from "./ConquistasClient";

export const metadata: Metadata = {
  title: "Central de Conquistas & Nível Gamer • MyGameList",
  description: "Acompanhe sua progressão gamer, insígnias, conquistas raras estilo Steam, missões e placar de XP.",
};

export default function ConquistasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-400">Carregando Conquistas...</p>
        </div>
      }
    >
      <ConquistasClient />
    </Suspense>
  );
}
