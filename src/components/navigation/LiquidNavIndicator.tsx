"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { gsap } from "@/lib/gsap";

interface LiquidNavIndicatorProps {
  activeIndex: number;
  tabRefs: React.MutableRefObject<(HTMLElement | null)[]>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function LiquidNavIndicator({
  activeIndex,
  tabRefs,
  containerRef,
}: LiquidNavIndicatorProps) {
  const indicatorRef = useRef<HTMLDivElement>(null);
  const waveShapeRef = useRef<HTMLDivElement>(null);
  const trailDropRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const prevIndexRef = useRef<number>(activeIndex);
  const isInitializedRef = useRef<boolean>(false);

  // Largura total da onda líquida que se estende da barra (96px)
  const WAVE_WIDTH = 96;

  const getTargetX = useCallback(
    (index: number): number | null => {
      const container = containerRef.current;
      const tab = tabRefs.current[index];
      if (!container || !tab) return null;

      const containerRect = container.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      const tabCenterX = tabRect.left - containerRect.left + tabRect.width / 2;

      return tabCenterX - WAVE_WIDTH / 2;
    },
    [containerRef, tabRefs]
  );

  useEffect(() => {
    const targetX = getTargetX(activeIndex);
    if (targetX === null) return;

    const prevIndex = prevIndexRef.current;
    const indicator = indicatorRef.current;
    const waveShape = waveShapeRef.current;
    const trailDrop = trailDropRef.current;
    const ripple = rippleRef.current;
    const glow = glowRef.current;

    if (!indicator || !waveShape) return;

    // Primeira montagem: posiciona instantaneamente sem animação
    if (!isInitializedRef.current) {
      gsap.set(indicator, { x: targetX, scaleX: 1, scaleY: 1, skewX: 0 });
      if (glow) gsap.set(glow, { opacity: 0.6 });
      isInitializedRef.current = true;
      prevIndexRef.current = activeIndex;
      return;
    }

    if (prevIndex === activeIndex) return;

    const diff = activeIndex - prevIndex;
    const distance = Math.abs(diff);
    const direction = Math.sign(diff); // 1 = direita, -1 = esquerda
    const prevX = getTargetX(prevIndex) ?? targetX;
    const duration = Math.min(0.38 + distance * 0.06, 0.58);

    // Cancela animações anteriores
    gsap.killTweensOf([indicator, waveShape, trailDrop, ripple, glow]);

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        prevIndexRef.current = activeIndex;
      },
    });

    // 1. Movimento horizontal da onda líquida
    tl.to(
      indicator,
      {
        x: targetX,
        duration: duration,
        ease: "power2.inOut",
      },
      0
    );

    // 2. Física Líquida: Estiramento elástico (squash & stretch) e inclinação orgânica
    tl.to(
      waveShape,
      {
        scaleX: Math.min(1 + distance * 0.12, 1.38),
        scaleY: Math.max(1 - distance * 0.08, 0.8),
        skewX: -direction * Math.min(distance * 4, 10),
        duration: duration * 0.42,
        ease: "power2.in",
      },
      0
    )
    .to(
      waveShape,
      {
        scaleX: 0.92,
        scaleY: 1.1,
        skewX: direction * 3,
        duration: duration * 0.28,
        ease: "power2.out",
      },
      duration * 0.42
    )
    .to(
      waveShape,
      {
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        duration: duration * 0.4,
        ease: "elastic.out(1.15, 0.45)",
      },
      duration * 0.65
    );

    // 3. Gota de Tensão Superficial (Metaball trailing liquid drop)
    if (trailDrop) {
      gsap.set(trailDrop, {
        x: prevX - targetX + (direction > 0 ? -10 : 10),
        scale: 0.8,
        opacity: 0.9,
      });

      tl.to(
        trailDrop,
        {
          x: 0,
          scale: 0.2,
          opacity: 0,
          duration: duration * 0.7,
          ease: "power2.inOut",
        },
        0.05
      );
    }

    // 4. Efeito de Respingo / Ondulação Líquida no Pouso (Ripple Splash)
    if (ripple) {
      tl.fromTo(
        ripple,
        { scale: 0.7, opacity: 0.8 },
        { scale: 1.45, opacity: 0, duration: 0.45, ease: "power2.out" },
        duration * 0.6
      );
    }

    prevIndexRef.current = activeIndex;
  }, [activeIndex, getTargetX]);

  // Recalcula posição em resize ou rotação de tela
  useEffect(() => {
    const handleResize = () => {
      const targetX = getTargetX(activeIndex);
      if (targetX === null) return;
      if (indicatorRef.current) gsap.set(indicatorRef.current, { x: targetX });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [activeIndex, getTargetX]);

  return (
    <>
      {/* Filtro SVG Gooey para Metaballs líquidas */}
      <svg className="fixed w-0 h-0 pointer-events-none -z-50" aria-hidden="true">
        <defs>
          <filter id="liquid-wave-goo" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 19 -8
              "
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Container Principal do Indicador Líquido */}
      <div
        ref={indicatorRef}
        className="absolute top-0 left-0 w-[96px] pointer-events-none z-0"
        style={{ transform: "translate3d(0, 0, 0)" }}
        aria-hidden="true"
      >
        {/* Halo de Brilho Neon Esmeralda Difuso */}
        <div
          ref={glowRef}
          className="absolute -top-[16px] left-1/2 -translate-x-1/2 w-16 h-12 rounded-full bg-emerald-500/25 blur-xl pointer-events-none -z-10"
        />

        {/* Onda Líquida Orgânica (Hump SVG Contínuo) */}
        <div ref={waveShapeRef} className="relative w-[96px] h-[22px] origin-bottom">
          <svg
            className="absolute -top-[20px] left-0 w-[96px] h-[22px] overflow-visible"
            viewBox="0 0 96 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Gradiente do contorno superior da onda líquida */}
              <linearGradient id="liquid-rim-glow" x1="0" y1="22" x2="96" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)" />
                <stop offset="30%" stopColor="rgba(16, 185, 129, 0.4)" />
                <stop offset="50%" stopColor="rgba(52, 211, 153, 0.95)" />
                <stop offset="70%" stopColor="rgba(16, 185, 129, 0.4)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.08)" />
              </linearGradient>

              {/* Preenchimento com leve brilho vertical no ápice da onda */}
              <linearGradient id="wave-dark-fill" x1="48" y1="0" x2="48" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#141a22" />
                <stop offset="100%" stopColor="#090b0f" />
              </linearGradient>
            </defs>

            {/* Corpo escuro da onda subindo organicamente da barra */}
            <path
              d="M 0 22 C 22 22 26 0 48 0 C 70 0 74 22 96 22 Z"
              fill="url(#wave-dark-fill)"
            />

            {/* Contorno brilhante neon esmeralda no topo da crista */}
            <path
              d="M 0 22 C 22 22 26 0 48 0 C 70 0 74 22 96 22"
              stroke="url(#liquid-rim-glow)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* Gota de rastro com filtro Gooey */}
          <div
            ref={trailDropRef}
            className="absolute -top-[12px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-400/80 opacity-0 blur-[1px]"
            style={{ filter: "url(#liquid-wave-goo)" }}
          />

          {/* Micro-ondulação de impacto no pouso (Ripple) */}
          <div
            ref={rippleRef}
            className="absolute -top-[8px] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border border-emerald-400/50 opacity-0 pointer-events-none"
          />
        </div>
      </div>
    </>
  );
}
