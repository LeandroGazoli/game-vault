"use client";

import React from "react";
import Link from "next/link";
import { Layers } from "lucide-react";

export const LEGENDARY_FRANCHISES = [
  {
    name: "Grand Theft Auto",
    desc: "A saga definitiva da Rockstar Games • Rumo a Vice City",
    query: "Grand Theft Auto",
    accent: "from-[#ff2a85]/40 via-[#ff7a00]/20 to-[#121316] border-[#ff2a85]/40 text-pink-300",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.jpg",
  },
  {
    name: "The Witcher",
    desc: "A saga do Bruxo Geralt de Rivia",
    query: "The Witcher",
    accent: "from-amber-950/70 via-[#1c1410] to-[#121316] border-amber-500/30 text-amber-300",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/coaarl.jpg",
  },
  {
    name: "Resident Evil",
    desc: "O auge do Survival Horror",
    query: "Resident Evil",
    accent: "from-red-950/70 via-[#1a0f10] to-[#121316] border-red-500/30 text-red-300",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6qg8.jpg",
  },
  {
    name: "God of War",
    desc: "A jornada mitológica de Kratos",
    query: "God of War",
    accent: "from-blue-950/70 via-[#0f141f] to-[#121316] border-blue-500/30 text-blue-300",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/cobkt6.jpg",
  },
  {
    name: "Zelda",
    desc: "Aventuras épicas por Hyrule",
    query: "Zelda",
    accent: "from-emerald-950/70 via-[#0f1a14] to-[#121316] border-emerald-500/30 text-emerald-300",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
  },
  {
    name: "Dark Souls & Soulslike",
    desc: "Desafio implacável e universos sombrios",
    query: "Dark Souls",
    accent: "from-purple-950/70 via-[#160f1c] to-[#121316] border-purple-500/30 text-purple-300",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1x77.jpg",
  },
];

export default function HomeFranchisesSection() {
  return (
    <section className="franchises-section space-y-4">
      <div className="franchises-title flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" /> Explorar por Franquias Lendárias
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Mergulhe na cronologia completa das maiores sagas da história dos games.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {LEGENDARY_FRANCHISES.map((f) => (
          <Link
            key={f.name}
            href={`/search?q=${encodeURIComponent(f.query)}`}
            className={`franchise-card group relative rounded-2xl overflow-hidden border p-3 flex flex-col justify-end min-h-[160px] sm:min-h-[190px] shadow-lg transition-all hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98] bg-gradient-to-b ${f.accent}`}
          >
            {/* Imagem de Fundo Desfocada */}
            <div className="absolute inset-0 -z-0 overflow-hidden opacity-30 group-hover:opacity-40 transition-opacity">
              <img
                src={f.cover}
                alt={f.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter blur-[1px]"
              />
            </div>

            <div className="relative z-10 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400/90 block">
                Saga Completa
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug group-hover:text-[#00E5FF] transition-colors line-clamp-1">
                {f.name}
              </h3>
              <p className="text-[11px] text-gray-400 line-clamp-1 hidden sm:block">
                {f.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
