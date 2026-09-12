"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toggleVoteIndie } from "@/lib/indieService";
import { triggerSuccessHaptic, triggerSelectionHaptic } from "@/lib/capacitor";
import AuthModal from "@/components/AuthModal";
import { Heart, Loader2 } from "lucide-react";

interface IndieVoteButtonProps {
  gameId: string;
  initialVotesCount: number;
  initialVoters: string[];
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function IndieVoteButton({
  gameId,
  initialVotesCount,
  initialVoters = [],
  className = "",
  size = "md",
}: IndieVoteButtonProps) {
  const { user } = useAuth();
  const [votes, setVotes] = useState(initialVotesCount);
  const [hasVoted, setHasVoted] = useState(
    Boolean(user && initialVoters.includes(user.uid))
  );
  const [loading, setLoading] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleVote = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (loading) return;

    setLoading(true);
    const nextVoted = !hasVoted;
    setHasVoted(nextVoted);
    setVotes((prev) => (nextVoted ? prev + 1 : Math.max(0, prev - 1)));

    if (nextVoted) {
      triggerSuccessHaptic();
    } else {
      triggerSelectionHaptic();
    }

    try {
      await toggleVoteIndie(gameId, user.uid, hasVoted);
    } catch (err) {
      console.error("Erro ao computar voto:", err);
      // Rollback otimista em caso de falha
      setHasVoted(hasVoted);
      setVotes((prev) => (hasVoted ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-4 py-2 text-xs",
    lg: "px-6 py-3 text-sm",
  }[size];

  return (
    <>
      <button
        onClick={handleVote}
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-2xl font-bold transition-all duration-300 active:scale-95 shadow-md ${sizeClasses} ${
          hasVoted
            ? "bg-emerald-500 text-black shadow-emerald-500/20"
            : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
        } ${className}`}
        title={hasVoted ? "Você já votou neste jogo (clique para remover)" : "Votar neste jogo indie"}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Heart
            className={`w-4 h-4 transition-transform ${
              hasVoted ? "fill-black text-black scale-110" : "text-rose-400 group-hover:scale-110"
            }`}
          />
        )}
        <span>{hasVoted ? "Votado" : "Apoiar com Voto"}</span>
        <span
          className={`px-2 py-0.5 rounded-full font-mono font-bold text-[11px] ${
            hasVoted ? "bg-black/20 text-black" : "bg-white/10 text-emerald-400"
          }`}
        >
          {votes}
        </span>
      </button>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
