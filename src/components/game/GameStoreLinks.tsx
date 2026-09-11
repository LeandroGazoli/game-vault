import React from "react";
import { getWebsiteMeta, GameWebsite } from "./gameDetailHelpers";

interface GameStoreLinksProps {
  gameName: string;
  storeWebsites: GameWebsite[];
}

export default function GameStoreLinks({
  gameName,
  storeWebsites,
}: GameStoreLinksProps) {
  if (storeWebsites.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-5 lg:p-6 border border-white/10 space-y-3.5">
      <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/10">
        <span>🛒</span>
        <span>Onde Comprar &amp; Lojas Digitais</span>
      </h3>
      <p className="text-[11px] text-zinc-400">
        Acesse as páginas oficiais para adquirir o título sem intermediários:
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        {storeWebsites.map((w) => {
          const meta = getWebsiteMeta(w.url);
          return (
            <a
              key={w.id}
              href={w.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-950/20 transition-all flex flex-col justify-between"
              title={`Página oficial de ${gameName} na ${meta.label}`}
            >
              <span className="text-xs font-bold text-white truncate">{meta.label}</span>
              <span className="text-[10px] text-emerald-400 font-semibold mt-1">
                Acessar Loja ↗
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
