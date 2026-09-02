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
    bg: "bg-[#00E5FF]/15",
    text: "text-[#00E5FF]",
    border: "border-[#00E5FF]/30",
    icon: Trophy,
  },
  playing: {
    label: "Jogando",
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/30",
    icon: Gamepad2,
  },
  dropped: {
    label: "Dropado",
    bg: "bg-rose-500/15",
    text: "text-rose-400",
    border: "border-rose-500/30",
    icon: XCircle,
  },
  backlog: {
    label: "Quero Jogar",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
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
    sm: "text-[11px] px-2.5 py-0.5 gap-1 font-semibold",
    md: "text-xs font-bold px-3 py-1 gap-1.5",
    lg: "text-sm font-bold px-3.5 py-1.5 gap-2",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      {showIcon && <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />}
      {label}
    </span>
  );
}
