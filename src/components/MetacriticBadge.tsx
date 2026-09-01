"use client";

import React from "react";

interface MetacriticBadgeProps {
  score: number | null | undefined;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function MetacriticBadge({ score, size = "md", showLabel = false }: MetacriticBadgeProps) {
  if (score === null || score === undefined || score <= 0) {
    return null;
  }

  let colorClasses = "bg-[#66cc33] text-black border-[#58b02c]";
  if (score < 50) {
    colorClasses = "bg-[#ff0000] text-white border-[#cc0000]";
  } else if (score < 75) {
    colorClasses = "bg-[#ffcc33] text-black border-[#d9ad2b]";
  }

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 min-w-[24px] h-5",
    md: "text-sm font-bold px-2 py-0.5 min-w-[32px] h-7",
    lg: "text-lg font-black px-2.5 py-1 min-w-[42px] h-9",
  }[size];

  return (
    <div className="inline-flex items-center gap-1.5">
      {showLabel && (
        <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
          Metacritic
        </span>
      )}
      <span
        title={`Nota Metacritic: ${score}/100`}
        className={`inline-flex items-center justify-center rounded font-mono font-bold leading-none border shadow-sm ${colorClasses} ${sizeClasses}`}
      >
        {score}
      </span>
    </div>
  );
}
