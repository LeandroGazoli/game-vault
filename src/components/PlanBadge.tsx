"use client";

import React from "react";
import { UserPlan } from "@/lib/types";
import { Crown, Sparkles, Shield } from "lucide-react";

interface PlanBadgeProps {
  plan?: UserPlan;
  size?: "sm" | "md";
  className?: string;
}

export default function PlanBadge({
  plan = "free",
  size = "sm",
  className = "",
}: PlanBadgeProps) {
  if (plan === "vip") {
    return (
      <span
        className={`inline-flex items-center gap-1 font-black uppercase font-mono rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20 ${
          size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1"
        } ${className}`}
      >
        <Crown className={size === "sm" ? "w-3 h-3 text-amber-400" : "w-3.5 h-3.5 text-amber-400"} />
        VIP
      </span>
    );
  }

  if (plan === "pro") {
    return (
      <span
        className={`inline-flex items-center gap-1 font-black uppercase font-mono rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm shadow-cyan-500/20 ${
          size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1"
        } ${className}`}
      >
        <Sparkles className={size === "sm" ? "w-3 h-3 text-[#00E5FF]" : "w-3.5 h-3.5 text-[#00E5FF]"} />
        PRO
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold uppercase font-mono rounded-full bg-white/5 text-gray-400 border border-white/10 ${
        size === "sm" ? "text-[9px] px-2 py-0.5" : "text-xs px-2.5 py-0.5"
      } ${className}`}
    >
      FREE
    </span>
  );
}
