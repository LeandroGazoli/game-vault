"use client";

import React from "react";
import { GameStatus } from "@/lib/types";
import { Trophy, Gamepad2, XCircle, Clock } from "lucide-react";

interface StatusBadgeProps {
  status: GameStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const STATUS_CONFIG: Record<
  GameStatus,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  completed: {
    label: "Zerado",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
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

export default function StatusBadge({ status, size = "md", showIcon = true }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.backlog;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-xs font-medium px-2.5 py-1 gap-1.5",
    lg: "text-sm font-semibold px-3 py-1.5 gap-2",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      {showIcon && <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />}
      {config.label}
    </span>
  );
}
