"use client";

import React, { useEffect, useState } from "react";

/**
 * ParallaxBackground
 * Camadas dinâmicas que respondem à rolagem e ao movimento do mouse com alta taxa de quadros e baixo custo de GPU.
 */
export default function ParallaxBackground() {
  const [scrollY, setScrollY] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY || 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const offsetX = (e.clientX - centerX) / centerX;
      const offsetY = (e.clientY - centerY) / centerY;
      setMouseOffset({ x: offsetX, y: offsetY });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const layer1Y = scrollY * 0.05;
  const layer2Y = scrollY * 0.15;
  const layer3Y = scrollY * 0.28;

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none" aria-hidden="true">
      {/* Camada 1: Nebulosa e Aurora Cósmica distante */}
      <div
        className="absolute inset-[-10%] transition-transform duration-700 ease-out opacity-60"
        style={{
          transform: `translate3d(${mouseOffset.x * -12}px, ${-layer1Y + mouseOffset.y * -10}px, 0)`,
          background:
            "radial-gradient(ellipse at 20% 15%, rgba(16, 185, 129, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(0, 229, 255, 0.09) 0%, transparent 60%)",
        }}
      />

      {/* Camada 2: Estrelas cintilantes e pontos de constelação estáticos */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out opacity-75"
        style={{
          transform: `translate3d(${mouseOffset.x * -20}px, ${-layer2Y}px, 0)`,
          backgroundImage: `radial-gradient(1.5px 1.5px at 15% 25%, rgba(255,255,255,0.7) 50%, transparent 100%),
                            radial-gradient(2px 2px at 45% 15%, rgba(0,229,255,0.8) 50%, transparent 100%),
                            radial-gradient(1px 1px at 70% 35%, rgba(255,255,255,0.6) 50%, transparent 100%),
                            radial-gradient(2.5px 2.5px at 85% 18%, rgba(16,185,129,0.85) 50%, transparent 100%),
                            radial-gradient(1.5px 1.5px at 30% 65%, rgba(255,255,255,0.5) 50%, transparent 100%),
                            radial-gradient(2px 2px at 60% 80%, rgba(0,229,255,0.7) 50%, transparent 100%),
                            radial-gradient(1px 1px at 90% 75%, rgba(255,255,255,0.6) 50%, transparent 100%)`,
          backgroundSize: "600px 600px",
        }}
      />

      {/* Camada 3: Grade Synthwave / Horizon Grid no rodapé */}
      <div
        className="absolute -bottom-10 left-0 right-0 h-[45vh] transition-transform duration-300 ease-out opacity-25"
        style={{
          transform: `translate3d(${mouseOffset.x * -30}px, ${-layer3Y * 0.5}px, 0) perspective(400px) rotateX(65deg)`,
          backgroundImage: `linear-gradient(to right, rgba(16, 185, 129, 0.25) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 229, 255, 0.25) 1px, transparent 1px)`,
          backgroundSize: "44px 44px",
          maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 70%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 70%)",
        }}
      />

      {/* Camada 4: Vinheta e iluminação atmosférica para manter legibilidade total dos cards */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#0e0f12]/30 to-[#0e0f12]/80 pointer-events-none" />
    </div>
  );
}
