"use client";

import React from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number | null | undefined; // 0 a 10
  max?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
}

export default function RatingStars({
  rating,
  max = 10,
  size = "md",
  showNumber = true,
}: RatingStarsProps) {
  if (rating === null || rating === undefined) {
    return <span className="text-xs text-gray-500">Sem avaliação</span>;
  }

  // Normaliza para 5 estrelas visuais se max for 10
  const normalizedFive = (rating / max) * 5;
  const fullStars = Math.floor(normalizedFive);
  const hasHalf = normalizedFive - fullStars >= 0.4;

  const starSize = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((i) => {
          if (i <= fullStars) {
            return <Star key={i} className={`${starSize} fill-amber-400 text-amber-400`} />;
          }
          if (i === fullStars + 1 && hasHalf) {
            return (
              <div key={i} className="relative">
                <Star className={`${starSize} text-gray-600`} />
                <Star className={`${starSize} fill-amber-400 text-amber-400 absolute inset-0 [clip-path:inset(0_50%_0_0)]`} />
              </div>
            );
          }
          return <Star key={i} className={`${starSize} text-gray-700`} />;
        })}
      </div>
      {showNumber && (
        <span className="font-mono font-bold text-amber-300 text-sm">
          {rating.toFixed(1)}
          <span className="text-gray-500 text-xs font-normal">/{max}</span>
        </span>
      )}
    </div>
  );
}
