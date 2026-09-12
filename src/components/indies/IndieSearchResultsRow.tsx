"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IndieGame } from "@/lib/types/indie.types";
import { fetchApprovedIndies } from "@/lib/indieService";
import IndieVoteButton from "./IndieVoteButton";
import { Gamepad2, ArrowRight, Sparkles } from "lucide-react";

interface IndieSearchResultsRowProps {
  query: string;
}

export default function IndieSearchResultsRow({ query }: IndieSearchResultsRowProps) {
  const [matchingIndies, setMatchingIndies] = useState<IndieGame[]>([]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setMatchingIndies([]);
      return;
    }

    const q = query.toLowerCase().trim();
    fetchApprovedIndies("votes")
      .then((indies) => {
        const matches = indies.filter(
          (g) =>
            g.title.toLowerCase().includes(q) ||
            g.developerName.toLowerCase().includes(q) ||
            g.genres.some((gen) => gen.toLowerCase().includes(q))
        );
        setMatchingIndies(matches);
      })
      .catch(() => setMatchingIndies([]));
  }, [query]);

  if (matchingIndies.length === 0) return null;

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-950/30 via-[#141822] to-emerald-950/20 border border-emerald-500/30 p-4 sm:p-5 space-y-3 shadow-xl mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold uppercase">
            INDIE SPOTLIGHT
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-white">
            Projetos da Comunidade Indie Encontrados ({matchingIndies.length})
          </h4>
        </div>

        <Link
          href="/indies"
          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
        >
          Ver Todos os Indies <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {matchingIndies.map((indie) => (
          <div
            key={indie.id}
            className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/5 hover:border-emerald-500/30 transition-all gap-3"
          >
            <Link
              href={`/indies/${indie.slug}`}
              className="flex items-center gap-2.5 min-w-0 flex-1 group"
            >
              <img
                src={indie.coverImage}
                alt={indie.title}
                className="w-10 h-14 rounded-xl object-cover shrink-0 border border-white/10"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-emerald-400 truncate">
                  {indie.title}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  Por {indie.developerName}
                </p>
                <span className="text-[9px] font-mono text-emerald-400 block truncate mt-0.5">
                  {indie.genres.slice(0, 2).join(" • ")}
                </span>
              </div>
            </Link>

            <IndieVoteButton
              gameId={indie.id}
              initialVotesCount={indie.votesCount || 0}
              initialVoters={indie.voters || []}
              size="sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
