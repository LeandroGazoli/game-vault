"use client";

import React, { useRef, useCallback, useEffect } from "react";
import { gsap } from "@/lib/gsap";

interface Card3DTiltProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export default function Card3DTilt({
  children,
  className = "",
  maxTilt = 10,
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
      // No mobile / touchscreen, não aplica tilt 3D para evitar layout shift e poupar VRAM
      if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
        return;
      }

      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotateX = (y - 0.5) * -maxTilt;
      const rotateY = (x - 0.5) * maxTilt;

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            rotateX,
            rotateY,
            scale: 1.02,
            transformPerspective: 1000,
            duration: 0.15,
            ease: "power1.out",
            overwrite: "auto",
            boxShadow: "0 15px 30px -10px rgba(0, 229, 255, 0.2), 0 0 15px rgba(0, 0, 0, 0.8)",
          });
        }

        if (glareRef.current) {
          glareRef.current.style.background = `radial-gradient(circle at ${x * 100}% ${
            y * 100
          }%, rgba(255, 255, 255, 0.3) 0%, rgba(0, 229, 255, 0.18) 25%, rgba(255, 184, 0, 0.15) 50%, transparent 75%)`;
          glareRef.current.style.opacity = "0.3";
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
      gsap.to(cardRef.current, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
        boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
      });
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
      className={`relative group/tilt ${className}`}
    >
      {children}

      {/* Brilho Holográfico Especular Dinâmico (Desktop apenas) */}
      <div
        ref={glareRef}
        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-200 z-30 overflow-hidden mix-blend-screen opacity-0 hidden sm:block"
      />

      {/* Borda Iluminada no Hover */}
      <div className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300 z-20 border border-[#00E5FF]/40 opacity-0 group-hover/tilt:opacity-100" />
    </div>
  );
}

