import React, { Suspense } from "react";
import type { Metadata } from "next";
import ConquistasClient from "@/app/conquistas/ConquistasClient";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const cleanUsername = decodeURIComponent(username || "");
  return {
    title: `Conquistas & Nível Gamer de @${cleanUsername} • MyGameList`,
    description: `Confira as insígnias, conquistas e progressão gamer de @${cleanUsername} no MyGameList.`,
  };
}

export default async function UserConquistasPage({ params }: PageProps) {
  const { username } = await params;
  const cleanUsername = decodeURIComponent(username || "");

  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-400">Carregando Conquistas...</p>
        </div>
      }
    >
      <ConquistasClient targetUsername={cleanUsername} />
    </Suspense>
  );
}