"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import SteamInventoryViewer from "@/components/steam/SteamInventoryViewer";
import { Sparkles, ShieldCheck, Gamepad2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SteamInventoryClient() {
  const { user, updateUserProfile } = useAuth();

  const handleSaveSteam = async (steamId: string) => {
    if (!user) return;
    await updateUserProfile({
      socialLinks: {
        ...user.socialLinks,
        steam: steamId,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header & Breadcrumb */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Início
          </Link>
          <span>/</span>
          <span className="text-[#00E5FF]">Inventário Steam</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Inventário Steam &amp; Skins
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl">
              Explore e exiba os itens mais valiosos do seu inventário da Steam: skins de armas e facas do <strong>Counter-Strike 2</strong>, chapéus e armas do <strong>Team Fortress 2</strong>, itens do <strong>Rust</strong>, <strong>Dota 2</strong> e cartas colecionáveis!
            </p>
          </div>

          {user?.socialLinks?.steam && (
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#14161a] border border-white/10 self-start md:self-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-xs">
                <span className="text-gray-400 block text-[10px]">Sua Steam Vinculada:</span>
                <span className="font-bold text-white font-mono">{user.socialLinks.steam}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visualizador de Inventário */}
      <SteamInventoryViewer
        initialSteamId={user?.socialLinks?.steam || ""}
        isOwner={Boolean(user)}
        onSaveSteamToProfile={handleSaveSteam}
      />
    </div>
  );
}
