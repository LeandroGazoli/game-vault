import React, { useState } from "react";
import { Globe, Share2, Users, BookOpen, ExternalLink } from "lucide-react";
import { GameWebsite, getWebsiteMeta } from "./gameDetailHelpers";

interface GameCommunityLinksProps {
  communityWebsites: GameWebsite[];
}

export default function GameCommunityLinks({
  communityWebsites,
}: GameCommunityLinksProps) {
  const [communityFilter, setCommunityFilter] = useState<
    "all" | "social" | "community" | "wiki" | "official"
  >("all");

  if (communityWebsites.length === 0) return null;

  // Contagem de cada categoria
  const counts = {
    social: communityWebsites.filter((w) => getWebsiteMeta(w.url).category === "social").length,
    community: communityWebsites.filter((w) => getWebsiteMeta(w.url).category === "community").length,
    wiki: communityWebsites.filter((w) => getWebsiteMeta(w.url).category === "wiki").length,
    official: communityWebsites.filter((w) => getWebsiteMeta(w.url).category === "official").length,
  };

  // Lista filtrada
  const filteredWebsites = communityWebsites.filter((w) => {
    if (communityFilter === "all") return true;
    return getWebsiteMeta(w.url).category === communityFilter;
  });

  return (
    <div className="glass-card rounded-2xl p-5 lg:p-6 border border-white/10 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
          <span>🌐</span>
          <span>Comunidade &amp; Guias</span>
        </h3>
        <span className="text-[10px] font-mono text-zinc-400">
          {communityWebsites.length} links
        </span>
      </div>

      {/* Barra de Filtros Interativos */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          onClick={() => setCommunityFilter("all")}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
            communityFilter === "all"
              ? "bg-white text-black shadow-sm"
              : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
          }`}
        >
          Todos ({communityWebsites.length})
        </button>

        {counts.social > 0 && (
          <button
            type="button"
            onClick={() => setCommunityFilter("social")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              communityFilter === "social"
                ? "bg-pink-500 text-white shadow-sm"
                : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
            }`}
          >
            <Share2 className="w-3 h-3" />
            <span>Redes ({counts.social})</span>
          </button>
        )}

        {counts.community > 0 && (
          <button
            type="button"
            onClick={() => setCommunityFilter("community")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              communityFilter === "community"
                ? "bg-[#5865F2] text-white shadow-sm"
                : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Fóruns ({counts.community})</span>
          </button>
        )}

        {counts.wiki > 0 && (
          <button
            type="button"
            onClick={() => setCommunityFilter("wiki")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              communityFilter === "wiki"
                ? "bg-amber-500 text-black shadow-sm"
                : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Guias ({counts.wiki})</span>
          </button>
        )}

        {counts.official > 0 && (
          <button
            type="button"
            onClick={() => setCommunityFilter("official")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              communityFilter === "official"
                ? "bg-cyan-500 text-black shadow-sm"
                : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Oficiais ({counts.official})</span>
          </button>
        )}
      </div>

      {/* Lista de Links Filtrados */}
      <div className="flex flex-col gap-2 pt-1">
        {filteredWebsites.length > 0 ? (
          filteredWebsites.map((w) => {
            const meta = getWebsiteMeta(w.url);
            return (
              <a
                key={w.id}
                href={w.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`min-h-[44px] inline-flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all hover:scale-[1.01] active:scale-98 ${meta.color}`}
                title={`Acessar ${meta.label}`}
              >
                <span className="font-semibold truncate mr-2">{meta.label}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70 shrink-0" />
              </a>
            );
          })
        ) : (
          <div className="text-center py-4 text-xs text-gray-500 font-mono">
            Nenhum link encontrado nesta categoria.
          </div>
        )}
      </div>
    </div>
  );
}
