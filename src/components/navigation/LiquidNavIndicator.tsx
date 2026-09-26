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
  const humpPathRef = useRef<SVGPathElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const prevIndexRef = useRef<number>(activeIndex);
  const isInitializedRef = useRef<boolean>(false);

  // Largura total do elemento indicador (hump de 88px)
  const INDICATOR_WIDTH = 88;

  // Calcula a coordenada X para que o hump e o círculo fiquem perfeitamente alinhados com o botão
  const getTargetX = useCallback(
    (index: number): number | null => {
      const container = containerRef.current;
      const tab = tabRefs.current[index];
      if (!container || !tab) return null;

      const containerRect = container.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      const tabCenterX = tabRect.left - containerRect.left + tabRect.width / 2;

      return tabCenterX - INDICATOR_WIDTH / 2;
    },
    [containerRef, tabRefs]
  );

  useEffect(() => {
    const targetX = getTargetX(activeIndex);
    if (targetX === null) return;

    const prevIndex = prevIndexRef.current;
    const indicator = indicatorRef.current;
    const circle = circleRef.current;
    const glow = glowRef.current;

    if (!indicator || !circle) return;

    // Primeiro carregamento: posiciona instantaneamente no elemento ativo sem animação
    if (!isInitializedRef.current) {
      gsap.set(indicator, { x: targetX, scaleX: 1, scaleY: 1 });
      if (glow) gsap.set(glow, { opacity: 0.6 });
      isInitializedRef.current = true;
      prevIndexRef.current = activeIndex;
      return;
    }

    if (prevIndex === activeIndex) return;

    const diff = activeIndex - prevIndex;
    const distance = Math.abs(diff);
    const duration = Math.min(0.38 + distance * 0.06, 0.55);

    // Cancela animações anteriores para transição limpa
    gsap.killTweensOf([indicator, circle, glow]);

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        prevIndexRef.current = activeIndex;
      },
    });

    // 1. Deslocamento horizontal do hump e círculo elevado
    tl.to(
      indicator,
      {
        x: targetX,
        duration: duration,
        ease: "power2.inOut",
      },
      0
    );

    // 2. Squash & Stretch sutil durante o voo horizontal (efeito líquido na parte superior)
    tl.to(
      indicator,
      {
        scaleX: Math.min(1 + distance * 0.08, 1.25),
        scaleY: Math.max(1 - distance * 0.06, 0.88),
        duration: duration * 0.45,
        ease: "power1.in",
      },
      0
    )
    .to(
      indicator,
      {
        scaleX: 1,
        scaleY: 1,
        duration: duration * 0.55,
        ease: "back.out(1.5)",
      },
      duration * 0.45
    );

    // 3. Efeito elástico no círculo central esmeralda
    tl.fromTo(
      circle,
      { scale: 0.9 },
      { scale: 1, duration: duration * 0.6, ease: "elastic.out(1.2, 0.5)" },
      duration * 0.4
    );

    prevIndexRef.current = activeIndex;
  }, [activeIndex, getTargetX]);

  // Recalcula posição ao redimensionar tela ou rotacionar dispositivo
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
    <div
      ref={indicatorRef}
      className="absolute top-0 left-0 w-[88px] pointer-events-none z-0"
      style={{ transform: "translate3d(0, 0, 0)" }}
      aria-hidden="true"
    >
      {/* 1. Hump SVG: Curva orgânica contínua que sobe da linha superior da barra */}
      <svg
        className="absolute -top-[18px] left-0 w-[88px] h-[20px] overflow-visible"
        viewBox="0 0 88 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Preenchimento escuro contínuo com o fundo da navbar (#090b0f) */}
        <path
          ref={humpPathRef}
          d="M 0 20 C 18 20 24 0 44 0 C 64 0 70 20 88 20 Z"
          fill="#090b0f"
        />
        {/* Contorno sutil da curva conectando perfeitamente com border-white/10 da navbar */}
        <path
          d="M 0 20 C 18 20 24 0 44 0 C 64 0 70 20 88 20"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>

      {/* 2. Halo de brilho difuso verde esmeralda no topo */}
      <div
        ref={glowRef}
        className="absolute -top-[20px] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-emerald-400/35 blur-lg pointer-events-none -z-10"
      />

      {/* 3. Círculo Elevado Esmeralda Perfeito (Centralizado com precisão matemática no topo do Hump) */}
      <div
        ref={circleRef}
        className="absolute -top-[14px] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 via-emerald-400 to-teal-300 shadow-[0_4px_16px_rgba(16,185,129,0.55),0_0_20px_rgba(16,185,129,0.3)] border-2 border-[#090b0f] flex items-center justify-center overflow-hidden"
      >
        {/* Brilho Especular Orgânico de Vidro Líquido */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.15)_35%,transparent_65%)] pointer-events-none" />
      </div>
    </div>
  );
}
