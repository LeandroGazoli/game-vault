import React from "react";
import { ShoppingCart, ExternalLink } from "lucide-react";
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
    <div className="rounded-[28px] sm:rounded-[32px] border border-white/10 bg-[#18191c] p-5 sm:p-7 space-y-3.5 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-cyan-400" />
          <span>Onde Jogar &amp; Lojas Oficiais</span>
        </h3>
        <span className="text-[10px] text-gray-400 font-mono">Lojas Disponíveis</span>
      </div>
      <p className="text-xs text-gray-400">
        Acesse as páginas oficiais para comprar, baixar ou conferir detalhes deste jogo:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {storeWebsites.map((w) => {
          const meta = getWebsiteMeta(w.url);
          return (
            <a
              key={w.id}
              href={w.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`min-h-[48px] flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all active:scale-95 shadow-sm ${meta.color}`}
              title={`Página oficial de ${gameName} na ${meta.label}`}
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                <span>{meta.label}</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider opacity-80">
                Acessar Loja
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
