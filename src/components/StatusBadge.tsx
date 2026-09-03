"use client";

import React from "react";
import { GameStatus, CompletionType } from "@/lib/types";
import { Trophy, Gamepad2, XCircle, Clock, Crown, Sword, Compass, Sparkles } from "lucide-react";

interface StatusBadgeProps {
  status: GameStatus;
  completionType?: CompletionType | null;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const STATUS_CONFIG: Record<
  GameStatus,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  completed: {
    label: "Zerado",
    bg: "bg-[#0c1f17]/90",
    text: "text-emerald-300",
    border: "border-emerald-500/40",
    icon: Trophy,
  },
  playing: {
    label: "Jogando",
    bg: "bg-[#0b1b24]/90",
    text: "text-cyan-300",
    border: "border-cyan-500/40",
    icon: Gamepad2,
  },
  dropped: {
    label: "Dropado",
    bg: "bg-[#230f14]/90",
    text: "text-rose-300",
    border: "border-rose-500/40",
    icon: XCircle,
  },
  backlog: {
    label: "Quero Jogar",
    bg: "bg-[#241a0b]/90",
    text: "text-amber-300",
    border: "border-amber-500/40",
    icon: Clock,
  },
};

export const COMPLETION_TYPE_LABELS: Record<CompletionType, { label: string; icon: any }> = {
  main_story: { label: "História", icon: Sword },
  main_extra: { label: "+ Extras", icon: Compass },
  completionist: { label: "100%", icon: Crown },
  platinum: { label: "Platina", icon: Sparkles },
  custom: { label: "Zerado", icon: Trophy },
};

export default function StatusBadge({
  status,
  completionType,
  size = "md",
  showIcon = true,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.backlog;
  let label = config.label;
  let Icon = config.icon;

  if (status === "completed" && completionType && COMPLETION_TYPE_LABELS[completionType]) {
    const compConfig = COMPLETION_TYPE_LABELS[completionType];
    label = `${compConfig.label}`;
    Icon = compConfig.icon;
  }

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1 font-bold",
    md: "text-xs font-bold px-2.5 py-1 gap-1.5",
    lg: "text-sm font-bold px-3 py-1.5 gap-2",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono tracking-tight shadow-sm ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      {showIcon && <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />}
      {label}
    </span>
  );
}
