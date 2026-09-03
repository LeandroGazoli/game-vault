"use client";

import React, { useState, useRef, useCallback } from "react";

interface Card3DTiltProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export default function Card3DTilt({
  children,
  className = "",
  maxTilt = 12,
}: Card3DTiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)",
    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease",
  });
  const [glare, setGlare] = useState<{ x: number; y: number; opacity: number; angle: number }>({
    x: 50,
    y: 50,
    opacity: 0,
    angle: 115,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotateX = ((y - 0.5) * -maxTilt).toFixed(2);
      const rotateY = ((x - 0.5) * maxTilt).toFixed(2);
      const angle = (Math.atan2(y - 0.5, x - 0.5) * 180) / Math.PI + 90;

      setStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(12px) scale3d(1.03, 1.03, 1.03)`,
        boxShadow: "0 20px 35px -10px rgba(0, 229, 255, 0.25), 0 0 15px rgba(0, 0, 0, 0.8)",
        transition: "transform 0.08s ease-out, box-shadow 0.2s ease",
      });

      setGlare({
        x: x * 100,
        y: y * 100,
        opacity: 0.35,
        angle,
      });
    },
    [maxTilt]
  );

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)",
      boxShadow: "none",
      transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease",
    });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`relative will-change-transform transform-gpu group/tilt ${className}`}
    >
      {children}

      {/* Brilho Holográfico Especular Dinâmico (Foil Shimmer) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-200 z-30 overflow-hidden mix-blend-screen"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.4) 0%, rgba(0, 229, 255, 0.25) 25%, rgba(255, 184, 0, 0.2) 50%, transparent 75%)`,
          opacity: glare.opacity,
        }}
      />

      {/* Borda Iluminada no Hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300 z-20 border border-[#00E5FF]/40 opacity-0 group-hover/tilt:opacity-100"
      />
    </div>
  );
}
