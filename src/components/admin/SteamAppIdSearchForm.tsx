"use client";

import React from "react";
import { Search, Loader2 } from "lucide-react";

interface SteamAppIdSearchFormProps {
  appIdInput: string;
  setAppIdInput: (val: string) => void;
  loading: boolean;
  onSearch: (appId: string) => void;
  suggestions: { name: string; appId: string }[];
}

export default function SteamAppIdSearchForm({
  appIdInput,
  setAppIdInput,
  loading,
  onSearch,
  suggestions,
}: SteamAppIdSearchFormProps) {
  return (
    <div className="space-y-3 shrink-0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(appIdInput);
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={appIdInput}
          onChange={(e) => setAppIdInput(e.target.value)}
          placeholder="Digite o Steam App ID (ex: 1245620 para Elden Ring)..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span>Buscar</span>
        </button>
      </form>

      {/* Atalhos Populares */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mr-1">
          Sugestões:
        </span>
        {suggestions.map((game) => (
          <button
            key={game.appId}
            type="button"
            onClick={() => {
              setAppIdInput(game.appId);
              onSearch(game.appId);
            }}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-zinc-300 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {game.name}
          </button>
        ))}
      </div>
    </div>
  );
}
