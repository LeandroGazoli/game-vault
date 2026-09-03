"use client";

import React, { useRef, useCallback, useEffect } from "react";

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
  const glareRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // No mobile / touchscreen, não aplica tilt 3D para evitar layout shift durante o scroll
      if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
        return;
      }

      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotateX = ((y - 0.5) * -maxTilt).toFixed(2);
      const rotateY = ((x - 0.5) * maxTilt).toFixed(2);

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (cardRef.current) {
          cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(12px) scale3d(1.03, 1.03, 1.03)`;
          cardRef.current.style.boxShadow =
            "0 20px 35px -10px rgba(0, 229, 255, 0.25), 0 0 15px rgba(0, 0, 0, 0.8)";
          cardRef.current.style.transition = "transform 0.08s ease-out, box-shadow 0.2s ease";
        }

        if (glareRef.current) {
          glareRef.current.style.background = `radial-gradient(circle at ${x * 100}% ${
            y * 100
          }%, rgba(255, 255, 255, 0.4) 0%, rgba(0, 229, 255, 0.25) 25%, rgba(255, 184, 0, 0.2) 50%, transparent 75%)`;
          glareRef.current.style.opacity = "0.35";
        }
      });
    },
    [maxTilt]
  );

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    if (cardRef.current) {
      cardRef.current.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)";
      cardRef.current.style.boxShadow = "none";
      cardRef.current.style.transition =
        "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease";
    }

    if (glareRef.current) {
      glareRef.current.style.opacity = "0";
    }
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform:
          "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)",
        transition:
          "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease",
      }}
      className={`relative will-change-transform transform-gpu group/tilt ${className}`}
    >
      {children}

      {/* Brilho Holográfico Especular Dinâmico (Foil Shimmer) */}
      <div
        ref={glareRef}
        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-200 z-30 overflow-hidden mix-blend-screen opacity-0"
      />

      {/* Borda Iluminada no Hover */}
      <div className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300 z-20 border border-[#00E5FF]/40 opacity-0 group-hover/tilt:opacity-100" />
    </div>
  );
}
