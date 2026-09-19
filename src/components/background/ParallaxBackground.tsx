"use client";

import React, { useEffect, useRef } from "react";

/**
 * ParallaxBackground
 * Camadas de fundo dinâmicas de altíssima performance.
 * 
 * Zero Re-renders no React:
 * Não utiliza useState para scroll ou mouse. Toda a movimentação ocorre diretamente
 * no DOM via CSS Custom Properties no requestAnimationFrame, garantindo 60-120 FPS
 * sem travar o scroll nem invalidar a árvore de componentes.
 */
export default function ParallaxBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Se o usuário prefere movimento reduzido, mantém estático
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const isTouch =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);

    let scrollY = window.scrollY || 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let rafId: number | null = null;
    let isRunning = true;

    const updateTransforms = () => {
      if (!container || !isRunning) return;

      // Suavização do mouse via lerp (apenas em desktop com cursor)
      if (!isTouch) {
        currentMouseX += (targetMouseX - currentMouseX) * 0.08;
        currentMouseY += (targetMouseY - currentMouseY) * 0.08;
      }

      const layer1Y = scrollY * 0.05;
      const layer2Y = scrollY * 0.15;
      const layer3Y = scrollY * 0.28 * 0.5;

      const mx1 = isTouch ? 0 : currentMouseX * -12;
      const my1 = isTouch ? 0 : currentMouseY * -10;
      const mx2 = isTouch ? 0 : currentMouseX * -20;
      const mx3 = isTouch ? 0 : currentMouseX * -30;

      container.style.setProperty("--l1-x", `${mx1.toFixed(1)}px`);
      container.style.setProperty("--l1-y", `${(-layer1Y + my1).toFixed(1)}px`);
      container.style.setProperty("--l2-x", `${mx2.toFixed(1)}px`);
      container.style.setProperty("--l2-y", `${(-layer2Y).toFixed(1)}px`);
      container.style.setProperty("--l3-x", `${mx3.toFixed(1)}px`);
      container.style.setProperty("--l3-y", `${(-layer3Y).toFixed(1)}px`);

      rafId = requestAnimationFrame(updateTransforms);
    };

    const handleScroll = () => {
      scrollY = window.scrollY || 0;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetMouseX = (e.clientX - centerX) / centerX;
      targetMouseY = (e.clientY - centerY) / centerY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    if (!isTouch) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    rafId = requestAnimationFrame(updateTransforms);

    return () => {
      isRunning = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      if (!isTouch) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      aria-hidden="true"
      style={
        {
          "--l1-x": "0px",
          "--l1-y": "0px",
          "--l2-x": "0px",
          "--l2-y": "0px",
          "--l3-x": "0px",
          "--l3-y": "0px",
        } as React.CSSProperties
      }
    >
      {/* Camada 1: Nebulosa e Aurora Cósmica distante */}
      <div
        className="absolute inset-[-10%] opacity-60"
        style={{
          transform: "translate3d(var(--l1-x), var(--l1-y), 0)",
          background:
            "radial-gradient(ellipse at 20% 15%, rgba(16, 185, 129, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(0, 229, 255, 0.09) 0%, transparent 60%)",
        }}
      />

      {/* Camada 2: Estrelas cintilantes e pontos de constelação estáticos */}
      <div
        className="absolute inset-0 opacity-75"
        style={{
          transform: "translate3d(var(--l2-x), var(--l2-y), 0)",
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
        className="absolute -bottom-10 left-0 right-0 h-[45vh] opacity-25"
        style={{
          transform: "translate3d(var(--l3-x), var(--l3-y), 0) perspective(400px) rotateX(65deg)",
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
